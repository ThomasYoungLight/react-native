/**
 * @format
 * @noflow
 */

'use strict';

const React = require('react');
const {Image, Pressable, Text, View, StyleSheet} = require('react-native');
const RatingStars = require('./RatingStars');
const PrimaryButton = require('./PrimaryButton');
const {useTheme} = require('../theme');

const thumbs = [
  require('../../assets/alpha-hotdog.png'),
  require('../../assets/bandaged.png'),
  require('../../assets/hawk.png'),
  require('../../assets/bunny.png'),
];

function ProductCard({product, onOpen, onAdd}) {
  const {colors} = useTheme();
  const open = React.useCallback(() => onOpen(product), [onOpen, product]);
  const add = React.useCallback(() => onAdd(product), [onAdd, product]);
  return (
    <Pressable onPress={open} style={[styles.card, {backgroundColor: colors.card}]}>
      <Image source={thumbs[product.id % thumbs.length]} style={styles.thumb} />
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={[styles.name, {color: colors.text}]} numberOfLines={1}>
            {product.name}
          </Text>
          {product.tag != null ? (
            <Text style={[styles.tag, {backgroundColor: colors.accent, color: colors.accentText}]}>
              {product.tag}
            </Text>
          ) : null}
        </View>
        <RatingStars rating={product.rating} reviews={product.reviews} />
        <View style={styles.priceRow}>
          <Text style={[styles.price, {color: colors.text}]}>
            ${product.price.toFixed(2)}
          </Text>
          <PrimaryButton label="Add" onPress={add} compact />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    marginHorizontal: 12,
    marginVertical: 5,
    borderRadius: 12,
    padding: 10,
  },
  thumb: {width: 56, height: 56, borderRadius: 8},
  body: {flex: 1, marginLeft: 10, justifyContent: 'space-between'},
  titleRow: {flexDirection: 'row', alignItems: 'center'},
  name: {flex: 1, fontSize: 15, fontWeight: '600'},
  tag: {
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
    marginLeft: 6,
    textTransform: 'uppercase',
  },
  priceRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  price: {fontSize: 15, fontWeight: '700'},
});

module.exports = React.memo(ProductCard);
