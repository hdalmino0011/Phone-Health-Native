import JSZip from 'jszip';
import { ANDROID_PROJECT_FILES } from '../data/androidProjectFiles';

export async function downloadAndroidProjectZip(onProgress?: (percent: number) => void): Promise<void> {
  const zip = new JSZip();

  // Add all Android files with correct directory hierarchies
  for (const file of ANDROID_PROJECT_FILES) {
    zip.file(file.path, file.content);
  }

  // Add basic gradlew and gradlew.bat stubs
  const gradlewStub = `#!/bin/sh
exec gradle "$@"
`;
  zip.file('gradlew', gradlewStub);
  zip.file('gradlew.bat', '@rem Gradle wrapper batch\r\ngradle %*\r\n');

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
