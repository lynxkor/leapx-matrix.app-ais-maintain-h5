import { createApp } from 'vue'
import { createPinia } from 'pinia'
import {
  List, Cell, Search, NavBar, PullRefresh, Image as VanImage, Lazyload, Swipe, SwipeItem, ActionSheet, ActionBar, ActionBarButton, Button, Form, Field, CellGroup, Icon, Dialog, Popup, DatePicker, TimePicker, Tab, Tabs, RadioGroup, Radio, Highlight,
  Stepper, Switch, NumberKeyboard, Collapse, CollapseItem
} from 'vant'
import * as Sentry from '@sentry/vue'

import App from './App.vue'
import router from './router'
// 引入组件样式
import 'vant/lib/index.css'
// 必须写在vant样式后，覆盖vant样式
import './assets/main.css'

const setHtmlFontsize = () => {
  var htmlWidth = document.documentElement.clientWidth || document.body.clientWidth
  console.log('width：', htmlWidth)
  var htmlDom = document.getElementsByTagName('html')[0]
  htmlDom.style.fontSize = (htmlWidth / 37.5) + 'px'
}
window.onresize = setHtmlFontsize
setHtmlFontsize()

const app = createApp(App)

// 初始化 Sentry 错误追踪
const environment = import.meta.env.VITE_SENTRY_ENV
if (environment) {
  Sentry.init({
    app,
    dsn: 'https://ee4e500cb386a8ae8f0e53a9f8be3c8f@it-sentry.leapmotor.com/62', // Sentry 数据源名称配置
    environment,
    integrations: [
      Sentry.browserTracingIntegration({ router }), // 浏览器跟踪集成
      Sentry.replayIntegration() // 会话重放集成
    ],
    // 跟踪设置
    tracesSampleRate: 1.0, // 捕获100%的事务
    // 会话重放
    replaysSessionSampleRate: 0.1, // 这将采样率设置为10%。在开发环境中可以将其设为100%，然后在生产环境中降低采样率。
    replaysOnErrorSampleRate: 1.0 // 如果尚未对整个会话进行采样，则在出现错误的会话中将采样率更改为100%。
  })
}

app.use(createPinia())
app.use(router)
app.use(List)
app.use(Cell)
app.use(Search)
app.use(NavBar)
app.use(PullRefresh)
app.use(VanImage)
app.use(Swipe)
app.use(SwipeItem)
app.use(ActionSheet)
app.use(ActionBar)
app.use(ActionBarButton)
app.use(Button)
app.use(Form)
app.use(Field)
app.use(CellGroup)
app.use(Icon)
app.use(Dialog)
app.use(Popup)
app.use(DatePicker)
app.use(TimePicker)
app.use(Tab)
app.use(Tabs)
app.use(RadioGroup)
app.use(Radio)
app.use(Highlight)
app.use(Stepper)
app.use(Switch)
app.use(NumberKeyboard)
app.use(Collapse)
app.use(CollapseItem)

// 注册时可以配置额外的选项
app.use(Lazyload, {
  lazyComponent: true
})

if (import.meta.env.DEV) {
  import('vconsole').then(({ default: VConsole }) => {
    new VConsole()
  })
}

app.mount('#app')
