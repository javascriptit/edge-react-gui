//@flow
export const PREFIX = 'UI/Wallets/'

export const UPSERT_WALLET = PREFIX + 'UPSERT_WALLET'

export const ACTIVATE_WALLET_ID = PREFIX + 'ACTIVATE_WALLET_ID'
export const ARCHIVE_WALLET_ID = PREFIX + 'ARCHIVE_WALLET_ID'

export const SELECT_WALLET = PREFIX + 'SELECT_WALLET'

export const MANAGE_TOKENS = 'MANAGE_TOKENS'
export const MANAGE_TOKENS_START = 'MANAGE_TOKENS_START'
export const MANAGE_TOKENS_SUCCESS = 'MANAGE_TOKENS_SUCCESS'
export const DELETE_CUSTOM_TOKEN_START = 'DELETE_CUSTOM_TOKEN_START'
export const DELETE_CUSTOM_TOKEN_SUCCESS = 'DELETE_CUSTOM_TOKEN_SUCCESS'

// import * as UI_SELECTORS from '../selectors.js'
import * as CORE_SELECTORS from '../../Core/selectors.js'
import * as SETTINGS_SELECTORS from '../Settings/selectors'
import * as SETTINGS_API from '../../Core/Account/settings.js'
import {
  updateSettings
} from '../Settings/action'

import type {Dispatch, GetState} from '../../ReduxTypes'
import type {AbcCurrencyWallet} from 'airbitz-core-types'
import _ from 'lodash'

import * as WALLET_API from '../../Core/Wallets/api.js'

export const selectWallet = (walletId: string, currencyCode: string) => ({
  type: SELECT_WALLET,
  data: {walletId, currencyCode}
})

function dispatchUpsertWallet (dispatch, wallet, walletId) {
  dispatch(upsertWallet(wallet))
  refreshDetails[walletId].delayUpsert = false
  refreshDetails[walletId].lastUpsert = Date.now()
}

const refreshDetails = {}

export const refreshWallet = (walletId: string) => (dispatch: Dispatch, getState: GetState) => {
  const state = getState()
  const wallet = CORE_SELECTORS.getWallet(state, walletId)
  if (wallet) {
    if (!refreshDetails[walletId]) {
      refreshDetails[walletId] = {
        delayUpsert: false,
        lastUpsert: 0
      }
    }
    if (!refreshDetails[walletId].delayUpsert) {
      const now = Date.now()
      if (now - refreshDetails[walletId].lastUpsert > 3000) {
        dispatchUpsertWallet(dispatch, wallet, walletId)
      } else {
        console.log('refreshWallets setTimeout delay upsert id:' + walletId)
        refreshDetails[walletId].delayUpsert = true
        setTimeout(() => {
          dispatchUpsertWallet(dispatch, wallet, walletId)
        }, 3000)
      }
    } else {
      console.log('refreshWallets delayUpsert id:' + walletId)
    }
  } else {
    console.log('refreshWallets no wallet. id:' + walletId)
  }
}

export const upsertWallet = (wallet: AbcCurrencyWallet) => (dispatch: Dispatch, getState: GetState) => {
  const state = getState()
  const loginStatus = SETTINGS_SELECTORS.getLoginStatus(state)
  if (!loginStatus) {
    dispatch({type: 'LOGGED_OUT'})
  }

  dispatch({
    type: UPSERT_WALLET,
    data: {wallet}
  })
}

// adds to core and enables in core
export const addCustomToken = (walletId: string, tokenObj: any) => (dispatch: Dispatch, getState: GetState) => {
  const state = getState()
  const wallet = CORE_SELECTORS.getWallet(state, walletId)
  WALLET_API.addCoreCustomToken(wallet, tokenObj)
  .catch((e) => console.log(e))
}

