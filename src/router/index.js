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
          path: '/reception/work-order',
          name: 'receptionWorkOrder',
          component: () => import('../views/reception/WorkOrder.vue'),
          meta: {
            title: '接车施工单',
            keepAlive: true
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
          path: '/reception/vehicle-search',
          name: 'vehicleSearch',
          component: () => import('../views/reception/VehicleSearch.vue'),
          meta: {
            title: '车辆搜索',
            hideHeader: true,
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
          component: () => import('../views/reception/add-parts/index.vue'),
          meta: {
            title: '选择维修项目',
            keepAlive: false
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
