# Nest CQRS Security Remediation Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Remove remediable production dependency vulnerabilities and harden the Nest CQRS service against anonymous access, unsafe configuration, permissive request handling, stale updates, sensitive logging, insecure container defaults, and unsafe release automation.

**Architecture:** Deliver one reviewable remediation pull request because the changes are tightly coupled: the runtime/dependency graph and build/release supply chain establish the deployment baseline, while the application layer enforces the corresponding production security policy. Preserve the project’s existing Nest 11 CommonJS architecture; moving to Nest 12 requires a separate ESM migration and must not be smuggled into a security patch.

**Tech Stack:** Node.js 20.19+, NestJS 11.2.9, Express 5 via `@nestjs/platform-express`, Mongoose 9.12.1, Jest 29, TypeScript 5.9, Docker, GitHub Actions.

---

## Security scope and explicit residual boundary

- Production dependencies must pass `npm audit --omit=dev --audit-level=low` with zero vulnerabilities.
- Development-only advisories inherited from current published tooling are tracked separately; they must not enter the production image because runtime dependencies are installed with `--omit=dev`.
- Production must fail startup if `API_KEY`, EventStore credentials, a secure EventStore URI, or CORS origins are absent.
- The API key establishes service-level authentication only. Per-user/per-tenant authorization requires an identity and ownership domain model that this repository does not contain; do not claim it is implemented.

## Task 1: Repair the reproducible dependency baseline

**Objective:** Synchronize the lockfile and install only verified, compatible runtime dependency upgrades.

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

**Step 1: Update compatible direct dependencies**

Use exact versions:

```text
@eventstore/db-client 6.2.1
@nestjs/common/core/platform-express 11.2.9
class-validator 0.15.1
cli-color 2.0.4
mongoose 9.12.1
rimraf 6.1.4
rxjs 7.8.2
@nestjs/cli 11.0.24
@nestjs/testing 11.2.9
```

**Step 2: Add production vulnerability overrides**

```json
{
  "overrides": {
    "uuid": "11.1.1",
    "@grpc/grpc-js": "1.14.7",
    "protobufjs": "7.6.6"
  }
}
```

**Step 3: Align Node engines**

Require Node `>=20.19.0`.

**Step 4: Verify**

Run:

```bash
npm ci
npm ls --depth=0
npm audit --omit=dev --audit-level=low
npm run build
npm test -- --runInBand
npm run test:e2e -- --runInBand
```

Expected: install succeeds, production audit finds zero vulnerabilities, and existing checks pass.

## Task 2: Harden runtime image and development infrastructure

**Objective:** Run the application in a supported Node image with production-only dependencies and keep local backing services off public interfaces.

**Files:**
- Modify: `Dockerfile`
- Modify: `docker-compose.yaml`
- Test: `test/runtime-config.spec.ts`

**Step 1: Write failing semantic configuration tests**

Assert the package Node engine and every Docker Node stage satisfy Node 20.19+. Assert runtime installation omits development dependencies. Assert MongoDB and EventStore published ports bind only to `127.0.0.1`.

**Step 2: Update Dockerfile**

Use supported Node 20 slim builder/runtime stages. Install/build in the builder and prune development dependencies before copying runtime files. Run as the non-root `node` user.

**Step 3: Update Compose**

Bind MongoDB and EventStore ports to loopback only. Keep insecure EventStore development configuration explicit and isolated to Compose, never as an application production default.

**Step 4: Verify**

Run targeted test, `docker build --no-cache .`, and inspect the image configuration without exposing secrets.

## Task 3: Centralize and test safe application bootstrap policy

**Objective:** Enforce explicit CORS and strict request validation from one testable bootstrap function.

**Files:**
- Create: `src/app.bootstrap.ts`
- Modify: `src/main.ts`
- Modify: `test/orders.e2e-spec.ts`

**Step 1: Write failing integration tests**

Test an allowed CORS preflight, a rejected untrusted origin, a valid create request, and rejection of unknown fields, invalid enum/quantity types, and malformed ObjectIds.

**Step 2: Implement minimal bootstrap policy**

Export a configuration function that installs a global `ValidationPipe` with `whitelist`, `forbidNonWhitelisted`, and `transform`, and enables CORS only for configured origins. In production, reject missing CORS configuration.

**Step 3: Verify**

Run the focused e2e suite and then the full unit/e2e suites.

## Task 4: Fail closed on production secrets and transport

**Objective:** Remove committed production credentials and reject insecure production EventStore configuration.

