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

module.exports = function withKotlinVersion(config) {
  return withDangerousMod(config, [
    'android',
    (modConfig) => {
      const projectRoot = modConfig.modRequest.platformProjectRoot;
      const buildGradlePath = path.join(projectRoot, 'build.gradle');

      if (fs.existsSync(buildGradlePath)) {
        let contents = fs.readFileSync(buildGradlePath, 'utf8');

        if (!contents.includes(SUPPRESS_MARKER)) {
          contents += PATCH_BLOCK;
          fs.writeFileSync(buildGradlePath, contents);
        }
      }

      return modConfig;
    },
  ]);
};
