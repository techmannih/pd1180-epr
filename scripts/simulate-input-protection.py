#!/usr/bin/env python3
"""Numerical screens for the input ECO and unresolved brake coordination.

Uses the inspected behavioral models from the supplied 16d1347 report, not
manufacturer macro-models. No PD protocol, switching ripple, physical loop
response, thermal model or mechanical load qualification is implied.
"""
import hashlib
import importlib.util
import json
import math
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.dont_write_bytecode = True
MODEL = ROOT / 'engineering/simulation/behavioral_models.py'
spec = importlib.util.spec_from_file_location('behavioral_models', MODEL)
model = importlib.util.module_from_spec(spec)
spec.loader.exec_module(model)


def main():
    audit = json.loads((ROOT / 'engineering/power-audit.json').read_text())
    limit = audit['calculations']['supply']['efuse_limit']
    assert audit['calculations']['supply']['overload_after_pgood']['pulse_multiplier'] == 1
    output = ROOT / 'engineering/input-protection'
    (output / 'netlists').mkdir(exist_ok=True)
    source_hash = hashlib.sha256((ROOT / 'index.circuit.tsx').read_bytes()).hexdigest()
    thresholds = audit['calculations']['thresholds_v']
    prototype = audit['calculations']['commissioning_profile']['brake_open_sensitivity']
    current_cutoff = thresholds['motor_cutoff_screen']['max']
    applied_brake = dict(on=thresholds['brake_on_screen']['max'],
                         off=thresholds['brake_off_screen']['max'])
    scenarios = [
        dict(name='old_2x_10A_request', kind='overload', load=10, load_duration=.002),
        dict(name='new_1x_nominal_10A_request', kind='overload', load=10, load_duration=.002,
             pulse=1, ilim=limit['formula_nominal_a']),
        dict(name='new_1x_upper_screen_10A_request', kind='overload', load=10, load_duration=.002,
             pulse=1, ilim=limit['max_a']),
        dict(name='new_1x_upper_screen_7A_40ms', kind='overload', load=7,
             pulse=1, ilim=limit['max_a']),
        dict(name='historical_cutoff_brake_working', kind='winding', brake=True, cap=752e-6,
             initial=54.2624803854, inductance=.0042, current=5.7125991733),
        dict(name='candidate_cutoff_53V3_brake_working', kind='winding', brake=True, cap=752e-6,
             initial=53.3, inductance=.0042, current=5.7125991733),
        dict(name='candidate_cutoff_53V3_brake_open', kind='winding', brake=False, cap=752e-6,
             initial=53.3, inductance=.0042, current=5.7125991733),
        dict(name='applied_full_current_brake_working', kind='winding', brake=True, cap=752e-6,
             initial=current_cutoff, inductance=.0042, current=5.7125991733, **applied_brake),
        dict(name='applied_full_current_brake_open', kind='winding', brake=False, cap=752e-6,
             initial=current_cutoff, inductance=.0042, current=5.7125991733, **applied_brake),
        dict(name='applied_full_current_brake_recovery_100us', kind='winding', brake=True, cap=752e-6,
             initial=current_cutoff, inductance=.0042, current=5.7125991733,
             lag=100e-6, initial_sense_v=48, **applied_brake),
    ]
    for name, initial, connected in [('brake_working', current_cutoff, True),
                                      ('brake_open', current_cutoff, False),
                                      ('supply_loss_brake_open', 50.4, False)]:
        scenarios.append(dict(name='applied_restricted_'+name, kind='winding', brake=connected,
             cap=prototype['minimum_capacitance_f'], initial=initial, inductance=.0042,
             current=prototype['each_phase_instantaneous_current_a'],
             rotor_energy=prototype['returned_energy_j']-.0042*prototype['each_phase_instantaneous_current_a']**2,
             **applied_brake))
    spice = model.Spice()
    results = []
    for case in scenarios:
        runs = []
        for fine in [False, True]:
            dt = (1e-7 if case['kind'] == 'winding' else 1e-6) / (2 if fine else 1)
            generator = model.winding if case['kind'] == 'winding' else model.overload
            deck, vectors, duration = generator(case, dt)
            if case['name'].startswith('applied_'):
                # Replace only the archived default brake network; retain the
                # archived winding/body-diode model without silently editing it.
                old = model.brake_network(case['cap'], case['initial'], case['brake'])
                revised = model.brake_network(case['cap'], case['initial'], case['brake'],
                    case['on'], case['off'], lag=case.get('lag', 1e-7))
                if 'initial_sense_v' in case:
                    # A high-bus brake-drive recovery sensitivity. Starting the
                    # sensor at Vinitial would leave the switch ON from t=0 and
                    # would not exercise a delayed brake turn-on.
                    revised = revised.replace(' ic={Vinitial}\nVbrake',
                        f' ic={case["initial_sense_v"]}\nVbrake')
                assert old in deck
                deck = deck.replace(old, revised)
                # Conservative rotor return in 100 us coincident with winding
                # discharge. It is an imposed energy pulse, not a torque model.
                energy = case.get('rotor_energy', 0)
                injection = f'''Bregen 0 inj I=(time<=100u) ? ({2*energy/100e-6:.12g}*(1-time/100u)/max(v(bus),1)) : 0
Vregen inj bus 0
'''
                deck = deck.replace('.model BODY', injection+'.model BODY')
                vectors = vectors+['i(vregen)', 'v(loa)', 'v(hia)', 'v(lob)', 'v(hib)']
            deck = deck.replace('* Board source commit ' + model.VERSION,
                                '* Model basis ' + model.VERSION + '\n* Current source SHA256 ' + source_hash)
            if case['name'].startswith('new_'):
                # Upstream allocation belongs outside the eFuse current path.
                # Update initial source/bus voltages consistently at 2 A preload.
                upstream = limit['upstream_input_allocation_a']
                vin = 48 - (2 + upstream) * .1
                bus = vin - 2 * .0461
                deck = deck.replace('I=.03*min', f'I={upstream:.12g}*min')
                deck = deck.replace('constant 30 mA', f'constant {upstream*1000:g} mA')
                deck = deck.replace('ic=47.797', f'ic={vin:.12g}')
                deck = deck.replace('ic=47.7048', f'ic={bus:.12g}')
            suffix = '_fine' if fine else ''
            (output / 'netlists' / (case['name'] + suffix + '.cir')).write_text(deck)
            data, log = spice.run(deck, vectors, duration)
            summary = model.summarize(case, data)
            if case['name'].startswith('applied_'):
                t = data['time']; bus = data['v(bus)']; cap = data['v(cap)']
                injected = model.integral(t, [v*i for v,i in zip(bus,data['i(vregen)'])])
                esr = model.integral(t, [(v-u)**2/.01 for v,u in zip(bus,cap)])
                switch = model.integral(t, [i*i*.0302 for i in data['i(vbrake)']])
                diode = sum(model.integral(t, [-lo*il+(hi-v)*ir for lo,il,hi,v,ir in
                    zip(data['v(lo'+p+')'],data['i(l'+p+')'],data['v(hi'+p+')'],bus,data['i(vret'+p+')'])]) for p in ['a','b'])
                remaining = .5*case['inductance']*(data['i(la)'][-1]**2+data['i(lb)'][-1]**2)
                residual = summary['initial_winding_energy_j']+injected-summary['capacitor_energy_change_j']-summary['brake_energy_j']-summary['copper_energy_j']-esr-switch-diode-remaining
                summary.update(injected_rotor_energy_j=injected, energy_residual_j=residual,
                    diode_energy_j=diode, esr_energy_j=esr, switch_energy_j=switch)
                # Small sense/diode capacitances and leakage are omitted from
                # this balance; reject residuals over 50 uJ or 0.5% input energy.
                assert abs(residual) < max(50e-6,.005*(summary['initial_winding_energy_j']+injected)), (case['name'],residual)
            runs.append(summary)
        peak_difference = abs(runs[0]['bus_max_v'] - runs[1]['bus_max_v'])
        assert peak_difference < .01, (case['name'], peak_difference)
        if case['kind'] == 'overload':
            assert abs(runs[0]['input_peak_a'] - runs[1]['input_peak_a']) < .002
        if case['name'].startswith('new_'):
            # Only the idealized behavioral envelope is checked here. Fast-trip
            # spikes from finite real current-loop response are not modeled.
            assert runs[1]['input_peak_a'] <= case['ilim'] + limit['upstream_input_allocation_a'] + .001
        results.append(dict(parameters=case, fine= runs[1], peak_timestep_difference_v=peak_difference))
        print(case['name'], 'bus peak', round(runs[1]['bus_max_v'], 4),
              'input peak', runs[1].get('input_peak_a'), flush=True)
    energy = .0042 * 5.7125991733 ** 2
    report = {
        'source_sha256': source_hash,
        'audit_sha256': hashlib.sha256((ROOT / 'engineering/power-audit.json').read_bytes()).hexdigest(),
        'model_sha256': hashlib.sha256(MODEL.read_bytes()).hexdigest(),
        'script_sha256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
        'numerical_checks_passed': True, 'hardware_qualified': False,
        'scope': f'{len(scenarios)} behavioral scenarios at two timesteps. Applied cases use current audited R61/R66 thresholds; historical/candidate cases remain comparison data.',
        'assumptions': ['Permissive 48 V source, 0.1 ohm cable, ideal current limiter envelope',
                        'New cases use the 250 mA upstream allocation, not measured consumption',
                        'No real loop overshoot, cable inductance, motor chopping or thermal model',
                        'Winding cases impose an already-high initial bus and enabled/off brake',
                        'Restricted cases impose 15 rpm rotor energy over 100 us; other winding cases exclude mechanical energy',
                        'The brake-recovery case starts sensing at 48 V with a 100 us RC lag while the bus starts at cutoff; it is not a measured or guaranteed delay',
                        'No attached-load energy, source continuing to drive the bus, or hardware qualification'],
        'brake_open_winding_screen': {
            'energy_j': energy, 'minimum_capacitance_f': 752e-6,
            'screened_peak_target_v': 54.5,
            'maximum_initial_bus_v_for_winding_energy_only': math.sqrt(54.5 ** 2 - 2 * energy / 752e-6),
            'mechanical_energy_included': False,
            'conclusion': 'A lower working-brake cutoff alone does not close the open-brake fault.'},
        'cases': results,
    }
    (output / 'simulation.json').write_text(json.dumps(report, indent=2) + '\n')


if __name__ == '__main__':
    main()