**Files:**
- Modify: `src/app.config.ts`
- Modify: `src/core/config/config.service.ts`
- Modify: `src/core/config/config.service.spec.ts`
- Modify: `src/core/event-store/event-store.service.ts`
- Modify: `src/core/event-store/event-store.service.spec.ts`

**Step 1: Write failing tests**

Assert production fails without EventStore credentials; provided credentials win; production rejects an insecure EventStore URI; and generated secure connection URLs require TLS.

**Step 2: Implement minimal configuration changes**

Keep development defaults only for development. Remove production credential fallbacks. Require production EventStore credentials and an `esdb://` URI whose TLS setting is not explicitly disabled.

**Step 3: Verify**

Run the two targeted specs and full test suite.

## Task 5: Require service authentication, validate identifiers, and make updates safe

**Objective:** Prevent anonymous use of the API and eliminate unsafe/invalid persistence paths.

**Files:**
- Create: `src/core/security/api-key.guard.ts`
- Create: `src/core/security/api-key.guard.spec.ts`
- Create: `src/core/security/parse-object-id.pipe.ts`
- Create: `src/core/security/parse-object-id.pipe.spec.ts`
- Modify: `src/orders/orders.controller.ts`
- Modify: `src/orders/orders.repository.ts`
- Modify: `src/orders/orders.repository.spec.ts`
- Modify: `test/orders.e2e-spec.ts`

**Step 1: Write failing tests**

Assert missing/wrong API keys get `401`, valid keys reach route handlers, malformed IDs get `400` without service invocation, and updates use a valid ObjectId, `$set`, `new: true`, and `runValidators: true`.

**Step 2: Implement minimal security boundary**

Add an `x-api-key` guard that requires `API_KEY` in production and validates it using constant-time comparison. Apply it to Orders endpoints. Add a reusable ObjectId pipe. Use `new: true`/`runValidators: true` in repository updates.

**Step 3: Verify**

Run guard/pipe/repository tests, e2e tests, then full test suite.

## Task 6: Remove sensitive payload logging and cap accidental data exposure

**Objective:** Avoid logging complete order payloads and introduce a bounded, explicit list response contract.

**Files:**
- Modify: `src/orders/events/handlers/order-created.handler.ts`
- Modify: `src/orders/events/handlers/order-updated.handler.ts`
- Add/modify tests adjacent to those handlers

**Step 1: Write failing tests**

Capture logger calls and assert address, payment method, credentials, and serialized full payloads never appear; assert a safe event name and order identifier do appear.

**Step 2: Implement safe structured logging**

Log only event type and order ID. Do not stringify the event or document.

**Step 3: Verify**

Run targeted handlers tests and the full suite.

## Task 7: Harden CI/release automation

**Objective:** Ensure PRs validate dependencies/tests/images and release jobs do not use mutable or invalid third-party actions.

**Files:**
- Create: `.github/workflows/ci.yaml`
- Modify: `.github/workflows/build-image.yaml`
- Modify: `.github/workflows/release.yaml`
- Modify: `skaffold.yaml`
- Add: configuration test or `actionlint` command documentation if executable locally

**Step 1: Write failing configuration assertions**

Assert CI runs `npm ci`, build, unit/e2e tests, and production audit. Assert action/cache uses the official namespace, all workflow action references are pinned to full commit SHAs where usable, and Skaffold uses an existing `prod` profile.

**Step 2: Implement workflow hardening**

Add least-privilege permissions. Replace invalid cache namespace. Pin first-party actions to reviewed SHAs. Replace `@latest` third-party Skaffold execution with a directly installed, version-pinned Skaffold binary or an action pinned to a full SHA. Use the built-in `GITHUB_TOKEN` for release unless the repository demonstrably needs a PAT.

**Step 3: Verify**

Run YAML/configuration tests locally and validate exact commands where dependencies are available. On GitHub, require the CI check to pass before merging.

## Task 8: Review, PR, merge, and post-merge validation

**Objective:** Produce focused pull requests with evidence and merge only passing changes.

**Steps:**

1. Inspect staged diff and run all required checks.
2. Ask independent reviewers for spec compliance then code quality.
3. Commit PR 1 (`fix(deps): patch production dependency vulnerabilities`) and open it against `main`.
4. Wait for GitHub checks; inspect failures rather than assuming.
5. Merge PR 1 only after relevant checks pass.
6. Rebase PR 2 onto current `main`; repeat full verification, review, PR creation, CI inspection, and merge.
7. Verify `main` at the merge commits, rerun production audit and relevant checks, and record residual risks honestly.
