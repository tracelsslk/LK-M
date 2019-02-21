
import React, { Component } from 'react'
import {
  Dimensions,
  Image,
  Keyboard,
  Modal,
  Platform, ScrollView, Text, TextInput, TouchableOpacity, View,
  Alert, RefreshControl,
  CameraRoll,
  StatusBar,
  AsyncStorage
} from 'react-native'
import RNFetchBlob from 'react-native-fetch-blob'
import Ionicons from 'react-native-vector-icons/Ionicons'
import ImageViewer from 'react-native-image-zoom-viewer'
import ImagePicker from 'react-native-image-picker'
import ImageResizer from 'react-native-image-resizer'
import {
  Toast
} from 'native-base'
import { Header } from 'react-navigation'
import AudioRecorderPlayer from 'react-native-audio-recorder-player'
import RadioForm from 'react-native-simple-radio-button'

import NetIndicator from '../common/NetIndicator'
import commonStyle from '../style/common'
import style, { iconColor } from './ChatView.style'
import TransModal from './TransModal'
import TextInputWrapper from './TextInputWrapper'
import MessageItem from './MessageItem'
import DelayIndicator from './DelayIndicator'

const { engine } = require('@lk/LK-C')
const _ = require('lodash')
const uuid = require('uuid')

const { debounceFunc, getFolderId } = require('../../../common/util/commonUtil')
const Constant = require('../state/Constant')

const Application = engine.getApplication()
const lkApp = Application.getCurrentApp()
const chatManager = engine.get('ChatManager')
const ContactManager = engine.get('ContactManager')
const personImg = require('../image/person.png')
const groupImg = require('../image/group.png')
const { runNetFunc } = require('../../util')

export default class ChatView extends Component<{}> {
    static navigationOptions = ({ navigation }) => {
      const { otherSideId, isGroup } = navigation.state.params
      let headerTitle = navigation.getParam('headerTitle')
      headerTitle = headerTitle || ''
      let result
      if (otherSideId) {
        result = {
          headerTitle,
          headerRight: (
            <TouchableOpacity
              onPress={navigation.getParam('navigateToInfo')}
              style={commonStyle.topRightIcon}
            >
              <Image source={isGroup ? groupImg : personImg} style={commonStyle.iconImg} resizeMode="contain" />
            </TouchableOpacity>
          )
        }
      }
      return result
    }

    constructor(props) {
      super(props)
      this.minHeight = 35
      const { navigation } = this.props
      const { isGroup, otherSideId } = navigation.state.params
      this.isGroupChat = isGroup
      this.originalContentHeight = Dimensions.get('window').height - Header.HEIGHT
      this.state = {
        biggerImageVisible: false,
        heightAnim: 0,
        refreshing: false,
        msgViewHeight: this.originalContentHeight,
        isInited: false,
        showVoiceRecorder: false,
        isRecording: false,
        recordTime: '',
        showMore: false,
        burnValue: {}
      }
      this.otherSideId = otherSideId
      this.text = ''
      this.folderId = getFolderId(RNFetchBlob.fs.dirs.DocumentDir)
      this.limit = Constant.MESSAGE_PER_REFRESH
      this.extra = {
        lastContentHeight: 0,
        contentHeight: 0,
        count: 0,
        isRefreshingControl: false
      }

      // keyboard fix
      this.keyBoardShowCount = 0

      const audioRecorderPlayer = new AudioRecorderPlayer()
      this.audioRecorderPlayer = audioRecorderPlayer
      // this._responder = {
      //   onResponderMove(event) {
      //     const { nativeEvent } = event
      //     const {
      //       locationX, locationY, pageX, pageY
      //     } = nativeEvent
      //   },
      //   onMoveShouldSetResponder(evt) {
      //     console.log({ evt })
      //     return false
      //   },
      //   onResponderTerminationRequest() {
      //     return true
      //   }
      // }
    }

