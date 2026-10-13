#!/usr/bin/env python3
"""Reproducible behavioral ngspice transient screens; Python standard library only.

Run: python3 scripts/simulate-power-eco.py [--library /path/to/libngspice]
Check committed evidence without running ngspice: add --check
Individual decks also run with: ngspice -b -r result.raw engineering/power-eco-simulation/CASE.cir
This does not model or qualify a complete controller, motor or USB-PD source.
"""
import argparse
import csv
import ctypes as ct
import ctypes.util
import hashlib
import json
import math
import os
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
ROOT = REPO / 'engineering' / 'power-eco-simulation'
VERSION = hashlib.sha256((REPO/'index.circuit.tsx').read_bytes()).hexdigest()

class Vector(ct.Structure):
    _fields_ = [('name', ct.c_char_p), ('type', ct.c_int), ('flags', ct.c_short),
                ('real', ct.POINTER(ct.c_double)), ('complex', ct.c_void_p),
                ('length', ct.c_int)]

class Spice:
    def __init__(self, library=None):
        candidates = [library, os.environ.get('NGSPICE_LIBRARY'),
                      '/Applications/KiCad/KiCad.app/Contents/Frameworks/libngspice.0.dylib',
                      ct.util.find_library('ngspice')]
        for candidate in candidates:
            if not candidate:
                continue
            try:
                self.lib = ct.CDLL(candidate)
                self.library = candidate
                break
            except OSError:
                pass
        else:
            raise RuntimeError('Install ngspice shared library or pass --library PATH')
        self.messages = []
        self.callback = ct.CFUNCTYPE(ct.c_int, ct.c_char_p, ct.c_int, ct.c_void_p)(self.log)
        self.exit_callback = ct.CFUNCTYPE(ct.c_int,ct.c_int,ct.c_bool,ct.c_bool,ct.c_int,ct.c_void_p)(self.on_exit)
        self.lib.ngSpice_Init.argtypes = [ct.c_void_p] * 7
        self.lib.ngSpice_Init(self.callback, None, self.exit_callback, None, None, None, None)
        self.lib.ngSpice_Command.argtypes = [ct.c_char_p]
        self.lib.ngSpice_Circ.argtypes = [ct.POINTER(ct.c_char_p)]
        self.lib.ngGet_Vec_Info.argtypes = [ct.c_char_p]
        self.lib.ngGet_Vec_Info.restype = ct.POINTER(Vector)
        self.command('version')
        self.version = '\n'.join(self.messages)
    def log(self, text, ident, user):
        self.messages.append(text.decode(errors='replace'))
        return 0
    def on_exit(self, status, immediate, quitexit, ident, user):
        self.messages.append(f'CONTROLLED_EXIT status={status}')
        return 0
    def command(self, text):
        return self.lib.ngSpice_Command(text.encode())
    def run(self, deck, vectors, duration):
        self.command('destroy all')
        self.messages = []
        lines = deck.splitlines()
        array = (ct.c_char_p * (len(lines)+1))(*[s.encode() for s in lines], None)
        if self.lib.ngSpice_Circ(array) != 0 or self.command('run') != 0:
            raise RuntimeError('\n'.join(self.messages))
        data = {}
        for name in ['time'] + vectors:
            ptr = self.lib.ngGet_Vec_Info(name.encode())
            if not ptr or not ptr.contents.real:
                raise RuntimeError(f'Missing vector {name}: ' + '\n'.join(self.messages))
            v = ptr.contents
            data[name] = list(v.real[:v.length])
        if abs(data['time'][-1]-duration) > 1e-8:
            raise RuntimeError('Incomplete transient: ' + '\n'.join(self.messages))
        if any(not math.isfinite(v) for a in data.values() for v in a):
            raise RuntimeError('Nonfinite simulation data')
        return data, '\n'.join(self.messages)

def integral(t, y):
    return sum((t1-t0)*(y1+y0)/2 for t0,t1,y0,y1 in zip(t,t[1:],y,y[1:]))

