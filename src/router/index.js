import { createRouter, createWebHistory } from 'vue-router'
import { useGlobalStore } from '@/stores/global'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'baseLayout',
      component: () => import('@/libs/layout/baseLayout.vue'),
      children: [
        {
          path: '/home',
          name: 'home',
          component: HomeView,
          meta: {
            title: 'Demo-首页'
          }
        },
        {
          path: '/example',
          name: 'example',
          // route level code-splitting
          // this generates a separate chunk (About.[hash].js) for this route
          // which is lazy-loaded when the route is visited.
          component: () => import('../views/example/ListView.vue'),
          meta: {
            title: 'Demo-商品列表',
            keepAlive: true
          }
        },
        {
          path: '/example/detail',
          name: 'exampleDetail',
          // route level code-splitting
          // this generates a separate chunk (About.[hash].js) for this route
          // which is lazy-loaded when the route is visited.
          component: () => import('../views/example/DetailView.vue'),
          meta: {
            title: 'Demo-商品详情'
          }
        },
        {
          path: '/repairWork',
          name: 'repairWork',
          // route level code-splitting
          // this generates a separate chunk (About.[hash].js) for this route
          // which is lazy-loaded when the route is visited.
          component: () => import('../views/repairWork/index.vue'),
          meta: {
            title: '维修作业列表',
            keepAlive: true
          }
        },
        {
          path: '/repairWork/detail',
          name: 'repairWorkDetail',
          // route level code-splitting
          // this generates a separate chunk (About.[hash].js) for this route
          // which is lazy-loaded when the route is visited.
          component: () => import('../views/repairWork/index.vue'),
          meta: {
            title: '维修作业详情'
          }
        }
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  const globalStore = useGlobalStore()
  // 优先使用路由元信息中的标题
  globalStore.setTitle(to.meta.title || '')
  document.title = to.meta.title || ''

  next()
})

export default router
