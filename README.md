# auto-sslfy

> This project is based on [@liuweiGL's vite-plugin-mkcert](https://github.com/liuweiGL/vite-plugin-mkcert).

Use [mkcert](https://github.com/FiloSottile/mkcert) to generate self-signed certificates in order to provide https support for local Koa.js/Express applications.

## Quick start

1. Installation dependencies

```sh
yarn add -D https://github.com/trestini/auto-sslfy
```

2. Import dependencies and get certificates

```ts
import { provideCertificate } from "auto-sslfy";
const cert = await provideCertificate();
```

3. Use it to create https server from node

```ts
createServer(
  {
    key: cert.key,
    cert: cert.cert,
  },
  koa.callback() // or express app
).listen(port);
```

This lib is useful for local development environment to enforce the use of https instead http. For production deployments is recommended using real certificates from real CA's.
