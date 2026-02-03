#!/bin/bash

# Build Release Script
# Prompts for version name, builds the macOS app, and creates a release candidate tag
# Supports Code Signing and Notarization if env vars are present

set -e

# --- Configuration ---
# Required env vars for signing/notarization:
# SIGNING_IDENTITY: "Developer ID Application: Your Name (TEAM_ID)"
# APPLE_ID: "your@email.com"
# APPLE_PASSWORD: "app-specific-password"
# TEAM_ID: "Your Team ID"

# Get version name from user
if [ -z "$1" ]; then
  read -p "Enter version name (e.g., 1.0.0): " VERSION_NAME
else
  VERSION_NAME=$1
fi

if [ -z "$VERSION_NAME" ]; then
  echo "Error: Version name is required"
  exit 1
fi

# Validate version name format (basic check)
if [[ ! "$VERSION_NAME" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9]+)?$ ]]; then
  echo "Warning: Version name '$VERSION_NAME' doesn't match standard format (e.g., 1.0.0 or 1.0.0-beta)"
  read -p "Continue anyway? (y/n): " CONTINUE
  if [ "$CONTINUE" != "y" ] && [ "$CONTINUE" != "Y" ]; then
    exit 1
  fi
fi

TAG_NAME="rc${VERSION_NAME}"
RELEASE_DIR="macos/release"
ARCHIVE_NAME="LottieViewer-macOS-${VERSION_NAME}.zip"

echo "Building release for version: $VERSION_NAME"
echo "Tag will be created as: $TAG_NAME"
echo ""

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
  echo "Error: Not in a git repository"
  exit 1
fi

# Check if tag already exists
if git rev-parse "$TAG_NAME" > /dev/null 2>&1; then
  echo "Error: Tag '$TAG_NAME' already exists"
  exit 1
fi

# Check if there are uncommitted changes
if ! git diff-index --quiet HEAD --; then
  echo "Warning: You have uncommitted changes"
  read -p "Continue anyway? (y/n): " CONTINUE
  if [ "$CONTINUE" != "y" ] && [ "$CONTINUE" != "Y" ]; then
    exit 1
  fi
fi

# Navigate to project root
cd "$(dirname "$0")/.."

# Prepare for signing
SIGNING_ARGS=""
if [ -n "$SIGNING_IDENTITY" ]; then
  echo "Code Signing Enabled with Identity: $SIGNING_IDENTITY"
  SIGNING_ARGS="CODE_SIGN_IDENTITY=\"$SIGNING_IDENTITY\" CODE_SIGN_STYLE=Manual DEVELOPMENT_TEAM=\"$TEAM_ID\""
else
  echo "WARNING: No SIGNING_IDENTITY provided. Build will be unsigned."
  SIGNING_ARGS="CODE_SIGN_IDENTITY=\"\" CODE_SIGNING_REQUIRED=NO"
fi

# Build the macOS app
echo "Building macOS app..."
cd macos

# Clean build folder first
rm -rf build

# Use eval to properly expand the quotes in SIGNING_ARGS
eval xcodebuild -workspace LottieViewer.xcworkspace \
  -scheme LottieViewer-macOS \
  -configuration Release \
  -derivedDataPath build \
  $SIGNING_ARGS

# Find and copy the app bundle
echo "Packaging release..."
APP_BUNDLE=$(find build -name "LottieViewer.app" -type d | head -1)

if [ -z "$APP_BUNDLE" ]; then
  echo "Error: Could not find LottieViewer.app bundle"
  exit 1
fi

# Create release directory
mkdir -p "$RELEASE_DIR"
rm -rf "$RELEASE_DIR/LottieViewer.app" # Clean previous

# Copy app bundle
if ! cp -R "$APP_BUNDLE" "$RELEASE_DIR/LottieViewer.app"; then
  echo "Error: Failed to copy app bundle"
  exit 1
fi

# Create zip archive (needed for notarization)
cd "$RELEASE_DIR"
echo "Creating zip archive..."
if ! zip -r "$ARCHIVE_NAME" LottieViewer.app > /dev/null; then
  echo "Error: Failed to create zip archive"
  exit 1
fi

# Notarization
if [ -n "$SIGNING_IDENTITY" ] && [ -n "$APPLE_ID" ] && [ -n "$APPLE_PASSWORD" ] && [ -n "$TEAM_ID" ]; then
  echo ""
  echo "----------------------------------------------------------------"
  echo "Starting Notarization..."
  echo "This may take a few minutes."
  echo "----------------------------------------------------------------"
  
  xcrun notarytool submit "$ARCHIVE_NAME" \
    --apple-id "$APPLE_ID" \
    --password "$APPLE_PASSWORD" \
    --team-id "$TEAM_ID" \
    --wait

  echo ""
  echo "Notarization submitted. Checking status..."
  
  # If previous command succeeded (set -e), it means it was accepted.
  # Now staple the ticket to the app
  echo "Stapling notarization ticket to the app..."
  xcrun stapler staple "LottieViewer.app"
  
  # Re-zip the stapled app
  echo "Re-zipping stapled app..."
  rm "$ARCHIVE_NAME"
  zip -r "$ARCHIVE_NAME" LottieViewer.app > /dev/null
  
  echo "Notarization and Stapling Complete!"
else
  echo ""
  echo "Skipping Notarization (Missing APPLE_ID, APPLE_PASSWORD, or TEAM_ID)"
fi

cd ../..

echo ""
echo "Build completed successfully!"
echo "Release artifacts:"
echo "  - $RELEASE_DIR/LottieViewer.app"
echo "  - $RELEASE_DIR/$ARCHIVE_NAME"
echo ""

# Create git tag
echo "Creating git tag: $TAG_NAME"
git tag -a "$TAG_NAME" -m "Release candidate ${VERSION_NAME}"

echo ""
echo "Tag '$TAG_NAME' created successfully!"
echo ""
echo "Next steps:"
echo "  1. Review the build artifacts in $RELEASE_DIR"
echo "  2. Run 'npm run release:push' to push the release and tag to remote"
