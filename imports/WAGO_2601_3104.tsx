// WAGO datasheet: paired solder tails per wire entry, 1.2 (+0.1) mm drill.
// Unique PCB tail identifiers avoid duplicate alias routes; each pair is tied at the callsite.
import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["T1_A"],
  pin2: ["T2_A"],
  pin3: ["T3_A"],
  pin4: ["T4_A"],
  pin5: ["T1_B"],
  pin6: ["T2_B"],
  pin7: ["T3_B"],
  pin8: ["T4_B"]
} as const

export const WAGO_2601_3104 = (props: ChipProps<typeof pinLabels>) => {
  return (
    <connector
      pinLabels={pinLabels}
      supplierPartNumbers={{
  "jlcpcb": [
    "C20252915"
  ]
}}
      manufacturerPartNumber="2601-3104"
      footprint={<footprint insertionDirection="from_above">
        <platedhole  portHints={["pin4"]} pcbX="5.250053mm" pcbY="-2.499995mm" outerDiameter="2.1999956mm" holeDiameter="1.2mm" shape="circle" />
<platedhole  portHints={["pin8"]} pcbX="5.250053mm" pcbY="2.499995mm" outerDiameter="2.1999956mm" holeDiameter="1.2mm" shape="circle" />
<platedhole  portHints={["pin7"]} pcbX="1.749933mm" pcbY="2.499995mm" outerDiameter="2.1999956mm" holeDiameter="1.2mm" shape="circle" />
<platedhole  portHints={["pin6"]} pcbX="-1.749933mm" pcbY="2.499995mm" outerDiameter="2.1999956mm" holeDiameter="1.2mm" shape="circle" />
<platedhole  portHints={["pin5"]} pcbX="-5.250053mm" pcbY="2.499995mm" outerDiameter="2.1999956mm" holeDiameter="1.2mm" shape="circle" />
<platedhole  portHints={["pin3"]} pcbX="1.749933mm" pcbY="-2.499995mm" outerDiameter="2.1999956mm" holeDiameter="1.2mm" shape="circle" />
<platedhole  portHints={["pin2"]} pcbX="-1.749933mm" pcbY="-2.499995mm" outerDiameter="2.1999956mm" holeDiameter="1.2mm" shape="circle" />
<platedhole  portHints={["pin1"]} pcbX="-5.250053mm" pcbY="-2.499995mm" outerDiameter="2.1999956mm" holeDiameter="1.2mm" shape="circle" />
<silkscreenpath route={[{"x":4.351147000000083,"y":-4.80123500000002},{"x":7.848727000000167,"y":-4.80123500000002},{"x":7.848727000000167,"y":7.898765000000026},{"x":-7.749413000000004,"y":7.898765000000026},{"x":-7.749413000000004,"y":-4.80123500000002},{"x":4.351147000000083,"y":-4.80123500000002}]} />
<silkscreentext text="{NAME}" pcbX="-0.271653mm" pcbY="8.960995mm" anchorAlignment="center" fontSize="1mm" />
<fabricationnotepath route={[{"x":-7.523048199999835,"y":7.799984399999971},{"x":-7.523048199999835,"y":-4.5729906000000256},{"x":7.622921000000019,"y":-4.5729906000000256},{"x":7.622921000000019,"y":7.6729844000000185},{"x":-7.350048799999854,"y":7.6729844000000185},{"x":-7.477048799999807,"y":7.799984399999971},{"x":-7.350048799999854,"y":7.926984399999924},{"x":7.749920999999972,"y":7.926984399999924},{"x":7.839723561210803,"y":7.889786961210689},{"x":7.8769210000000385,"y":7.799984399999971},{"x":7.8769210000000385,"y":-4.699990599999978},{"x":7.839723561210803,"y":-4.789793161210696},{"x":7.749920999999972,"y":-4.826990600000045},{"x":-7.650048199999901,"y":-4.826990600000045},{"x":-7.739850761210732,"y":-4.789793161210696},{"x":-7.777048199999854,"y":-4.699990599999978},{"x":-7.777048199999854,"y":7.799984399999971},{"x":-7.650048199999901,"y":7.926984399999924},{"x":-7.523048199999835,"y":7.799984399999971}]} strokeWidth="0mm" isFilled hasStroke={false} />
<courtyardoutline outline={[{"x":-8.675027599999794,"y":8.189989200000014},{"x":8.074927200000047,"y":8.189989200000014},{"x":8.074927200000047,"y":-5.059998000000064},{"x":-8.675027599999794,"y":-5.059998000000064},{"x":-8.675027599999794,"y":8.189989200000014}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C20252915.obj?uuid=e2f3d14f5899419fb0772fbc01962f77",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C20252915.step?uuid=e2f3d14f5899419fb0772fbc01962f77",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: -0.07494980000012674, y: -1.6149955999999746, z: -0.10000699999999973 },
      }}
      {...props}
    />
  )
}