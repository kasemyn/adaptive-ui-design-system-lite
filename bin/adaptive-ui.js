#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const {
  checkAndroidManifest,
  checkInfoPlist,
  checkNewArchitecture,
  checkReactNativeVersion,
} = require('./doctorChecks');

const ANDROID_MANIFEST_PATH = 'android/app/src/main/AndroidManifest.xml';
const GRADLE_PROPERTIES_PATH = 'android/gradle.properties';

function readTextIfPresent(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : null;
}

function findInfoPlist(projectDir) {
  const iosDir = path.join(projectDir, 'ios');
  if (!fs.existsSync(iosDir)) {
    return null;
  }
  const appTargetDir = fs
    .readdirSync(iosDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => path.join(iosDir, entry.name))
    .find(
      dir =>
        fs.existsSync(path.join(dir, 'Info.plist')) &&
        !/(Tests|Pods|build)$/.test(dir),
    );
  return appTargetDir ? path.join(appTargetDir, 'Info.plist') : null;
}

function readInstalledReactNativeVersion(projectDir) {
  try {
    const packageJsonPath = require.resolve('react-native/package.json', {
      paths: [projectDir],
    });
    return JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')).version;
  } catch {
    return null;
  }
}

function printSection(title, results) {
  console.log(`\n${title}`);
  results.forEach(result => {
    console.log(`  ${result.ok ? '✔' : '✖'} ${result.message}`);
    if (!result.ok && result.fix) {
      result.fix.split('\n').forEach(line => console.log(`      → ${line}`));
    }
  });
}

function runDoctor(projectDir) {
  console.log(`@fc/adaptive-ui doctor — ${projectDir}`);
  const sections = [];

  const reactNativeVersion = readInstalledReactNativeVersion(projectDir);
  sections.push([
    'Project',
    [
      checkReactNativeVersion(reactNativeVersion),
      checkNewArchitecture(
        readTextIfPresent(path.join(projectDir, GRADLE_PROPERTIES_PATH)),
        reactNativeVersion,
      ),
    ],
  ]);

  const manifestPath = path.join(projectDir, ANDROID_MANIFEST_PATH);
  const manifestXml = readTextIfPresent(manifestPath);
  if (manifestXml) {
    sections.push([
      `Android (${ANDROID_MANIFEST_PATH})`,
      checkAndroidManifest(manifestXml),
    ]);
  }

  const infoPlistPath = findInfoPlist(projectDir);
  if (infoPlistPath) {
    sections.push([
      `iOS (${path.relative(projectDir, infoPlistPath)})`,
      checkInfoPlist(fs.readFileSync(infoPlistPath, 'utf8')),
    ]);
  }

  sections.forEach(([title, results]) => printSection(title, results));

  const problemCount = sections
    .flatMap(([, results]) => results)
    .filter(result => !result.ok).length;
  console.log(
    problemCount === 0
      ? '\nAll checks passed.'
      : `\n${problemCount} problem${
          problemCount === 1 ? '' : 's'
        } found. Nothing was changed — apply the fixes above.`,
  );
  return problemCount === 0 ? 0 : 1;
}

function printUsage() {
  console.log('Usage: adaptive-ui doctor [projectDir]');
  console.log(
    'Checks native configuration needed for foldables, tablets and desktop windowing. Never edits files.',
  );
}

const [command, projectDirArgument] = process.argv.slice(2);
if (command === 'doctor') {
  process.exitCode = runDoctor(
    path.resolve(projectDirArgument ?? process.cwd()),
  );
} else {
  printUsage();
  process.exitCode = command ? 1 : 0;
}
