/**
 * Hybrid AOT Metro serializer plugin.
 *
 * Adds to a standard Metro bundle:
 *  1. Stable, content-independent module IDs (sha1 of project-relative path,
 *     truncated to 32 bits) so the native manifest baked into the app binary
 *     stays valid across OTA bundle rebuilds.
 *  2. A `__moduleHashes` table (sha256 of each module's transformed factory
 *     code) plus a `__d` wrapper that dispatches a module to a native factory
 *     from `global.__nativeModules` when the hashes match, and falls back to
 *     the bundle's JS factory when they don't (OTA-changed) or no native
 *     build exists.
 *  3. A `hybrid-manifest.json` build artifact: {id: {hash, path, code}} for
 *     every module, consumed by the registry codegen that shermes-compiles
 *     selected modules into SHUnits linked into the app binary.
 *
 * A production version would embed the hash into each __d call instead of a
 * separate table; the table keeps this prototype non-invasive.
 *
 * @format
 * @noflow
 */

'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const baseJSBundleModule = require('metro/private/DeltaBundler/Serializers/baseJSBundle');
const bundleToStringModule = require('metro/private/lib/bundleToString');
const baseJSBundle = baseJSBundleModule.default || baseJSBundleModule;
const bundleToString = bundleToStringModule.default || bundleToStringModule;
const {
  getJsOutput,
  isJsModule,
} = require('metro/private/DeltaBundler/Serializers/helpers/js');

const PROJECT_ROOT = __dirname;
const MANIFEST_OUT =
  process.env.HYBRID_MANIFEST_OUT ||
  path.join(__dirname, 'build', 'hybrid-manifest.json');

function relPath(modulePath) {
  return path.relative(PROJECT_ROOT, modulePath).split(path.sep).join('/');
}

function stableModuleId(rel) {
  const h = crypto.createHash('sha1').update(rel).digest();
  return h.readUInt32BE(0);
}

function createModuleIdFactory() {
  const byPath = new Map();
  const byId = new Map();
  return modulePath => {
    let id = byPath.get(modulePath);
    if (id != null) {
      return id;
    }
    const rel = relPath(modulePath);
    id = stableModuleId(rel);
    const clash = byId.get(id);
    if (clash != null && clash !== rel) {
      throw new Error(
        `hybrid-serializer: module id collision between "${rel}" and "${clash}"`,
      );
    }
    byId.set(id, rel);
    byPath.set(modulePath, id);
    return id;
  };
}

function contentHash(code) {
  return crypto.createHash('sha256').update(code).digest('hex');
}

function buildDispatchPrelude(hashes) {
  return (
    '(function (g) {\n' +
    "  'use strict';\n" +
    '  var hashes = ' +
    JSON.stringify(hashes) +
    ';\n' +
    '  g.__moduleHashes = hashes;\n' +
    '  var orig = g.__d;\n' +
    '  if (typeof orig !== "function") { return; }\n' +
    '  var bindings = {};\n' +
    '  g.__hybridBindings = bindings;\n' +
    '  g.__d = function (factory, id, deps) {\n' +
    '    var native = g.__nativeModules;\n' +
    '    var n = native ? native[id] : null;\n' +
    '    if (n) {\n' +
    '      if (n.hash === hashes[id]) {\n' +
    "        bindings[id] = {binding: 'native', path: n.path};\n" +
    '        return orig(n.factory, id, deps);\n' +
    '      }\n' +
    "      bindings[id] = {binding: 'shadowed-ota-changed', path: n.path};\n" +
    '    }\n' +
    '    return orig(factory, id, deps);\n' +
    '  };\n' +
    "})(typeof globalThis !== 'undefined' ? globalThis : this);"
  );
}

function customSerializer(entryPoint, preModules, graph, options) {
  const manifest = {};
  const hashes = {};
  for (const module of graph.dependencies.values()) {
    if (!isJsModule(module)) {
      continue;
    }
    const output = getJsOutput(module);
    if (!output.type.startsWith('js/module')) {
      continue;
    }
    const id = options.createModuleId(module.path);
    const hash = contentHash(output.data.code);
    hashes[id] = hash;
    manifest[id] = {
      hash,
      path: relPath(module.path),
      code: output.data.code,
    };
  }

  fs.mkdirSync(path.dirname(MANIFEST_OUT), {recursive: true});
  fs.writeFileSync(MANIFEST_OUT, JSON.stringify(manifest, null, 1));

  const bundle = baseJSBundle(entryPoint, preModules, graph, options);
  bundle.pre += '\n' + buildDispatchPrelude(hashes);
  return bundleToString(bundle).code;
}

module.exports = {createModuleIdFactory, customSerializer};
