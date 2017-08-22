import {Linking} from 'react-native'
import {Actions} from 'react-native-router-flux'
import * as WALLET_API from '../../../Core/Wallets/api'

const formatWallet = (w) => ({
  'id': w.id,
  'name': w.name,
  'type': w.type,
  'currencyCode': w.currencyCode,
  'primaryNativeBalance': w.currencyCode
})

export class PluginBridge {
  constructor (context) {
    this.context = context
    this.navStack = []
  }

  componentDidMount () {
    Actions.refresh({
      onLeft:() => {
        this.back()
      },
      leftTitle:'Back'
    })
  }

  bitidAddress () {
    // TODO: not supported by core...yet
    return Promise.resolve(null)
  }

  bitidSignature () {
    // TODO: not supported by core...yet
    // const {uri, message} = data
    return Promise.resolve(null)
  }

  chooseWallet () {
    this.context.toggleWalletList()
    return Promise.resolve(null)
  }

  selectedWallet () {
    return Promise.resolve(formatWallet(this.context.walletId))
  }

  wallets () {
    let wallets = Object.keys(this.context.wallets)
      .map((key) => formatWallet(this.context.wallets[key]))
    return Promise.resolve(wallets)
  }

  getAddress (data) {
    const walletId = data.walletId
    const coreWallet = this.context.coreWallets[walletId]
    const currencyCode = data.currencyCode
    return WALLET_API.getReceiveAddress(coreWallet, currencyCode)
      .then((receiveAddress) => {
        const encodedURI = coreWallet.encodeUri(receiveAddress)
        return {'encodeUri': encodedURI, 'address': receiveAddress}
      })
  }

  finalizeReceiveRequest (data) {
    const {coreWallet, receiveAddress} = data
    return WALLET_API.lockReceiveAddress(coreWallet, receiveAddress)
  }

  _spend (spendTargets, lockInputs, broadcast) {
    return new Promise((resolve, reject) => {
      Actions.sendConfirmation({
        abcSpendInfo: {spendTargets},
        finishCallback: (error, abcTransaction) => {
          (error) ? reject(error) : resolve(abcTransaction)
        },
        lockInputs,
        broadcast
      })
    })
  }

  createSpendRequest (data) {
    const {toAddress, nativeAmount} = data
    return this._spend([{
      publicAddress:toAddress, nativeAmount:nativeAmount
    }], true, true)
  }

  createSpendRequest2 (data) {
    const {toAddress, toAddress2, nativeAmount, nativeAmount2} = data
    return this._spend([{
      publicAddress:toAddress, nativeAmount:nativeAmount
    }, {
      publicAddress:toAddress2, nativeAmount:nativeAmount2
    }], true, true)
  }

  requestSign (data) {
    const {toAddress, nativeAmount} = data
    return this._spend([{
      publicAddress:toAddress, nativeAmount:nativeAmount
    }], true, false)
  }

  broadcastTx (data) {
    const {coreWallet, rawtx} = data
    return WALLET_API.broadcastTransaction(coreWallet, rawtx)
  }

  saveTx (data) {
    const {coreWallet, signedTransaction} = data
    return WALLET_API.signTransaction(coreWallet, signedTransaction)
      .then(() => {
        return true
      })
  }

  requestFile () {
    // TODO
    // const {options} = data
    return Promise.resolve(null)
  }

  readData (data) {
    return this.context.folder.file(data.key).getText()
  }

  writeData (data) {
    const {key, value} = data
    return this.context.folder.file(key)
      .setText(value)
      .then(() => {
        return true
      })
  }

  clearData () {
    return Promise.resolve(true)
    /* TODO: find out why this breaks the account locally
    return this.context.folder.delete()
      .then(() => {
        return true
      })
      */
  }

  getAffiliateInfo () {
    // TODO
    return Promise.resolve(null)
  }

  get (data) {
    const {key} = data
    if (this.context.plugin[key]) {
      return Promise.resolve(this.context.plugin[key])
    } else {
      return Promise.reject(`${key} is not valid for plugin`)
    }
  }

  debugLevel (data) {
    console.log(`LOGGING ${this.context.plugin.key}  ${data.level}: ${data.text}`)
    return Promise.resolve(null)
  }

  showAlert (data) {
    this.context.showAlert({success: data['success'], title: data['title'], message: data['message']})
    return Promise.resolve(null)
  }

  hideAlert () {
    return Promise.resolve(null)
  }

  title (data) {
    const {title} = data
    Actions.refresh({title: title})
    return Promise.resolve(null)
  }

  back () {
    if (this.navStack.length === 0) {
      Actions.pop()
    } else {
      this.navStackPop()
      this.context.back()
    }
    return Promise.resolve(null)
  }

  exit () {
    Actions.pop()
    return Promise.resolve(null)
  }

  launchExternal (data) {
    return Linking.openURL(data.uri)
  }

  navStackClear () {
    this.navStack = []
    return Promise.resolve(null)
  }

  navStackPush (data) {
    this.navStack.push(data.path)
    return Promise.resolve(null)
  }

  navStackPop () {
    let path = this.navStack.pop()
    return Promise.resolve(path)
  }
}
