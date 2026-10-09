import JSZip from 'jszip';
import { ANDROID_PROJECT_FILES } from '../data/androidProjectFiles';

export async function downloadAndroidProjectZip(onProgress?: (percent: number) => void): Promise<void> {
  const zip = new JSZip();

  // Add all Android files with correct directory hierarchies
  for (const file of ANDROID_PROJECT_FILES) {
    zip.file(file.path, file.content);
  }

  // Add robust gradlew with auto-wrapper bootstrap
  const gradlewScript = `#!/usr/bin/env sh
# Gradle wrapper script with automated bootstrap
set -e
APP_HOME=$(cd "\$(dirname "\$0")" && pwd)
WRAPPER_JAR="\$APP_HOME/gradle/wrapper/gradle-wrapper.jar"

if [ ! -f "\$WRAPPER_JAR" ]; then
    echo "Downloading Gradle wrapper jar..."
    mkdir -p "\$APP_HOME/gradle/wrapper"
    curl -sLo "\$WRAPPER_JAR" "https://services.gradle.org/distributions/gradle-8.2-bin.zip" || true
    if command -v gradle >/dev/null 2>&1; then
        gradle wrapper --gradle-version 8.2
    fi
fi

if [ -f "\$WRAPPER_JAR" ]; then
    exec java -Xmx2048m -jar "\$WRAPPER_JAR" "$@"
elif command -v gradle >/dev/null 2>&1; then
    exec gradle "$@"
else
    echo "Gradle not installed and wrapper jar missing. Please install gradle or run on GitHub Actions."
    exit 1
fi
`;
  zip.file('gradlew', gradlewScript);
  zip.file('gradlew.bat', '@rem Gradle wrapper batch\r\ncall gradle %*\r\n');
  zip.file('gradle/wrapper/gradle-wrapper.properties', `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.2-bin.zip
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`);

  // Add .gitignore
  const gitignoreContent = `*.iml
.gradle
/local.properties
/.idea
.DS_Store
/build
/app/build
/captures
.externalNativeBuild
.cxx
`;
  zip.file('.gitignore', gitignoreContent);

  // Generate the zip blob
  const content = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    },
    (metadata) => {
      if (onProgress) {
        onProgress(Math.round(metadata.percent));
      }
    }
  );

  // Trigger browser download
  const url = URL.createObjectURL(content);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'aegisdroid-native-android-project.zip';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
