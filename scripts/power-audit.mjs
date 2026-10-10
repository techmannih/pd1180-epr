import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'

// A DC/tolerance screen, not a simulation of switching waveforms or hardware certification.
export const rmsCurrent = (scaler, cs, shunt) =>
  (scaler === 0 ? 256 : scaler) / 256 * (cs + 1) / 32 * 0.325 / shunt / Math.SQRT2

export function inductanceHenries(value) {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value
  const match = typeof value === 'string' && value.match(/^([\d.]+)\s*(n|u|µ|m)?H$/)
  const result = match && Number(match[1]) * ({ n: 1e-9, u: 1e-6, µ: 1e-6, m: 1e-3 }[match[2]] ?? 1)
  if (!(result > 0) || !Number.isFinite(result)) throw new Error(`Invalid inductance: ${value}`)
  return result
}

export function supplyIsolationErrors(railKeys) {
  const errors = []
  const seen = new Map()
  for (const [rail, key] of Object.entries(railKeys)) {
    if (!key) errors.push(`Missing compiled supply net ${rail}`)
    else if (seen.has(key)) errors.push(`${rail} is shorted to ${seen.get(key)} in compiled connectivity`)
    else seen.set(key, rail)
  }
  return errors
}

// TPS2663 section 8.3.9 forbids an IMON bypass capacitor. Compare compiled
// connectivity, so renamed nets and direct trace connections are covered too.
export function imonBypassErrors(circuit) {
  const controller = circuit.find(p => p.type === 'source_component' && p.name === 'U6')
  const ports = circuit.filter(p => p.type === 'source_port')
  const pinKey = pin => controller && ports.find(p =>
    p.source_component_id === controller.source_component_id && p.pin_number === pin,
  )?.subcircuit_connectivity_map_key
  const imon = pinKey(13), ground = pinKey(8)
  if (!imon || !ground || imon === ground) return ['Cannot verify distinct U6 IMON and GND connectivity']
  return circuit.filter(p => p.type === 'source_component' && p.ftype === 'simple_capacitor')
    .filter(cap => {
      const nets = new Set(ports.filter(p => p.source_component_id === cap.source_component_id)
        .map(p => p.subcircuit_connectivity_map_key))
      return nets.has(imon) && nets.has(ground)
    }).map(cap => `${cap.name}: TPS26631 IMON must not have a bypass capacitor (TI section 8.3.9)`)
}

export function dividerRange(top, bottom, threshold, leakage = 0, tolerance = 0.01) {
  return {
    min: threshold.min * (1 + top * (1 - tolerance) / (bottom * (1 + tolerance))) - leakage * top * (1 + tolerance),
    nominal: threshold.nominal * (1 + top / bottom),
    max: threshold.max * (1 + top * (1 + tolerance) / (bottom * (1 - tolerance))) + leakage * top * (1 + tolerance),
  }
}

export function operatingErrors({ vsaOnMotorBus, brakeOn, motorCutoff, vsaMaximum = 50, vsMaximum = 55, rippleAllowance = 0.5 }) {
  const errors = []
  if (vsaOnMotorBus && brakeOn.nominal > vsaMaximum)
    errors.push('U7 VSA is tied to VMOTOR; nominal brake turn-on exceeds the 50 V VSA operating limit.')
  if (motorCutoff.max + rippleAllowance >= vsMaximum)
    errors.push('Motor overvoltage cutoff plus the ripple allowance can reach/exceed the 55 V VS operating limit.')
  if (brakeOn.max >= motorCutoff.min)
    errors.push('Brake turn-on and motor cutoff tolerance envelopes overlap.')
  return errors
}

