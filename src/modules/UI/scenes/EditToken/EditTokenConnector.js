// @flow

import {connect} from 'react-redux'

import EditToken from './EditToken.ui'
// import * as WALLET_ACTIONS from '../../Wallets/action.js'
import type {Dispatch, State} from '../../../ReduxTypes'

const mapStateToProps = (state: State) => ({
  currencySettings: state.ui.settings.customTokens
})
const mapDispatchToProps = (dispatch: Dispatch) => ({
  dispatch,
})

export default connect(mapStateToProps, mapDispatchToProps)(EditToken)
