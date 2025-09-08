#!/bin/sh

EXTENSION=firefox-profile-starter-neerajcd@gmail.com
DIST_DIR="dist"
DEST_DIR="$HOME/.local/share/gnome-shell/extensions/$EXTENSION"

gnome-extensions disable "$EXTENSION"

npm run build

rm -rf "$DEST_DIR"

mkdir -p "$DEST_DIR"
cp dist/extension.js "$DEST_DIR/extension.js"
cp metadata.json "$DEST_DIR/metadata.json"
cp -r icons "$DEST_DIR"

gnome-extensions enable "$EXTENSION"

