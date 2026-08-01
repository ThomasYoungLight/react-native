/**
 * @format
 * @noflow
 */

'use strict';

const React = require('react');

const palettes = {
  light: {
    bg: '#f2f4f8',
    card: '#ffffff',
    text: '#16181d',
    subtext: '#5c6470',
    accent: '#2a6df4',
    accentText: '#ffffff',
    divider: '#e3e7ee',
  },
  dark: {
    bg: '#101318',
    card: '#1c2129',
    text: '#eef1f6',
    subtext: '#98a2b3',
    accent: '#5b8cff',
    accentText: '#0b1220',
    divider: '#2a303b',
  },
};

const ThemeContext = React.createContext({
  name: 'light',
  colors: palettes.light,
  toggle: () => {},
});

function useTheme() {
  return React.useContext(ThemeContext);
}

module.exports = {ThemeContext, palettes, useTheme};
