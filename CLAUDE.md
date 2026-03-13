# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
npm install

# Development
npm run dev                    # Start frontend dev server (proxies to deployed AWS backend)

# Build
npm run build                  # Build backend + frontend
npm run build:backend          # Backend only (esbuild)
npm run build:frontend         # Frontend only (Vite + TypeScript)
npm run build:infra            # CDK infra only (TypeScript compilation)

# Lint
npm run lint --workspace=frontend

# Deploy
./scripts/deploy.sh            # Full deployment (first time or all-in-one)
npm run deploy --workspace=infra  # CDK deploy only
npx cdk diff --cwd infra       # Preview infrastructure changes
npx cdk destroy --cwd infra    # Tear down all AWS resources
```

No tests currently exist in the codebase. If added, they'd run via `npm test --workspaces --if-present`.

## Architecture

This is an npm monorepo with three workspaces: `frontend/`, `backend/`, and `infra/`. The app is a habit tracker + journal built on a fully serverless AWS stack.

**Data flow**: React frontend (S3/CloudFront) → API Gateway (Cognito-authorized) → Lambda handlers → DynamoDB

### Frontend (`frontend/`)
- React 18 + TypeScript + Vite, styled with Tailwind CSS
- Auth via AWS Amplify UI (Cognito)
- Four main routes: `/` (today's habits), `/habits` (management), `/habits/:id` (history), `/journal/:date` (markdown editor)
- Path alias `@/` maps to `src/`
- Env vars (`VITE_USER_POOL_ID`, `VITE_API_URL`, etc.) are generated from CDK outputs by the deploy script into `frontend/.env.production`. Copy to `.env.local` for local dev.

### Backend (`backend/`)
- 13 Lambda handlers bundled individually by esbuild into `dist/{handler}/index.js`
- Each handler extracts userId from Cognito claims (`event.requestContext.authorizer.claims.sub`)
- Shared utilities in `backend/src/shared/` (not bundled as handlers): `dynamo.ts`, `auth.ts`, `response.ts`
- All responses include CORS headers via `response.ts` helpers

### Infrastructure (`infra/`)
- AWS CDK v2 stack in `infra/lib/productivity-app-stack.ts`, organized into four constructs: `DatabaseConstruct`, `AuthConstruct`, `ApiConstruct`, `HostingConstruct`
- DynamoDB uses single-table design: `PK = USER#{userId}`, `SK` encodes entity type and ID (e.g., `HABIT#{habitId}`, `COMPLETION#{habitId}#{date}`, `JOURNAL#{date}`)
- CDK outputs written to `cdk-outputs.json` after deploy

### Deployment pipeline (`scripts/deploy.sh`)
1. Build backend
2. CDK deploy (creates/updates all AWS resources)
3. Write frontend env vars from `cdk-outputs.json`
4. Build frontend
5. Sync to S3
6. Invalidate CloudFront cache
