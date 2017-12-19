// @flow

import type {
  AbcContext,
  AbcContextCallbacks,
  AbcCorePlugin,
  AbcCurrencyPlugin,
  AbcContextOptions
} from 'airbitz-core-types'
import SplashScreen from 'react-native-smart-splash-screen'
import { selectLocale } from '../locales/strings.js'

import HockeyApp from 'react-native-hockeyapp'
import React, {Component} from 'react'
import {Keyboard, Platform, StatusBar, Image, TouchableWithoutFeedback} from 'react-native'
import {connect} from 'react-redux'
import ControlPanel from './UI/components/ControlPanel/ControlPanelConnector'
import THEME from '../theme/variables/airbitz'

import {
  Scene,
  Router,
  Actions,
  Overlay,
  Tabs,
  Modal,
  Drawer,
  Stack
} from 'react-native-router-flux'
import {StyleProvider} from 'native-base'
import {MenuContext} from 'react-native-menu'
import getTheme from '../theme/components'
import platform from '../theme/variables/platform'
import Locale from 'react-native-locale'
import * as Constants from '../constants/indexConstants'
import LoginConnector from './UI/scenes/Login/LoginConnector'
import EdgeLoginSceneConnector from '../connectors/scene/EdgeLoginSceneConnector'
import ChangePasswordConnector from './UI/scenes/ChangePinPassword/ChangePasswordConnector.ui'
import ChangePinConnector from './UI/scenes/ChangePinPassword/ChangePinConnector.ui'
import PasswordRecoveryConnector from './UI/scenes/PasswordRecovery/PasswordRecoveryConnector.ui'
import TransactionListConnector from './UI/scenes/TransactionList/TransactionListConnector'
import HelpButton from './UI/components/Header/Component/HelpButton.ui'
import BackButton from './UI/components/Header/Component/BackButton.ui'
import ExchangeDropMenu from '../connectors/components/HeaderMenuExchangeConnector'

import TransactionDetails from './UI/scenes/TransactionDetails/TransactionDetailsConnector.js'
import Request from './UI/scenes/Request/index'
import SendConfirmation from './UI/scenes/SendConfirmation/index'
import Scan from './UI/scenes/Scan/ScanConnector'
import ExchangeConnector from '../connectors/scene/CryptoExchangeSceneConnector'
import WalletList from './UI/scenes/WalletList/WalletListConnector'
import CreateWallet from './UI/scenes/CreateWallet/createWalletConnector'
import ManageTokens from './UI/scenes/ManageTokens'
import AddToken from './UI/scenes/AddToken'
import SettingsOverview from './UI/scenes/Settings/SettingsOverviewConnector'
import CurrencySettings from './UI/scenes/Settings/CurrencySettingsConnector'
import DefaultFiatSettingConnector from './UI/scenes/Settings/DefaultFiatSettingConnector'
import SendConfirmationOptions from './UI/scenes/SendConfirmation/SendConfirmationOptionsConnector.js'
import ChangeMiningFeeSendConfirmation from './UI/scenes/ChangeMiningFee/ChangeMiningFeeSendConfirmationConnector.ui'
import ChangeMiningFeeExchange from './UI/scenes/ChangeMiningFee/ChangeMiningFeeExchangeConnector.ui'

// $FlowFixMe
import CardStackStyleInterpolator from 'react-navigation/src/views/CardStack/CardStackStyleInterpolator'
import HelpModal from './UI/components/HelpModal'
import ErrorAlert from './UI/components/ErrorAlert/ErrorAlertConnector'
import TransactionAlert from './UI/components/TransactionAlert/TransactionAlertConnector'
import MenuIcon from '../assets/images/MenuButton/menu.png'
import Header from './UI/components/Header/Header.ui'
import walletIcon from '../assets/images/tabbar/wallets.png'
import walletIconSelected from '../assets/images/tabbar/wallets_selected.png'
import receiveIcon from '../assets/images/tabbar/receive.png'
import receiveIconSelected from '../assets/images/tabbar/receive_selected.png'
import scanIcon from '../assets/images/tabbar/scan.png'
import scanIconSelected from '../assets/images/tabbar/scan_selected.png'
import exchangeIcon from '../assets/images/tabbar/exchange.png'
import exchangeIconSelected from '../assets/images/tabbar/exchange_selected.png'
import AutoLogout from './UI/components/AutoLogout/AutoLogoutConnector'

import {styles as stylesRaw} from './style.js'

import * as CONTEXT_API from './Core/Context/api'

import {makeFakeContexts, makeReactNativeContext} from 'airbitz-core-react-native'
import {coinbasePlugin, shapeshiftPlugin} from 'edge-exchange-plugins'
import {
  BitcoinCurrencyPluginFactory,
  BitcoincashCurrencyPluginFactory,
  LitecoinCurrencyPluginFactory
  // DashCurrencyPluginFactory
} from 'edge-currency-bitcoin'
import {EthereumCurrencyPluginFactory} from 'edge-currency-ethereum'

