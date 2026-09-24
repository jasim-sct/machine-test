# Operations: Deployment & Production Build

> **Scope**: Building packages, production startup, and distribution artifacts.  
> **Source of Truth**: `package.json` scripts in root and apps.  
> **Last Verified**: 2026-09-24

---

## 1. Production Build Pipeline

Execute the root workspace build command:

```bash
pnpm build
```

This sequentially:
1. Compiles `@saas/shared` via `tsc` to generate types and JS artifacts in `packages/shared/dist`.
2. Compiles `@saas/api` via `nest build` to generate `apps/api/dist`.
3. Compiles `@saas/web` via `tsc && vite build` to generate optimized production static files in `apps/web/dist`.

---

## 2. Production Execution

- **API Process**:
  ```bash
  pnpm --filter @saas/api start:prod
  # Executes: node dist/main
  ```
- **Web Frontend**:
  - The static output in `apps/web/dist` can be served via Nginx, Caddy, Cloudflare Pages, or AWS S3/CloudFront.
