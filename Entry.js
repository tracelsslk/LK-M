
import React, { Component } from 'react'
import {
  YellowBox,
  StyleSheet, View
} from 'react-native'
import {Root} from 'native-base'
import {isFirstTime, markSuccess} from 'react-native-update'

import DataSource from './lk/store/RNSqlite'
import LKEntry from './lk/LKEntry'
const {engine} = require('@lk/LK-C')

const packageJson = require('./package.json')
const {dropExtraTable} = require('./lk/util')

let Application = engine.getApplication()
const lkApp = Application.getCurrentApp()
lkApp.on('dbReady', () => {
  if (isFirstTime) {
    markSuccess()
    if (packageJson.version === '0.0.11') {
      dropExtraTable()
    }
  }
})
lkApp.start(DataSource, Application.PLATFORM_RN)

YellowBox.ignoreWarnings(['Warning: isMounted(...) is deprecated', 'Module RCTImageLoader', 'Class RCTC'])

export default class Entry extends Component<{}> {
  render () {
    return (
      <Root>
        <View style={styles.container}>
          <LKEntry></LKEntry>
        </View>
      </Root>

    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5
  }
})