     refreshRecord = async (limit) => {
       const user = lkApp.getCurrentUser()
       let memberInfoObj
       let headerTitle
       if (this.isGroupChat) {
         const chat = await chatManager.asyGetChat(lkApp.getCurrentUser().id, this.otherSideId)
         headerTitle = chat.name
         const memberAry = await chatManager.asyGetGroupMembers(this.otherSideId)
         // console.log({memberAry})
         memberInfoObj = memberAry.reduce((accumulator, ele) => {
           accumulator[ele.id] = ele
           return accumulator
         }, {})
         this.otherSide = {
           memberInfoObj,
           id: this.otherSideId,
           name: headerTitle
         }
       } else {
         const otherSide = await ContactManager.asyGet(user.id, this.otherSideId)
         this.otherSide = otherSide
         headerTitle = otherSide.name
       }
       const { navigation } = this.props
       navigation.setParams({
         headerTitle
       })

       const msgAry = await chatManager.asyGetMsgs(user.id, this.otherSideId, limit)
       const msgOtherSideAry = msgAry.filter(msg => msg.senderUid !== user.id)
       const { length: msgOtherSideAryLength } = msgOtherSideAry

       if (msgOtherSideAryLength) {
         this.relativeMsgId = _.last(msgOtherSideAry).id
       } else {
         this.relativeMsgId = null
       }
       const imageUrls = []
       const imageIndexer = {}
       let index = 0
       for (let i = 0; i < msgAry.length; i++) {
         const record = msgAry[i]
         if (record.type === chatManager.MESSAGE_TYPE_IMAGE) {
           const img = JSON.parse(record.content)

           img.data = this.getImageData(img)

           imageUrls.push({
             url: `file://${img.data}`,
             props: {
             }
           })
           imageIndexer[record.id] = index
           index++
         }
       }
       this.imageIndexer = imageIndexer

       const recordAry = []
       let lastShowingTime
       const msgSet = new Set()
       const { length: msgLength } = msgAry
       let opacity = 1
       const interval = 1 / msgLength
       for (const msg of msgAry) {
         const { sendTime, id } = msg
         if (!msgSet.has(id)) {
           msgSet.add(id)
           const now = new Date()
           if ((lastShowingTime && sendTime - lastShowingTime > 10 * 60 * 1000)
             || !lastShowingTime) {
             lastShowingTime = sendTime
             let timeStr = ''
             const date = new Date(lastShowingTime)
             if (now.getFullYear() === date.getFullYear()
               && now.getMonth() === date.getMonth()
               && now.getDate() === date.getDate()) {
               timeStr += '今天 '
             } else if (now.getFullYear() === date.getFullYear()) {
               timeStr += `${date.getMonth() + 1}月${date.getDate()}日 `
             }
             timeStr += `${date.getHours()}:${date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()}`
             recordAry.push(<Text style={{ marginVertical: 10, color: '#a0a0a0', fontSize: 11 }} key={lastShowingTime || uuid()}>{timeStr}</Text>)
           }
           const option = {
             msg,
             isGroupChat: this.isGroupChat,
             memberInfoObj,
             onPress: msg.type === chatManager.MESSAGE_TYPE_IMAGE
               ? () => { this.showBiggerImage(imgUri, rec.id) } : () => {},
             opacity
           }
           if (msg.senderUid !== user.id) {
             option.otherSide = await ContactManager.asyGet(user.id, msg.senderUid)
           }
           recordAry.push(<MessageItem key={id} {...option} />)
           opacity -= interval
         }
       }
       this.setState({
         recordEls: recordAry,
         refreshing: false,
         isInited: true,
         imageUrls
       })
     }

    _keyboardDidShow=(e) => {
      this.keyBoardShowCount++
      const { height } = Dimensions.get('window')
      const keyY = e.endCoordinates.screenY
      const _f = () => {
        const headerHeight = Header.HEIGHT
        const change = {
          showMore: false
        }

        if (this.extra.contentHeight + headerHeight < keyY) {
          change.msgViewHeight = keyY - headerHeight
        } else {
          change.heightAnim = height - keyY
        }

        this.setState(change)
      }
      if (Platform.OS === 'ios') {
        const { screenY: screenYStart } = e.startCoordinates
        // fix keyboard, in ios, event emits 3 times
        if (screenYStart === height || this.keyBoardShowCount === 3) {
          _f()
        }
      } else {
        _f()
      }
    }

    _keyboardDidHide=() => {
      this.setState({ heightAnim: 0, msgViewHeight: this.originalContentHeight })
    }

