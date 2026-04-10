const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Убираем использование toReversed()
// Просто добавляем нужные расширения
config.resolver.sourceExts.push('cjs');

module.exports = config;