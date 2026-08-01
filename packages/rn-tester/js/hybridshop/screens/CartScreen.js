/**
 * Lazily required (see DetailScreen).
 *
 * @format
 * @noflow
 */

'use strict';

const React = require('react');
const {FlatList, Text, View, StyleSheet} = require('react-native');
const Header = require('../components/Header');
const PrimaryButton = require('../components/PrimaryButton');
const {useTheme} = require('../theme');

function CartRow({item, onRemove}) {
  const {colors} = useTheme();
  return (
    <View style={[styles.row, {backgroundColor: colors.card}]}>
      <View style={styles.rowBody}>
        <Text style={[styles.rowName, {color: colors.text}]} numberOfLines={1}>
          {item.product.name}
        </Text>
        <Text style={[styles.rowMeta, {color: colors.subtext}]}>
          {item.qty} × ${item.product.price.toFixed(2)}
        </Text>
      </View>
      <PrimaryButton label="Remove" onPress={() => onRemove(item.product.id)} compact />
    </View>
  );
}

function CartScreen({goBack, cart}) {
  const {colors} = useTheme();
  const remove = React.useCallback(
    productId => cart.dispatch({type: 'remove', productId}),
    [cart],
  );
  const renderItem = React.useCallback(
    ({item}) => <CartRow item={item} onRemove={remove} />,
    [remove],
  );
  return (
    <View style={[styles.root, {backgroundColor: colors.bg}]}>
      <Header title="Your cart" onBack={goBack} />
      {cart.state.items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyText, {color: colors.subtext}]}>Cart is empty.</Text>
        </View>
      ) : (
        <FlatList
          data={cart.state.items}
          renderItem={renderItem}
          keyExtractor={item => String(item.product.id)}
          contentContainerStyle={styles.list}
        />
      )}
      <View style={[styles.footer, {backgroundColor: colors.card, borderTopColor: colors.divider}]}>
        <Text style={[styles.total, {color: colors.text}]}>
          Total ${cart.total.toFixed(2)}
        </Text>
        <PrimaryButton label="Checkout" onPress={() => cart.dispatch({type: 'clear'})} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1},
  empty: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  emptyText: {fontSize: 15},
  list: {padding: 10},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  rowBody: {flex: 1, marginRight: 10},
  rowName: {fontSize: 15, fontWeight: '600'},
  rowMeta: {fontSize: 13, marginTop: 2},
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  total: {fontSize: 17, fontWeight: '800'},
});

module.exports = CartScreen;
