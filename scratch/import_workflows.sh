#!/bin/bash
export PATH="/root/.local/share/pnpm/store/v11/links/@/node/22.22.3/8900afdd38c8bbff16c18040d415cc2b5697706817bd30c0e37fd388a10edb00/node_modules/node/bin:$PATH"
n8nPath="/root/.local/share/pnpm/store/v11/links/@/node/22.22.3/8900afdd38c8bbff16c18040d415cc2b5697706817bd30c0e37fd388a10edb00/node_modules/node/bin/n8n"

echo "Running n8n publish:workflow..."
$n8nPath publish:workflow --id=7SwRxH0Jx08L3ILP
echo "n8n publish:workflow finished with exit code $?"
