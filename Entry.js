
import React, { Component } from 'react'
import {
  YellowBox,
  StyleSheet, View
} from 'react-native'
import {Root} from 'native-base'
import {isFirstTime, markSuccess} from 'react-native-update'


import LKEntry from './lk/LKEntry'
const {engine} = require('@lk/LK-C')

const packageJson = require('./package.json')

const Application = engine.getApplication()
const lkApp = Application.getCurrentApp()
if (isFirstTime) {
  markSuccess()
}

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
