/**
 * Lazily required (see DetailScreen).
 *
 * @format
 * @noflow
 */

'use strict';

const React = require('react');
const {Switch, Text, View, StyleSheet} = require('react-native');
const Header = require('../components/Header');
const {useTheme} = require('../theme');

function SettingRow({label, children}) {
  const {colors} = useTheme();
  return (
    <View style={[styles.row, {backgroundColor: colors.card}]}>
      <Text style={[styles.label, {color: colors.text}]}>{label}</Text>
      {children}
    </View>
  );
}

function SettingsScreen({goBack}) {
  const theme = useTheme();
  const {colors} = theme;
  const [notify, setNotify] = React.useState(true);
  return (
    <View style={[styles.root, {backgroundColor: colors.bg}]}>
      <Header title="Settings" onBack={goBack} />
      <View style={styles.content}>
        <SettingRow label="Dark theme">
          <Switch
            value={theme.name === 'dark'}
            onValueChange={theme.toggle}
            testID="theme-switch"
          />
        </SettingRow>
        <SettingRow label="Order notifications">
          <Switch value={notify} onValueChange={setNotify} />
        </SettingRow>
        <Text style={[styles.footnote, {color: colors.subtext}]}>
          HybridShop trial build — module dispatch is per-content-hash; OTA-changed
          modules fall back to the interpreter individually.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1},
  content: {padding: 12},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  label: {fontSize: 15, fontWeight: '600'},
  footnote: {fontSize: 12, lineHeight: 17, marginTop: 14, textAlign: 'center'},
});

module.exports = SettingsScreen;