    msgChange= async () => {
      // todo should have scroll and message pop up animation
      const num = await chatManager.asyGetNewMsgNum(this.otherSideId)
      if (num) {
        chatManager.asyReadMsgs(this.otherSideId, num)
      }
      this.limit++
      this.refreshRecord(this.limit)
    }

    update = () => {
      this.refreshRecord(this.limit)
    }

    componentWillUnmount =() => {
      chatManager.un('msgChanged', this.msgChange)
      // todo: could be null
      const ary = ['keyboardDidShow', 'keyboardDidHide']
      ary.forEach((ele) => {
        Keyboard.removeListener(ele)
      })
    }

    componentDidMount= async () => {
      const num = await chatManager.asyGetNewMsgNum(this.otherSideId)
      if (num) {
        chatManager.asyReadMsgs(this.otherSideId, num)
      }
      chatManager.on('msgChanged', this.msgChange)
      Keyboard.addListener('keyboardDidShow', this._keyboardDidShow)
      Keyboard.addListener('keyboardDidHide', this._keyboardDidHide)

      this.refreshRecord(this.limit)
      this.props.navigation.setParams({ navigateToInfo: debounceFunc(this._navigateToInfo) })
      const burnValue = await AsyncStorage.getItem('burnValue')
      this.setState({
        burnValue: JSON.parse(burnValue)
      })
    }

    _navigateToInfo = () => {
      if (this.isGroupChat) {
        this.props.navigation.navigate('GroupInfoView', { group: this.otherSide })
      } else {
        this.props.navigation.navigate('FriendInfoView', { friend: this.otherSide })
      }
    }

    send= async () => {
      if (this.text !== '') {
        runNetFunc(() => {
          this.refs.text2.focus()
          this.refs.text.reload()
          const channel = lkApp.getLKWSChannel()
          try {
            if (this.isGroupChat) {
              channel.sendGroupText(this.otherSideId, this.text, this.relativeMsgId)
            } else {
              channel.sendText(this.otherSideId, this.text, this.relativeMsgId)
            }
            this.text = ''
          } catch (err) {
            Alert.alert(err.toString())
          }
        }, {
          errorCb: () => {
            this.refs.text.reload(this.text)
          }
        })
      }
    }

    sendImage = ({ data, width, height }) => {
      runNetFunc(() => {
        lkApp.getLKWSChannel().sendImage(this.otherSideId, data, width, height, this.relativeMsgId, this.isGroupChat).catch((err) => {
          Alert.alert(err.toString())
        })
      })
    }

    showImagePicker=() => {
      const options = {
        title: '选择图片',
        cancelButtonTitle: '取消',
        takePhotoButtonTitle: '拍照',
        chooseFromLibraryButtonTitle: '图片库',
        mediaType: 'photo',
        storageOptions: {
          skipBackup: true,
          path: 'images'
        }
      }

      ImagePicker.showImagePicker(options, (response) => {
        if (response.didCancel) {
        } else if (response.error) {
        } else if (response.customButton) {
        } else {
          const imageUri = response.uri

          const maxWidth = 1000
          const maxHeight = 1000
          ImageResizer.createResizedImage(imageUri, maxWidth, maxHeight, 'JPEG', 70, 0, null).then((res) => {
            RNFetchBlob.fs.readFile(res.path, 'base64').then((data) => {
              this.sendImage({ data, width: maxWidth, height: maxHeight })
            })
          }).catch((err) => {
            console.log(err)
          })
        }
      })
    }

    showBiggerImage= (imgUri, msgId) => {
      const biggerImageIndex = this.imageIndexer[msgId]

      this.setState({ biggerImageVisible: true, biggerImageUri: imgUri, biggerImageIndex })
    }

    getImageData = (img) => {
      const { url } = img
      const result = this.getCurrentUrl(url)

      return result
    }

    getCurrentUrl = (oldUrl) => {
      let result = oldUrl
      if (Platform.OS === 'ios') {
        result = oldUrl.replace(getFolderId(oldUrl), this.folderId)
      }
      return result
    }

    _onRefresh = () => {
      this.limit = this.limit + Constant.MESSAGE_PER_REFRESH
      if (this.limit > this.extra.maxCount) {
        Toast.show({
          text: '没有更早的消息记录',
          position: 'top'
        })
      } else {
        this.setState({
          refreshing: true
        })
        this.extra.isRefreshingControl = true
        this.refreshRecord(this.limit)
      }
    }

