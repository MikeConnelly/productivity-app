# Productivity App

A habit tracker and daily journal. Built with React + AWS serverless (Lambda, DynamoDB, Cognito, API Gateway, CloudFront).

## Structure

```
productivity-app/
├── frontend/    # React + Vite + Tailwind
├── backend/     # Lambda handlers (TypeScript + esbuild)
└── infra/       # AWS CDK infrastructure
```

## Prerequisites

- Node.js 20+
- AWS CLI configured with credentials (`aws configure`)
- AWS CDK bootstrapped in your account/region (`npx cdk bootstrap`)

## First-time deployment

```bash
# Install dependencies
npm install

# Deploy everything (CDK + frontend build + S3 sync)
./scripts/deploy.sh
```

The script will print the app URL when finished.

## Local development

After your first deployment, the script writes `frontend/.env.production` with the real AWS resource IDs. Copy those values into a local env file:

```bash
cp frontend/.env.production frontend/.env.local
```

Then start the dev server:

```bash
npm run dev
```

The local dev server proxies to the real AWS backend — there is no local backend emulator.

## Subsequent deployments

Re-run the deploy script any time you change backend or infrastructure:

```bash
./scripts/deploy.sh
```

For frontend-only changes you can skip CDK and deploy faster:

```bash
npm run build --workspace=frontend
aws s3 sync frontend/dist/ s3://<your-bucket-name>/ --delete
aws cloudfront create-invalidation --distribution-id <dist-id> --paths "/*"
```

Bucket name and distribution ID are in `cdk-outputs.json` after the first deploy.

## Environment variables

| Variable | Description |
|---|---|
| `VITE_USER_POOL_ID` | Cognito User Pool ID |
| `VITE_USER_POOL_CLIENT_ID` | Cognito App Client ID |
| `VITE_API_URL` | API Gateway base URL |

These are written automatically by `deploy.sh`. See `frontend/.env.example` for the format.

## Tear down

```bash
cd infra && npx cdk destroy
```

Note: the DynamoDB table and Cognito User Pool have `RemovalPolicy.RETAIN` to prevent accidental data loss. Delete them manually in the AWS console if needed.
