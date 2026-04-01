<template>
  <div class="pre-auth-list">
    <!-- 搜索过滤头部 - 固定定位 -->
    <div class="filter-fixed">
      <FilterHeader
        ref="filterHeaderRef"
        :showSort="false"
        :showScan="false"
        :placeholder="'请输入预授权单号/预警信息/门店名称'"
        :filter-list="filterList"
        :search-page-route="'preAuthorizationSearch'"
        @search="onSearch"
        @filterSearch="onFilterSearch"
      />
    </div>

    <!-- 预授权列表 -->
    <div class="list-container">
      <!-- 空状态 -->
      <div v-if="showEmpty" class="empty-state">
        <img class="empty-image" src="@/libs/assets/image/no-data.png" alt="没有数据" />
        <p class="empty-text">没有找到相关内容</p>
        <van-button plain type="primary" size="normal" class="reset-btn" @click="handleResetFilter">
          重置筛选
        </van-button>
      </div>

      <RefreshList
        v-else
        :requestData="requestData"
        :has-no-data="dataList.length === 0"
        @setData="setData"
        @resetFilters="resetFilters"
      >
        <ListItem
          v-for="item in dataList"
          :key="item.id"
          @click="goToDetail(item)"
          class="list_item_contaniner"
        >
          <template #header>
            <div class="item-header">
              <span class="order-no">{{ item.orderNo }}</span>
              <span class="status-tag" :class="getStatusClass(item.status)">
                {{ getStatusText(item.status) }}
              </span>
            </div>
          </template>

          <template #card-info>
            <van-row class="card-info">
              <van-col span="24" class="card-info-col">
                <span class="card-info-title">VIN</span>
                <span class="card-info-des">{{ item.vin }}</span>
              </van-col>
              <van-col span="24" class="card-info-col">
                <span class="card-info-title">门店名称</span>
                <span class="card-info-des">{{ item.storeName }}</span>
              </van-col>
              <van-col span="24" class="card-info-col">
                <span class="card-info-title">保修时间</span>
                <span class="card-info-des">{{ item.warrantyTime }}</span>
              </van-col>
              <van-col span="24" class="card-info-col">
                <span class="card-info-title">进店里程</span>
                <span class="card-info-des">{{ item.mileage }}</span>
              </van-col>
              <van-col span="24" class="card-info-col">
                <span class="card-info-title">创建时间</span>
                <span class="card-info-des">{{ item.createTime }}</span>
              </van-col>
              <van-col span="24" class="card-info-col">
                <span class="card-info-title">创建人</span>
                <span class="card-info-des">{{ item.creator }}</span>
              </van-col>
              <van-col span="24" class="card-info-col">
                <span class="card-info-title">销售门店</span>
                <span class="card-info-des">{{ item.salesStore }}</span>
              </van-col>
            </van-row>
          </template>

          <template #btn-content>
            <ais-button type="primary" round size="large" plain @click.stop="handleContact(item)">
              联系创建人
            </ais-button>
          </template>
        </ListItem>
      </RefreshList>
    </div>

    <!-- 底部操作栏 -->
    <div class="action-bar">
      <van-button class="create-btn" type="primary" @click="createAuthorization"> 新建 </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import FilterHeader from '@/libs/components/FilterHeader.vue'
import RefreshList from '@/libs/components/RefreshList.vue'
import ListItem from '@/components/ListItem.vue'
import AisButton from '@/components/AisButton.vue'

const router = useRouter()

// 响应式数据
const activeTab = ref('all')
const dataList = ref([])
const showEmpty = ref(false)
const filterHeaderRef = ref(null)

// FilterHeader 配置
const filterList = ref([
  {
    title: '客户类型',
    key: 'customerType',
    nodeType: 'single',
    options: [
      { label: '个人客户', value: 'individual' },
      { label: '企业客户', value: 'enterprise' }
    ]
  },
  {
    title: '车辆品牌',
    key: 'brand',
    nodeType: 'single',
    options: [
      { label: 'Leapmotor C10', value: 'c10' },
      { label: 'Leapmotor T03', value: 't03' },
      { label: '其他', value: 'other' },
      { label: '测试空结果', value: 'empty' }
    ]
  },
  {
    title: '日期范围',
    key: 'dateRange',
    nodeType: 'day',
    columnsType: ['year', 'month', 'day'],
    list: [
      { label: '今天', value: 'today' },
      { label: '近7天', value: 'week' },
      { label: '近30天', value: 'month' }
    ]
  }
])

