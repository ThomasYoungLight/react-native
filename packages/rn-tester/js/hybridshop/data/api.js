/**
 * Fake product API: deterministic (seeded) catalog behind a constant
 * simulated latency so TTI comparisons are apples-to-apples.
 *
 * @format
 * @noflow
 */

'use strict';

const LATENCY_MS = 80;

const ADJECTIVES = ['Aero', 'Terra', 'Nova', 'Flux', 'Ember', 'Polar', 'Zen', 'Vivid'];
const NOUNS = ['Runner', 'Kettle', 'Lamp', 'Pack', 'Chair', 'Board', 'Flask', 'Speaker'];
const BLURBS = [
  'Built from recycled aluminium with a soft-touch finish.',
  'Weighs almost nothing, survives almost anything.',
  'A quiet upgrade to a loud world.',
  'Designed in collaboration with people who actually use it.',
];

let seed = 20260802;
function rand(n) {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed % n;
}

function makeProduct(id) {
  const name = ADJECTIVES[rand(ADJECTIVES.length)] + ' ' + NOUNS[rand(NOUNS.length)];
  return {
    id,
    name,
    price: 900 + rand(24000) / 100,
    rating: 2 + rand(31) / 10,
    reviews: 3 + rand(1200),
    stock: rand(40),
    blurb: BLURBS[rand(BLURBS.length)],
    tag: rand(3) === 0 ? 'sale' : rand(4) === 0 ? 'new' : null,
  };
}

function fetchProducts(count) {
  return new Promise(resolve => {
    setTimeout(() => {
      const items = [];
      for (let i = 0; i < count; i++) {
        items.push(makeProduct(i + 1));
      }
      resolve(items);
    }, LATENCY_MS);
  });
}

let nextRefreshId = 10000;
function fetchFreshBatch(count) {
  return new Promise(resolve => {
    setTimeout(() => {
      const items = [];
      for (let i = 0; i < count; i++) {
        items.push(makeProduct(nextRefreshId++));
      }
      resolve(items);
    }, LATENCY_MS);
  });
}

module.exports = {fetchProducts, fetchFreshBatch, LATENCY_MS};
