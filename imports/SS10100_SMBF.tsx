import type { DiodeProps } from "@tscircuit/props"

// GOODWORK SS10100, SMBF, C49242208, datasheet Rev 1.0 (2017-01).
// Body max 4.4 x 3.7 mm; overall length 5.5 mm; leads max 1.3 x 2.2 mm.
// Derived land pattern provides >=0.45 mm toe, >=0.15 mm heel and 0.2 mm side.
// Cathode is the banded end (pad 1). Assembly land-pattern acceptance remains open.
export const SS10100_SMBF = (props: DiodeProps) => {
  const { name = "D1", ...restProps } = props
  return <diode
  name={name}
  pinLabels={{ pin1: ["cathode", "neg"], pin2: ["anode", "pos"] }}
  manufacturerPartNumber="SS10100"
  supplierPartNumbers={{ jlcpcb: ["C49242208"] }}
  footprint={<footprint>
    <smtpad portHints={["pin1"]} pcbX={-2.15} pcbY={0} width={2.1} height={2.6} shape="rect" />
    <smtpad portHints={["pin2"]} pcbX={2.15} pcbY={0} width={2.1} height={2.6} shape="rect" />
    <fabricationnotepath route={[{x:-2.2,y:-1.85},{x:2.2,y:-1.85},{x:2.2,y:1.85},{x:-2.2,y:1.85},{x:-2.2,y:-1.85}]} />
    <silkscreenpath route={[{x:-1.8,y:-1.85},{x:1.8,y:-1.85}]} />
    <silkscreenpath route={[{x:-1.8,y:1.85},{x:1.8,y:1.85}]} />
    <silkscreenpath route={[{x:-3.4,y:-1.5},{x:-3.4,y:1.5}]} />
    <courtyardoutline outline={[{x:-3.6,y:-2.1},{x:3.6,y:-2.1},{x:3.6,y:2.1},{x:-3.6,y:2.1},{x:-3.6,y:-2.1}]} />
    <silkscreentext text="{NAME}" pcbX={0} pcbY={2.85} anchorAlignment="center" />
  </footprint>}
  {...restProps}
/>
}
