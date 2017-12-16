// @flow

import React, {Component} from 'react'
import {
  View,
  TouchableWithoutFeedback,
  TouchableHighlight
} from 'react-native'
import Text from '../../components/FormattedText'
import CheckBox from '../../components/CheckBox'
import styles, {styles as rawStyles} from './style.js'

// import THEME from '../../../../theme/variables/airbitz'

export type State = {
  enabled?: boolean
}

export type Props = {
  toggleToken: (string) => void,
  metaToken: any,
  enabled?: boolean,
  enabledList: Array<string>,
  goToEditTokenScene: (string) => void
}

class ManageTokenRow extends Component<Props , State> {
  constructor (props: Props) {
    super(props)
    this.state = {
      enabled: props.enabled
    }
  }

  render () {
    const { item } = this.props.metaToken
    let enabled = false
    if (this.props.enabledList.indexOf(item.currencyCode) >= 0) {
      enabled = true
    }

    return (

      <TouchableHighlight
        onPress={() => this.props.goToEditTokenScene(item.currencyCode)}
        underlayColor={rawStyles.underlay.color}
        style={[styles.manageTokenRow]}
      >
        <View style={[styles.manageTokenRowInterior]}>
          <View style={[styles.tokenNameArea]}>
            <Text style={[styles.tokenNameText]}>{item.currencyName} ({item.currencyCode})</Text>
          </View>
          <TouchableWithoutFeedback
            onPress={() => this.props.toggleToken(item.currencyCode)}
          >
            <View style={[styles.touchableCheckboxInterior]}>
              <CheckBox enabled={enabled} />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableHighlight>
    )
  }
}

export default ManageTokenRow
