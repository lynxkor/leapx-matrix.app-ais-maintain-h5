import { getNavigatorType } from './index'
import { NAVIGATOR_TYPE_ANDROID, NAVIGATOR_TYPE_IOS } from './constants'

/**
 * 返回上一页或退出webview
 */
export function goBack() {
  if (window.history.length > 1) {
    window.history.go(-1)
  } else {
    const navigatorType = getNavigatorType()
    switch (navigatorType) {
      case NAVIGATOR_TYPE_ANDROID:
        window.Android.goback()
        break
      case NAVIGATOR_TYPE_IOS:
        window.webkit.messageHandlers.goback.postMessage(null)
        break
      default:
        window.close()
        break
    }
  }
}
