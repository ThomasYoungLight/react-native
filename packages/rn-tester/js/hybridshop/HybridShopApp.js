/**
 * HybridShop — the real-app trial for the hybrid AOT pipeline. An ordinary
 * React Native app (normal ReactFabric rendering, NO surface takeover):
 * FlatList feed over a fake async API, hand-rolled stack navigation whose
 * non-initial screens are require()d LAZILY on first open, theme context,
 * memoized components, images.
 *
 * An auto-pilot drives a deterministic session and logs timings:
 * TTI (bundle start -> feed rendered with data), first-open time per lazy
 * screen (require + mount + layout), theme-toggle commit, refresh bursts.
 *
 * @format
 * @noflow
 */

'use strict';

const React = require('react');
const {AppRegistry, Platform, SafeAreaView, StatusBar, View, StyleSheet} =
  require('react-native');
const {ThemeContext, palettes} = require('./theme');
const {useCart} = require('./data/useCart');
const FeedScreen = require('./screens/FeedScreen');
const perf = require('./perf');

const HYBRID_SHOP = true;

// Lazy screen table: factories run on FIRST navigation, not at startup —
// under profile-guided ring 1 these stay ring 2 unless a profile run
// visited them.
const lazyScreens = {
  detail: () => require('./screens/DetailScreen'),
  cart: () => require('./screens/CartScreen'),
  settings: () => require('./screens/SettingsScreen'),
};
const loadedScreens = {};

function loadScreen(name) {
  if (loadedScreens[name] == null) {
    loadedScreens[name] = lazyScreens[name]();
  }
  return loadedScreens[name];
}

function ScreenMount({name, t0, children}) {
  React.useLayoutEffect(() => {
    if (t0 != null) {
      perf.hlog('[HybridShop] nav(' + name + '): ' + (Date.now() - t0) + ' ms (require+mount)');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return children;
}

const DEMO_PRODUCT = {
  id: 7,
  name: 'Nova Runner',
  price: 129.5,
  rating: 4.4,
  reviews: 812,
  stock: 12,
  blurb: 'Autopilot demo product.',
  tag: 'new',
};

function makeAutopilot(api) {
  let refreshFn = null;
  let started = false;
  const pilot = {
    registerRefresh(fn) {
      refreshFn = fn;
    },
    onFeedReady() {
      if (started) {
        return;
      }
      started = true;
      const step = (delay, fn) => new Promise(res => setTimeout(() => res(fn()), delay));
      step(500, () => api.navigate('detail', {product: DEMO_PRODUCT}))
        .then(() => step(500, api.goBack))
        .then(() => step(400, () => api.navigate('cart')))
        .then(() => step(500, api.goBack))
        .then(() => step(400, () => api.navigate('settings')))
        .then(() => step(500, () => {
          const t0 = Date.now();
          api.toggleTheme();
          setTimeout(
            () => perf.hlog('[HybridShop] themeToggle scheduled+committed ≤ ' + (Date.now() - t0) + ' ms'),
            0,
          );
        }))
        .then(() => step(500, api.goBack))
        .then(async () => {
          const times = [];
          for (let i = 0; i < 3; i++) {
            if (refreshFn != null) {
              times.push(await refreshFn());
            }
          }
          perf.hlog('[HybridShop] refreshBurst (fetch+prepend 20, x3): ' + times.join('/') + ' ms');
          perf.hlog('[HybridShop] autopilot done');
        });
    },
  };
  return pilot;
}

function HybridShopRoot() {
  const [themeName, setThemeName] = React.useState('light');
  const [stack, setStack] = React.useState([{name: 'feed', params: null, t0: null}]);
  const cart = useCart();

  const theme = React.useMemo(
    () => ({
      name: themeName,
      colors: palettes[themeName],
      toggle: () => setThemeName(t => (t === 'light' ? 'dark' : 'light')),
    }),
    [themeName],
  );

  const navigate = React.useCallback((name, params) => {
    const t0 = Date.now();
    loadScreen(name);
    setStack(s => s.concat([{name, params: params == null ? null : params, t0}]));
  }, []);
  const goBack = React.useCallback(() => {
    setStack(s => (s.length > 1 ? s.slice(0, -1) : s));
  }, []);

  const autopilot = React.useMemo(
    () =>
      makeAutopilot({
        navigate,
        goBack,
        toggleTheme: () => setThemeName(t => (t === 'light' ? 'dark' : 'light')),
      }),
    [navigate, goBack],
  );

  const top = stack[stack.length - 1];
  let screen;
  if (top.name === 'feed') {
    screen = <FeedScreen navigate={navigate} cart={cart} autopilot={autopilot} />;
  } else {
    const Comp = loadScreen(top.name);
    screen = (
      <ScreenMount name={top.name} t0={top.t0} key={top.name + stack.length}>
        <Comp goBack={goBack} params={top.params} cart={cart} navigate={navigate} />
      </ScreenMount>
    );
  }

  return (
    <ThemeContext.Provider value={theme}>
      <SafeAreaView style={[styles.root, {backgroundColor: theme.colors.bg}]}>
        <StatusBar
          barStyle={themeName === 'dark' ? 'light-content' : 'dark-content'}
        />
        <View style={styles.statusPad} />
        {screen}
      </SafeAreaView>
    </ThemeContext.Provider>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1},
  statusPad: {
    height: Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 0,
  },
});

if (HYBRID_SHOP) {
  AppRegistry.registerComponent('RNTesterApp', () => HybridShopRoot);
}

module.exports = HybridShopRoot;
