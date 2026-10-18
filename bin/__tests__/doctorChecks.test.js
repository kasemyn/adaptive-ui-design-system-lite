const {
  checkAndroidManifest,
  checkInfoPlist,
  checkNewArchitecture,
  checkReactNativeVersion,
} = require('../doctorChecks');

const reactNativeTemplateManifest = `
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
  <application android:name=".MainApplication">
    <activity
      android:name=".MainActivity"
      android:configChanges="keyboard|keyboardHidden|orientation|screenLayout|screenSize|smallestScreenSize|uiMode"
      android:screenOrientation="portrait"
      android:exported="true">
      <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
      </intent-filter>
    </activity>
  </application>
</manifest>`;

const iPhoneOnlyPlist = `
<plist><dict>
  <key>UIRequiresFullScreen</key>
  <true/>
  <key>UISupportedInterfaceOrientations</key>
  <array>
    <string>UIInterfaceOrientationPortrait</string>
  </array>
</dict></plist>`;

function failures(results) {
  return results.filter(result => !result.ok);
}

describe('checkAndroidManifest', () => {
  it('flags the React Native template for missing density and an orientation lock', () => {
    const problems = failures(
      checkAndroidManifest(reactNativeTemplateManifest),
    );
    expect(problems).toHaveLength(2);
    expect(problems[0].message).toContain('density');
    expect(problems[0].fix).toBe(
      'android:configChanges="keyboard|keyboardHidden|orientation|screenLayout|screenSize|smallestScreenSize|uiMode|density"',
    );
    expect(problems[1].message).toContain('portrait');
  });

  it('passes a manifest that is set up for foldables', () => {
    const fixedManifest = reactNativeTemplateManifest
      .replace('uiMode"', 'uiMode|density"')
      .replace('android:screenOrientation="portrait"', '');
    expect(failures(checkAndroidManifest(fixedManifest))).toEqual([]);
  });

  it('flags an activity that opts out of resizing', () => {
    const optedOut = reactNativeTemplateManifest.replace(
      'android:exported="true"',
      'android:exported="true" android:resizeableActivity="false"',
    );
    expect(
      failures(checkAndroidManifest(optedOut)).map(problem => problem.fix),
    ).toContain('android:resizeableActivity="true"');
  });

  it('reports a manifest without a launcher activity', () => {
    expect(failures(checkAndroidManifest('<manifest />'))).toHaveLength(1);
  });
});

describe('checkInfoPlist', () => {
  it('flags full-screen-only and, with no iPad list, offers a complete iPad block', () => {
    const problems = failures(checkInfoPlist(iPhoneOnlyPlist));
    expect(problems).toHaveLength(2);
    expect(problems[1].fix).toContain(
      '<key>UISupportedInterfaceOrientations~ipad</key>',
    );
    expect(problems[1].fix).toContain(
      '<string>UIInterfaceOrientationPortrait</string>',
    );
  });

  it('lists only the missing entries when an iPad list already exists', () => {
    const plist = `
      <key>UISupportedInterfaceOrientations~ipad</key>
      <array>
        <string>UIInterfaceOrientationPortrait</string>
        <string>UIInterfaceOrientationLandscapeLeft</string>
        <string>UIInterfaceOrientationLandscapeRight</string>
      </array>`;
    const [problem] = failures(checkInfoPlist(plist));
    expect(problem.fix).toBe(
      'Add to the existing UISupportedInterfaceOrientations~ipad array:\n<string>UIInterfaceOrientationPortraitUpsideDown</string>',
    );
  });

  it('uses the ~ipad orientation list when present', () => {
    const plist = `
      <key>UISupportedInterfaceOrientations~ipad</key>
      <array>
        <string>UIInterfaceOrientationPortrait</string>
        <string>UIInterfaceOrientationPortraitUpsideDown</string>
        <string>UIInterfaceOrientationLandscapeLeft</string>
        <string>UIInterfaceOrientationLandscapeRight</string>
      </array>`;
    expect(failures(checkInfoPlist(plist))).toEqual([]);
  });
});

describe('project checks', () => {
  it.each([
    ['0.75.4', false],
    ['0.76.0', true],
    ['0.87.1', true],
    [null, false],
  ])('react-native %p passes: %p', (version, expected) => {
    expect(checkReactNativeVersion(version).ok).toBe(expected);
  });

  it('fails when the New Architecture is switched off', () => {
    expect(checkNewArchitecture('newArchEnabled=false', '0.79.0').ok).toBe(
      false,
    );
  });

  it('accepts a missing flag from 0.82, where the New Architecture is always on', () => {
    expect(checkNewArchitecture('', '0.87.1').ok).toBe(true);
    expect(checkNewArchitecture('', '0.79.0').ok).toBe(false);
  });
});
