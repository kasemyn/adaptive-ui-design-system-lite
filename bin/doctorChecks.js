'use strict';

const REQUIRED_CONFIG_CHANGES = [
  'orientation',
  'screenSize',
  'smallestScreenSize',
  'screenLayout',
  'density',
];

const IPAD_ORIENTATIONS = [
  'UIInterfaceOrientationPortrait',
  'UIInterfaceOrientationPortraitUpsideDown',
  'UIInterfaceOrientationLandscapeLeft',
  'UIInterfaceOrientationLandscapeRight',
];

const MINIMUM_REACT_NATIVE = { major: 0, minor: 76 };

function passed(message) {
  return { ok: true, message };
}

function failed(message, fix) {
  return { ok: false, message, fix };
}

function findLauncherActivity(manifestXml) {
  const activities =
    manifestXml.match(/<activity\b[\s\S]*?<\/activity>/g) ?? [];
  return (
    activities.find(activity =>
      activity.includes('android.intent.category.LAUNCHER'),
    ) ?? null
  );
}

function readAndroidAttribute(elementXml, attributeName) {
  const match = elementXml.match(
    new RegExp(`android:${attributeName}\\s*=\\s*"([^"]*)"`),
  );
  return match ? match[1] : null;
}

function checkResizeableActivity(activityXml) {
  if (readAndroidAttribute(activityXml, 'resizeableActivity') === 'false') {
    return failed(
      'The launcher activity opts out of resizing, so split screen, desktop windowing and Fold continuity are blocked',
      'android:resizeableActivity="true"',
    );
  }
  return passed('Launcher activity is resizeable');
}

function checkConfigChanges(activityXml) {
  const declared = (readAndroidAttribute(activityXml, 'configChanges') ?? '')
    .split('|')
    .filter(Boolean);
  const missing = REQUIRED_CONFIG_CHANGES.filter(
    change => !declared.includes(change),
  );
  if (missing.length === 0) {
    return passed(
      'configChanges keeps the app alive through fold, unfold and resize',
    );
  }
  const corrected = [...declared, ...missing].join('|');
  return failed(
    `configChanges is missing ${missing.join(
      ', ',
    )}: the activity restarts (losing all state) when these change`,
    `android:configChanges="${corrected}"`,
  );
}

function checkNoOrientationLock(activityXml) {
  const lockedOrientation = readAndroidAttribute(
    activityXml,
    'screenOrientation',
  );
  if (lockedOrientation) {
    return failed(
      `The activity is locked to "${lockedOrientation}"; Android 16 ignores this on large screens anyway`,
      'Remove android:screenOrientation from the activity',
    );
  }
  return passed('No orientation lock');
}

function checkAndroidManifest(manifestXml) {
  const activityXml = findLauncherActivity(manifestXml);
  if (!activityXml) {
    return [
      failed(
        'No launcher <activity> found in the manifest',
        'Check the app module path, or pass the project directory: adaptive-ui doctor <dir>',
      ),
    ];
  }
  return [
    checkResizeableActivity(activityXml),
    checkConfigChanges(activityXml),
    checkNoOrientationLock(activityXml),
  ];
}

function readPlistArray(plistXml, key) {
  const match = plistXml.match(
    new RegExp(`<key>${key}</key>\\s*<array>([\\s\\S]*?)</array>`),
  );
  if (!match) {
    return null;
  }
  return [...match[1].matchAll(/<string>([^<]*)<\/string>/g)].map(
    stringMatch => stringMatch[1],
  );
}

function checkRequiresFullScreen(plistXml) {
  if (/<key>UIRequiresFullScreen<\/key>\s*<true\s*\/>/.test(plistXml)) {
    return failed(
      'UIRequiresFullScreen is true, which disables Split View, Slide Over and Stage Manager on iPad',
      '<key>UIRequiresFullScreen</key>\n<false/>',
    );
  }
  return passed(
    'iPad multitasking is allowed (UIRequiresFullScreen is not true)',
  );
}

function ipadOrientationsBlock() {
  return [
    '<key>UISupportedInterfaceOrientations~ipad</key>',
    '<array>',
    ...IPAD_ORIENTATIONS.map(
      orientation => `  <string>${orientation}</string>`,
    ),
    '</array>',
  ].join('\n');
}

function checkIpadOrientations(plistXml) {
  const ipadSpecificOrientations = readPlistArray(
    plistXml,
    'UISupportedInterfaceOrientations~ipad',
  );
  const orientations =
    ipadSpecificOrientations ??
    readPlistArray(plistXml, 'UISupportedInterfaceOrientations') ??
    [];
  const missing = IPAD_ORIENTATIONS.filter(
    orientation => !orientations.includes(orientation),
  );
  if (missing.length === 0) {
    return passed('All four iPad orientations are supported');
  }
  const message = `iPad is missing orientations ${missing.join(
    ', ',
  )}; multitasking needs all four`;
  if (!ipadSpecificOrientations) {
    return failed(
      message,
      `Add an iPad-specific list (phones keep their current orientations):\n${ipadOrientationsBlock()}`,
    );
  }
  return failed(
    message,
    `Add to the existing UISupportedInterfaceOrientations~ipad array:\n${missing
      .map(orientation => `<string>${orientation}</string>`)
      .join('\n')}`,
  );
}

function checkInfoPlist(plistXml) {
  return [checkRequiresFullScreen(plistXml), checkIpadOrientations(plistXml)];
}

function parseVersion(version) {
  const [major = 0, minor = 0] = version
    .split('.')
    .map(part => Number.parseInt(part, 10));
  return { major, minor };
}

function isAtLeastMinimumReactNative(version) {
  const { major, minor } = parseVersion(version);
  return (
    major > MINIMUM_REACT_NATIVE.major ||
    (major === MINIMUM_REACT_NATIVE.major &&
      minor >= MINIMUM_REACT_NATIVE.minor)
  );
}

function checkReactNativeVersion(installedVersion) {
  if (!installedVersion) {
    return failed(
      'react-native is not installed in this project',
      'Run the doctor from the app root, or pass it: adaptive-ui doctor <dir>',
    );
  }
  if (!isAtLeastMinimumReactNative(installedVersion)) {
    return failed(
      `react-native ${installedVersion} is older than 0.76`,
      'Upgrade to React Native 0.76 or newer (New Architecture)',
    );
  }
  return passed(`react-native ${installedVersion} (0.76+ required)`);
}

function checkNewArchitecture(gradlePropertiesText, installedVersion) {
  const { minor } = parseVersion(installedVersion ?? '0.0');
  const setting = (gradlePropertiesText ?? '').match(
    /^\s*newArchEnabled\s*=\s*(\w+)/m,
  );
  if (setting && setting[1] !== 'true') {
    return failed(
      'The New Architecture is disabled; the fold module is a TurboModule and needs it',
      'newArchEnabled=true  (android/gradle.properties)',
    );
  }
  if (!setting && minor < 82) {
    return failed(
      'newArchEnabled is not set in android/gradle.properties',
      'newArchEnabled=true',
    );
  }
  return passed('New Architecture is enabled');
}

module.exports = {
  checkAndroidManifest,
  checkInfoPlist,
  checkNewArchitecture,
  checkReactNativeVersion,
};