export const setEnabledTokens = (walletId: string, enabledTokens: Array<string>, disabledTokens: Array<string>) => (dispatch: Dispatch, getState: GetState) => {
  // tell Redux that we are updating the enabledTokens list
  dispatch(setTokensStart())
  // get a snapshot of the state
  const state = getState()
  // get a copy of the relevant core wallet
  const wallet = CORE_SELECTORS.getWallet(state, walletId)
  // now actually tell the wallet to enable the token(s) in the core and save to file
  WALLET_API.setEnabledTokens(wallet, enabledTokens, disabledTokens)
  .then(() => {
    // let Redux know it was completed successfully
    dispatch(setTokensSuccess())
    // refresh the wallet in Redux
    dispatch(refreshWallet(walletId))
  })
  .catch((e) => console.log(e))
}

export const getEnabledTokens = (walletId: string) => (dispatch: Dispatch, getState: GetState) => {
  // get a snapshot of the state
  const state = getState()
  // get the AbcWallet
  const wallet = CORE_SELECTORS.getWallet(state, walletId)
  // get list of enabled / disbaled tokens frome file (not core)
  WALLET_API.getEnabledTokensFromFile(wallet)
  .then((tokens) => {
    // make copy of the wallet
    let modifiedWallet = wallet
    // reflect the new enabled tokens in that wallet copy
    modifiedWallet.enabledTokens = tokens
    // do the actual enabling of the tokens
    WALLET_API.enableTokens(modifiedWallet, tokens)
    .then(() => {
      // now reflect that change in Redux's version of the wallet
      dispatch(upsertWallet(modifiedWallet))
    })
  })
}

// this will delete the token from the account object (Settings area), Redux (settings area), and disable in both the wallet file and core
// as long as the token is disabled *in the wallet file*, then it will eventually be disabled in the core, because eventually the phone turns off or restarts
export const deleteCustomToken = (walletId: string, currencyCode: string) => (dispatch: any, getState: any) => {
  const state = getState()
  const coreWallets = CORE_SELECTORS.getWallets(state)
  const guiWallets = state.ui.wallets.byId
  const account = CORE_SELECTORS.getAccount(state)

  dispatch(deleteCustomTokenStart())
  SETTINGS_API.getSyncedSettings(account)
  .then((settings) => {
    delete settings[currencyCode] // remove top-level property. We should migrate away from it eventually anyway
    const customTokensOnFile = settings.customTokens // should use '|| []' as catch-all or no?
    if (customTokensOnFile.length === 0) return
    const indexOfToken = _.findIndex(customTokensOnFile, (item) => item.currencyCode = currencyCode)
    customTokensOnFile.splice(indexOfToken, 1)
    settings.customTokens = customTokensOnFile // use new variable?
    SETTINGS_API.setSyncedSettings(account, settings)
    .then(() => {
      // now time to loop through wallets and disable (on wallet and in core)
      for (let prop in guiWallets) {
        let theGuiWallet = guiWallets[prop]
        let theCoreWallet = coreWallets[prop]
        if (theGuiWallet.enabledTokens && theGuiWallet.enabledTokens.length > 0) {
          // if the wallet has tokens
          const indexOfEnabledToken = theGuiWallet.enabledTokens.indexOf(currencyCode)
          // find the index of the token
          theGuiWallet.enabledTokens.splice(indexOfEnabledToken, 1)
          // and remove it from the enabledTokens property
          const indexOfMetaToken = _.findIndex(theGuiWallet.metaTokens, (item) => item.currencyCode === currencyCode)
          theGuiWallet.metaTokens.splice(indexOfMetaToken, 1)
          dispatch(setEnabledTokens(theGuiWallet.id, theGuiWallet.enabledTokens, [currencyCode]))
        }
      }
      // wait until all wallets have been disabled before you remove denom from settings
      dispatch(updateSettings(settings))
      dispatch(deleteCustomTokenSuccess())
    })
    .catch((e) => {
      console.log(e)
    })
  })
}

export const deleteCustomTokenStart = () => ({
  type: DELETE_CUSTOM_TOKEN_START
})

export const deleteCustomTokenSuccess = () => ({
  type: DELETE_CUSTOM_TOKEN_SUCCESS
})

export const setTokensStart = () => ({
  type: MANAGE_TOKENS_START
})

export const setTokensSuccess = () => ({
  type: MANAGE_TOKENS_SUCCESS
})
