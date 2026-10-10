/** Board identity and rear-side tscircuit attribution kept separate from circuitry. */
export function BoardMarkings() {
  return <>
    <silkscreentext text="PD1180-EPR — NEMA 34 Smart Motor-Mounted" layer="bottom" pcbX={0} pcbY={20} fontSize="0.8mm" />
    <silkscreentext text="Stepper Controller with USB-C PD 3.1 EPR · r0.4 ECO" layer="bottom" pcbX={0} pcbY={18.8} fontSize="0.8mm" />
    <silkscreentext text="PWR" layer="top" pcbX={-41.85} pcbY={22.2} pcbRotation={90} fontSize="1mm" isKnockout />
    <silkscreentext text="DATA" layer="top" pcbX={-41.85} pcbY={-8.2} pcbRotation={90} fontSize="1mm" isKnockout />
    <silkscreentext text="J7 INDUSTRIAL I/O" layer="top" pcbX={-2} pcbY={-42.3} fontSize="0.8mm" />
    <silkscreentext text="ts" layer="bottom" pcbX={0} pcbY={14.4} fontSize="2.4mm" />
    <silkscreentext text="Made with tscircuit" layer="bottom" pcbX={0} pcbY={11.9} fontSize="0.9mm" />
  </>
}