// 模拟数据
const mockData = [
  {
    id: 1,
    orderNo: 'YS-260313141948383402',
    status: 'pending',
    vin: 'LFV3H6686RKYM3393',
    storeName: '2358446753543340032',
    warrantyTime: 'B10-510激光雷达版',
    mileage: '2025款',
    createTime: '2025-12-30 13:15:00',
    creator: '王小虎',
    salesStore: '杭州服务中心芯图大厦店'
  },
  {
    id: 2,
    orderNo: 'YS-260313141948383403',
    status: 'submitted',
    vin: 'LFV3H6686RKYM3394',
    storeName: '2358446753543340033',
    warrantyTime: 'C11-200增程版',
    mileage: '2024款',
    createTime: '2025-12-29 10:00:00',
    creator: '李小明',
    salesStore: '上海浦东店'
  },
  {
    id: 3,
    orderNo: 'YS-260313141948383404',
    status: 'approved',
    vin: 'LFV3H6686RKYM3395',
    storeName: '测试门店001',
    warrantyTime: 'C10-525舒享版',
    mileage: '2024款',
    createTime: '2025-12-28 09:00:00',
    creator: '张三',
    salesStore: '北京朝阳店'
  },
  {
    id: 4,
    orderNo: 'YS-260313141948383405',
    status: 'rejected',
    vin: 'LFV3H6686RKYM3396',
    storeName: '深圳南山店',
    warrantyTime: 'T03-400轻享版',
    mileage: '2023款',
    createTime: '2025-12-27 14:30:00',
    creator: '李四',
    salesStore: '深圳南山店'
  },
  {
    id: 5,
    orderNo: 'YS-260313141948383406',
    status: 'pending',
    vin: 'LFV3H6686RKYM3397',
    storeName: '成都武侯店',
    warrantyTime: 'C11-605纯电版',
    mileage: '2025款',
    createTime: '2025-12-26 11:20:00',
    creator: '王五',
    salesStore: '成都武侯店'
  },
  {
    id: 6,
    orderNo: 'YS-260313141948383407',
    status: 'audit',
    vin: 'LFV3H6686RKYM3398',
    storeName: '广州天河店',
    warrantyTime: 'C10-510激光雷达版',
    mileage: '2025款',
    createTime: '2025-12-25 09:30:00',
    creator: '赵六',
    salesStore: '广州天河店'
  }
]

// 初始化数据
dataList.value = [...mockData]

// requestData 配置
const requestData = reactive({
  data: {
    keyWord: '',
    pageNum: 1,
    pageSize: 10
  },
  api: () => Promise.resolve({ code: 200, data: mockData })
})

// 方法定义
const onSearch = (params) => {
  showToast(`搜索：${params.searchValue}`)
  requestData.data.keyWord = params.searchValue
  requestData.data.pageNum = 1
  dataList.value = [...mockData]
}

const onFilterSearch = (filterParams) => {
  showToast('应用筛选条件')

  let filtered = [...mockData]

  // 根据筛选条件过滤
  if (filterParams.brand === 'empty') {
    // 选择"测试空结果"时返回空数组
    filtered = []
  } else if (filterParams.brand && filterParams.brand !== 'all') {
    if (filterParams.brand === 'c10') {
      filtered = filtered.filter((item) => item.warrantyTime.includes('C10'))
    } else if (filterParams.brand === 't03') {
      filtered = filtered.filter((item) => item.warrantyTime.includes('T03'))
    } else if (filterParams.brand === 'other') {
      filtered = filtered.filter(
        (item) =>
          !item.warrantyTime.includes('C10') &&
          !item.warrantyTime.includes('T03') &&
          !item.warrantyTime.includes('C11')
      )
    }
  }

  requestData.data = { ...requestData.data }
  dataList.value = filtered
  showEmpty.value = filtered.length === 0
}

const onTabChange = (name) => {
  // Tab 切换功能已移除，保留此方法避免报错
  console.log('Tab change:', name)
}

