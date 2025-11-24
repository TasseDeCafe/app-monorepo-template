#!/bin/bash

# Ensure the script exits if any command fails
set -e

VERSION=$(sentry-cli releases propose-version)
sentry-cli releases new --org grammarians -p template-app-backend "$VERSION"

sentry-cli releases set-commits --org grammarians -p template-app-backend "$VERSION" --auto

sentry-cli sourcemaps inject --org grammarians --project template-app-backend ./dist
sentry-cli sourcemaps upload --org grammarians --project template-app-backend ./dist

sentry-cli releases finalize --org grammarians -p template-app-backend "$VERSION"

sentry-cli releases deploys --org grammarians -p template-app-backend "$VERSION" new -e production

echo "Sentry release $VERSION created, source maps uploaded, and deployed successfully"
