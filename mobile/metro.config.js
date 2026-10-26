// Learn more https://docs.expo.dev/guides/customizing-metro
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// The app shares the price fetching, the cheapest-time maths and the appliance figures
// with the website (../src), so the two always agree.
config.watchFolders = [path.resolve(__dirname, '../src')];
// Those files resolve their Babel helpers from this project's node_modules.
config.resolver.nodeModulesPaths = [path.resolve(__dirname, 'node_modules')];

module.exports = config;
