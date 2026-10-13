import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'

// A DC/tolerance screen, not a simulation of switching waveforms or hardware certification.
export const rmsCurrent = (scaler, cs, shunt) =>
  (scaler === 0 ? 256 : scaler) / 256 * (cs + 1) / 32 * 0.325 / shunt / Math.SQRT2

// TI specifies current-limit corners at selected RILIM values. A 4.99k setting
// is screened with a deliberately wider +/-10% device allocation around the
// larger 18090 coefficient implied by the 4.02k/4.5A table entry.
// This interpolation/allocation is not a guaranteed production limit.
export function inputCurrentScreen(ohm, resistorTolerance, upstreamAllocationA, contractA = 5) {
  if (!(ohm >= 3000 && ohm <= 30000) || !(resistorTolerance >= 0 && resistorTolerance < 0.1) ||
      !(upstreamAllocationA >= 0) || !Number.isFinite(upstreamAllocationA) || !(contractA > 0) || !Number.isFinite(contractA))
    throw new Error('Invalid input-current screen')
  const max = 18090 * 1.10 / (ohm * (1 - resistorTolerance))
  return {
    formula_nominal_a: 18000 / ohm,
    table_interpolated_nominal_a: 18090 / ohm,
    min_a: 18090 * 0.90 / (ohm * (1 + resistorTolerance)), max_a: max,
    resistor_tolerance_with_temperature_fraction: resistorTolerance,
    device_error_allocation_fraction: 0.10,
    upstream_input_allocation_a: upstreamAllocationA,
    total_input_screen_a: max + upstreamAllocationA,
    remaining_contract_margin_a: contractA - max - upstreamAllocationA,
    manufacturer_guaranteed_at_selected_resistance: false,
  }
}

// Lossless energy transfer screen, not a transient prediction. Unknown returned
// energy remains unknown; a disabled bridge is not an energy sink.
export function busVoltageAfterReturn(initialV, capacitanceF, returnedJ) {
  if (returnedJ === null) return null
  if (!Number.isFinite(initialV) || initialV < 0 ||
      !Number.isFinite(capacitanceF) || capacitanceF <= 0 ||
      !Number.isFinite(returnedJ) || returnedJ < 0)
    throw new Error('Invalid bus energy screen input')
  return Math.sqrt(initialV ** 2 + 2 * returnedJ / capacitanceF)
}

// Unknown rotor inertia must remain unknown; treating null as zero would
// incorrectly remove kinetic energy from the braking review.
export function rotorKineticEnergy(inertia, rpm) {
  if (inertia === null) return null
  if (!Number.isFinite(inertia) || inertia <= 0 || !Number.isFinite(rpm) || rpm < 0)
    throw new Error('Invalid rotor inertia or speed')
  return 0.5 * inertia * (2 * Math.PI * rpm / 60) ** 2
}

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
    }).map(cap => `${cap.name}: TPS2663x IMON must not have a bypass capacitor (TI section 8.3.9)`)
}

export function dividerRange(top, bottom, threshold, leakage = 0, tolerance = 0.01) {
  return {
    min: threshold.min * (1 + top * (1 - tolerance) / (bottom * (1 + tolerance))) - leakage * top * (1 + tolerance),
    nominal: threshold.nominal * (1 + top / bottom),
    max: threshold.max * (1 + top * (1 + tolerance) / (bottom * (1 - tolerance))) + leakage * top * (1 + tolerance),
  }
}

// Conservative independent bounds: the subtractive feedback term uses the
// opposite resistor corners. Output swing is rail/load dependent, not 3.3 V
// at every temperature. This screen includes the 2.9–3.6 V board-rail window
// and the TLV3201 0.350 V high-output-headroom limit at 4 mA.
export function brakeReleaseRange(top, bottom, feedback, threshold, tolerance) {
  const low = 1 - tolerance, high = 1 + tolerance
  return {
    min: threshold.min * (1 + top*low/(bottom*high) + top*low/(feedback*high)) - 3.6*top*high/(feedback*low) - 5e-9*top,
    nominal: threshold.nominal * (1 + top/bottom + top/feedback) - 3.3*top/feedback,
    max: threshold.max * (1 + top*high/(bottom*low) + top*high/(feedback*low)) - (2.9-.350)*top*low/(feedback*high) + 5e-9*top,
  }
}

