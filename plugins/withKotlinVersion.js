const { withDangerousMod } = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');

const KOTLIN_VERSION = '1.9.25';

module.exports = function withKotlinVersion(config) {
  return withDangerousMod(config, [
    'android',
    (modConfig) => {
      const projectRoot = modConfig.modRequest.platformProjectRoot;

      // --- Patch build.gradle ---
      const buildGradlePath = path.join(projectRoot, 'build.gradle');
      if (fs.existsSync(buildGradlePath)) {
        let contents = fs.readFileSync(buildGradlePath, 'utf8');

        // Update ext.kotlinVersion
        if (/kotlinVersion\s*=/.test(contents)) {
          contents = contents.replace(
            /kotlinVersion\s*=\s*["'][^"']*["']/g,
            `kotlinVersion = "${KOTLIN_VERSION}"`
          );
        } else {
          contents = contents.replace(
            /(ext\s*\{)/,
            `$1\n        kotlinVersion = "${KOTLIN_VERSION}"`
          );
        }

        // Add or replace explicit Kotlin Gradle plugin classpath entry
        if (/kotlin-gradle-plugin/.test(contents)) {
          contents = contents.replace(
            /classpath\(["']org\.jetbrains\.kotlin:kotlin-gradle-plugin:[^"')]*["']\)/g,
            `classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:${KOTLIN_VERSION}")`
          );
        } else {
          contents = contents.replace(
            /(classpath\(["']com\.android\.tools\.build:gradle[^"')]*["']\))/,
            `$1\n        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:${KOTLIN_VERSION}")`
          );
        }

        fs.writeFileSync(buildGradlePath, contents);
      }

      // --- Patch settings.gradle ---
      const settingsGradlePath = path.join(projectRoot, 'settings.gradle');
      if (fs.existsSync(settingsGradlePath)) {
        let settings = fs.readFileSync(settingsGradlePath, 'utf8');

        if (!settings.includes('eachPlugin')) {
          settings = settings.replace(
            /(pluginManagement\s*\{)/,
            `$1\n    resolutionStrategy {\n        eachPlugin {\n            if (requested.id.namespace == 'org.jetbrains.kotlin') {\n                useVersion '${KOTLIN_VERSION}'\n            }\n        }\n    }`
          );
        }

        fs.writeFileSync(settingsGradlePath, settings);
      }

      return modConfig;
    },
  ]);
};
