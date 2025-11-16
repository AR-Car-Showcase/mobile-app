#!/bin/bash

PROJECT_ROOT="/run/media/sricharan.adepu/Sri_Charan/viro-react/ARCarShowcase"

echo "🧹 Cleaning old icons..."
# Remove ALL existing icons to avoid conflicts
rm -f "$PROJECT_ROOT/android/app/src/main/res/mipmap-"*/ic_launcher*.*
rm -f "$PROJECT_ROOT/android/app/src/debug/res/mipmap-"*/ic_launcher*.*

echo "📁 Creating icon directories..."
mkdir -p "$PROJECT_ROOT/android/app/src/debug/res/mipmap-xxxhdpi"
mkdir -p "$PROJECT_ROOT/android/app/src/main/res/mipmap-xxxhdpi"

echo "🖼️  Setting up DEBUG icon (testing.png)..."
cp "$PROJECT_ROOT/assets/images/testing.png" "$PROJECT_ROOT/android/app/src/debug/res/mipmap-xxxhdpi/ic_launcher.png"
cp "$PROJECT_ROOT/assets/images/testing.png" "$PROJECT_ROOT/android/app/src/debug/res/mipmap-xxxhdpi/ic_launcher_round.png"

echo "🖼️  Setting up RELEASE icon (release.png)..."
cp "$PROJECT_ROOT/assets/images/release.png" "$PROJECT_ROOT/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png"
cp "$PROJECT_ROOT/assets/images/release.png" "$PROJECT_ROOT/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png"

echo "✅ Icons setup complete!"
echo "Now run: cd android && ./gradlew clean && ./gradlew installDebug"
