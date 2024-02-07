#!/bin/bash
rm -rf node_modules
npm ci --no-audit

# Migrate Nx and Angular
npx --no-install nx migrate latest
npx --no-install nx migrate @angular/core@latest
npx --no-install nx migrate @angular/cli@latest
npx --no-install nx migrate @schematics/angular@latest

# Migrate Plugins
npx --no-install nx migrate @jscutlery/semver@latest
npx --no-install nx migrate ngx-deploy-npm@latest
npx --no-install nx migrate @twittwer/compodoc@latest

# Run Migrations
rm -rf node_modules
rm package-lock.json
npm install
npx --no-install nx migrate --run-migrations --if-exists
npm install
rm -f migrations.json

# Format
npx --no-install nx run-many --target=lint --all --parallel=3 --fix --skip-nx-cache
