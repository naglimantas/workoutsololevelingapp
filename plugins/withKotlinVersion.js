const { withDangerousMod } = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');

module.exports = function withKotlinVersion(config) {
  return withDangerousMod(config, [
    'android',
    (modConfig) => {
      const buildGradlePath = path.join(
        modConfig.modRequest.platformProjectRoot,
        'build.gradle'
      );
      if (fs.existsSync(buildGradlePath)) {
        let contents = fs.readFileSync(buildGradlePath, 'utf8');
        contents = contents.replace(
          /kotlinVersion\s*=\s*["'][^"']*["']/g,
          'kotlinVersion = "1.9.25"'
        );
        if (!contents.includes('kotlinVersion')) {
          contents = contents.replace(
            /ext\s*\{/,
            'ext {\n        kotlinVersion = "1.9.25"'
          );
        }
        fs.writeFileSync(buildGradlePath, contents);
      }
      return modConfig;
    },
  ]);
};
