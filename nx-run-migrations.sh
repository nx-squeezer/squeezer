#!/bin/bash

[ -f migrations.json ] && npx nx migrate --run-migrations=migrations.json