def crossing(t, y, level, rising=True):
    for a,b,x,z in zip(t,t[1:],y,y[1:]):
        if (x < level <= z) if rising else (x > level >= z):
            return a+(b-a)*(level-x)/(z-x)
    return None

def header(title):
    return f'''{title}
* BEHAVIORAL SCREEN -- not a manufacturer macro-model or hardware qualification.
* Board source SHA256 {VERSION}
.options reltol=1e-5 abstol=1e-9 vntol=1e-7 method=gear maxord=2
'''

def brake_network(cap, initial, brake=True, on=51.99, off=51.3432, esr=.01, lag=1e-7, resistance=10, initial_sense=None):
    # First-order sensing lag is an assumed sensitivity parameter, not a TLV3201 model.
    return f'''.param Cbulk={cap:.12g} Vinitial={initial:.12g}
Cbulk cap 0 {{Cbulk}} ic={{Vinitial}}
Resr cap bus {esr}
Rleak bus 0 1e9
Rsense bus sense 1k
Csense sense 0 {lag/1000:.12g} ic={initial if initial_sense is None else initial_sense:.12g}
Vbrake bus rb 0
Rbrake rb drain {resistance if brake else 1e12}
Sbrake drain 0 sense 0 BRK
.model BRK SW(Ron=0.0302 Roff=1e12 Vt={(on+off)/2:.12g} Vh={(on-off)/2:.12g})
'''

def regeneration(p, dt):
    cap=p.get('cap',940e-6); initial=p.get('initial',48)
    e=p.get('energy',.5*.00014*(2*math.pi*1000/60)**2)
    stop=p.get('stop',.020); start=.001; end=start+stop; duration=end+.009
    deck=header(p['name'])+brake_network(cap,initial,p.get('brake',True),p.get('on',51.99),p.get('off',51.3432),p.get('esr',.01),p.get('lag',1e-7),p.get('resistance',10))
    # Triangular electrical power: integral exactly E; assumes all specified mechanical
    # energy reaches the DC bus. It continues after OVP; it is not a torque/speed model.
    deck+=f'''Bregen 0 inj I = (time >= {start} && time <= {end:.12g}) ? ({2*e/stop:.12g}*(1-(time-{start})/{stop:.12g})/max(v(bus),1)) : 0
Vregen inj bus 0
.tran {dt:.12g} {duration:.12g} 0 {dt:.12g} uic
.end
'''
    return deck,['v(bus)','v(cap)','i(vbrake)','i(vregen)'],duration

def winding(p,dt):
    cap=p.get('cap',940e-6); initial=p.get('initial',53.69047619047619)
    current=p.get('current',5.5); inductance=p.get('inductance',.0035); duration=.003
    deck=header(p['name'])+brake_network(cap,initial,p.get('brake',False),on=p.get('on',51.99),off=p.get('off',51.3432),esr=p.get('esr',.01),lag=p.get('lag',1e-7),initial_sense=p.get('initial_sense_v'))
    # Two phases at a 45-degree electrical angle: both initially Irms, total L*Irms^2.
    # Two body diodes per phase; simple diode model, without reverse recovery.
    for phase in ['a','b']:
        deck+=f'''Dlo{phase} 0 lo{phase} BODY
L{phase} lo{phase} w{phase} {inductance} ic={current}
Rw{phase} w{phase} hi{phase} .48
Dhi{phase} hi{phase} ret{phase} BODY
Vret{phase} ret{phase} bus 0
Rfloatlo{phase} lo{phase} 0 1G
Rfloathi{phase} hi{phase} 0 1G
'''
    # An imposed 100 us rotor-energy pulse, not a motor torque/deceleration model.
    energy=p.get('rotor_energy',0)
    deck+=f'''Bregen 0 inj I=(time<=100u) ? ({2*energy/100e-6:.12g}*(1-time/100u)/max(v(bus),1)) : 0
Vregen inj bus 0
.model BODY D(Is=1e-9 N=1.2 Rs=.015 Cjo=330p)
.tran {dt:.12g} {duration} 0 {dt:.12g} uic
.end
'''
    return deck,['v(bus)','v(cap)','i(vbrake)','i(la)','i(lb)','i(vreta)','i(vretb)','i(vregen)','v(loa)','v(hia)','v(lob)','v(hib)'],duration

