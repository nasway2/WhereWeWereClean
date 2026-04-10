const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Эти настройки критически важны для Firebase Auth
config.resolver.unstable_enablePackageExports = false;
config.resolver.sourceExts.push('cjs');

module.exports = config;