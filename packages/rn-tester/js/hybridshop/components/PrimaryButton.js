/**
 * @format
 * @noflow
 */

'use strict';

const React = require('react');
const {Pressable, Text, StyleSheet} = require('react-native');
const {useTheme} = require('../theme');

function PrimaryButton({label, onPress, compact}) {
  const {colors} = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [
        styles.base,
        compact ? styles.compact : null,
        {backgroundColor: colors.accent, opacity: pressed ? 0.7 : 1},
      ]}>
      <Text style={[styles.label, {color: colors.accentText}]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  compact: {paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8},
  label: {fontSize: 14, fontWeight: '600'},
});

module.exports = React.memo(PrimaryButton);
