import React, {Component} from 'react'
import {
  Text,
  View
} from 'react-native'
import PropTypes from 'prop-types'
import {Badge} from 'native-base'
const LKChatProvider = require('../../logic/provider/LKChatProvider')
const chatManager = require('../../core/ChatManager')
const lkApp = require('../../LKApplication').getCurrentApp()

export default class MsgBadge extends Component<{}> {
  constructor (props) {
    super(props)
    this.state = {
      badge: null
    }
    this.user = lkApp.getCurrentUser()
  }

  async componentDidMount () {
    let num = await LKChatProvider.asyGetAllMsgNotReadNum(this.user.id)
    this.updateBadge(num)
    chatManager.on('msgBadgeChanged', this.updateBadge)
  }

  updateBadge = (num) => {
    // console.log({updateNum:num})
    if (num) {
      if (num < 10) {
        num = ` ${num} `
      }
      this.setState({
        badge: num
      })
    } else {
      this.setState({
        badge: null
      })
    }
  }
  componentWillUnmount () {
    chatManager.un('msgBadgeChanged', this.updateBadge)
  }

  render () {
    const scale = 0.65

    return (
      this.state.badge
        ? <Badge danger style={{position: 'absolute', top: -12, right: -17, transform: [{scaleX: scale}, {scaleY: scale}]}}>
          <Text style={{color: '#fff'}}>{this.state.badge}</Text>
        </Badge>
        : null
    )
  }
}

MsgBadge.defaultProps = {}

MsgBadge.propTypes = {}