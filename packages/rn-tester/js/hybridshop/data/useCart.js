/**
 * @format
 * @noflow
 */

'use strict';

const React = require('react');

function cartReducer(state, action) {
  switch (action.type) {
    case 'add': {
      const existing = state.items.find(i => i.product.id === action.product.id);
      let items;
      if (existing) {
        items = state.items.map(i =>
          i.product.id === action.product.id ? {product: i.product, qty: i.qty + 1} : i,
        );
      } else {
        items = state.items.concat([{product: action.product, qty: 1}]);
      }
      return {items, adds: state.adds + 1};
    }
    case 'remove': {
      return {
        items: state.items.filter(i => i.product.id !== action.productId),
        adds: state.adds,
      };
    }
    case 'clear':
      return {items: [], adds: state.adds};
    default:
      return state;
  }
}

function useCart() {
  const [state, dispatch] = React.useReducer(cartReducer, {items: [], adds: 0});
  const total = React.useMemo(
    () => state.items.reduce((sum, i) => sum + i.product.price * i.qty, 0),
    [state.items],
  );
  return {state, dispatch, total};
}

module.exports = {useCart};
