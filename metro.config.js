const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Disable Watchman — VSCode terminal inherits lower process priority (nice_value > 0)
// which causes Watchman daemon to refuse starting. Node crawler is the reliable fallback.
config.resolver.useWatchman = false;

// Disable "exports" field resolution for packages that don't properly expose subpaths
// (e.g. event-target-shim used by react-native-webrtc)
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
