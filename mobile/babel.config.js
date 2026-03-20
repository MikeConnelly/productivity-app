const path = require('path');

process.env.EXPO_ROUTER_APP_ROOT = path.join(__dirname, 'app');

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'],
  };
};
