**English** · [Türkçe](DEVELOPMENT.tr.md)

# Run from source

StudyOS uses React 19, TypeScript, Tailwind 4 and Vite for the interface, with a Tauri 2 / Rust desktop layer. Desktop records are persisted in SQLite.

## Browser preview

With Node.js 24, run these commands at the project root:

```powershell
npm ci
npm run dev
```

Open `http://localhost:1420/`. Preview records use localStorage and IndexedDB and are separate from the desktop database. In-app update checks do not run in the browser preview.

## Windows desktop development

Install the [Tauri Windows prerequisites](https://v2.tauri.app/start/prerequisites/): a current Rust/MSVC toolchain, Microsoft C++ Build Tools with the C++ desktop workload and Windows SDK, WebView2, and Node.js. Then run:

```powershell
npm ci
npm run tauri dev
```

The first Rust build can take a while to download and compile dependencies. Do not run a separate preview server and Tauri development server at the same time; both use port 1420. Stop a running server with `Ctrl + C`.

## Checks

```powershell
npm test
node --test scripts/tests/configure-release.check.mjs
npm run build
cargo test --manifest-path src-tauri/Cargo.toml --bin studyos deletion_tests
cargo check --manifest-path src-tauri/Cargo.toml
```

Tests cover the timer, scheduling, record removal, glass preferences and release configuration. WebGL effects and window behavior also need visual checks on Windows.

## Project layout

| Path | Purpose |
|---|---|
| `src/main.tsx` | App screens and state management |
| `src/Planner.tsx` | Daily schedule and task details |
| `src/components/` | Glass effects, navigation and deletion interactions |
| `src/storage.ts` | Desktop and browser persistence |
| `src-tauri/src/` | SQLite and update commands |
| `.github/workflows/release.yml` | Signed Windows release workflow |

## Build an installer

Run `npm run tauri build` on Windows. Output is written to `src-tauri/target/release/bundle/nsis/`.

Signed update publishing is configured by the project maintainers. The existing [maintainer publishing guide](../AUTO-UPDATES.md) is in Turkish. Signing credentials are not required for normal contributions, tests or browser development.