    onContentSizeChange=(contentWidth, contentHeight) => {
      this.extra.lastContentHeight = this.extra.msgViewHeight
      this.extra.contentHeight = contentHeight
      this.extra.count++
      const offset = Math.floor(this.extra.contentHeight - this.extra.lastContentHeight)

      const point = 1
      if (this.extra.count === point) {
        this.scrollView.scrollToEnd({ animated: false })
      } else if (this.extra.count > point) {
        if (this.extra.isRefreshingControl) {
          this.scrollView.scrollTo({ x: 0, y: offset, animated: false })
          this.extra.isRefreshingControl = false
        } else {
          this.scrollView.scrollToEnd({ animated: false })
        }
      }
    }

    closeImage = () => {
      this.setState({ biggerImageVisible: false, biggerImageUri: null })
    }

  showVoiceRecorder = () => {
    const { showVoiceRecorder } = this.state
    this.setState({
      showVoiceRecorder: !showVoiceRecorder
    })
  }

  record = () => {
    runNetFunc(async () => {
      this.setState({
        isRecording: true
      })
      const audioPath = 'lk.m4a'
      await this.audioRecorderPlayer.startRecorder(audioPath)
      this.audioRecorderPlayer.addRecordBackListener((e) => {
        const { current_position: recordTimeRaw } = e
        const time = this.audioRecorderPlayer.mmssss(Math.floor(recordTimeRaw))
        this.recordTimeRaw = recordTimeRaw
        this.setState({
          recordTime: time
        })
      })
    })
  }

  cancelRecord = async () => {
    const filePath = await this.audioRecorderPlayer.stopRecorder()

    if (filePath) {
      RNFetchBlob.fs.readFile(filePath.replace('file://', ''), 'base64').then((data) => {
        const ext = _.last(filePath.split('.'))
        lkApp.getLKWSChannel().sendAudio(this.otherSideId, data, ext, this.relativeMsgId, this.isGroupChat, this.recordTimeRaw).catch((err) => {
          Alert.alert(err.toString())
        })
      })
    }

    this.audioRecorderPlayer.removeRecordBackListener()
    this.setState({
      isRecording: false,
      recordTime: ''
    })
  }

  getIconButtonAry = option => option.map((ele) => {
    const { iconName, label, onPress } = ele
    return (
      <TouchableOpacity style={style.iconButtonWrap} key={iconName} onPress={onPress}>
        <View style={style.iconButton}>
          <Ionicons name={iconName} size={38} />
        </View>
        <Text style={{ color: iconColor }}>{label}</Text>
      </TouchableOpacity>
    )
  })

