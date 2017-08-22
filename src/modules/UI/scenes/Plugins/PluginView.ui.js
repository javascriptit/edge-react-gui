import React from 'react'
import {WebView, FlatList, Text, View, Image} from 'react-native'
import {connect} from 'react-redux'
import {openABAlert} from '../../components/ABAlert/action'
import {Actions} from 'react-native-router-flux'
import * as CORE_SELECTORS from '../../../Core/selectors.js'
import * as Constants from '../../../../constants/indexConstants'
import WalletListModal
from '../../../UI/components/WalletListModal/WalletListModalConnector'

import {BUY_SELL, SPEND} from './plugins'
import {PluginBridge} from './api'

class PluginList extends React.Component {
  _onPress = (plugin) => {
    Actions.plugin({plugin: plugin})
  }

  _renderPlugin = ({item}) => (
    <View style={{flex: 1, flexDirection: 'row'}}>
      <Image
        style={{width: 50, height: 50}}
        source={{uri: item.imageUrl}}
      />
      <View style={{flex: 1, flexDirection: 'column'}}>
        <Text id={item.key} key={item.key} onPress={() => this._onPress(item)}>{item.key}</Text>
        <Text>{item.subtitle}</Text>
      </View>
    </View>
  )

  render () {
    return (
      <FlatList
        data={this.plugins}
        renderItem={this._renderPlugin}
      />
    )
  }
}

class PluginBuySell extends PluginList {
  constructor () {
    super()
    this.plugins = BUY_SELL
  }
}

class PluginSpend extends PluginList {
  constructor () {
    super()
    this.plugins = SPEND
  }
}

class PluginView extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      showWalletList:false
    }
    this.webview = null
    this.plugin = this.props.plugin
    this.updateBridge(this.props)
  }

  updateBridge (props) {
    this.bridge = new PluginBridge({
      plugin:props.plugin,
      account:props.account,
      coreWallets:props.coreWallets,
      wallets:props.wallets,
      walletName:props.walletName,
      walletId:props.walletId,
      navigationState:this.props.navigation.state,
      folder:props.account.folder.folder(this.plugin.key),
      toggleWalletList:this.toggleWalletList,
      showAlert:this.props.showAlert,
      back:this._webviewBack,
    })
  }

  toggleWalletList = () => {
    this.setState({showWalletList:!this.state.showWalletList})
  }

  componentWillReceiveProps (nextProps) {
    this.updateBridge(nextProps)
  }

  componentDidMount () {
    this.bridge.componentDidMount()
  }

  _renderWebView = () => {
    return this.plugin.sourceFile
  }

  _webviewBack = () => {
    this.webview.injectJavaScript('window.history.back()')
  }

  _pluginReturn = (data) => {
    this.webview.injectJavaScript(`window.PLUGIN_RETURN('${JSON.stringify(data)}')`)
  }

  _nextMessage = (datastr) => {
    this.webview.injectJavaScript(`window.PLUGIN_NEXT('${datastr}')`)
  }

  _onMessage = (event) => {
    console.log(event.nativeEvent.data)
    if (!this.webview) {
      return
    }
    const data = JSON.parse(event.nativeEvent.data)
    const {cbid, func} = data
    this._nextMessage(cbid)

    console.log(func)
    if (this.bridge[func]) {
      this.bridge[func](data)
        .then((res) => {
          this._pluginReturn({cbid, func, err:null, res})
        })
        .catch((err) => {
          this._pluginReturn({cbid, func, err, res:null})
        })
    } else {
      this._pluginReturn({cbid, func, err:'invalid function'})
    }
  }

  _setWebview = (webview) => {
    this.webview = webview
  }

  render () {
    return (
      <View style={{flex: 1}}>
        {this.state.showWalletList && (
          <WalletListModal
            topDisplacement={Constants.SCAN_WALLET_DIALOG_TOP}
            type={Constants.FROM}
          />
        )}
        <WebView ref={this._setWebview} onMessage={this._onMessage} source={this._renderWebView()} />
      </View>
    )
  }
}

const mapStateToProps = (state) => ({
  account: CORE_SELECTORS.getAccount(state),
  coreWallets: state.core.wallets.byId,
  wallets: state.ui.wallets.byId,
  walletName: state.ui.scenes.walletList.walletName,
  walletId: state.ui.scenes.walletList.walletId,
})

const mapDispatchToProps = (dispatch) => ({
  showAlert: (alertSyntax) => dispatch(openABAlert(Constants.OPEN_AB_ALERT, alertSyntax))
})

const PluginViewConnect = connect(mapStateToProps, mapDispatchToProps)(PluginView)
export {PluginViewConnect, PluginBuySell, PluginSpend}
