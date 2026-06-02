# CI/CD Frontend Pipeline

**Platform:** GitHub Actions + Vercel
**Package manager:** pnpm
**Last updated:** 2026-05-17

---

## Pipeline (mỗi PR)

```text
lint → typecheck → test → build → preview deploy
```

| Step | Tool | Script | Block merge? |
| --- | --- | --- | --- |
| Lint | ESLint + next plugin | `pnpm lint` | ✅ |
| Typecheck | `tsc --noEmit` strict | `pnpm typecheck` | ✅ |
| Test | Vitest + MSW | `pnpm test:ci` | ✅ |
| Build | `next build` | `pnpm build` | ✅ |
| Preview deploy | Vercel per-PR | auto | — |

## Branch strategy

| Branch | CI | Deploy |
| --- | --- | --- |
| `main` | Full pipeline | Auto → Production |
| `feat/*`, `fix/*` | Full pipeline | Preview URL (per PR) |
| `chore/*` | Lint + typecheck | Không deploy |

## Preview deploy

- Vercel tự tạo preview URL khi PR mở
- Preview dùng `NEXT_PUBLIC_MOCK_ENABLED=true` — không cần BE thật
- Rollback production = 1 click Vercel Dashboard

## Lint rule quan trọng

ESLint `import/no-restricted-paths` enforce **cấm import chéo giữa domains** (core-philosophy.md) — vi phạm → CI fail.

## Pre-commit (local)

```bash
husky + lint-staged → chạy eslint + tsc-files trước mỗi commit
```
