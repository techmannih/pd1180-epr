export const reviewed = ['C23','C41','R56']
export function placementAdvisories(output, status) {
  if (!/^placement drc:\s*Errors: 0\s*Warnings: 0\s*$/m.test(output)) throw new Error('Placement DRC contains unexpected errors/warnings')
  const advice = [...output.matchAll(/^  - (\w+) connections cross the routing path between its pads\. Suggested move: rotate \1 180 degrees\.$/gm)].map(m=>m[1]).sort()
  const count = Number(output.match(/^placement summary: (\d+) suboptimal orientations$/m)?.[1] ?? NaN)
  if (status !== 1 || count !== 3 || JSON.stringify(advice)!==JSON.stringify(reviewed)) throw new Error('Placement advisories changed; physical review required')
  return advice
}
