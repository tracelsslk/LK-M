import {  createStackNavigator,createBottomTabNavigator } from 'react-navigation'
import React from 'react';
import {
  StatusBar,Image
} from 'react-native';
import ContactView from '../contact/ContactView'
import AddContactView from '../contact/AddContactView'
import FriendInfoView from '../contact/FriendInfoView'
import ChatView from '../chat/ChatView'
import RecentView from '../chat/RecentView'
import OrgView from '../contact/OrgView'
import MineView from '../mine/MineView'
import DevView from '../mine/dev/DevView'
const util = require('../util/navigatorUtil')
const style = require('../style')


const stackNavigatorConfig = {
    navigationOptions:{
        headerStyle:{
            backgroundColor:style.color.mainColor
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
            <Image style={{width:30,height:30}} source={require('../image/back-icon.png')}></Image>
        )
    }
}

const ChatTab = createStackNavigator({
    RecentView
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
            tabBarIcon: ({  focused }) =>{
                return util.getTabLogo('消息',focused,"message-outline",24 )
            }
        }
    },
    ContactTab:{
        screen:ContactTab,
        navigationOptions:{
            tabBarIcon: ({  focused }) =>{
                return util.getTabLogo('通讯录',focused,"table-of-contents" )
            },
        }
    },
    MineTab:{
        screen:MineTab,
        navigationOptions:{
            tabBarIcon: ({  focused }) =>{
                return util.getTabLogo('我',focused,"account-outline" )
            }
        }
    },

},{
    tabBarOptions:{
        showLabel:false
    },
    lazy:false,

})

const MainStack = createStackNavigator({
    MainTab:{
        screen:MainTab,
        navigationOptions:{
            header:null
        }
    },
    AddContactView,
    DevView,
    FriendInfoView,
    ChatView,
    OrgView
},stackNavigatorConfig)

export default MainStack
