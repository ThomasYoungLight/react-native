/**
 * @format
 * @noflow
 */

'use strict';

const React = require('react');
const {FlatList, Text, View, ActivityIndicator, StyleSheet} = require('react-native');
const Header = require('../components/Header');
const ProductCard = require('../components/ProductCard');
const PrimaryButton = require('../components/PrimaryButton');
const {fetchProducts, fetchFreshBatch} = require('../data/api');
const {useTheme} = require('../theme');
const perf = require('../perf');

function FeedScreen({navigate, cart, autopilot}) {
  const {colors} = useTheme();
  const [products, setProducts] = React.useState(null);

  React.useEffect(() => {
    let alive = true;
    fetchProducts(60).then(items => {
      if (alive) {
        setProducts(items);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  // First commit that actually shows feed content = TTI.
  const hasData = products != null;
  React.useLayoutEffect(() => {
    if (hasData) {
      perf.measureFromT0('TTI(feed rendered)');
      if (autopilot != null) {
        autopilot.onFeedReady();
      }
    }
  }, [hasData, autopilot]);

  const refresh = React.useCallback(() => {
    const t0 = Date.now();
    return fetchFreshBatch(20).then(fresh => {
      setProducts(prev => fresh.concat(prev == null ? [] : prev).slice(0, 120));
      return Date.now() - t0;
    });
  }, []);

  React.useEffect(() => {
    if (autopilot != null) {
      autopilot.registerRefresh(refresh);
    }
  }, [autopilot, refresh]);

  const openProduct = React.useCallback(
    product => navigate('detail', {product}),
    [navigate],
  );
  const addToCart = React.useCallback(
    product => cart.dispatch({type: 'add', product}),
    [cart],
  );

  const renderItem = React.useCallback(
    ({item}) => <ProductCard product={item} onOpen={openProduct} onAdd={addToCart} />,
    [openProduct, addToCart],
  );
  const keyExtractor = React.useCallback(item => String(item.id), []);

  const cartCount = cart.state.items.reduce((n, i) => n + i.qty, 0);

  return (
    <View style={[styles.root, {backgroundColor: colors.bg}]}>
      <Header
        title="HybridShop"
        right={
          <PrimaryButton
            label={'Cart (' + cartCount + ')'}
            onPress={() => navigate('cart')}
            compact
          />
        }
      />
      {products == null ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.loadingText, {color: colors.subtext}]}>Loading catalog…</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.list}
          initialNumToRender={12}
        />
      )}
      <View style={styles.footerRow}>
        <PrimaryButton label="Settings" onPress={() => navigate('settings')} compact />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1},
  loading: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  loadingText: {marginTop: 10, fontSize: 14},
  list: {paddingVertical: 6},
  footerRow: {padding: 10, alignItems: 'center'},
});

module.exports = FeedScreen;
