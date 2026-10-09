/** Board identity and rear-side tscircuit attribution kept separate from circuitry. */
export function BoardMarkings() {
  return <>
    <silkscreentext text="PD1180-EPR — NEMA 34 Smart Motor-Mounted" layer="bottom" pcbX={0} pcbY={20} fontSize="0.8mm" />
    <silkscreentext text="Stepper Controller with USB-C PD 3.1 EPR · r0.4 ECO" layer="bottom" pcbX={0} pcbY={18.8} fontSize="0.8mm" />
    <silkscreentext text="J1 PD POWER" layer="top" pcbX={-40.5} pcbY={15} pcbRotation={90} fontSize="0.8mm" />
    <silkscreentext text="J10 USB DATA" layer="top" pcbX={-40.5} pcbY={1} pcbRotation={90} fontSize="0.8mm" />
    <silkscreentext text="J7 INDUSTRIAL I/O" layer="top" pcbX={-10} pcbY={-6} fontSize="0.8mm" />
    <silkscreentext text="ts" layer="bottom" pcbX={0} pcbY={14.4} fontSize="2.4mm" />
    <silkscreentext text="Made with tscircuit" layer="bottom" pcbX={0} pcbY={11.9} fontSize="0.9mm" />
  </>
}
