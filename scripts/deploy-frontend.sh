#!/usr/bin/env bash
# Frontend-only deploy: build frontend, sync S3, invalidate CloudFront
# Requires cdk-outputs.json to already exist (run deploy.sh at least once first)
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f cdk-outputs.json ]; then
  echo "Error: cdk-outputs.json not found. Run deploy.sh first to provision infrastructure."
  exit 1
fi

# Parse outputs
USER_POOL_ID=$(jq -r '.ProductivityAppStack.UserPoolId' cdk-outputs.json)
USER_POOL_CLIENT_ID=$(jq -r '.ProductivityAppStack.UserPoolClientId' cdk-outputs.json)
API_URL=$(jq -r '.ProductivityAppStack.ApiUrl' cdk-outputs.json)
CLOUDFRONT_URL=$(jq -r '.ProductivityAppStack.CloudFrontUrl' cdk-outputs.json)
BUCKET_NAME=$(jq -r '.ProductivityAppStack.BucketName' cdk-outputs.json)
DISTRIBUTION_ID=$(aws cloudfront list-distributions \
  --query "DistributionList.Items[?DomainName=='${CLOUDFRONT_URL#https://}'].Id" \
  --output text)

echo "==> Writing frontend env..."
cat > frontend/.env.production <<EOF
VITE_USER_POOL_ID=$USER_POOL_ID
VITE_USER_POOL_CLIENT_ID=$USER_POOL_CLIENT_ID
VITE_API_URL=$API_URL
EOF

echo "==> Building frontend..."
npm run build --workspace=frontend

echo "==> Syncing to S3..."
aws s3 sync frontend/dist/ "s3://$BUCKET_NAME/" --delete

echo "==> Invalidating CloudFront..."
aws cloudfront create-invalidation \
  --distribution-id "$DISTRIBUTION_ID" \
  --paths "/*"

echo ""
echo "Deployed! App URL: $CLOUDFRONT_URL"