  render() {
    const size = 200
    const greyScale = 106
    const option = [{
      iconName: 'ios-camera-outline',
      label: '图片',
      onPress: this.showImagePicker
    }, {
      iconName: 'ios-flame',
      label: '阅后即焚',
      onPress: () => {
        this.refs.modal.show()
      }
    }]
    const iconButtonAry = this.getIconButtonAry(option)
    const contentView = (
      <View style={{ backgroundColor: '#f0f0f0', height: this.state.msgViewHeight }}>
        {this.state.isRecording
          ? (
            <View style={{
              position: 'absolute', justifyContent: 'center', alignItems: 'center', width: '100%', top: '25%', zIndex: 2
            }}
            >
              <View style={{
                width: size,
                height: size,
                backgroundColor: `rgba(${greyScale}, ${greyScale}, ${greyScale}, 0.9)`,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 5
              }}
              >
                <Ionicons name="ios-mic-outline" size={45} color="white" />

                <View>
                  <Text style={{ fontSize: 15, color: 'white' }}>
                    正在录音...
                  </Text>
                </View>
                <View style={{ marginTop: 10 }}>
                  <Text style={{ fontSize: 20, color: 'white' }}>
                    {this.state.recordTime}
                  </Text>
                </View>

              </View>
            </View>
          ) : null}
        <NetIndicator />
        <View style={{
          flex: 1, flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', bottom: this.state.heightAnim
        }}
        >
          <ScrollView
            ref={(ref) => { this.scrollView = ref }}
            style={{ width: '100%', backgroundColor: '#d5e0f2' }}
            refreshControl={(
              <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={this._onRefresh}
              />
)}
            onContentSizeChange={this.onContentSizeChange}
          >
            <View style={{
              width: '100%', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', marginBottom: 20
            }}
            >
              {this.state.recordEls}
            </View>
          </ScrollView>
          <View style={{
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            borderTopWidth: 1,
            borderColor: '#d0d0d0',
            overflow: 'hidden',
            paddingVertical: 5,
            marginBottom: Platform.OS === 'ios' ? 0 : 20
          }}
          >
            <TouchableOpacity
              onPress={this.showVoiceRecorder}
              style={{
                display: 'flex', alignItems: 'flex-start', justifyContent: 'center', borderWidth: 0
              }}
            >
              <View style={{
                borderRadius: 17,
                borderWidth: 1,
                width: 34,
                height: 34,
                marginHorizontal: 2,
                alignItems: 'center',
                justifyContent: 'center',
                borderColor: iconColor
              }}
              >

                <Ionicons
                  name={this.state.showVoiceRecorder ? 'ios-keypad-outline' : 'ios-mic-outline'}
                  size={25}
                  color={iconColor}
                  style={{}}
                />
              </View>

            </TouchableOpacity>
            <TextInput
              ref="text2"
              style={{
                height: 0, width: 0, backgroundColor: 'red', display: 'none'
              }}
            />
            {this.state.showVoiceRecorder ? (
              <TouchableOpacity
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderRadius: 5,
                  borderColor: '#a0a0a0',
                  padding: 10,
                  marginHorizontal: 5
                }}
                onPressIn={this.record}
                onPressOut={this.cancelRecord}
                hitSlop={{
                  top: 500, left: 0, bottom: 100, right: 0
                }}
              >
                <Text>按住说话</Text>
              </TouchableOpacity>
            ) : (
              <TextInputWrapper
                onChangeText={(v) => {
                  this.text = v ? v.trim() : ''
                }}
                onSubmitEditing={this.send}
                ref="text"
                textInputProp={{
                  placeholder: this.state.burnValue ? `本消息会在${this.state.burnValue.label}阅后即焚` : ''
                }}
              />
            )}

            <TouchableOpacity
              onPress={() => { this.setState({ showMore: !this.state.showMore }) }}
              style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
            >
              <Ionicons name="ios-add-circle-outline" size={40} style={{ marginRight: 5 }} color={iconColor} />
            </TouchableOpacity>
          </View>
          {this.state.showMore ? (
            <View style={{
              marginBottom: 20, flexDirection: 'row', justifyContent: 'space-around', width: '100%'
            }}
            >
              {iconButtonAry}
            </View>
          ) : null}
        </View>
        <Modal
          visible={this.state.biggerImageVisible}
          transparent={false}
          animationType="fade"
          onRequestClose={this.closeImage}
        >
          <StatusBar hidden />
          <ImageViewer
            imageUrls={this.state.imageUrls}
            onClick={this.closeImage}
            onSave={(url) => {
              CameraRoll.saveToCameraRoll(url)
              // todo: toast will be overlapped
              Alert.alert(
                '',
                '图片成功保存到系统相册',

                { cancelable: true }
              )
            }}
            index={this.state.biggerImageIndex}
          />
        </Modal>

        <TransModal
          title="设置阅后即焚时长"
          ref="modal"
          confirm={async () => {
            await AsyncStorage.setItem('burnValue', JSON.stringify(this.radioValue))
            this.setState({
              burnValue: this.radioValue
            })
          }
          }
        >
          <View style={{ alignItems: 'flex-start', justifyContent: 'space-around', marginLeft: 10 }}>
            <RadioForm
              radio_props={[
                {
                  label: '关闭',
                  value: {
                    label: '关闭',
                    time: 0
                  }
                },
                {
                  label: '自定义',
                  value: {
                    label: '自定义',
                    time: -1
                  }
                },
                {
                  label: '3 秒',
                  value: {
                    label: '3秒',
                    time: 3
                  }
                }
              ]}
              initial={0}
              onPress={(value) => { this.radioValue = value }}
              labelStyle={
                  { marginHorizontal: 20 }
                }
              radioStyle={{ marginVertical: 15 }}
            />
          </View>

        </TransModal>
      </View>
    )
    const loadingView = <DelayIndicator />
    return this.state.isInited ? contentView : loadingView
  }
}
