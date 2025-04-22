#!/bin/bash

set -e

CLI_DIR="packages/@quickbyte/cli"
PIPELINES_DIR="packages/@quickbyte/pipelines"
ENTRY_SRC="$CLI_DIR/src/index.ts"
ENTRY_DIST="$CLI_DIR/dist/index.js"
NODE_BIN_DIR="$HOME/.nvm/versions/node/$(node -v)/bin"


echo "🧱 Bootstrapping CLI entrypoint if missing..."
mkdir -p "$(dirname $ENTRY_SRC)"

if [ ! -f "$ENTRY_SRC" ]; then
  cat <<EOF > "$ENTRY_SRC"
#!/usr/bin/env node

import { Command } from "commander";

const program = new Command();

program
  .name("qb")
  .description("QuickByte CLI")
  .version("0.1.0");

program
  .command("hello")
  .description("Say hello")
  .action(() => {
    console.log("👋 Hello from QuickByte CLI!");
  });

program.parse();
EOF
  echo "✅ Created placeholder CLI at $ENTRY_SRC"
fi

echo "🔨 Building with TypeScript project references..."
tsc -b $PIPELINES_DIR $CLI_DIR

if [ ! -f "$ENTRY_DIST" ]; then
  echo "❌ Build failed: CLI entrypoint not found at $ENTRY_DIST"
  exit 1
fi

echo "🔍 Ensuring CLI entrypoint has shebang..."
FIRST_LINE=$(head -n 1 "$ENTRY_DIST")
if [[ "$FIRST_LINE" != "#!/usr/bin/env node" ]]; then
  echo "🚧 Adding shebang..."
  (echo '#!/usr/bin/env node' && cat "$ENTRY_DIST") > "$ENTRY_DIST.tmp"
  mv "$ENTRY_DIST.tmp" "$ENTRY_DIST"
fi

chmod +x "$ENTRY_DIST"

echo "🔗 Linking packages globally..."
(cd $PIPELINES_DIR && npm link)
(cd $CLI_DIR && npm link @quickbyte/pipelines && npm link)

echo "🔍 Checking global qb command..."
QB_PATH=$(which qb || true)

if [ -z "$QB_PATH" ]; then
  export PATH="$NODE_BIN_DIR:$PATH"
  QB_PATH=$(which qb || true)
  echo "⚠️  'qb' was not found in PATH — added node bin temporarily."
fi

if [ -z "$QB_PATH" ]; then
  echo "❌ 'qb' is still not available. Try adding this to your shell profile:"
  echo "export PATH=\"$NODE_BIN_DIR:\$PATH\""
  exit 1
fi

echo "✅ 'qb' is available at: $QB_PATH"
qb --help || echo "⚠️ CLI launched but failed. Check implementation."