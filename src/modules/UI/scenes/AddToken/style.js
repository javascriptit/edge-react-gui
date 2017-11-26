import {StyleSheet} from 'react-native'
import THEME from '../../../../theme/variables/airbitz'
import PLATFORM from '../../../../theme/variables/platform'


export const styles = {

  gradient: {
    height: 66,
    width: '100%',
    position: 'absolute'
  },
  container: {
    position: 'relative',
    height: PLATFORM.deviceHeight - 66,
    top: 66,
    paddingHorizontal: 20,
    backgroundColor: THEME.COLORS.GRAY_4
  },
  leftArea: {
    flexDirection: 'row'
  },
  icon: {
    backgroundColor: THEME.COLORS.TRANSPARENT,
    fontSize: 22,
    color: THEME.COLORS.WHITE
  },

  headerRow: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 50
  },
  headerText: {
    fontSize: 18,
    color: THEME.COLORS.WHITE,
    backgroundColor: THEME.COLORS.TRANSPARENT,
    marginLeft: 16
  },
  headerIcon: {
    backgroundColor: THEME.COLORS.TRANSPARENT,
    fontSize: 22
  },

  instructionalArea: {
    paddingVertical: 16,
    paddingHorizontal: 20
  },
  instructionalText: {
    fontSize: 16,
    textAlign: 'center'
  },

  nameArea: {
    height: 70
  },
  currencyCodeArea: {
    height: 70
  },
  denominationArea: {
    height: 70
  },

  buttonsArea: {
    marginTop: 16,
    height: 52,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'flex-end',
    paddingVertical: 4
  },
  addButton: {
    flex: 1,
    marginRight: 2,
    backgroundColor: THEME.COLORS.GRAY_2,
    borderRadius: 3
  },
  buttonText: {
    color: THEME.COLORS.WHITE,
    fontSize: 18
  },
  saveButton: {
    flex: 1,
    marginLeft: 2,
    backgroundColor: THEME.COLORS.SECONDARY,
    borderRadius: 3
  }
}
export default StyleSheet.create(styles)