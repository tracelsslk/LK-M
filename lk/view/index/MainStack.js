import { createSwitchNavigator, createStackNavigator,createBottomTabNavigator } from 'react-navigation'
import React, { Component } from 'react';
import {
    Alert,
    AsyncStorage,
    Button,
    NativeModules,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    View,Modal,StatusBar,Image
} from 'react-native';
import PropTypes from 'prop-types'
import ContactView from '../contact/ContactView'
import AddContactView from '../contact/AddContactView'
import ChatView from '../chat/ChatView'
import MineView from '../mine/MineView'
import DevView from '../mine/dev/DevView'
const util = require('../util/navigatorUtil')


const stackNavigatorConfig = {
    navigationOptions:{
        headerStyle:{
            backgroundColor:"#5077AA"
        },
        headerTitleStyle:{
            color:"white"
        },
        headerBackTitleStyle:{
            color:"white"
        },
        headerBackground:(
            <StatusBar
                barStyle="light-content"
                backgroundColor="red"
            />
        ),
        headerBackImage:(
            <Image style={{width:30,height:30}} source={require('../../image/back-icon.png')}></Image>
        )
    }
}

const ChatTab = createStackNavigator({
    ChatView
},stackNavigatorConfig)

const ContactTab = createStackNavigator({
    ContactView,
},stackNavigatorConfig)

const MineTab = createStackNavigator({
    MineView
},stackNavigatorConfig)

const MainTab = createBottomTabNavigator({
    ChatTab:{
        screen:ChatTab,
        navigationOptions:{
            tabBarIcon: ({ tintColor, focused }) =>{
                return util.getTabLogo('消息',focused,"message-outline",24 )
            }
        }
    },
    ContactTab:{
        screen:ContactTab,
        navigationOptions:{
            tabBarIcon: ({ tintColor, focused }) =>{
                return util.getTabLogo('通讯录',focused,"table-of-contents" )
            },
        }
    },
    MineTab:{
        screen:MineTab,
        navigationOptions:{
            tabBarIcon: ({ tintColor, focused }) =>{
                return util.getTabLogo('我',focused,"account-outline" )
            }
        }
    },

},{
    tabBarOptions:{
        showLabel:false
    },
    lazy:false
})

const MainStack = createStackNavigator({
    MainTab,
    AddContactView,
    DevView
},stackNavigatorConfig)

export default MainTab
