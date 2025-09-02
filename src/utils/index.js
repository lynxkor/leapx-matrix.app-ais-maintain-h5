import { NAVIGATOR_TYPE_ANDROID, NAVIGATOR_TYPE_IOS } from './constants'

/**
 * 判断手机类型.
 * @returns {string} 安卓类型返回Android 苹果类型返回Ios，其他返回other.
 */
export function getNavigatorType () {
  var u = navigator.userAgent
  // alert(u);
  var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1 // android终端
  // var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); // ios终端
  var isiOS = /(iPhone|iPad|iPod|iOS|Mac)/i.test(u)
  if (isAndroid) {
    return NAVIGATOR_TYPE_ANDROID
  } else if (isiOS) {
    return NAVIGATOR_TYPE_IOS
  }
  return ''
}
