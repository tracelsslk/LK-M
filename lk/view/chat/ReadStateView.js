import React, {Component} from 'react'
import {
  ScrollView, Text,
  View
} from 'react-native'

const {engine} = require('@lk/LK-C')

const chatManager = engine.ChatManager
const {getAvatarSource, getIconNameByState} = require('../../util')

const Application = engine.Application
const lkApp = Application.getCurrentApp()
const common = require('@external/common')

const {List} = common

export default class ReadStateView extends Component<{}> {
  constructor (props) {
    super(props)
    this.state = {}
    this.user = lkApp.getCurrentUser()
    const {msgId} = this.props.navigation.state.params
    this.msgId = msgId
  }

  componentDidMount () {
    this.asyncRender()
    chatManager.on('msgStateChange', this.msgStateChangeListener)
  }

  msgStateChangeListener = ({param}) => {
    const {msgId} = param
    if (msgId === this.msgId) {
      this.asyncRender()
    }
  }

  asyncRender = async () => {
    const readStateAry = await chatManager.getAllReadState({
      msgId: this.msgId
    })
    const dataAry = []
    for (const key in readStateAry) {
      const value = readStateAry[key]
      const {contactId, name, pic} = value
      const state = value.state === null ? chatManager.MESSAGE_STATE_SERVER_RECEIVE : value.state

      const obj = {
        image: getAvatarSource(pic),
        key: contactId,
        title: name,
        rightContent: <View><Text>{getIconNameByState({
          state,
          showDetail: false
        })}</Text></View>
      }
      dataAry.push(obj)
      const content = <View style={{marginVertical: 20}}>
        <List data={dataAry}></List>
      </View>
      this.setState({
        content
      })
    }
  }

  componentWillUnmount () {
    chatManager.un('msgStateChange', this.msgStateChangeListener)
  }

  render () {
    return (
      <ScrollView>
        <View>
          {this.state.content}
        </View>
      </ScrollView>
    )
  }
}

ReadStateView.defaultProps = {}

ReadStateView.propTypes = {}
