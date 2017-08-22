// @flow

import React, {Component} from 'react'
import {View, TouchableHighlight, Image} from 'react-native'
import {Text} from 'native-base'
import {Actions} from 'react-native-router-flux'
import {sprintf} from 'sprintf-js'
import strings from '../../../../../locales/default'

import UserList from './UserListConnector'

import styles from '../style'

import buyAndSellImage from '../../../../../assets/images/sidenav/buysell.png'
import logoutImage from '../../../../../assets/images/sidenav/logout.png'
import settings from '../../../../../assets/images/sidenav/settings.png'
import spendImage from '../../../../../assets/images/sidenav/spend.png'

const LOGOUT_TEXT = sprintf(strings.enUS['settings_button_logout'])
const SETTINGS_TEXT = sprintf(strings.enUS['settings_title'])

type Props ={
  logout: (username?: string) => void,
  onPressOption: () => void
}
type State = {}

export default class Main extends Component<Props, State> {
  onLogout = () => {
    this.props.logout()
  }

  render () {
    return this.props.usersView ? <UserList /> : (
      <View style={{flex: 1, justifyContent: 'flex-end'}}>
        <View style={styles.others.container}>
          <TouchableHighlight style={styles.others.iosTouchableHighlight}
            underlayColor={styles.main.iosTouchableHighlightUnderlayColor}
            onPress={this.onLogout}>
            <View style={[ styles.others.link, styles.others.borderVertical, {flex: 1} ]}>
              <View style={styles.iconImageContainer}>
                <Image style={styles.iconImage} source={logoutImage} />
              </View>
              <View style={styles.others.textContainer}>
                <Text style={styles.others.text}>
                  {LOGOUT_TEXT}
                </Text>
              </View>
            </View>
          </TouchableHighlight>
          <TouchableHighlight style={styles.others.iosTouchableHighlight}
            underlayColor={styles.main.iosTouchableHighlightUnderlayColor}
            onPress={Actions.settingsOverviewTab}>
            <View style={[ styles.others.link, styles.others.borderBottom, {flex: 1} ]}>
              <View style={styles.iconImageContainer}>
                <Image style={styles.iconImage} source={settings} />
              </View>
              <View style={styles.others.textContainer}>
                <Text style={styles.others.text}>
                  {SETTINGS_TEXT}
                </Text>
              </View>
            </View>
          </TouchableHighlight>
          <TouchableHighlight style={styles.others.iosTouchableHighlight}
            underlayColor={styles.main.iosTouchableHighlightUnderlayColor}
            onPress={this._handleOnPressRouting('buysell')}>
            <View style={[ styles.others.link, styles.others.borderVertical, {flex: 1} ]}>
              <View style={styles.iconImageContainer}>
                <Image style={styles.iconImage} source={buyAndSellImage} />
              </View>
              <View style={styles.others.textContainer}>
                <Text style={styles.others.text}>
                  Buy/Sell
                </Text>
              </View>
            </View>
          </TouchableHighlight>
          <TouchableHighlight style={styles.others.iosTouchableHighlight}
            underlayColor={styles.main.iosTouchableHighlightUnderlayColor}
            onPress={this._handleOnPressRouting('spend')}>
            <View style={[ styles.others.link, styles.others.borderVertical, {flex: 1} ]}>
              <View style={styles.iconImageContainer}>
                <Image style={styles.iconImage} source={spendImage} />
              </View>
              <View style={styles.others.textContainer}>
                <Text style={styles.others.text}>
                  Spend
                </Text>
              </View>
            </View>
          </TouchableHighlight>
        </View>
      </View>
    )
  }

  _handleOnPressRouting = (route) => () => {
    switch (route) {
    case 'settingsOverview':
      return Actions.settingsOverviewTab()
    case 'walletList':
      return Actions.walletListTab()
    case 'scan':
      return Actions.scanTab()
    case 'buysell':
      return Actions.buySellTab()
    case 'spend':
      return Actions.spendTab()
    default:
      return
    }
  }
}
