#!/bin/sh

ZIP_FILE=firefox-profile-starter-neerajcd@gmail.com.zip
DIST_DIR="dist"

npm run build
mkdir -p "$DIST_DIR"

cd "$DIST_DIR"
rm -rf metadata.json icons
cp ../metadata.json .
cp -r ../icons .

rm -f "$ZIP_FILE"
zip -qr "$ZIP_FILE" extension.js metadata.json icons
