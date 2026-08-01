/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import RNTesterApp from './RNTesterAppShared';
import {AppRegistry} from 'react-native';
import './HybridAOTDemo';

AppRegistry.registerComponent('RNTesterApp', () => RNTesterApp);

// Must run AFTER registerComponent (its registerRunnable overrides the same
// app key), hence require() rather than a hoisted import.
require('./HybridFabricDemo');
// HybridShop real-app trial: registers over 'RNTesterApp' when its flag is on.
require('./hybridshop/HybridShopApp');

module.exports = RNTesterApp;
