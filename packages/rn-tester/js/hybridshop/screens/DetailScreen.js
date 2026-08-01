/**
 * Lazily required: this module (and its subtree) is NOT executed at startup —
 * the navigation handler require()s it on first open. Under profile-guided
 * ring 1 it stays ring 2 (interpreted) unless a profile run visited it.
 *
 * @format
 * @noflow
 */

'use strict';

const React = require('react');
const {Image, ScrollView, Text, View, StyleSheet} = require('react-native');
const Header = require('../components/Header');
const RatingStars = require('../components/RatingStars');
const PrimaryButton = require('../components/PrimaryButton');
const {useTheme} = require('../theme');

const thumbs = [
  require('../../assets/alpha-hotdog.png'),
  require('../../assets/bandaged.png'),
  require('../../assets/hawk.png'),
  require('../../assets/bunny.png'),
];

function Spec({label, value}) {
  const {colors} = useTheme();
  return (
    <View style={[styles.specRow, {borderBottomColor: colors.divider}]}>
      <Text style={[styles.specLabel, {color: colors.subtext}]}>{label}</Text>
      <Text style={[styles.specValue, {color: colors.text}]}>{value}</Text>
    </View>
  );
}

function DetailScreen({goBack, params, cart}) {
  const {colors} = useTheme();
  const product = params.product;
  const add = React.useCallback(
    () => cart.dispatch({type: 'add', product}),
    [cart, product],
  );
  return (
    <View style={[styles.root, {backgroundColor: colors.bg}]}>
      <Header title={product.name} onBack={goBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <Image source={thumbs[product.id % thumbs.length]} style={styles.hero} />
        <View style={[styles.card, {backgroundColor: colors.card}]}>
          <Text style={[styles.price, {color: colors.text}]}>
            ${product.price.toFixed(2)}
          </Text>
          <RatingStars rating={product.rating} reviews={product.reviews} />
          <Text style={[styles.blurb, {color: colors.subtext}]}>{product.blurb}</Text>
          <Spec label="In stock" value={String(product.stock)} />
          <Spec label="SKU" value={'HS-' + product.id} />
          <Spec label="Ships" value="2–4 days" />
          <View style={styles.buttonWrap}>
            <PrimaryButton label="Add to cart" onPress={add} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1},
  content: {padding: 14},
  hero: {width: 128, height: 128, borderRadius: 16, alignSelf: 'center', margin: 14},
  card: {borderRadius: 14, padding: 16},
  price: {fontSize: 24, fontWeight: '800', marginBottom: 6},
  blurb: {fontSize: 14, lineHeight: 20, marginVertical: 10},
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  specLabel: {fontSize: 13},
  specValue: {fontSize: 13, fontWeight: '600'},
  buttonWrap: {marginTop: 14},
});

module.exports = DetailScreen;