// Both comparators physically use U12. Its error cannot be simultaneously high
// for one comparator and low for the other. Comparator errors and all divider
// tolerances remain independent. Call only after checking the shared net.
export function sharedReferenceGap(cutTop, cutBottom, brakeTop, brakeBottom, feedback, reference, comparatorError, tolerance) {
  const lo = 1-tolerance, hi = 1+tolerance
  const cutGain = 1 + cutTop*lo/(cutBottom*hi)
  const brakeGain = 1 + brakeTop*hi/(brakeBottom*lo) + brakeTop*hi/(feedback*lo)
  return Math.min(...[reference.min, reference.max].map(v =>
    v*(cutGain-brakeGain) - comparatorError*(cutGain+brakeGain))) - 5e-9*(cutTop+brakeTop)*hi
}

export function operatingErrors({ vsaOnMotorBus, brakeOn, motorCutoff, coordinationGap, vsaMaximum = 50, vsMaximum = 55, rippleAllowance = 0.5 }) {
  const errors = []
  if (vsaOnMotorBus && brakeOn.nominal > vsaMaximum)
    errors.push('U7 VSA is tied to VMOTOR; nominal brake turn-on exceeds the 50 V VSA operating limit.')
  if (motorCutoff.max + rippleAllowance >= vsMaximum)
    errors.push('Motor overvoltage cutoff plus the ripple allowance can reach/exceed the 55 V VS operating limit.')
  if (coordinationGap === undefined ? brakeOn.max >= motorCutoff.min : !(coordinationGap > 0))
    errors.push('Brake turn-on can coincide with or exceed motor cutoff at a reviewed tolerance corner.')
  return errors
}