const pluginFactories: Array<AbcCorePlugin> = [
  coinbasePlugin,
  shapeshiftPlugin
]
pluginFactories.push(EthereumCurrencyPluginFactory)
pluginFactories.push(BitcoinCurrencyPluginFactory)
pluginFactories.push(BitcoincashCurrencyPluginFactory)
pluginFactories.push(LitecoinCurrencyPluginFactory)
// pluginFactories.push(DashCurrencyPluginFactory)

const localeInfo = Locale.constants() // should likely be moved to login system and inserted into Redux

import ENV from '../../env.json'

const {AIRBITZ_API_KEY, SHAPESHIFT_API_KEY} = ENV
const HOCKEY_APP_ID = Platform.select(ENV.HOCKEY_APP_ID)

const RouterWithRedux = connect()(Router)

StatusBar.setBarStyle('light-content', true)

const tabBarIconFiles: {[tabName: string]: string} = {}
tabBarIconFiles[Constants.WALLET_LIST] = walletIcon
tabBarIconFiles[Constants.REQUEST] = receiveIcon
tabBarIconFiles[Constants.SCAN] = scanIcon
tabBarIconFiles[Constants.TRANSACTION_LIST] = exchangeIcon
tabBarIconFiles[Constants.EXCHANGE] = exchangeIcon

const tabBarIconFilesSelected: {[tabName: string]: string} = {}
tabBarIconFilesSelected[Constants.WALLET_LIST] = walletIconSelected
tabBarIconFilesSelected[Constants.REQUEST] = receiveIconSelected
tabBarIconFilesSelected[Constants.SCAN] = scanIconSelected
tabBarIconFilesSelected[Constants.TRANSACTION_LIST] = exchangeIconSelected
tabBarIconFilesSelected[Constants.EXCHANGE] = exchangeIconSelected

type Props = {
  username?: string,
  addExchangeTimer: (number) => void,
  addCurrencyPlugin: (AbcCurrencyPlugin) => void,
  setKeyboardHeight: (number) => void,
  addContext: (AbcContext) => void,
  addUsernames: (Array<string>) => void,
  setLocaleInfo: (any) => void,
  setDeviceDimensions: (any) => void,
  dispatchEnableScan: () => void,
  dispatchDisableScan: () => void,
  contextCallbacks: AbcContextCallbacks
}
type State = {
  context: ?AbcContext,
}
export default class Main extends Component<Props, State> {
  keyboardDidShowListener: any
  keyboardDidHideListener: any

  constructor (props: Props) {
    super(props)

    this.state = {
      context: undefined,
    }
  }

