#!/bin/bash

# Build Release Script
# Prompts for version name, builds the macOS app, and creates a release candidate tag

set -e

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

# Build the macOS app
echo "Building macOS app..."
cd macos

xcodebuild -workspace LottieViewer.xcworkspace \
  -scheme LottieViewer-macOS \
  -configuration Release \
  -derivedDataPath build \
  CODE_SIGN_IDENTITY="" \
  CODE_SIGNING_REQUIRED=NO

# Find and copy the app bundle
echo "Packaging release..."
APP_BUNDLE=$(find build -name "LottieViewer.app" -type d | head -1)

if [ -z "$APP_BUNDLE" ]; then
  echo "Error: Could not find LottieViewer.app bundle"
  exit 1
fi

# Create release directory
mkdir -p "$RELEASE_DIR"

# Copy app bundle
if ! cp -R "$APP_BUNDLE" "$RELEASE_DIR/LottieViewer.app"; then
  echo "Error: Failed to copy app bundle"
  exit 1
fi

# Create zip archive
cd "$RELEASE_DIR"
if ! zip -r "LottieViewer-macOS-${VERSION_NAME}.zip" LottieViewer.app > /dev/null; then
  echo "Error: Failed to create zip archive"
  exit 1
fi

cd ../..

echo ""
echo "Build completed successfully!"
echo "Release artifacts:"
echo "  - $RELEASE_DIR/LottieViewer.app"
echo "  - $RELEASE_DIR/LottieViewer-macOS-${VERSION_NAME}.zip"
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
