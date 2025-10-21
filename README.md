## Application workspace

The `app` directory groups the Rust backend (`app/backend`) and the React frontend
(`app/frontend`). A small Node.js wrapper lives here so you can build and run both parts with a
single set of commands.

### Prerequisites

- Rust toolchain for the backend (`rustup` recommended)
- Node.js (18+) and npm for the orchestrator/front-end

### Install dependencies

Run once to install the root tools (currently just `concurrently`) and the frontend packages:

```sh
npm install          # installs the root package
(cd frontend && npm install)
```

### Development workflow

- `npm run dev` — start the backend (`cargo run`) and the frontend (`npm run dev --prefix frontend`)
  together. Output from both processes is multiplexed in the same terminal. Stop with `Ctrl+C`.
- `npm run dev:backend` — run only the backend with Cargo.
- `npm run dev:frontend` — run only the frontend development server.

The frontend expects the backend at `http://localhost:8080` by default. Override this with
`VITE_API_BASE_URL` in `app/frontend/.env.local` when necessary.

### Build for release

- `npm run build` — produces an optimized frontend bundle and compiles the backend in release mode.
  Frontend assets land in `app/frontend/dist/`; backend binaries are under `target/release/`.