export async function audit() {
  const paths = ['index.circuit.tsx', 'dist/index/circuit.json', 'docs/design-manifest.json',
    'hardware-contract.json', 'docs/motor-data.json', 'firmware/include/tmc5160_config.h',
    'firmware/src/tmc5160.c', 'firmware/src/motor_service.c', 'firmware/target/main.cpp',
    'dist/manufacturing/kicad-project/pd1180-epr-r0.3.kicad_pcb', 'scripts/power-audit.mjs', 'firmware/src/control.c']
  const bytes = Object.fromEntries(await Promise.all(paths.map(async p => [p, await readFile(p)])))
  const circuit = JSON.parse(bytes['dist/index/circuit.json'])
  const parts = Object.fromEntries(circuit.filter(p => p.type === 'source_component').map(p => [p.name, p]))
  const contract = JSON.parse(bytes['hardware-contract.json'])
  const motor = JSON.parse(bytes['docs/motor-data.json'])
  if (motor.motor !== contract.rated_targets.motor) throw new Error('Motor data does not match the selected motor')
  for (const field of ['phase_resistance_25c_ohm', 'phase_inductance_h']) {
    if (!Number.isFinite(motor[field]) || motor[field] <= 0) throw new Error(`Missing motor ${field}`)
  }
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
  // TLV3201: 4 mV offset, 56 dB CMRR across a 1.2 V common-mode excursion,
  // 65 dB PSRR across 0.9 V relative to its 2.7 V table, and 2 mV allocation
  // for hysteresis/noise. The latter
  // is a design allocation requiring measured confirmation, not a TI guarantee.
  const referenceOnlyError = 2.5 * (0.0005 + 6e-6 * 165)
  const comparatorError = 0.004 + 0.002 + 1.2*10**(-56/20) + 0.9*10**(-65/20)
  const referenceError = referenceOnlyError + comparatorError
  const ref = { min: 2.5-referenceError, nominal: 2.5, max: 2.5+referenceError }
  const brakeTop = sum(['R60', 'R61']), brakeBottom = resistance('R62'), feedback = resistance('R63')
  const brakeOn = {
    min: ref.min * (1 + brakeTop * (1-precisionTolerance)/(brakeBottom*(1+precisionTolerance)) + brakeTop*(1-precisionTolerance)/(feedback*(1+precisionTolerance))) - 0.325*brakeTop*(1+precisionTolerance)/(feedback*(1-precisionTolerance)) - 5e-9*brakeTop,
    nominal: ref.nominal * (1 + brakeTop/brakeBottom + brakeTop/feedback),
    max: ref.max * (1 + brakeTop*(1+precisionTolerance)/(brakeBottom*(1-precisionTolerance)) + brakeTop*(1+precisionTolerance)/(feedback*(1-precisionTolerance))) + 5e-9*brakeTop,
  }
  const motorCutoff = dividerRange(resistance('R64'), sum(['R65','R66']), ref, 5e-9, precisionTolerance)
  const brakeOff = brakeReleaseRange(brakeTop, brakeBottom, feedback, ref, precisionTolerance)
  const coordinationGap = sharedReferenceGap(resistance('R64'), sum(['R65','R66']), brakeTop, brakeBottom, feedback,
    { min: 2.5-referenceOnlyError, max: 2.5+referenceOnlyError }, comparatorError, precisionTolerance)
  const inputProtection = contract.input_protection
  const ilimPart = inputProtection.current_set_resistor
  const ilim = inputCurrentScreen(resistance('R25'),
    ilimPart.initial_tolerance_fraction + ilimPart.tcr_ppm_per_c * 1e-6 * ilimPart.temperature_excursion_c,
    inputProtection.upstream_input_current_allocation_a, contract.rated_targets.pd_contract_a)
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
  const benchPermille = macro('PD1180_BENCH_CURRENT_MAX_PERMILLE')
  const benchIrun = Math.floor(32*benchPermille/1000)-1
  const benchRms = rmsCurrent(macro('PD1180_GLOBALSCALER'), benchIrun, rs)
  const benchRpm = macro('PD1180_BENCH_VMAX')*12e6/2**24*60/(200*256)
  const benchAcceleration = macro('PD1180_BENCH_AMAX')*12e6**2/2**41*60/(200*256)
  const benchRotorEnergy = rotorKineticEnergy(motor.rotor_inertia_kg_m2, benchRpm)
  const benchWindingEnergy = motor.phase_inductance_h*benchRms**2
  // A separate deliberately pessimistic sensitivity, not a guaranteed bound:
  // 1.5 A instantaneously in EACH phase, 15 rpm, +20% L, -20% C.
  const benchSensitivityRotor = rotorKineticEnergy(motor.rotor_inertia_kg_m2, 15)
  const benchSensitivityEnergy = benchSensitivityRotor === null ? null :
    motor.phase_inductance_h*(1+motor.phase_inductance_tolerance_fraction)*1.5**2 + benchSensitivityRotor
  const benchCutoffPeak = busVoltageAfterReturn(motorCutoff.max,bulk*0.8,benchSensitivityEnergy)
  const windingEnergy = motor.phase_inductance_h * target ** 2
  const slew = { min: 1.775e-6 * 23.5 / (capacitance('C18') * 1.1), nominal: 2e-6 * 25 / capacitance('C18'), max: 2.225e-6 * 26 / (capacitance('C18') * 0.9) }
  const netKey = name => circuit.find(p => p.type === 'source_net' && p.name === name)?.subcircuit_connectivity_map_key
  const pinKey = (name, pin) => circuit.find(p => p.type === 'source_port' && p.source_component_id === part(name).source_component_id && p.pin_number === pin)?.subcircuit_connectivity_map_key
  const componentNames = new Map(Object.values(parts).map(p => [p.source_component_id, p.name]))
  const brakeReturnReferences = [...new Set(circuit.filter(p => p.type === 'source_port' &&
    p.subcircuit_connectivity_map_key === netKey('BRAKE_RETURN')).map(p => componentNames.get(p.source_component_id)))].sort()
  const vsaOnMotorBus = pinKey('U7', 4) === netKey('VMOTOR')
  const errors = operatingErrors({ vsaOnMotorBus, brakeOn, motorCutoff, coordinationGap })
  if (pinKey('U13',4) !== netKey('VREF_2V5') || pinKey('U14',3) !== netKey('VREF_2V5'))
    errors.push('Shared-reference coordination requires both U13 and U14 on the compiled U12 VREF_2V5 net')
  if (brakeOff.min <= 48*1.05 + 0.3)
    errors.push('Brake release lacks the allocated margin above a 5% high 48 V source')
  if (benchCutoffPeak === null || benchCutoffPeak + 0.5 > 54.75)
    errors.push('Restricted rotor-only energy screen lacks 0.25 V residual margin below 55 V after the 0.5 V transient allocation')
  if (!(benchPermille > 0 && benchPermille <= 240) || benchIrun < 0)
    errors.push('The unloaded commissioning profile must not permit a current request above 240 permille')
  if (part('U6').manufacturer_part_number !== 'TPS26630RGER') errors.push('U6 must use the reviewed 1x TPS26630RGER, not a 2x pulse-current variant')
  if (resistance('R25') !== ilimPart.ohm) errors.push('R25 differs from the reviewed input-current contract')
  if (ilim.remaining_contract_margin_a <= 0) errors.push('Input-current screen plus upstream allocation exceeds the PD contract')
  if (programmed * 1.05 / 0.99 * Math.SQRT2 >= motor.phase_current_a) errors.push('Programmed sine-peak sensitivity exceeds ordered motor phase rating')
  errors.push(...imonBypassErrors(circuit))
  // Allow a 5% high 48 V source plus 0.3 V noise margin without nuisance OVP.
  if (ovp.min < 48*1.05 + 0.3) errors.push('Input OVP lacks margin above a 5% high 48 V source')
  if (ovp.max + 0.5 >= 55) errors.push('Input OVP plus transient allowance exceeds the VS operating limit')
  errors.push(...supplyIsolationErrors(Object.fromEntries(
    ['VMOTOR', 'TMC_12V', 'GND', 'DRIVER_BUCK_SW', 'DRIVER_BUCK_BOOT', 'DRIVER_BUCK_VCC', 'VREF_2V5', 'V3V3'].map(name => [name, netKey(name)]),
  )))
  if (pinKey('C61', 1) !== netKey('TMC_12V')) errors.push('C61 local VSA bypass must be on TMC_12V')
  for (const [name,pin,net] of [['U7',3,'TMC_12V'],['U7',4,'TMC_12V'],['U7',33,'VMOTOR'],['U34',2,'VMOTOR'],['U34',3,'VMOTOR'],['U34',5,'DRIVER_BUCK_FB'],['U34',8,'DRIVER_BUCK_SW'],['L3',1,'DRIVER_BUCK_SW'],['L3',2,'TMC_12V'],['U34',1,'GND'],['U34',6,'DRIVER_BUCK_VCC'],['U34',7,'DRIVER_BUCK_BOOT'],['U34',9,'GND'],['C86',1,'VMOTOR'],['C86',2,'GND'],['C87',1,'VMOTOR'],['C87',2,'GND'],['C88',1,'DRIVER_BUCK_VCC'],['C88',2,'GND'],['C89',1,'DRIVER_BUCK_BOOT'],['C89',2,'DRIVER_BUCK_SW'],['C90',1,'TMC_12V'],['C90',2,'GND'],['C91',1,'TMC_12V'],['C91',2,'GND'],['C92',1,'TMC_12V'],['C92',2,'GND'],['R121',1,'TMC_12V'],['R121',2,'DRIVER_BUCK_FB'],['R122',1,'DRIVER_BUCK_FB'],['R122',2,'GND'],['C93',1,'V3V3'],['C93',2,'GND'],['C94',1,'VREF_2V5'],['C94',2,'GND'],['D20',1,'VMOTOR'],['D20',2,'BRAKE_RETURN'],['R134',1,'BRAKE_RETURN'],['R134',2,'BRAKE_FB_MID'],['R135',1,'BRAKE_FB_MID'],['R135',2,'BRAKE_FB'],['R136',1,'BRAKE_FB'],['R136',2,'GND'],['C98',1,'BRAKE_FB'],['C98',2,'GND'],['U30',6,'BRAKE_FB'],['U12',1,'GND'],['U12',2,'GND'],['U12',3,'V3V3'],['U12',4,'V3V3'],['U12',5,'VREF_2V5'],['U12',6,'VREF_2V5']]) {
    if (!netKey(net) || pinKey(name,pin) !== netKey(net)) errors.push(`${name}.${pin} must connect to ${net}`)
  }
  for (const [ref, ohms] of Object.entries({R25:4990, R61:16200, R66:1200, R134:4700, R135:4700, R136:510})) {
    if (Math.abs(resistance(ref)-ohms)>1e-6) errors.push(`${ref}: audited resistance must remain ${ohms} ohms`)
  }
  const modePort = circuit.find(p => p.type === 'source_port' && p.source_component_id === part('U6').source_component_id && p.pin_number === 11)
  if (!modePort || circuit.some(t => t.type === 'source_trace' && t.connected_source_port_ids?.includes(modePort.source_port_id))) errors.push('TPS26630 MODE pin 11 must remain open for latch-off')
  const requiredParts = { U12:'C187836', U34:'C1858393', L3:'C2047110', R22:'C23162', R23:'C705777', R24:'C95204', R60:'C326731', R61:'C728583', R62:'C95204', R63:'C326730', R64:'C861400', R65:'C723637', U6:'C1850276', R25:'C7293210', R66:'C136970', R122:'C861611', R134:'C6675858', R135:'C6675858', R136:'C7468460', C98:'C57112', D20:'C49242208' }
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
    full_current_operation_authorized: false,
    operating_risks: [
      { id: 'brake-unavailable', severity: 'high', status: 'open', closure: 'Qualify brake-open, supply-loss and worst-stop energy/transients; driver inhibit is not an energy sink.' },
      { id: 'input-current-coordination', severity: 'high', status: 'open', closure: 'TPS26630 removes the deliberate 2x pulse allowance. Qualify its finite limiting/fast-trip response with the exact EPR source/cable and measure all upstream loads against the allocation.' },
      { id: 'motor-mounted-thermal', severity: 'high', status: 'open', closure: 'Agree the motor current waveform and qualify winding, MOSFET, shunt, capacitor and connector temperatures; the local TMP102 is insufficient evidence.' },
      { id: 'external-brake-installation', severity: 'high', status: 'open', closure: 'Specify load energy, duty, resistor pulse limits, thermal interface, heatsink and mechanical installation.' },
      { id: 'ripple-and-brake-turnoff', severity: 'medium', status: 'open', closure: 'Measure each bulk-capacitor ripple/heating and Q16 VDS turn-off overshoot with the intended brake harness; qualify any required clamp/snubber.' },
    ],
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
      winding_inductance_high_screen_fraction: 0.2,
      winding_copper_temperature_coefficient_per_c_assumed: 0.00393,
      winding_copper_temperature_model_reference_c: 25,
      slew_capacitance_initial_tolerance_fraction: 0.1,
      capacitor_dc_bias_and_temperature_included: false,
      motor_model: contract.rated_targets.motor,
      motor_phase_resistance_25c_ohm: motor.phase_resistance_25c_ohm,
      motor_phase_inductance_h: motor.phase_inductance_h,
      motor_rotor_inertia_kg_m2: motor.rotor_inertia_kg_m2,
      external_load_inertia: null,
      motor_rpm_and_stop_time: null,
      mosfet_hot_resistance_multiplier: 2,
      mosfet_hot_multiplier_is_guaranteed: false,
      switching_frequency_sensitivity_hz: [20000, 40000],
      missing_models: ['PCB thermal boundary conditions', 'MOSFET switching/dead-time losses', 'capacitor RMS ripple', 'motor iron/friction/load losses', 'source/cable transient response'],
    },
    calculations: {
      commissioning_profile: {
        scope: 'Unloaded rotor only; no coupling, driven load, gravity load or external back-drive',
        selection_basis: 'Retained low-energy commissioning choice; not copied from PD-1180 ratings',
        motor_operation_authorized: false,
        max_requested_current_permille: benchPermille, irun: benchIrun,
        nominal_rms_a: benchRms, nominal_sine_peak_a: benchRms*Math.SQRT2,
        nominal_speed_rpm: benchRpm, nominal_acceleration_rpm_per_s: benchAcceleration,
        nominal_ramp_stop_s: benchRpm/benchAcceleration,
        nominal_rotor_energy_j: benchRotorEnergy, nominal_winding_energy_j: benchWindingEnergy,
        nominal_rotor_energy_at_1000rpm_j: rotorKineticEnergy(motor.rotor_inertia_kg_m2,1000),
        brake_open_sensitivity: {
          each_phase_instantaneous_current_a: 1.5, rpm: 15,
          returned_energy_j: benchSensitivityEnergy, minimum_capacitance_f: bulk*0.8,
          peak_from_50v4_v: busVoltageAfterReturn(50.4,bulk*0.8,benchSensitivityEnergy),
          peak_from_upper_cutoff_v: benchCutoffPeak,
          upper_cutoff_peak_plus_0v5_allocation_v: benchCutoffPeak === null ? null : benchCutoffPeak+0.5,
          residual_margin_below_55v_v: benchCutoffPeak === null ? null : 55-benchCutoffPeak-0.5,
          guaranteed_bound: false,
          note: 'Lossless energy screen only. The 1.5 A/phase and 15 rpm sensitivity is an engineering allocation requiring measurement; it does not close startup continuity, running brake failure or transient margin.' },
        note: 'Clock, current regulation, winding nonlinearity and speed are uncalibrated. No attached load is allowed in this prototype scope; unknown application inertia remains unknown in motor-data.json.' },
      driver_supply: { volts: driverRail, external_operating_range_v:[10,13],
        inductor_h: inductance, inductor_isat_25c_a:2.7, regulator_high_side_limit_max_a:2.4,
        inductor_minimum_at_minus_20_percent_h:inductance*0.8,
        regulator_minimum_inductance_h:minimumInductance,
        output_nominal_capacitance_f:['C90','C91','C92'].reduce((v,n)=>v+capacitance(n),0),
        note:'PFM regulation and resistor temperature allowances included. Saturation rating is specified at 25 C; hot current, capacitor bias, load steps and startup remain measured qualification items.' },
      supply: { contract_w: 48*5, efuse_limit: ilim, nominal_motor_input_ceiling_w: 48*ilim.formula_nominal_a,
        tolerance_low_current_ceiling_w_at_48v: 48*ilim.min_a,
        upstream_logic_current_margin_a_at_5a_contract: 5-ilim.max_a,
        overload_after_pgood: { nominal_current_ceiling_a: ilim.formula_nominal_a,
          pulse_multiplier: 1, deliberate_2x_pulse_window_ms: 0, hard_5a_ceiling: false,
          fast_trip_nominal_multiplier: 2,
          note: 'TPS26630 1x active limiting, TI 8.3.7.1.1. Finite loop response and a separate 2x fast-trip threshold can still permit brief overshoot; this is not an ideal instantaneous 5 A clamp.' },
        efuse_thermal_screen: {
          ron_max_ohm_at_125c: 0.053,
          conduction_loss_w_at_formula_limit: ilim.formula_nominal_a**2*0.053,
          conduction_loss_w_at_upper_current_screen: ilim.max_a**2*0.053,
          linear_limiting_loss_w_at_4v_drop_and_formula_limit: 4*ilim.formula_nominal_a,
          pcb_temperature_rise_qualified: false,
          note: 'I²R applies while fully enhanced. Active limiting dissipates (VIN-VOUT)*I and invokes thermal regulation/shutdown; MODE remains open for latch-off. No PCB thermal impedance, SOA or restart qualification is inferred.' },
        note: 'Input limit is not a phase-current limit. The 250 mA upstream allocation must be verified on hardware; the 4.99k interpolation and device-error allowance are screening assumptions.' },
      thresholds_v: { input_uvlo: uvlo, input_ovp: ovp, brake_on_screen: brakeOn,
        brake_off_nominal: brakeOff.nominal, brake_off_screen: brakeOff,
        independent_reference_envelope_gap: motorCutoff.min-brakeOn.max,
        brake_on_to_cutoff_shared_reference_minimum_gap: coordinationGap,
        shared_reference_error_v: referenceOnlyError, each_comparator_error_screen_v: comparatorError,
        coordination_note: 'U13 and U14 share the same U12 output, verified in compiled connectivity. U12 error is common; comparator offset/CMRR/PSRR and resistor errors are independent. Independent absolute envelopes may overlap across different boards. Dynamic separation still requires measurement.',
        brake_off_above_high_source_and_noise_allocation: brakeOff.min-48*1.05-0.3,
        motor_cutoff_screen: motorCutoff, vsa_operating_max: 50, vs_operating_max: 55,
        note: 'Screening corners, not a qualified min/max specification. Shared reference prevents treating the two trips as independent distributions.' },
      current: { target_rms_a: target, sine_peak_a: target*Math.SQRT2, programmed_rms_a: programmed,
        sensitivity_min_rms_a: programmed*0.95/1.01, sensitivity_max_rms_a: programmed*1.05/0.99,
        motor_rated_phase_a: motor.phase_current_a, motor_qualified_driver_rms_a: motor.qualified_driver_rms_a,
        motor_rating_note: motor.current_rating_basis,
        note: 'Existing board design-current screen, not an approved setting for the ordered motor. TMC ±5% is specified at full scale; applying it to GLOBALSCALER=139 is only a sensitivity calculation, not a guaranteed tolerance.' },
      dissipation_w: { regulation_shunt_cycle_upper_bound_each: target**2*rs,
        regulation_shunt_held_peak_upper_bound_each: 2*target**2*rs,
        phase_telemetry_shunt_cycle_each: target**2*telemetryShunt,
        phase_telemetry_shunt_held_peak_each: 2*target**2*telemetryShunt,
        eight_bridge_mosfets_conduction_25c_max_rds_total: 4*target**2*0.0151,
        eight_bridge_mosfets_conduction_hot_sensitivity_total: 4*target**2*0.0151*2,
        efuse_at_nominal_limit_and_125c_max_ron: ilim.formula_nominal_a**2*0.053,
        two_motor_windings_25c: 2*target**2*motor.phase_resistance_25c_ohm,
        two_motor_windings_100c_linear_copper_sensitivity: 2*target**2*motor.phase_resistance_25c_ohm*(1+0.00393*75),
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
        bulk_energy_48_to_brake_on_nominal_j: 0.5*bulk*(brakeOn.nominal**2-48**2),
        winding_energy_nominal_sine_quadrature_j: windingEnergy,
        brake_unavailable_return_screen: {
          voltage_after_nominal_cutoff_nominal_cap_nominal_inductance_v: busVoltageAfterReturn(motorCutoff.nominal,bulk,windingEnergy),
          voltage_after_upper_cutoff_min_cap_nominal_inductance_v: busVoltageAfterReturn(motorCutoff.max,bulk*0.8,windingEnergy),
          voltage_after_upper_cutoff_min_cap_high_inductance_v: busVoltageAfterReturn(motorCutoff.max,bulk*0.8,windingEnergy*1.2),
          min_cap_energy_headroom_upper_cutoff_to_55v_j: 0.5*bulk*0.8*(55**2-motorCutoff.max**2),
          mechanical_regeneration_included: false,
          note: 'All remaining winding energy returned to the bus after inhibit; lossless screening cases, not measured or predicted waveforms. Inductance under operating current, current tolerance, ESR/ESL, source response and mechanical energy are not bounded by this model. Exceeding 55 V requires closure even when static threshold checks pass.' },
        rotor_only_energy_j: Object.fromEntries([100,500,1000,2000].map(rpm => [rpm, rotorKineticEnergy(motor.rotor_inertia_kg_m2,rpm)])),
        brake_nominal_at_53v: { ohm:10,current_a:5.3,power_w:53**2/10 },
        brake_at_55v_and_minus_2_percent_resistance: { current_a:55/9.8,power_w:55**2/9.8 },
        continuous_281w_resistor_case_to_ambient_max_c_per_w_at_50c: (85-50)/(53**2/10),
        note: 'Brake sizing requires load inertia, stop time, duty and gravity. 300 W LPS300 rating requires 85 C maximum case temperature; pulse energy and repetition must be checked separately.' },
      ripple_and_brake_switch: {
        bulk_capacitors: ['C22','C23'], manufacturer_part: 'EEUFR1J471',
        each_rated_ripple_a_at_100khz: 1.995, measured_each_ripple_a: null,
        equal_current_sharing_qualified: false,
        brake_return_component_references: brakeReturnReferences,
        explicit_clamp_or_snubber_verified: false, measured_q16_turnoff_peak_v: null,
        note: 'A rating at 100 kHz is not a validated chopping/braking waveform rating. D20 provides a local cable-inductance recirculation path and R134 feeds startup continuity sensing. Their presence does not qualify switching overshoot or runtime brake integrity.' },
      brake_feedback: {
        divider_ratio: sum(['R134','R135','R136'])/resistance('R136'),
        maximum_open_return_v_at_2ma_leakage: .002*sum(['R134','R135','R136'])*1.02,
        each_top_resistor_nominal_w_at_55v: (55/sum(['R134','R135','R136']))**2*resistance('R134'),
        note:'D20 2 mA at 125 C rated reverse voltage is the leakage screen; higher junction temperatures and actual ADC errors need qualification. Divider is 1%, 100 ppm/C, two 250 mW 1206 top resistors; board ambient design limit 50 C, local temperature must stay within derated ratings.' },
      telemetry: { volts_per_ampere: telemetryShunt*20,
        phase_output_at_target_peak_v: [1.65-target*Math.SQRT2*telemetryShunt*20,1.65+target*Math.SQRT2*telemetryShunt*20],
        vmon_at_55v: 55*resistance('R33')/(sum(['R31','R32'])+resistance('R33')),
        note: 'Nominal transfer only; ADC/reference/gain errors, offset, common-mode switching and sampling require calibration.' },
    },
    errors,
    outstanding: ['Measured VSA ripple and VS transient margin', 'Measured brake/cutoff tolerance coordination',
      'PD source/cable finite current-limit and fast-trip coordination; upstream current measurement', 'Ordered motor current convention, external load inertia, speed, ambient and mechanics qualification',
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
      cutoff_resistor: 'https://www.yageogroup.com/component-documentation/download/specsheet/RT0603BRD071K2L',
      brake: 'https://www.vishay.com/docs/50052/lps300.pdf',
      bulk_capacitor: 'https://industrial.panasonic.com/ww/products/pt/aluminum-cap-lead/models/EEUFR1J471',
      motor: motor.document,
    },
  }
  return report
}

if (import.meta.main) {
  const report = await audit()
  await writeFile('engineering/power-audit.json', `${JSON.stringify(report, null, 2)}\n`)
  console.log(JSON.stringify({ status: report.status, powered_tests_performed: false,
    full_current_operation_authorized: report.full_current_operation_authorized,
    open_operating_risks: report.operating_risks.map(r => r.id), errors: report.errors }, null, 2))
  if (process.argv.includes('--check') && report.errors.length) process.exitCode = 1
}