def overload(p,dt):
    # Reduced selectable 1x/2x eFuse overload envelope. Timer begins at the prescribed load edge.
    # Real PD protocol, source control loop, eFuse thermal behavior and restart are absent.
    ilim=p.get('ilim',18000/4020); source_limit=p.get('source_limit',12)
    pulse=p.get('pulse',2); cbtime=p.get('cbtime',.0255)
    trip=p.get('trip',False); uvlo=p.get('uvlo',False)
    start=.005; load_end=start+p.get('load_duration',.040); duration=.060
    load=p.get('load',7); rcable=.1; rfuse=.031+.0151
    upstream=p.get('upstream',.1)
    vin0=48-(2+upstream)*rcable; bus0=vin0-2*rfuse
    deck=header(p['name'])
    limit=f'((time >= {start} && time < {start+cbtime:.12g}) ? {ilim*pulse:.12g} : {ilim:.12g})'
    deck+=f'''* 48 V source; 100 mOhm source/cable R and 2.2 uF input C are assumptions.
* Upstream logic is represented by a constant {upstream*1000:g} mA load above 10 V.
* Initial capacitors are precharged: this is an overload test, not startup.
Videal ideal 0 48
Bsource ideal src I = (v(trip) < .5) ? min({source_limit},max(0,(48-v(vin))/{rcable})) : 0
Vsource src vin 0
Cinput vin 0 2.2u ic={vin0}
Rleakin vin 0 1G
Blogic vin 0 I={upstream:.12g}*min(1,max(v(vin),0)/10)
Bpath vin feed I = (v(uv) > .5) ? 0 : min({limit},max(0,(v(vin)-v(bus))/{rfuse}))
Vfeed feed bus 0
Cbulk cap 0 940u ic={bus0}
Resr cap bus .01
Rleakout bus 0 1G
Bload bus 0 I = (v(uv) > .5) ? 0 : (((time >= {start} && time < {load_end}) ? {load} : 2)*min(1,max(v(bus),0)/10))
* Below 10 V the synthetic load folds back; post-collapse values are illustrative.
'''
    if trip:
        deck+='''* Hypothetical source trips after 1 ms above 5 A, then stays off.
Btimer 0 timer I = (v(trip) > .5) ? 0 : ((i(Vsource) > 5) ? 1 : -min(max(v(timer),0)*1e7,1e7))
Ctimer timer 0 1 ic=0
Vone one 0 1
Strip one trip timer 0 TRIP
Rtrip trip 0 1k
.model TRIP SW(Ron=.001 Roff=1e12 Vt=.0005 Vh=.0005)
'''
    else:
        deck+='Vtrip trip 0 0\n'
    if uvlo:
        deck+='''* Combined successful eFuse disconnect/load-inhibit sensitivity at 44.4 V input.
* This latches off; it is not a model of the actual firmware or eFuse auto-retry.
Buvtimer 0 uvtimer I=(v(vin)<44.4 && time>5m) ? 1 : 0
Cuvtimer uvtimer 0 1 ic=0
Buv uv 0 V=(v(uvtimer)>1u) ? 1 : 0
'''
    else:
        deck+='Vuv uv 0 0\n'
    deck+=f'''.tran {dt:.12g} {duration} 0 {dt:.12g} uic
.end
'''
    return deck,['v(bus)','v(cap)','v(vin)','i(vsource)','i(vfeed)','v(trip)','v(uv)'],duration