const setData = (res) => {
  const list = Array.isArray(res.list) ? res.list : []
  if (res.isRefresh) {
    dataList.value = [...list]
  } else {
    dataList.value.push(...list)
  }
}

const resetFilters = () => {
  activeTab.value = 'all'
  requestData.data = {
    keyWord: '',
    pageNum: 1,
    pageSize: 10
  }
  dataList.value = [...mockData]
  showEmpty.value = false
}

const handleResetFilter = () => {
  activeTab.value = 'all'
  requestData.data = {
    keyWord: '',
    pageNum: 1,
    pageSize: 10
  }
  dataList.value = [...mockData]
  showEmpty.value = false
  // 重置 FilterHeader 的筛选条件
  if (filterHeaderRef.value) {
    filterHeaderRef.value.resetFilters()
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'pending':
      return '未提交'
    case 'submitted':
      return '已提交'
    case 'audit':
      return '待审核'
    case 'approved':
      return '已通过'
    case 'rejected':
      return '已驳回'
    default:
      return '未知'
  }
}

const getStatusClass = (status) => {
  switch (status) {
    case 'pending':
      return 'status-blue'
    case 'submitted':
      return 'status-green'
    case 'audit':
      return 'status-yellow'
    case 'approved':
      return 'status-green'
    case 'rejected':
      return 'status-red'
    default:
      return ''
  }
}

const handleContact = (item) => {
  showToast(`联系创建人: ${item.orderNo}`)
}

const goToDetail = (item) => {
  router.push(`/pre-authorization/${item.id}`)
}

const createAuthorization = () => {
  router.push('/pre-authorization/create')
}
</script>

<style lang="scss" scoped>
.pre-auth-list {
  padding-bottom: 89px;
  min-height: 100vh;
  background-color: #f5f5f5;
  overflow-y: auto;

  &::-webkit-scrollbar {
    display: none;
  }

  .filter-fixed {
    position: fixed;
    left: 0;
    right: 0;
    z-index: 100;
    background: #fff;
  }

  .filter-tabs {
    background: #fff;

    :deep(.van-tab) {
      font-size: 14px;
    }
  }

  .list-container {
    padding: 0 12px;
    padding-bottom: 77px;
    margin-top: 56px;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 66px 0;

    .empty-image {
      width: 230px;
      height: 142px;
      margin-bottom: 16px;
    }

    .empty-text {
      font-family: 'PingFang SC';
      font-size: 14px;
      color: #6c6e6c;
      margin: 0 0 20px 0;
    }

    .reset-btn {
      width: 88px;
      height: 32px;
      font-size: 14px;
      color: #009100 !important;
      border: 1px solid #009100 !important;
      border-radius: 4px;
    }
  }

  .item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    .order-no {
      font-family: 'PingFang SC';
      font-size: 16px;
      font-weight: 500;
      color: #191a1b;
    }

    .status-tag {
      font-family: 'PingFang SC';
      font-size: 12px;
      font-weight: 500;
      padding: 2px 8px;
      border-radius: 4px;

      &.status-blue {
        color: #2261dd;
        background: rgba(34, 97, 221, 0.1);
      }

      &.status-green {
        color: #009100;
        background: rgba(0, 145, 0, 0.1);
      }

      &.status-yellow {
        color: #c8a12b;
        background: rgba(200, 161, 43, 0.1);
      }

      &.status-red {
        color: #ee0a24;
        background: rgba(238, 10, 36, 0.1);
      }
    }
  }

  .card-info {
    box-sizing: border-box;
    margin-top: 6px;
    padding-bottom: 6px;

    .card-info-col {
      font-family: 'PingFang SC';
      font-size: 14px;
      padding: 6px 12px 0 0;
      display: flex;
      gap: 12px;

      .card-info-title {
        color: #545454;
        width: 70px;
        flex-shrink: 0;
      }

      .card-info-des {
        color: #191a1b;
        flex: 1;
        word-break: break-all;
      }
    }
  }

  .action-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 48px;
    background: #ffffff;
    border-top: 0.5px solid #e0e0e0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 12px;
    padding-bottom: 29px;
    box-sizing: content-box;
    z-index: 100;

    .create-btn {
      width: 100%;
      height: 40px;
      background: #009100;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      color: #ffffff;
    }
  }
}
</style>
