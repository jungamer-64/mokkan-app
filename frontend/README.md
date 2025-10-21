## Overview

This frontend is a lightweight dashboard for the Rust CMS backend. It consumes the public
`/api/v1/articles` endpoints to list articles, lets you filter them by keyword, page through the
results, and inspect the full body of any article. You can also refresh an individual article to
fetch the latest content from the API.

The UI is built with React, TypeScript, and Vite. Styling is handled with handcrafted CSS so it can
be customised without additional dependencies.

## Getting started

Install dependencies:

```sh
npm install
```

Run the development server (expects the backend on `http://localhost:8080` by default):

```sh
npm run dev
```

Create a production build:

```sh
npm run build
```

Preview the production build locally:

```sh
npm run preview
```

## Configuration

The frontend reads the backend origin from the `VITE_API_BASE_URL` environment variable. When it is
omitted, the default `http://localhost:8080` is used.

Create a `.env.local` file in this directory if you need a custom value:

```dotenv
VITE_API_BASE_URL=http://127.0.0.1:8080
```

Restart the dev server after changing environment variables so Vite can pick up the new value.
