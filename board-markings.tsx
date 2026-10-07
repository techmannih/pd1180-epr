/** Board identity and rear-side tscircuit attribution kept separate from circuitry. */
export function BoardMarkings() {
  return <>
    <silkscreentext text="PD1180-EPR — NEMA 34 Smart Motor-Mounted" layer="bottom" pcbX={0} pcbY={20} fontSize="0.8mm" />
    <silkscreentext text="Stepper Controller with USB-C PD 3.1 EPR · r0.3" layer="bottom" pcbX={0} pcbY={18.8} fontSize="0.8mm" />
    <silkscreentext text="ts" layer="bottom" pcbX={0} pcbY={4} fontSize="2.4mm" />
    <silkscreentext text="Made with tscircuit" layer="bottom" pcbX={0} pcbY={1.5} fontSize="0.9mm" />
  </>
}
