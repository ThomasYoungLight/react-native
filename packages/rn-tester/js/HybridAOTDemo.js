/**
 * Hybrid AOT prototype demo, Metro-plugin edition. The modules below are
 * pulled in with ordinary require(); the hybrid-serializer's __d wrapper
 * decides per module — by content hash — whether the bundle's JS factory or
 * the native SHUnit factory baked into the app binary is used.
 *
 * @format
 * @flow strict-local
 */

'use strict';

const core = require('./hybrid/HybridReactCore');
const util = require('./hybrid/HybridUtil');

function runDemo() {
  /* eslint-disable no-console */
  const g: $FlowFixMe = global;
  const hlog = (m: string) => {
    console.log(m);
    if (g.__hybridLog != null) {
      g.__hybridLog(m);
    }
  };
  hlog('=== [HybridAOT] demo start (Metro plugin) ===');
  hlog(
    '[HybridAOT] __nativeModules: ' +
      (g.__nativeModules
        ? Object.keys(g.__nativeModules).length + ' modules registered'
        : 'ABSENT'),
  );
  const bindings = g.__hybridBindings || {};
  const ids = Object.keys(bindings);
  hlog(
    '[HybridAOT] dispatch decisions: ' +
      (ids.length === 0
        ? '(none)'
        : ids
            .map(id => id + '=' + bindings[id].binding + ' (' + bindings[id].path + ')')
            .join('; ')),
  );

  hlog(
    '[HybridAOT] util.tag()=' +
      util.tag() +
      ' checksum(1e6)=' +
      util.checksum(1000000),
  );
  const u0 = Date.now();
  util.checksum(20000000);
  const u1 = Date.now();
  hlog('[HybridAOT] util.checksum(2e7): ' + (u1 - u0) + ' ms');

  hlog('[HybridAOT] core.impl=' + core.impl);
  const res = core.run();
  hlog('[HybridAOT] ring0=' + res.label);
  hlog('[HybridAOT] ' + res.host);
  hlog(
    '[HybridAOT] ring0 run: ' +
      res.ticks +
      ' interactions, ' +
      res.posts +
      ' posts, ' +
      res.ms +
      ' ms (' +
      (res.ms / res.ticks).toFixed(4) +
      ' ms/interaction)',
  );
  hlog('=== [HybridAOT] demo end ===');
}

setTimeout(runDemo, 5000);

module.exports = {};
