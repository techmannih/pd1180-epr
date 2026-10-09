import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["pin1"],
  pin2: ["pin2"],
  pin3: ["pin3"],
  pin4: ["pin4"],
  pin5: ["pin5"],
  pin6: ["pin6"],
  pin7: ["pin7"],
  pin8: ["pin8"],
  pin9: ["pin9"],
  pin10: ["pin10"],
  pin11: ["pin11"],
  pin12: ["pin12"],
  pin13: ["pin13"],
  pin14: ["pin14"],
  pin15: ["pin15"],
  pin16: ["pin16"],
  pin17: ["pin17"],
  pin18: ["pin18"],
  pin19: ["pin19"],
  pin20: ["pin20"]
} as const

export const B20B_PHDSS_LF__SN_ = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      supplierPartNumbers={{
  "jlcpcb": [
    "C471521"
  ]
}}
      manufacturerPartNumber="B20B-PHDSS(LF)(SN)"
      footprint={<footprint insertionDirection="from_above">
        <platedhole  portHints={["pin1"]} pcbX="8.999982mm" pcbY="-0.999871mm" outerDiameter="1.524mm" holeDiameter="0.9144mm" shape="circle" />
<platedhole  portHints={["pin2"]} pcbX="8.999982mm" pcbY="1.000125mm" outerDiameter="1.524mm" holeDiameter="0.9144mm" shape="circle" />
<platedhole  portHints={["pin3"]} pcbX="6.999986mm" pcbY="-0.999871mm" outerDiameter="1.524mm" holeDiameter="0.9144mm" shape="circle" />
<platedhole  portHints={["pin4"]} pcbX="6.999986mm" pcbY="1.000125mm" outerDiameter="1.524mm" holeDiameter="0.9144mm" shape="circle" />
<platedhole  portHints={["pin5"]} pcbX="4.99999mm" pcbY="-0.999871mm" outerDiameter="1.524mm" holeDiameter="0.9144mm" shape="circle" />
<platedhole  portHints={["pin6"]} pcbX="4.99999mm" pcbY="1.000125mm" outerDiameter="1.524mm" holeDiameter="0.9144mm" shape="circle" />
<platedhole  portHints={["pin7"]} pcbX="2.999994mm" pcbY="-0.999871mm" outerDiameter="1.524mm" holeDiameter="0.9144mm" shape="circle" />
<platedhole  portHints={["pin8"]} pcbX="2.999994mm" pcbY="1.000125mm" outerDiameter="1.524mm" holeDiameter="0.9144mm" shape="circle" />
<platedhole  portHints={["pin9"]} pcbX="0.999998mm" pcbY="-0.999871mm" outerDiameter="1.524mm" holeDiameter="0.9144mm" shape="circle" />
<platedhole  portHints={["pin10"]} pcbX="0.999998mm" pcbY="1.000125mm" outerDiameter="1.524mm" holeDiameter="0.9144mm" shape="circle" />
<platedhole  portHints={["pin11"]} pcbX="-0.999998mm" pcbY="-0.999871mm" outerDiameter="1.524mm" holeDiameter="0.9144mm" shape="circle" />
<platedhole  portHints={["pin12"]} pcbX="-0.999998mm" pcbY="1.000125mm" outerDiameter="1.524mm" holeDiameter="0.9144mm" shape="circle" />
<platedhole  portHints={["pin13"]} pcbX="-2.999994mm" pcbY="-0.999871mm" outerDiameter="1.524mm" holeDiameter="0.9144mm" shape="circle" />
<platedhole  portHints={["pin14"]} pcbX="-2.999994mm" pcbY="1.000125mm" outerDiameter="1.524mm" holeDiameter="0.9144mm" shape="circle" />
<platedhole  portHints={["pin15"]} pcbX="-4.99999mm" pcbY="-0.999871mm" outerDiameter="1.524mm" holeDiameter="0.9144mm" shape="circle" />
<platedhole  portHints={["pin16"]} pcbX="-4.99999mm" pcbY="1.000125mm" outerDiameter="1.524mm" holeDiameter="0.9144mm" shape="circle" />
<platedhole  portHints={["pin17"]} pcbX="-6.999986mm" pcbY="-0.999871mm" outerDiameter="1.524mm" holeDiameter="0.9144mm" shape="circle" />
<platedhole  portHints={["pin18"]} pcbX="-6.999986mm" pcbY="1.000125mm" outerDiameter="1.524mm" holeDiameter="0.9144mm" shape="circle" />
<platedhole  portHints={["pin19"]} pcbX="-8.999982mm" pcbY="-0.999871mm" outerDiameter="1.524mm" holeDiameter="0.9144mm" shape="circle" />
<platedhole  portHints={["pin20"]} pcbX="-8.999982mm" pcbY="1.000125mm" outerDiameter="1.524mm" holeDiameter="0.9144mm" shape="circle" />
<silkscreenrect pcbX="0mm" pcbY="0mm" width="21.999956mm" height="4.99999mm" strokeWidth="0.254mm" />
<silkscreentext text="{NAME}" pcbX="-0.008382mm" pcbY="3.625725mm" anchorAlignment="center" fontSize="1mm" />
<courtyardoutline outline={[{"x":-11.19996540000011,"y":2.7501219999998057},{"x":11.199990800000023,"y":2.7501219999998057},{"x":11.199990800000023,"y":-2.749867999999992},{"x":-11.19996540000011,"y":-2.749867999999992},{"x":-11.19996540000011,"y":2.7501219999998057}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C471521.obj?uuid=52b92233863a4aef900d0adabc7118e4",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C471521.step?uuid=52b92233863a4aef900d0adabc7118e4",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 10.949987299999929, y: 2.4998730000000933, z: -6.000006 },
      }}
      {...props}
    />
  )
}