def summarize(p,d):
    t=d['time']; bus=d['v(bus)']; cap=d['v(cap)']; c=p.get('cap',940e-6)
    s={'bus_max_v':max(bus),'bus_min_v':min(bus),'bus_final_v':bus[-1],
       'first_55v_s':crossing(t,bus,55),'first_60v_s':crossing(t,bus,60),'rows':len(t)}
    if p['kind']!='overload':
        ib=d['i(vbrake)']; rb=p.get('resistance',10) if p.get('brake',p['kind']=='regen') else 1e12
        s.update(brake_peak_a=max(ib), brake_peak_w=max(i*i*rb for i in ib),
                 brake_energy_j=integral(t,[i*i*rb for i in ib]),
                 capacitor_energy_change_j=.5*c*(cap[-1]**2-p.get('initial',48 if p['kind']=='regen' else 53.69047619047619)**2))
        if p['kind']=='regen':
            ir=d['i(vregen)']; s['injected_energy_j']=integral(t,[v*i for v,i in zip(bus,ir)])
            s['bank_ripple_rms_a_over_run']=math.sqrt(integral(t,[(i-j)**2 for i,j in zip(ir,ib)])/t[-1])
            s['esr_energy_j']=integral(t,[(v-u)**2/p.get('esr',.01) for v,u in zip(bus,cap)])
            s['switch_energy_j']=integral(t,[i*i*.0302 for i in ib])
            s['energy_residual_j']=s['injected_energy_j']-s['brake_energy_j']-s['capacitor_energy_change_j']-s['esr_energy_j']-s['switch_energy_j']
        else:
            l=p.get('inductance',.0035); i0=p.get('current',5.5)
            s['initial_winding_energy_j']=l*i0*i0
            s['returned_energy_j']=integral(t,[v*(a+b) for v,a,b in zip(bus,d['i(vreta)'],d['i(vretb)'])])
            s['copper_energy_j']=integral(t,[.48*(a*a+b*b) for a,b in zip(d['i(la)'],d['i(lb)'])])
            s['lossless_capacitor_final_v']=math.sqrt(p.get('initial',53.69047619047619)**2+2*l*i0*i0/c)
            injected=integral(t,[v*i for v,i in zip(bus,d['i(vregen)'])])
            esr=integral(t,[(v-u)**2/p.get('esr',.01) for v,u in zip(bus,cap)])
            switch=integral(t,[i*i*.0302 for i in ib])
            diode=sum(integral(t,[-lo*il+(hi-v)*ir for lo,il,hi,v,ir in
                zip(d['v(lo'+phase+')'],d['i(l'+phase+')'],d['v(hi'+phase+')'],bus,d['i(vret'+phase+')'])]) for phase in ['a','b'])
            remaining=.5*l*(d['i(la)'][-1]**2+d['i(lb)'][-1]**2)
            residual=s['initial_winding_energy_j']+injected-s['capacitor_energy_change_j']-s['brake_energy_j']-s['copper_energy_j']-esr-switch-diode-remaining
            s.update(injected_rotor_energy_j=injected,energy_residual_j=residual,
                diode_energy_j=diode,esr_energy_j=esr,switch_energy_j=switch,remaining_winding_energy_j=remaining)
    else:
        i=d['i(vsource)']; s.update(input_peak_a=max(i),efuse_peak_a=max(d['i(vfeed)']),first_5a_s=crossing(t,i,5),
            first_44v_s=crossing(t,bus,44,False),first_40v_s=crossing(t,bus,40,False),
            above_5a_ms=1000*integral(t,[float(v>5.0001) for v in i]),
            source_trip_s=crossing(t,d['v(trip)'],.5),load_uvlo_s=crossing(t,d['v(uv)'],.5))
    return s


