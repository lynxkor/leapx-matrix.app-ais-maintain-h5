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
          path: '/pre-authorization',
          name: 'preAuthorization',
          component: () => import('../views/preAuthorization/PreAuthorizationDashboard.vue'),
          meta: {
            title: '预授权管理',
            keepAlive: true
          }
        },
        {
          path: '/pre-authorization/list',
          name: 'preAuthorizationList',
          component: () => import('../views/preAuthorization/PreAuthorizationList.vue'),
          meta: {
            title: '预授权管理',
            keepAlive: true
          }
        },
        {
          path: '/pre-authorization/:id',
          name: 'preAuthorizationDetail',
          component: () => import('../views/preAuthorization/PreAuthorizationDetail.vue'),
          meta: {
            title: '预授权详情'
          }
        },
        {
          path: '/pre-authorization/create',
          name: 'createPreAuthorization',
          component: () => import('../views/preAuthorization/CreatePreAuthorization.vue'),
          meta: {
            title: '预授权申请'
          }
        },
        {
          path: '/pre-authorization/edit/:id',
          name: 'editPreAuthorization',
          component: () => import('../views/preAuthorization/CreatePreAuthorization.vue'),
          meta: {
            title: '编辑预授权'
          }
        },
        {
          path: '/pre-authorization/search',
          name: 'preAuthorizationSearch',
          component: () => import('../views/preAuthorization/PreAuthorizationSearchPage.vue'),
          meta: {
            title: ''
          }
        },
        // 结算报表模块路由
        {
          path: '/settlement-statement',
          name: 'settlementStatement',
          component: () => import('../views/settlementStatement/SettlementStatementList.vue'),
          meta: {
            title: '结算交车',
            keepAlive: true
          }
        },
        {
          path: '/settlement-statement/search',
          name: 'settlementStatementSearch',
          component: () => import('../views/settlementStatement/SettlementStatementSearch.vue'),
          meta: {
            title: '搜索结算单',
            hideHeader: true
          }
        },
        // 售后结算单列表
        {
          path: '/settlement-statement/after-sales',
          name: 'afterSalesSettlementList',
          component: () => import('../views/settlementStatement/AfterSalesSettlementList.vue'),
          meta: {
            title: '售后结算单',
            keepAlive: true
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
