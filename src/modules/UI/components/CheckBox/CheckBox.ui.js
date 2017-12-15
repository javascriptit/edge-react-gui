import React, {Component} from 'react'
import {View, Image} from 'react-native'
import styles from './style'
import Checkmark from '../../../../assets/images/manageTokens/check_mark.png'

class CheckBox extends Component {

  render () {
    const { enabled } = this.props

    return (
      <View style={styles.checkBoxOutline}>
        {enabled &&<Image source={Checkmark} style={styles.checkmark} />}
      </View>
    )
  }
}

export default CheckBox