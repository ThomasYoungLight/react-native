/**
 * @format
 * @noflow
 */

'use strict';

const React = require('react');
const {Pressable, Text, View, StyleSheet} = require('react-native');
const {useTheme} = require('../theme');

function Header({title, onBack, right}) {
  const {colors} = useTheme();
  return (
    <View style={[styles.bar, {backgroundColor: colors.card, borderBottomColor: colors.divider}]}>
      {onBack != null ? (
        <Pressable onPress={onBack} style={styles.back} testID="header-back">
          <Text style={[styles.backText, {color: colors.accent}]}>‹ Back</Text>
        </Pressable>
      ) : (
        <View style={styles.back} />
      )}
      <Text style={[styles.title, {color: colors.text}]} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  back: {width: 70},
  backText: {fontSize: 15, fontWeight: '600'},
  title: {flex: 1, fontSize: 17, fontWeight: '700', textAlign: 'center'},
  right: {width: 70, alignItems: 'flex-end'},
});

module.exports = React.memo(Header);
