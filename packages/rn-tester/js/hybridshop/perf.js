/**
 * Timing marks for the HybridShop trial. TTI anchors on global.__hybridT0
 * (stamped by the dispatch prelude at bundle-evaluation start).
 *
 * @format
 * @noflow
 */

'use strict';

const g = global;

const marks = {};

function hlog(m) {
  console.log(m);
  if (g.__hybridLog != null) {
    g.__hybridLog(m);
  }
}

function mark(name) {
  if (marks[name] == null) {
    marks[name] = Date.now();
  }
}

function measureFromT0(name) {
  if (g.__hybridT0 != null && marks[name] == null) {
    marks[name] = Date.now();
    hlog('[HybridShop] ' + name + ': ' + (marks[name] - g.__hybridT0) + ' ms from bundle start');
  }
}

module.exports = {hlog, mark, marks, measureFromT0};
