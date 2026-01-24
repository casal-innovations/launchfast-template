# Deployment

> ⚠️ **Important**
>
> LaunchFast deployment is designed to be handled by the **LaunchFast
> installer**. This document explains **what gets deployed and why**, how the
> infrastructure works, and how to reason about it when debugging or
> customizing.
>
> It is **not** intended to replace the installer or serve as the recommended
> deployment path.

---

## What the Installer Does

When you opt into deployment during installation, LaunchFast automates the full
deployment setup with correct defaults and guardrails:

- Injects deployment configuration files (`fly.toml`, `Dockerfile`, CI workflow)
- Configures region-aware Fly.io settings
- Verifies Fly.io billing and CLI availability
- Sets up CI-based deploys for production and staging
- Ensures secrets and infrastructure are created in the correct order
- Prevents partial or inconsistent deployment states

This automation is the product.  
Everything below exists to help you **understand or extend** what was created.

---

## Deployment Architecture Overview

LaunchFast deploys to **Fly.io** using:

- A containerized Node.js application
- SQLite databases replicated with **LiteFS**
- Fly-managed volumes for persistent storage
- Fly-managed Consul for primary/replica coordination
- GitHub Actions for CI-driven deploys

At runtime, the application automatically degrades to single-instance,
local-database behavior when LiteFS or Fly-specific environment variables are
not present.

---

## Fly.io Applications

A typical setup consists of two Fly apps:

- **Production**: `your-app-name`
- **Staging**: `your-app-name-staging`

Each app has:

- Its own persistent volume
- Its own secrets
- Its own deployment lifecycle

The installer ensures naming, regions, and configuration are consistent.

---

## Secrets and Environment Variables

### Required Secrets (per app)

These are set automatically during installation:

- `SESSION_SECRET`
- `HONEYPOT_SECRET`

### Environment-Specific

- `ALLOW_INDEXING=false` (recommended for non-production environments)

### Optional

- Email provider secrets (see email docs)
- Monitoring provider secrets (see monitoring docs)

Secrets are managed via Fly.io secrets, **not** `.env` files.

---

## Database and LiteFS

LaunchFast uses SQLite with LiteFS replication.

Key properties:

- A Fly volume named `data` is mounted per app
- One instance is elected primary via Consul
- Writes occur only on the primary
- Reads transparently work on replicas

For local development or non-LiteFS environments:

- LiteFS automatically becomes a no-op
- SQLite runs from local filesystem paths

No code changes are required to switch modes.

---

## CI-Based Deployment

By default, LaunchFast uses CI-driven deployment:

- `main` branch → production
- `dev` branch → staging

Each deployment:

- Builds the container image
- Runs migrations
- Deploys via Fly.io

This ensures deployments are repeatable and auditable.

---

## Advanced: Manual or Custom Deployment

Some advanced users may choose to:

- Modify the Dockerfile
- Change Fly regions or scaling behavior
- Deploy without CI
- Run the app in Docker or Podman locally

These are **supported but not optimized paths**.

If you take this route, you are responsible for:

- Correct file placement
- Secret management
- Volume and LiteFS configuration
- Deployment ordering

The installer exists specifically to remove this burden.

---

## When to Use This Document

Use this document if you need to:

- Understand how LaunchFast deploys your app
- Debug a deployment issue
- Customize infrastructure behavior
- Explain the architecture to teammates
- Extend or replace parts of the deployment system intentionally

If your goal is simply to deploy correctly and quickly:  
**Use the installer.**

---

## Related Documentation

- Email setup: `docs/documentation/email.md`
- Monitoring: `docs/documentation/monitoring.md`
- Database usage: `docs/documentation/database.md`
- Secrets management: `docs/documentation/secrets.md`
