/**
 * @format
 * @noflow
 */

'use strict';

const React = require('react');
const {Text, View, StyleSheet} = require('react-native');
const {useTheme} = require('../theme');

function RatingStars({rating, reviews}) {
  const {colors} = useTheme();
  const full = Math.round(rating);
  let stars = '';
  for (let i = 0; i < 5; i++) {
    stars += i < full ? '★' : '☆';
  }
  return (
    <View style={styles.row}>
      <Text style={[styles.stars, {color: colors.accent}]}>{stars}</Text>
      <Text style={[styles.count, {color: colors.subtext}]}>
        {rating.toFixed(1)} ({reviews})
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {flexDirection: 'row', alignItems: 'center'},
  stars: {fontSize: 13, marginRight: 6},
  count: {fontSize: 12},
});

module.exports = React.memo(RatingStars);
