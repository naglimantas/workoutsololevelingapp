const { withDangerousMod } = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');

const SUPPRESS_MARKER = 'suppressKotlinVersionCompatibilityCheck';
const PATCH_BLOCK = `

allprojects {
    tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompile).configureEach {
        kotlinOptions {
            freeCompilerArgs += [
                "-P",
                "plugin:androidx.compose.compiler.plugins.kotlin:suppressKotlinVersionCompatibilityCheck=1.9.24"
            ]
        }
    }
}
`;

const SPLASH_LOGO_XML = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="512dp"
    android:height="512dp"
    android:viewportWidth="512"
    android:viewportHeight="512">
</vector>`;

module.exports = function withKotlinVersion(config) {
  return withDangerousMod(config, [
    'android',
    (modConfig) => {
      const projectRoot = modConfig.modRequest.platformProjectRoot;

      // Patch build.gradle — suppress Compose Kotlin version check
      const buildGradlePath = path.join(projectRoot, 'build.gradle');
      if (fs.existsSync(buildGradlePath)) {
        let contents = fs.readFileSync(buildGradlePath, 'utf8');
        if (!contents.includes(SUPPRESS_MARKER)) {
          contents += PATCH_BLOCK;
          fs.writeFileSync(buildGradlePath, contents);
        }
      }

      // Create splashscreen_logo drawable if missing
      // expo-splash-screen references it in values.xml even without a splash image
      const drawableDir = path.join(projectRoot, 'app', 'src', 'main', 'res', 'drawable');
      if (!fs.existsSync(drawableDir)) {
        fs.mkdirSync(drawableDir, { recursive: true });
      }
      const logoPath = path.join(drawableDir, 'splashscreen_logo.xml');
      if (!fs.existsSync(logoPath)) {
        fs.writeFileSync(logoPath, SPLASH_LOGO_XML);
      }

      return modConfig;
    },
  ]);
};
