/**
 * Live-Fabric hybrid demo: takes over the RNTester root surface and drives
 * global.nativeFabricUIManager directly through the hybrid ring-0 reconciler
 * — the shermes-compiled typed port when HybridFabricCore's content hash
 * matches the unit baked into the binary, the interpreted real-React twin
 * otherwise (e.g. after an OTA edit). ReactFabric never runs.
 *
 * @format
 * @flow
 */

'use strict';

// Off while the HybridShop real-app trial owns the root surface
// (js/hybridshop/HybridShopApp.js); flip back to re-enable the direct
// nativeFabricUIManager takeover demo.
const TAKE_OVER = false;

// Top-level (not inside the flag): Metro constant-folds `if (false)` and
// would otherwise drop HybridFabricCore from the bundle graph entirely,
// unkeying the fabriccore ring-0 unit.
const {AppRegistry, Platform, StatusBar} = require('react-native');
require('react-native/Libraries/Components/View/ViewNativeComponent');
require('react-native/Libraries/Text/TextNativeComponent');
const ReactNativeViewConfigRegistry = require('react-native/Libraries/Renderer/shims/ReactNativeViewConfigRegistry');
const core = require('./hybrid/HybridFabricCore');

if (TAKE_OVER) {

  const g: $FlowFixMe = global;
  const hlog = (m: string) => {
    console.log(m);
    if (g.__hybridLog != null) {
      g.__hybridLog(m);
    }
  };

  const run = (appParameters: $FlowFixMe) => {
    const ui = g.nativeFabricUIManager;
    hlog('=== [HybridFabric] surface takeover ===');
    hlog(
      '[HybridFabric] core.impl=' +
        core.impl +
        ' rootTag=' +
        String(appParameters.rootTag) +
        ' fabric=' +
        String(appParameters.fabric === true) +
        ' ui=' +
        String(ui != null),
    );
    if (ui == null) {
      hlog('[HybridFabric] nativeFabricUIManager absent; aborting');
      return;
    }
    if (ui.registerEventHandler) {
      ui.registerEventHandler((target, eventType, nativeEvent) => {
        core.dispatchTouch(target, eventType, nativeEvent);
      });
    }
    // The takeover surface is edge-to-edge; RNTester's AppContainer never
    // runs, so handle the system bars here. Android's status-bar height is a
    // real constant; the gesture-nav/home-indicator heights are estimates (a
    // production integration would plumb WindowInsets through the surface).
    if (Platform.OS === 'android') {
      StatusBar.setBarStyle('dark-content');
    }
    const insetTop =
      Platform.OS === 'android' ? StatusBar.currentHeight ?? 28 : 59;
    const insetBottom = Platform.OS === 'android' ? 48 : 34;
    const env = {
      ui,
      rootTag: appParameters.rootTag,
      getViewConfig: (name: string) => ReactNativeViewConfigRegistry.get(name),
      banner: core.impl,
      insetTop,
      insetBottom,
      log: hlog,
    };
    core.start(env);
    // Measured commit loop once the surface has settled, then keep it
    // visibly alive; row presses toggle selection via dispatchTouch.
    setTimeout(() => {
      const res = core.measure(100, 1000);
      hlog('[HybridFabric] ' + res.host);
      hlog(
        '[HybridFabric] measure: ' +
          String(res.ticks) +
          ' commits, ' +
          String(res.ms) +
          ' ms (' +
          (res.ms / res.ticks).toFixed(4) +
          ' ms/commit)',
      );
      setInterval(() => core.tickOnce(), 800);
    }, 3000);
  };

  AppRegistry.registerRunnable('RNTesterApp', run);
}

// Export the core reference so Metro's dead-code elimination cannot drop the
// HybridFabricCore dependency while TAKE_OVER is false.
module.exports = {core};
