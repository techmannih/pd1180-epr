# Filtered publishing for the NEMA34 package

The hosted package is `techmannih/nema34-mounted-stepper-controller`. The repository remains the complete engineering handoff. The cloud build needs the editable components, pinned imports, runtime configuration, dependency lock and verified routed board; it does not need the firmware, engineering reports, manufacturing ZIPs or checking scripts.

## Why an explicit archive is needed

The 2026-10-20 GitHub import registered 653 files, including 233 under `docs/` and 128 under `scripts/`, despite those directories being listed in `ignoredFiles`. The installed CLI (`@tscircuit/cli` 0.1.2330) also does not load that configuration when its ordinary `push` command enumerates files. The previous local size check measured a filtered selection, not the actual upload. Increasing `workerTimeoutMs` cannot correct either file-selection issue.

The board now has a separate, explicit publication path:

1. `prepare:cloud` reads an immutable Git commit and applies the exclusions **before** uploading. It rejects missing source/import/assembly files, symlinks, unexpected binary inputs, more than 100 files or more than 10 MiB of source.
2. The publisher creates a non-latest release in the existing package and uploads all files as one compressed archive. There is no individual-file fallback. This avoids making partially uploaded source visible to build scheduling.
3. It checks the registered inventory and every source hash, waits for actual hosted success, then compares the entire built `dist/release/circuit.json` with the committed route, including schematic and assembly records.
4. Only explicit `--latest` may promote a verified release, and only if the source commit still equals GitHub `main` both before publication and immediately before promotion.

Engineering documents and scripts stay in GitHub. Circuit geometry, schematic, firmware motion locks, manufacturing files and hardware qualification requirements are unaffected.

## Commands

Run from the repository root with the pinned Bun version. The default input is **committed `HEAD`**, not uncommitted edits.

```sh
bun test scripts/cloud-package.test.mjs
bun run prepare:cloud
# Optionally select another exact commit:
bun run prepare:cloud <commit>
```

The folder and archive are written under ignored `build/cloud-package/<commit>`. The folder contains `cloud-source.json` with the Git revision and per-file hashes. Run the exact `buildCommand` from its `tscircuit.config.json` in this folder, then:

```sh
bun scripts/check-cloud-build.mjs build/cloud-package/<commit>
```

The `Filtered cloud package` workflow does that clean install/build and comparison on PRs and main. Its archive is available as an Actions artifact. It does not require a publishing credential.

For hosted validation, use the normal local CLI login. The publisher reads that credential privately; no GitHub secret is required. `TSCIRCUIT_TOKEN` in the process environment is also supported; never commit or print it.

```sh
tsci auth login
bun run publish:cloud <commit>
# After merge and successful verification, explicitly promote current main:
bun run publish:cloud <main-commit> --latest
```

The publisher always targets the existing NEMA34 package, regardless of the historical npm name in `package.json`. A `-cloud.<commit>` release stays non-latest by default. A repeated command reuses the same commit-specific release and verifies its inventory; it does not silently overwrite a different version or retry failed builds indefinitely. Reports are saved under `build/cloud-package/`.

The existing automatic GitHub importer is a separate path and does not become filtered just because this command exists. Its status can still fail independently. Use `publish:cloud` locally after a reviewed main update to use this filtered delivery path. CI builds and verifies the upload artifact without publishing credentials. Do not claim that merging this change modifies the hosting service.

## Timeout evidence and limits

Release v0.3.93 stopped after the sole `Starting execution` message. Its recorded job duration was 2420.28 seconds, while the service reported its separate 30-minute deadline. No routing or compilation stage was logged. The identical PR source tree had previously completed the configured build commands in 162.941 seconds.

The package-side archive corrects excessive/partial input delivery. It cannot guarantee availability of a hosted sandbox or override a service deadline. Keep a startup timeout distinct from a compiler/routing failure. A local pass or successful upload is not a hosted build pass.