  componentWillMount () {
    HockeyApp.configure(HOCKEY_APP_ID, true)
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow)
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide)
  }

  componentWillUnmount () {
    this.keyboardDidShowListener.remove()
    this.keyboardDidHideListener.remove()
  }

  componentDidMount () {
    HockeyApp.start()
    HockeyApp.checkForUpdate() // optional
    makeCoreContext(this.props.contextCallbacks)
    .then((context) => {
      // Put the context into Redux:
      this.props.addContext(context)

      CONTEXT_API.listUsernames(context)
      .then((usernames) => {
        this.props.addUsernames(usernames)
      })
      this.props.setLocaleInfo(localeInfo)
      selectLocale('enUS')
      SplashScreen.close({
        animationType: SplashScreen.animationType.fade,
        duration: 850,
        delay: 500,
      })
    })
  }

  render () {
    return (
      <StyleProvider style={getTheme(platform)}>
        <MenuContext style={{flex: 1}}>
          <RouterWithRedux backAndroidHandler={this.handleBack}>
            <Overlay>
              <Modal hideNavBar transitionConfig={() => ({screenInterpolator: CardStackStyleInterpolator.forFadeFromBottomAndroid})}>
                {/*<Lightbox>*/}
                <Stack hideNavBar key='root' navigationBarStyle={{backgroundColor: THEME.COLORS.TRANSPARENT}} backButtonTintColor='white' titleStyle={{color: THEME.COLORS.WHITE, alignSelf: 'center'}}>
                  <Scene key={Constants.LOGIN} component={LoginConnector} title='login'  initial username={this.props.username} />
                  <Scene key={Constants.TRANSACTION_DETAILS} navTransparent={true} component={TransactionDetails} back clone title='Transaction Details'  />
                  <Drawer hideNavBar key='edge' contentComponent={ControlPanel} hideDrawerButton={true} drawerPosition='right'>
                    {/*
                     Wrapper Scene needed to fix a bug where the tabs would
                     reload as a modal ontop of itself
                     */}
                    <Scene hideNavBar>
                      {/*<Gradient>*/}
                      <Tabs key='edge' swipeEnabled={true} navTransparent={true} tabBarPosition={'bottom'} showLabel={true}>
                        <Stack key={Constants.WALLET_LIST} navigationBarStyle={{backgroundColor: THEME.COLORS.PRIMARY}} title='Wallets' icon={this.icon(Constants.WALLET_LIST)} activeTintColor={'transparent'} tabBarLabel='Wallets'>
                          <Scene key='walletList_notused' component={WalletList} navTransparent={true} title='Wallets' renderLeftButton={() => <HelpButton/>} renderRightButton={() => <TouchableWithoutFeedback onPress={() => Actions.drawerOpen()}><Image source={MenuIcon}/></TouchableWithoutFeedback>} />
                          <Scene key={Constants.CREATE_WALLET} back renderBackButton={this.renderWalletListBackButton} component={CreateWallet} tintColor={stylesRaw.backButtonColor} title='Create Wallet' navTransparent={true}  />
                          <Scene key={Constants.TRANSACTION_LIST} back renderBackButton={this.renderWalletListBackButton} tintColor={stylesRaw.backButtonColor} navTransparent={true} icon={this.icon(Constants.TRANSACTION_LIST)} renderTitle={this.renderWalletListNavBar} component={TransactionListConnector} renderRightButton={() => <TouchableWithoutFeedback onPress={() => Actions.drawerOpen()}><Image source={MenuIcon}/></TouchableWithoutFeedback>} tabBarLabel='Transactions' title='Transactions'  />
                        </Stack>
                        <Scene key={Constants.REQUEST} renderTitle={this.renderWalletListNavBar} navTransparent={true} icon={this.icon(Constants.REQUEST)} component={Request} tabBarLabel='Request' title='Request' renderLeftButton={() => <HelpButton/>} renderRightButton={() => <TouchableWithoutFeedback onPress={() => Actions.drawerOpen()}><Image source={MenuIcon}/></TouchableWithoutFeedback>}  />
                        <Stack key={Constants.SCAN} title='Send' navigationBarStyle={{backgroundColor: THEME.COLORS.PRIMARY}} icon={this.icon(Constants.SCAN)} tabBarLabel='Send' >
                          <Scene key='scan_notused' renderTitle={this.renderWalletListNavBar} component={Scan} tintColor={stylesRaw.backButtonColor} navTransparent={true} renderRightButton={() => <TouchableWithoutFeedback onPress={() => Actions.drawerOpen()}><Image source={MenuIcon}/></TouchableWithoutFeedback>} onEnter={this.props.dispatchEnableScan} onExit={this.props.dispatchDisableScan} renderLeftButton={() => <HelpButton/>} tabBarLabel='Send' title='Send'  />
                          <Scene key={Constants.EDGE_LOGIN}
                            renderTitle={'Edge Login'}
                            component={EdgeLoginSceneConnector}
                            renderLeftButton={() => <HelpButton/>}
                            animation={'fade'}
                            duration={200} />
                        </Stack>
                        <Stack key={Constants.EXCHANGE} navigationBarStyle={{backgroundColor: THEME.COLORS.PRIMARY}} icon={this.icon(Constants.EXCHANGE)} title='Exchange'  >
                          <Scene key='exchange_notused' navigationBarStyle={{backgroundColor: THEME.COLORS.PRIMARY}} icon={this.icon(Constants.EXCHANGE)} renderLeftButton={() => <ExchangeDropMenu/>} component={ExchangeConnector} renderRightButton={() => <TouchableWithoutFeedback onPress={() => Actions.drawerOpen()}><Image source={MenuIcon}/></TouchableWithoutFeedback>} tabBarLabel='Exchange' title='Exchange'  />
                          <Scene
                            key={Constants.CHANGE_MINING_FEE_EXCHANGE}
                            component={ChangeMiningFeeExchange}
                            onLeft={Actions.pop}
                            leftTitle='Back'
                            renderRightButton={() => <HelpButton/>}
                            title='Change Mining Fee'
                            animation='fade'
                            duration={600}
                        />
                        </Stack>
                      </Tabs>
                      <Stack key={Constants.SEND_CONFIRMATION} navTransparent={true} hideTabBar title='Send Confirmation' >
                        <Scene key='sendconfirmation_notused' hideTabBar component={SendConfirmation} back title='Send Confirmation' panHandlers={null} renderRightButton={() => <SendConfirmationOptions/>}  />
                        <Scene
                          key={Constants.CHANGE_MINING_FEE_SEND_CONFIRMATION}
                          component={ChangeMiningFeeSendConfirmation}
                          onLeft={Actions.pop}
                          navTransparent={false}
                          leftTitle='Back'
                          renderRightButton={() => <HelpButton/>}
                          title='Change Mining Fee'
                          animation='fade'
                          duration={600}
                        />
                      </Stack>
                      <Stack key={Constants.MANAGE_TOKENS} title={'Manage Tokens'} navigationBarStyle={{backgroundColor: THEME.COLORS.PRIMARY}} navTransparent={true} hideTabBar>
                        <Scene key='manageTokens_notused' onLeft={Actions.pop} component={ManageTokens} back title='Manage Tokens'   />
                        <Scene key={Constants.ADD_TOKEN} component={AddToken} onLeft={Actions.pop} leftTitle='Back' back title='Add Token' />
                      </Stack>
                      <Stack key='settingsOverviewTab' title='Settings' navigationBarStyle={{backgroundColor: THEME.COLORS.PRIMARY}} hideDrawerButton={true} >
                        <Scene key={Constants.SETTINGS_OVERVIEW} tintColor={stylesRaw.backButtonColor} navTransparent={true} component={SettingsOverview} title='Settings' onLeft={Actions.pop} leftTitle='Back'  />
                        <Scene key={Constants.CHANGE_PASSWORD} tintColor={stylesRaw.backButtonColor} navTransparent={true} component={ChangePasswordConnector}   title='Change Password'  />
                        <Scene key={Constants.CHANGE_PIN}        component={ChangePinConnector}       navTransparent={true}  title='Change Pin' tintColor={stylesRaw.backButtonColor}  />
                        <Scene key={Constants.RECOVER_PASSWORD}  component={PasswordRecoveryConnector} title='Password Recovery' tintColor={stylesRaw.backButtonColor}  />
                        <Scene key={Constants.BTC_SETTINGS} component={CurrencySettings} currencyCode={'BTC'} tintColor={stylesRaw.backButtonColor} navTransparent={true} pluginName={'bitcoin'}     title='BTC Settings'  />
                        <Scene key={Constants.BCH_SETTINGS} component={CurrencySettings} currencyCode={'BCH'} tintColor={stylesRaw.backButtonColor} navTransparent={true} pluginName={'bitcoinCash'} title='BCH Settings'  />
                        <Scene key={Constants.ETH_SETTINGS} component={CurrencySettings} currencyCode={'ETH'} tintColor={stylesRaw.backButtonColor} navTransparent={true} pluginName={'ethereum'}    title='ETH Settings'  />
                        <Scene key={Constants.LTC_SETTINGS} component={CurrencySettings} currencyCode={'LTC'} tintColor={stylesRaw.backButtonColor} navTransparent={true} pluginName={'litecoin'}    title='LTC Settings'  />
                        <Scene key='defaultFiatSetting' component={DefaultFiatSettingConnector} title='Default Fiat'  />
                      </Stack>
                      {/*</Gradient>*/}
                    </Scene>
                  </Drawer>
                </Stack>
                {/*</Lightbox>*/}
              </Modal>
            </Overlay>
          </RouterWithRedux>

          <HelpModal style={{flex: 1}} />
          <ErrorAlert/>
          <TransactionAlert/>

          <AutoLogout />

        </MenuContext>
      </StyleProvider>
    )
  }



  renderWalletListNavBar = () => (<Header/>)
  renderWalletListBackButton = () => (<BackButton withArrow onPress={this.handleBack} label='Wallets' />)

  icon = (tabName: string) => (props: {focused: boolean}) => {
    if (typeof tabBarIconFiles[tabName] === 'undefined' || typeof tabBarIconFilesSelected[tabName] === 'undefined') {
      throw new Error('Invalid tabbar name')
    }
    let imageFile
    if (props.focused) {
      imageFile = tabBarIconFilesSelected[tabName]
    } else {
      imageFile = tabBarIconFiles[tabName]
    }
    return (
      <Image source={imageFile}/>
    )
  }

  keyboardDidShow = (event: any) => {
    let keyboardHeight = event.endCoordinates.height
    this.props.setKeyboardHeight(keyboardHeight)
  }

  keyboardDidHide = () => {
    this.props.setKeyboardHeight(0)
  }

  isCurrentScene = (sceneKey: string) => {
    return Actions.currentScene === sceneKey
  }

  handleBack = () => {
    if (!this.isCurrentScene('walletList_notused')) {
      Actions.pop()
    }
    return true
  }
}

function makeCoreContext (callbacks: AbcContextCallbacks): Promise<AbcContext> {
  const opts: AbcContextOptions = {
    apiKey: AIRBITZ_API_KEY,
    callbacks,
    plugins: pluginFactories,
    shapeshiftKey: SHAPESHIFT_API_KEY
  }

  if (ENV.USE_FAKE_CORE) {
    const [context] = makeFakeContexts({...opts, localFakeUser: true})
    return Promise.resolve(context)
  }

  return makeReactNativeContext(opts)
}
