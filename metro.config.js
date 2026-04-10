const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Просто добавляем поддержку .cjs файлов
config.resolver.sourceExts.push('cjs');

module.exports = config;