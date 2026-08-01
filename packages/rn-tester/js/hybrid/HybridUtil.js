/**
 * Ring-1 demo module: an ordinary product module. The registry codegen
 * shermes-compiles this module's transformed factory verbatim from the
 * hybrid-manifest, so the native and bundle implementations are the same
 * source keyed by the same content hash.
 *
 * @format
 * @flow strict
 */

'use strict';

function add(a: number, b: number): number {
  return a + b;
}

function tag(): string {
  return 'util-v1';
}

function checksum(n: number): number {
  let acc = 0;
  for (let i = 0; i < n; i++) {
    acc = (acc + ((i * 2654435761) % 97)) | 0;
  }
  return acc;
}

module.exports = {add, tag, checksum};
