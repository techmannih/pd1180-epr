/** Board identity and rear-side tscircuit attribution kept separate from circuitry. */
export function BoardMarkings() {
  return <>
    <silkscreentext text="PD1180-EPR — NEMA 34 Smart Motor-Mounted" layer="bottom" pcbX={0} pcbY={20} fontSize="0.8mm" />
    <silkscreentext text="Stepper Controller with USB-C PD 3.1 EPR · r0.4 ECO" layer="bottom" pcbX={0} pcbY={18.8} fontSize="0.8mm" />
    <silkscreentext text="PWR" layer="top" pcbX={-41.85} pcbY={22.2} pcbRotation={90} fontSize="1mm" isKnockout />
    <silkscreentext text="DATA" layer="top" pcbX={-41.85} pcbY={8} pcbRotation={90} fontSize="1mm" isKnockout />
    {/* PD fixture contacts 1/2/3: VREF/GND/SDA; see the programming fixture map. */}
    <silkscreentext text="1" layer="top" pcbX={-16.8} pcbY={24.3} pcbRotation={90} fontSize="0.8mm" />
    <silkscreentext text="2" layer="top" pcbX={-20.5} pcbY={20.9} pcbRotation={0} fontSize="0.8mm" />
    <silkscreentext text="3" layer="top" pcbX={-20.5} pcbY={19.9} pcbRotation={0} fontSize="0.8mm" />
    <silkscreentext text="SCL" layer="top" pcbX={2.1} pcbY={19.3} pcbRotation={90} fontSize="0.8mm" />
    <silkscreentext text="ISO" layer="top" pcbX={6.9} pcbY={39.3} pcbRotation={0} fontSize="0.8mm" />
    <silkscreentext text="PD V" layer="top" pcbX={6.9} pcbY={42.3} pcbRotation={0} fontSize="0.8mm" />
    <silkscreentext text="VM" layer="top" pcbX={9.5} pcbY={42.1} pcbRotation={0} fontSize="0.8mm" />
    <silkscreentext text="GND" layer="top" pcbX={22} pcbY={42.1} pcbRotation={0} fontSize="0.8mm" />
    <silkscreentext text="RGB" layer="top" pcbX={-40.3} pcbY={-20.1} pcbRotation={0} fontSize="0.8mm" />
    <silkscreentext text="3V3" layer="top" pcbX={-37.6} pcbY={-21.0} fontSize="0.8mm" />
    <silkscreentext text="ts" layer="bottom" pcbX={0} pcbY={14.4} fontSize="2.4mm" />
    <silkscreentext text="Made with tscircuit" layer="bottom" pcbX={0} pcbY={11.9} fontSize="0.9mm" />
  </>
}
