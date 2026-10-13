import type { InductorProps } from "@tscircuit/props"

// Bourns SRP7050TA datasheet, p1 recommended layout: two 2.5 x 3.5 mm
// lands, 8.4 mm overall span. C2047110 has no EasyEDA library entry.
// https://www.bourns.com/docs/product-datasheets/srp7050ta.pdf
export const SRP7050TA_470M = (props: Omit<InductorProps, "inductance">) => (
  <inductor
    inductance="47uH"
    manufacturerPartNumber="SRP7050TA-470M"
    supplierPartNumbers={{ jlcpcb: ["C2047110"] }}
    // Dimensioned body envelope, not a manufacturer STEP model.
    cadModel={{
      jscad: {
        type: "translate",
        vector: [0, 0, 2.4],
        shape: { type: "cuboid", size: [7.3, 6.6, 4.8] },
      },
      size: { x: 7.3, y: 6.6, z: 4.8 },
    }}
    footprint={
      <footprint>
        <smtpad portHints={["pin1"]} pcbX={-2.95} pcbY={0} width={2.5} height={3.5} shape="rect" />
        <smtpad portHints={["pin2"]} pcbX={2.95} pcbY={0} width={2.5} height={3.5} shape="rect" />
        <fabricationnotepath route={[{ x: -3.65, y: -3.3 }, { x: 3.65, y: -3.3 }, { x: 3.65, y: 3.3 }, { x: -3.65, y: 3.3 }, { x: -3.65, y: -3.3 }]} />
        <silkscreenpath route={[{ x: -3.65, y: 2.1 }, { x: -3.65, y: 3.3 }, { x: 3.65, y: 3.3 }, { x: 3.65, y: 2.1 }]} />
        <silkscreenpath route={[{ x: -3.65, y: -2.1 }, { x: -3.65, y: -3.3 }, { x: 3.65, y: -3.3 }, { x: 3.65, y: -2.1 }]} />
        <courtyardoutline outline={[{ x: -4.45, y: -3.7 }, { x: 4.45, y: -3.7 }, { x: 4.45, y: 3.7 }, { x: -4.45, y: 3.7 }, { x: -4.45, y: -3.7 }]} />
      </footprint>
    }
    {...props}
  />
)
