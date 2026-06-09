import { createRouter, createWebHistory } from 'vue-router'
import { useGlobalStore } from '@/stores/global'
// import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'baseLayout',
      component: () => import('@/libs/layout/baseLayout.vue'),
      children: [
        // {
        //   path: '/home',
        //   name: 'home',
        //   component: HomeView,
        //   meta: {
        //     title: 'Demo-首页'
        //   }
        // },
        // {
        //   path: '/example',
        //   name: 'example',
        //   // route level code-splitting
        //   // this generates a separate chunk (About.[hash].js) for this route
        //   // which is lazy-loaded when the route is visited.
        //   component: () => import('../views/example/ListView.vue'),
        //   meta: {
        //     title: 'Demo-商品列表',
        //     keepAlive: true
        //   }
        // },
        // {
        //   path: '/example/detail',
        //   name: 'exampleDetail',
        //   // route level code-splitting
        //   // this generates a separate chunk (About.[hash].js) for this route
        //   // which is lazy-loaded when the route is visited.
        //   component: () => import('../views/example/DetailView.vue'),
        //   meta: {
        //     title: 'Demo-商品详情'
        //   }
        // },
        {
          path: '/repairWork/list',
          name: 'repairWork',
          // route level code-splitting
          // this generates a separate chunk (About.[hash].js) for this route
          // which is lazy-loaded when the route is visited.
          component: () => import('../views/repairWork/index.vue'),
          meta: {
            title: '维修作业',
            keepAlive: true
          }
        },
        {
          path: '/repairWork/search',
          name: 'repairWorkSearch',
          // route level code-splitting
          // this generates a separate chunk (About.[hash].js) for this route
          // which is lazy-loaded when the route is visited.
          component: () => import('../views/repairWork/search.vue'),
          meta: {
            title: '维修作业搜索',
            hideHeader: true
          }
        },
        {
          path: '/reception/work-order',
          name: 'receptionWorkOrder',
          component: () => import('../views/reception/WorkOrder.vue'),
          meta: {
            title: '接车施工单',
            keepAlive: true,
            closeWindow: 1
          }
        },
        {
          path: '/reception/work-order-search',
          name: 'workOrderSearch',
          component: () => import('../views/reception/workOrderSearch.vue'),
          meta: {
            title: '接车施工单搜索',
            hideHeader: true,
            keepAlive: false
          }
        },
        {
          path: '/reception/sign',
          name: 'signView',
          component: () => import('../views/reception/sign/SignView.vue'),
          meta: {
            title: '施工单签字',
            keepAlive: false
          }
        },
        {
          path: '/reception/work-order/create/:vehicleInfo?',
          name: 'workOrderCreate',
          component: () => import('../views/reception/create/index.vue'),
          meta: {
            title: '新建施工单',
            keepAlive: false
          }
        },
        {
          path: '/reception/work-order/detail',
          name: 'workOrderDetail',
          component: () => import('../views/reception/detail/index.vue'),
          meta: {
            title: '施工单详情',
            keepAlive: false
          }
        },
        {
          path: '/reception/work-order/edit',
          name: 'workOrderEdit',
          component: () => import('../views/reception/edit/index.vue'),
          meta: {
            title: '施工单详情',
            keepAlive: false
          }
        },
        {
          path: '/reception/maintenance-history',
          name: 'maintenanceHistory',
          component: () => import('../views/reception/MaintenanceHistory.vue'),
          meta: {
            title: '维修履历',
            keepAlive: true
          }
        },
        {
          path: '/reception/rights-query',
          name: 'rightsQuery',
          component: () => import('../views/reception/RightsQuery.vue'),
          meta: {
            title: '权益查询',
            keepAlive: true
          }
        },
        {
          path: '/reception/select-package',
          name: 'selectPackage',
          component: () => import('../views/reception/select-package/index.vue'),
          meta: {
            title: '选择维修项目',
            keepAlive: false
          }
        },
        {
          path: '/reception/add-parts',
          name: 'addParts',
          component: () => import('../components/SelectRepairItem/index.vue'),
          meta: {
            title: '选择维修项目',
            keepAlive: false
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
          path: '/pre-authorization/detail/:id',
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
          path: '/pre-authorization/search',
          name: 'preAuthorizationSearch',
          component: () => import('../views/preAuthorization/PreAuthorizationSearchPage.vue'),
          meta: {
            title: '',
            hideHeader: true
          }
        },
        // 结算报表模块路由
        {
          path: '/settlement-statement',
          name: 'settlementStatement',
          component: () => import('../views/settlementStatement/SettlementStatementList.vue'),
          meta: {
            title: '结算交车',
            keepAlive: false
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
        },
        {
          path: '/placeholder',
          name: 'placeholder',
          component: () => import('../views/placeholder/index.vue'),
          meta: {
            title: '功能建设中'
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
