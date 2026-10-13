# PR #3 hosted import investigation — 2026-10-13

The failed [v0.3.82-pr3-3a48c343 build](https://tscircuit.com/techmannih/nema34-mounted-stepper-controller/releases/fb197195-b148-4ced-bfc1-580235302878) did not receive the complete repository. Its missing `index.circuit.tsx` and `package.json` errors do not show missing Git files or a wrong entrypoint. Hosted success remains unresolved; a local build cannot clear that status.

Evidence is recorded in [hosted-build-investigation.json](hosted-build-investigation.json), with public API/log links and SHA-256 values. The registry lists **551 files**. Fetching `index.circuit.tsx`, `package.json` and `release/circuit.json` individually returns byte-for-byte matches to Git commit `3a48c3439405d550b6283ea8d9586294b4db8805`. The configured build paths are therefore present and correct in the registered release.

| Event | UTC timestamp |
|---|---|
| Worker starts execution | 05:53:21.157 |
| First source write: `scripts/critical_copper.py` | 05:53:38.847 |
| Last source write: `verification.md` | 05:53:40.165 |
| Root `index.circuit.tsx` registered | 05:53:49.234 |
| Root `package.json` registered | 05:53:50.427 |
| Routed `release/circuit.json` registered | 05:53:53.684 |
| Failed sandbox destroyed | 05:54:05.929 |
| Last remaining file registered | 05:54:45.388 |

There are exactly **70 logged source writes**, matching the final 70 paths in the registry inventory; all were registered before execution. A further **255 files were registered after execution started**, including all three required files above; **84 arrived after the failed sandbox was destroyed**. The log then shows the CLI generating a replacement `package.json` and failing to resolve `/workspace/index.circuit.tsx`.

This is consistent with a premature or stale build-input snapshot during an unfinished import. The exact registry scheduling/storage defect is unproven. Inspection of the public [worker implementation](https://github.com/tscircuit/usercode.tscircuit.com/blob/eda348e1f2791a56614aa6bc05e9ee12d9169bdb/src/jobs/execute-job-async.ts#L124) confirms that it loads the job's input-file paths before creating directories and writing files, but the deployed revision and job state were not available for comparison. No claim is made that upload size or compression caused or fixes this failure.

Closure requires a hosted run for the final PR commit that materializes the complete input, executes both configured build targets, and publishes the matching `dist/release/circuit.json`. Keep the PR draft until that result is reviewed. Do not rename the authoritative entrypoint, fetch mutable `main` from inside the build, omit required source/import files, or waive the stock/fabrication gates to hide this error.

The separate clean-checkout test defect is fixed with `scripts/fixtures/placement-reviewed.txt`. Before the change, a `git archive` checkout reproduced `ENOENT` for the ignored `docs/checks/placement-raw.log`. After the change, a Git-index-only checkout passes the test both from its own root and from `/tmp`, without generating the ignored log. CI runs this regression before the stock-dependent review. The real placement checker continues to generate fresh placement output and validate native evidence.

A local control copied only the **80 tracked files allowed by `ignoredFiles`** into a new temporary workspace, reusing only the installed pinned dependency tree. The exact configured transpile/site/preview command completed with exit 0; the 13,701-record routed JSON matched and the static site plus 480 × 320 PNG were present. The first thumbnail attempt timed out; the CLI’s site-preview retry succeeded. This establishes a working local input package, not successful hosted import. Full verification remains 37/40 with the same assembly, board-standards and 404 native-silkscreen blockers; delivery integrity passes for 76 files and seven ZIPs.
