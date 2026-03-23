const { withAppBuildGradle } = require('@expo/config-plugins');

module.exports = function withFixBundleCompression(config) {
  return withAppBuildGradle(config, (config) => {
    config.modResults.contents = config.modResults.contents.replace(
      /\s*enableBundleCompression\s*=.*\n/,
      '\n'
    );
    return config;
  });
};