export async function audit() {
  const paths = ['index.circuit.tsx', 'dist/index/circuit.json', 'docs/design-manifest.json',
    'hardware-contract.json', 'firmware/include/tmc5160_config.h',
    'dist/manufacturing/kicad-project/pd1180-epr-r0.3.kicad_pcb', 'scripts/power-audit.mjs']
  const bytes = Object.fromEntries(await Promise.all(paths.map(async p => [p, await readFile(p)])))
  const circuit = JSON.parse(bytes['dist/index/circuit.json'])
  const parts = Object.fromEntries(circuit.filter(p => p.type === 'source_component').map(p => [p.name, p]))
  const contract = JSON.parse(bytes['hardware-contract.json'])
  const part = name => {
    if (!parts[name]) throw new Error(`Missing source component ${name}`)
    return parts[name]
  }
  const resistance = name => {
    const value = part(name).resistance
    if (!(value > 0)) throw new Error(`Missing resistance for ${name}`)
    return value
  }
  const sum = names => names.reduce((v, name) => v + resistance(name), 0)
  const config = bytes['firmware/include/tmc5160_config.h'].toString()
  const macro = name => {
    const value = config.match(new RegExp(`#define ${name} (\\d+)u`))
    if (!value) throw new Error(`Missing firmware macro ${name}`)
    return Number(value[1])
  }
  // Existing thick-film parts: initial tolerance only for non-coordination screens.
  const t = 0.01
  const inputTrip = { min: 1.176, nominal: 1.2, max: 1.224 }
  const uvlo = dividerRange(sum(['R19', 'R20']), resistance('R21'), inputTrip, 150e-9)
  // 0.1% precision dividers, <=25 ppm/C, maximum 100 C excursion from 25 C.
  // Include R22's 1% initial + 100 ppm/C separately from the precision resistors.
  const precisionTolerance = 0.001 + 25e-6 * 100
  const ovpTop = sum(['R22', 'R23'])
  const ovpTopTolerance = (resistance('R22') * 0.02 + resistance('R23') * precisionTolerance) / ovpTop
  const ovp = {
    min: inputTrip.min * (1 + ovpTop * (1-ovpTopTolerance)/(resistance('R24')*(1+precisionTolerance))) - 150e-9*ovpTop*(1+ovpTopTolerance),
    nominal: inputTrip.nominal * (1 + ovpTop/resistance('R24')),
    max: inputTrip.max * (1 + ovpTop * (1+ovpTopTolerance)/(resistance('R24')*(1-precisionTolerance))) + 150e-9*ovpTop*(1+ovpTopTolerance),
  }
  // REF3425: 0.05% initial + 6 ppm/C over the entire 165 C temperature span.
  // TLV3201: 4 mV offset; add 2 mV allocation for hysteresis/noise. The latter
  // is a design allocation requiring measured confirmation, not a TI guarantee.
  const referenceError = 2.5 * (0.0005 + 6e-6 * 165) + 0.004 + 0.002
  const ref = { min: 2.5-referenceError, nominal: 2.5, max: 2.5+referenceError }
  const brakeTop = sum(['R60', 'R61']), brakeBottom = resistance('R62'), feedback = resistance('R63')
  const brakeOn = {
    min: ref.min * (1 + brakeTop * (1-precisionTolerance)/(brakeBottom*(1+precisionTolerance)) + brakeTop*(1-precisionTolerance)/(feedback*(1+precisionTolerance))) - 0.325*brakeTop*(1+precisionTolerance)/(feedback*(1-precisionTolerance)) - 5e-9*brakeTop,
    nominal: ref.nominal * (1 + brakeTop/brakeBottom + brakeTop/feedback),
    max: ref.max * (1 + brakeTop*(1+precisionTolerance)/(brakeBottom*(1-precisionTolerance)) + brakeTop*(1+precisionTolerance)/(feedback*(1-precisionTolerance))) + 5e-9*brakeTop,
  }
  const motorCutoff = dividerRange(resistance('R64'), sum(['R65','R66']), ref, 5e-9, precisionTolerance)
  const ilim = {
    formula_nominal_a: 18000 / resistance('R25'),
    table_nominal_a: 4.5,
    min_a: 4.185 * 4020 / (resistance('R25') * (1+t)),
    max_a: 4.815 * 4020 / (resistance('R25') * (1-t)),
  }
  const target = contract.rated_targets.motor_phase_rms_a
  const rs = resistance('R109'), telemetryShunt = resistance('R115')
  if (rs !== resistance('R110') || telemetryShunt !== resistance('R116')) throw new Error('Phase shunts differ; audit each phase separately')
  const programmed = rmsCurrent(macro('PD1180_GLOBALSCALER'), macro('PD1180_IRUN'), rs)
  const capacitance = name => {
    const value = part(name).capacitance
    if (!(value > 0)) throw new Error(`Missing capacitance for ${name}`)
    return value
  }
  const bulk = capacitance('C22') + capacitance('C23')
  const slew = { min: 1.775e-6 * 23.5 / (capacitance('C18') * 1.1), nominal: 2e-6 * 25 / capacitance('C18'), max: 2.225e-6 * 26 / (capacitance('C18') * 0.9) }
  const netKey = name => circuit.find(p => p.type === 'source_net' && p.name === name)?.subcircuit_connectivity_map_key
  const pinKey = (name, pin) => circuit.find(p => p.type === 'source_port' && p.source_component_id === part(name).source_component_id && p.pin_number === pin)?.subcircuit_connectivity_map_key
  const vsaOnMotorBus = pinKey('U7', 4) === netKey('VMOTOR')
  const errors = operatingErrors({ vsaOnMotorBus, brakeOn, motorCutoff })
  errors.push(...imonBypassErrors(circuit))
  // Allow a 5% high 48 V source plus 0.3 V noise margin without nuisance OVP.
  if (ovp.min < 48*1.05 + 0.3) errors.push('Input OVP lacks margin above a 5% high 48 V source')
  if (ovp.max + 0.5 >= 55) errors.push('Input OVP plus transient allowance exceeds the VS operating limit')
  errors.push(...supplyIsolationErrors(Object.fromEntries(
    ['VMOTOR', 'TMC_12V', 'GND', 'DRIVER_BUCK_SW', 'DRIVER_BUCK_BOOT', 'DRIVER_BUCK_VCC', 'VREF_2V5', 'V3V3'].map(name => [name, netKey(name)]),
  )))
  if (pinKey('C61', 1) !== netKey('TMC_12V')) errors.push('C61 local VSA bypass must be on TMC_12V')
  for (const [name,pin,net] of [['U7',3,'TMC_12V'],['U7',4,'TMC_12V'],['U7',33,'VMOTOR'],['U34',2,'VMOTOR'],['U34',3,'VMOTOR'],['U34',5,'DRIVER_BUCK_FB'],['U34',8,'DRIVER_BUCK_SW'],['L3',1,'DRIVER_BUCK_SW'],['L3',2,'TMC_12V'],['U34',1,'GND'],['U34',6,'DRIVER_BUCK_VCC'],['U34',7,'DRIVER_BUCK_BOOT'],['U34',9,'GND'],['C86',1,'VMOTOR'],['C86',2,'GND'],['C87',1,'VMOTOR'],['C87',2,'GND'],['C88',1,'DRIVER_BUCK_VCC'],['C88',2,'GND'],['C89',1,'DRIVER_BUCK_BOOT'],['C89',2,'DRIVER_BUCK_SW'],['C90',1,'TMC_12V'],['C90',2,'GND'],['C91',1,'TMC_12V'],['C91',2,'GND'],['C92',1,'TMC_12V'],['C92',2,'GND'],['R121',1,'TMC_12V'],['R121',2,'DRIVER_BUCK_FB'],['R122',1,'DRIVER_BUCK_FB'],['R122',2,'GND'],['C93',1,'V3V3'],['C93',2,'GND'],['C94',1,'VREF_2V5'],['C94',2,'GND'],['U12',1,'GND'],['U12',2,'GND'],['U12',3,'V3V3'],['U12',4,'V3V3'],['U12',5,'VREF_2V5'],['U12',6,'VREF_2V5']]) {
    if (!netKey(net) || pinKey(name,pin) !== netKey(net)) errors.push(`${name}.${pin} must connect to ${net}`)
  }
  const requiredParts = { U12:'C187836', U34:'C1858393', L3:'C2047110', R22:'C23162', R23:'C705777', R24:'C95204', R60:'C326731', R61:'C860148', R62:'C95204', R63:'C326730', R64:'C861400', R65:'C723637', R66:'C110776', R122:'C861611' }
  for (const [name,code] of Object.entries(requiredParts)) {
    if (!part(name).supplier_part_numbers?.jlcpcb?.includes(code)) errors.push(`${name}: ${code} is required for the audited ratings/tolerances`)
  }
  const driverRail = {
    nominal: 1 + resistance('R121') / resistance('R122'),
    min: 0.985 * (1 + resistance('R121')*0.98/(resistance('R122')*(1+precisionTolerance))),
    max: 1.025 * (1 + resistance('R121')*1.02/(resistance('R122')*(1-precisionTolerance))),
  }
  if (driverRail.min < 10 || driverRail.max > 13) errors.push('External VSA + 12VOUT must remain between 10 and 13 V')
  const inductance = inductanceHenries(part('L3').inductance)
  const minimumInductance = 0.625 * driverRail.max / 340000
  if (inductance * 0.8 < minimumInductance) errors.push('L3 is below the regulator minimum inductance at tolerance')
  for (const cap of ['C32', 'C33', 'C34', 'C35']) {
    if (capacitance(cap) < 470e-9) errors.push(`${cap}: use 470 nF for the MOSFET maximum gate charge of 22 nC`)
  }
  const report = {
    schema_version: 1,
    checked_at: new Date().toISOString(),
    status: errors.length ? 'electrical-design-blocked' : 'screen-complete-hardware-unqualified',
    powered_tests_performed: false,
    input_sha256: Object.fromEntries(paths.map(p => [p, createHash('sha256').update(bytes[p]).digest('hex')])),
    assumptions: {
      resistor_initial_tolerance_fraction: t,
      protection_resistor_initial_tolerance_fraction: 0.001,
      protection_resistor_max_tcr_ppm_per_c: 25,
      protection_temperature_range_c: [-40,125],
      comparator_hysteresis_and_noise_allocation_v: 0.002,
      motor_bus_dynamic_overshoot_allocation_v: 0.5,
      source_high_voltage_design_allowance_fraction: 0.05,
      input_ovp_noise_margin_v: 0.3,
      bulk_capacitance_tolerance_fraction: 0.2,
      slew_capacitance_initial_tolerance_fraction: 0.1,
      capacitor_dc_bias_and_temperature_included: false,
      motor_model: contract.rated_targets.motor,
      motor_phase_resistance_20c_ohm: 0.45,
      motor_phase_inductance_h: 0.0045,
      motor_rotor_inertia_kg_m2: 0.00027,
      external_load_inertia: null,
      motor_rpm_and_stop_time: null,
      mosfet_hot_resistance_multiplier: 2,
      mosfet_hot_multiplier_is_guaranteed: false,
      switching_frequency_sensitivity_hz: [20000, 40000],
      missing_models: ['PCB thermal boundary conditions', 'MOSFET switching/dead-time losses', 'capacitor RMS ripple', 'motor iron/friction/load losses', 'source/cable transient response'],
    },
    calculations: {
      driver_supply: { volts: driverRail, external_operating_range_v:[10,13],
        inductor_h: inductance, inductor_isat_25c_a:2.7, regulator_high_side_limit_max_a:2.4,
        inductor_minimum_at_minus_20_percent_h:inductance*0.8,
        regulator_minimum_inductance_h:minimumInductance,
        output_nominal_capacitance_f:['C90','C91','C92'].reduce((v,n)=>v+capacitance(n),0),
        note:'PFM regulation and resistor temperature allowances included. Saturation rating is specified at 25 C; hot current, capacitor bias, load steps and startup remain measured qualification items.' },
      supply: { contract_w: 48*5, efuse_limit: ilim, nominal_motor_input_ceiling_w: 48*ilim.formula_nominal_a,
        tolerance_low_current_ceiling_w_at_48v: 48*ilim.min_a,
        upstream_logic_current_margin_a_at_5a_contract: 5-ilim.max_a,
        note: 'Input limit is not a phase-current limit; the upstream logic buck also draws from the 5 A contract. TPS26631 supports 2x overload pulses; source coordination needs measurement.' },
      thresholds_v: { input_uvlo: uvlo, input_ovp: ovp, brake_on_screen: brakeOn,
        brake_off_nominal: brakeOn.nominal - 3.3*brakeTop/feedback,
        motor_cutoff_screen: motorCutoff, vsa_operating_max: 50, vs_operating_max: 55,
        note: 'Screening corners, not a qualified min/max specification. Shared reference prevents treating the two trips as independent distributions.' },
      current: { target_rms_a: target, sine_peak_a: target*Math.SQRT2, programmed_rms_a: programmed,
        sensitivity_min_rms_a: programmed*0.95/1.01, sensitivity_max_rms_a: programmed*1.05/0.99,
        note: 'TMC ±5% is specified at full scale; applying it to GLOBALSCALER=198 is only a sensitivity calculation, not a guaranteed tolerance.' },
      dissipation_w: { regulation_shunt_cycle_upper_bound_each: target**2*rs,
        regulation_shunt_held_peak_upper_bound_each: 2*target**2*rs,
        phase_telemetry_shunt_cycle_each: target**2*telemetryShunt,
        phase_telemetry_shunt_held_peak_each: 2*target**2*telemetryShunt,
        eight_bridge_mosfets_conduction_25c_max_rds_total: 4*target**2*0.0151,
        eight_bridge_mosfets_conduction_hot_sensitivity_total: 4*target**2*0.0151*2,
        efuse_at_nominal_limit_and_125c_max_ron: ilim.formula_nominal_a**2*0.053,
        two_motor_windings_20c: 2*target**2*0.45,
        note: 'Loss estimates exclude switching losses and do not determine junction temperature. Low-side shunt current depends on decay duty; held-peak bound covers the high-current microstep.' },
      inrush: { capacitance_f: bulk, stored_energy_at_48v_j: 0.5*bulk*48**2,
        charge_to_48v_c: bulk*48, nominal_ramp_ms: 48/slew.nominal*1000,
        initial_tolerance_ramp_ms: [48/slew.max*1000,48/slew.min*1000],
        nominal_capacitor_current_a: bulk*slew.nominal,
        initial_tolerance_capacitor_current_a: [bulk*0.8*slew.min,bulk*1.2*slew.max],
        nominal_initial_efuse_dissipation_w: 48*bulk*slew.nominal,
        note: 'No-load linear ramp model; thermally regulated startup, MLCC bias and additional loads alter the ramp. Verify eFuse SOA and PGOOD timing.' },
      regeneration: { bulk_energy_48_to_53v_j: 0.5*bulk*(53**2-48**2),
        bulk_energy_48_to_53v_min_cap_j: 0.5*bulk*0.8*(53**2-48**2),
        winding_energy_nominal_sine_quadrature_j: 0.0045*target**2,
        rotor_only_energy_j: Object.fromEntries([100,500,1000,2000].map(rpm => [rpm, 0.5*0.00027*(2*Math.PI*rpm/60)**2])),
        brake_nominal_at_53v: { ohm:10,current_a:5.3,power_w:53**2/10 },
        brake_at_55v_and_minus_2_percent_resistance: { current_a:55/9.8,power_w:55**2/9.8 },
        continuous_281w_resistor_case_to_ambient_max_c_per_w_at_50c: (85-50)/(53**2/10),
        note: 'Brake sizing requires load inertia, stop time, duty and gravity. 300 W LPS300 rating requires 85 C maximum case temperature; pulse energy and repetition must be checked separately.' },
      telemetry: { volts_per_ampere: telemetryShunt*20,
        phase_output_at_target_peak_v: [1.65-target*Math.SQRT2*telemetryShunt*20,1.65+target*Math.SQRT2*telemetryShunt*20],
        vmon_at_55v: 55*resistance('R33')/(sum(['R31','R32'])+resistance('R33')),
        note: 'Nominal transfer only; ADC/reference/gain errors, offset, common-mode switching and sampling require calibration.' },
    },
    errors,
    outstanding: ['Measured VSA ripple and VS transient margin', 'Measured brake/cutoff tolerance coordination',
      'PD source/cable 2x eFuse pulse coordination', 'Actual motor/load/speed/ambient/mechanics confirmation',
      'TI-generated EEPROM image and approved configuration identity', 'Fabricator stack-up/impedance/filled-via approval',
      'Assembled-board current, thermal, USB, brake and fault measurements'],
    sources: {
      tmc5160a: 'https://www.analog.com/media/en/technical-documentation/data-sheets/tmc5160a_datasheet_rev1.18.pdf#page=120',
      efuse: 'https://www.ti.com/lit/ds/symlink/tps2663.pdf#page=6',
      mosfet: 'https://www.ti.com/lit/ds/symlink/csd19534q5a.pdf#page=3',
      reference: 'https://www.ti.com/lit/ds/symlink/ref34.pdf',
      driver_regulator: 'https://www.ti.com/lit/ds/symlink/lmr36510.pdf',
      driver_inductor: 'https://www.bourns.com/docs/product-datasheets/srp7050ta.pdf',
      comparator: 'https://www.ti.com/lit/ds/symlink/tlv3201.pdf#page=6',
      brake: 'https://www.vishay.com/docs/50052/lps300.pdf',
      motor: 'https://www.analog.com/media/en/technical-documentation/data-sheets/qsh8618_datasheet_rev1.08.pdf',
    },
  }
  return report
}

if (import.meta.main) {
  const report = await audit()
  await writeFile('engineering/power-audit.json', `${JSON.stringify(report, null, 2)}\n`)
  console.log(JSON.stringify({ status: report.status, powered_tests_performed: false, errors: report.errors }, null, 2))
  if (process.argv.includes('--check') && report.errors.length) process.exitCode = 1
}