def main():
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--library'); ap.add_argument('--csv-dir',type=Path); ap.add_argument('--check',action='store_true')
    args=ap.parse_args()
    audit=json.loads((REPO/'engineering/power-audit.json').read_text())
    if audit['input_sha256']['index.circuit.tsx'] != VERSION:
        raise RuntimeError('Refresh power-audit.json from the current source before simulating')
    model_hash=hashlib.sha256(Path(__file__).read_bytes()).hexdigest()
    audit_hash=hashlib.sha256(json.dumps({k:audit[k] for k in ['calculations','assumptions','errors']},sort_keys=True).encode()).hexdigest()
    if args.check:
        r=json.loads((ROOT/'results.json').read_text())
        assert r['source_sha256']==VERSION and r['model_sha256']==model_hash and r['audit_parameters_sha256']==audit_hash, 'Stale simulation evidence'
        assert r['hardware_qualified'] is False and not r['errors'] and all(r['checks'].values()) and len(r['cases'])==14
        for name,digest in r['deck_sha256'].items():
            assert hashlib.sha256((ROOT/name).read_bytes()).hexdigest()==digest, 'Changed simulation deck: '+name
        print('Fourteen behavioral cases: source/model/audit-parameter/deck hashes and numerical checks verified; hardware remains unqualified.')
        return
    a=audit['calculations']; th=a['thresholds_v']
    corner=dict(kind='winding',cap=752e-6,initial=th['motor_cutoff_screen']['max'],
        inductance=.0042,current=a['current']['sensitivity_max_rms_a'],
        on=th['brake_on_screen']['max'],off=th['brake_off_screen']['max'])
    upstream=a['supply']['efuse_limit']['upstream_input_allocation_a']
    restricted=a['commissioning_profile']['brake_open_sensitivity']
    rotor_energy=restricted['returned_energy_j']-.0042*restricted['each_phase_instantaneous_current_a']**2
    cases=[
      dict(name='winding_nominal_brake',kind='winding',brake=True,
           initial=th['motor_cutoff_screen']['nominal'],current=a['current']['programmed_rms_a'],
           on=th['brake_on_screen']['nominal'],off=th['brake_off_screen']['nominal']),
      dict(corner,name='winding_corner_brake',brake=True),
      dict(corner,name='winding_corner_open',brake=False),
      dict(corner,name='commissioning_corner_open',brake=False,current=a['current']['sensitivity_max_rms_a']*7/32),
      dict(corner,name='winding_corner_recovery_100us',brake=True,lag=100e-6,initial_sense_v=48),
      dict(corner,name='restricted_open_with_rotor',brake=False,current=1.5,rotor_energy=rotor_energy),
      dict(corner,name='restricted_supply_loss_open',brake=False,current=1.5,rotor_energy=rotor_energy,initial=50.4),
      dict(name='rotor_1000rpm_brake',kind='regen',cap=752e-6,on=th['brake_on_screen']['max'],off=th['brake_off_screen']['max']),
      dict(name='rotor_1000rpm_open',kind='regen',cap=752e-6,brake=False),
      dict(name='five_joules_20ms_stress',kind='regen',energy=5,cap=752e-6,
           on=th['brake_on_screen']['nominal'],off=th['brake_off_screen']['nominal']),
      dict(name='input_new_1x_corner',kind='overload',ilim=a['supply']['efuse_limit']['max_a'],pulse=1,upstream=upstream),
      dict(name='input_new_1x_nominal_10a',kind='overload',ilim=a['supply']['efuse_limit']['formula_nominal_a'],pulse=1,upstream=upstream,load=10,load_duration=.002),
      dict(name='input_new_1x_corner_10a',kind='overload',ilim=a['supply']['efuse_limit']['max_a'],pulse=1,upstream=upstream,load=10,load_duration=.002),
      dict(name='input_old_2x_reference',kind='overload',ilim=18000/4020,pulse=2),
    ]
    spice=Spice(args.library); ROOT.mkdir(parents=True,exist_ok=True)
    result={'source_sha256':VERSION,'model_type':'behavioral transient screen',
      'hardware_qualified':False,'simulator_version':spice.version,'model_sha256':model_hash,
      'audit_parameters_sha256':audit_hash,
      'assumptions':['100% prescribed energy return; no full motor/bridge model',
        '10 mOhm bank ESR assumption; no capacitor ripple or thermal qualification',
        '2.2 uF lumped input capacitance, 100 mOhm source/cable resistance; revised input cases use 250 mA upstream, old reference uses 100 mA; not measured',
        'Ideal eFuse current envelope omits finite response, thermal shutdown and PD source dynamics',
        'Winding corner starts at maximum cutoff; 100 ns sensor lag is assumed; separate 100 us recovery begins at a 48 V sense state',
        'Restricted rotor cases impose 15 rpm rotor energy over 100 us; other winding cases exclude mechanical energy',
        'Brake cable inductance/clamp transient is a separate screen, not in the bus models'], 'cases':[]}
    errors=[]
    for p in cases:
      summaries=[]
      for refinement in [1,2]:
        dt=(.1e-6 if p['kind']=='winding' else 1e-6)/refinement
        deck,vs,duration={'winding':winding,'regen':regeneration,'overload':overload}[p['kind']](p,dt)
        d,log=spice.run(deck,vs,duration); summary=summarize(p,d);summaries.append(summary)
        if refinement==2:
          (ROOT/(p['name']+'.cir')).write_text(deck)
          if args.csv_dir:
            args.csv_dir.mkdir(parents=True,exist_ok=True)
            with (args.csv_dir/(p['name']+'.csv')).open('w',newline='') as f:
              w=csv.writer(f);w.writerow(d);w.writerows(zip(*d.values()))
      differences={k:abs(summaries[0][k]-summaries[1][k]) for k in ['bus_max_v','bus_min_v']}
      if max(differences.values())>.02: errors.append(p['name']+': timestep sensitivity >20 mV')
      if p['kind']=='regen' and abs(summaries[1]['energy_residual_j'])>1e-3:
        errors.append(p['name']+': energy residual >1 mJ')
      if p['kind']=='winding' and abs(summaries[1]['energy_residual_j'])>max(50e-6,.005*(summaries[1]['initial_winding_energy_j']+summaries[1]['injected_rotor_energy_j'])):
        errors.append(p['name']+': winding energy balance outside 50 uJ / 0.5% bound')
      if p['kind']=='overload' and abs(summaries[0]['input_peak_a']-summaries[1]['input_peak_a'])>.002:
        errors.append(p['name']+': input-current timestep sensitivity >2 mA')
      result['cases'].append({'parameters':p,'normal':summaries[0],'fine':summaries[1],'refinement_difference_v':differences})
      print(p['name'],json.dumps(summaries[1]),flush=True)
    by={c['parameters']['name']:c['fine'] for c in result['cases']}
    # These are bounded model assertions, not a hardware acceptance certificate.
    checks={
      'healthy_winding_corner_plus_0p5v_allocation_below_55v':by['winding_corner_brake']['bus_max_v']+.5<55,
      'commissioning_open_winding_plus_0p5v_allocation_below_55v':by['commissioning_corner_open']['bus_max_v']+.5<55,
      'new_steady_envelope_below_5a':by['input_new_1x_corner']['input_peak_a']<5,
      'new_10a_request_envelope_below_5a':by['input_new_1x_corner_10a']['input_peak_a']<5,
      'restricted_rotor_and_winding_plus_0p5v_allocation_below_55v':by['restricted_open_with_rotor']['bus_max_v']+.5<55,
      'old_2x_envelope_exceeds_5a':by['input_old_2x_reference']['input_peak_a']>5,
      'open_brake_at_1000rpm_remains_unsafe':by['rotor_1000rpm_open']['bus_max_v']>60,
      'unapproved_5j_20ms_load_remains_unsafe':by['five_joules_20ms_stress']['bus_max_v']>55,
    }
    errors += [k for k,v in checks.items() if not v]
    result.update(checks=checks,errors=errors,deck_sha256={p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(ROOT.glob('*.cir'))})
    (ROOT/'results.json').write_text(json.dumps(result,indent=2)+'\n')
    if errors: raise RuntimeError(errors)

if __name__=='__main__':main()
