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

const TAKE_OVER = true;

if (TAKE_OVER) {
  const {AppRegistry} = require('react-native');
  // Ensure the real view configs are registered before we resolve them.
  require('react-native/Libraries/Components/View/ViewNativeComponent');
  require('react-native/Libraries/Text/TextNativeComponent');
  const ReactNativeViewConfigRegistry = require('react-native/Libraries/Renderer/shims/ReactNativeViewConfigRegistry');
  const core = require('./hybrid/HybridFabricCore');

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
    const env = {
      ui,
      rootTag: appParameters.rootTag,
      getViewConfig: (name: string) => ReactNativeViewConfigRegistry.get(name),
      banner: core.impl,
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

module.exports = {};
