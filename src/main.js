import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { List, Cell, Search, NavBar, PullRefresh, Image as VanImage, Lazyload, Swipe, SwipeItem, ActionSheet, ActionBar, ActionBarButton, Button, Form, Field, CellGroup, Icon } from 'vant'

import App from './App.vue'
import router from './router'
// 引入组件样式
import 'vant/lib/index.css'
// 必须写在vant样式后，覆盖vant样式
import './assets/main.css'

const app = createApp(App)

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

// 注册时可以配置额外的选项
app.use(Lazyload, {
  lazyComponent: true
})

app.mount('#app')
