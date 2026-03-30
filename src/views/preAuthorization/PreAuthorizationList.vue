<template>
  <div class="pre-auth-list">
    <!-- 搜索过滤头部 -->
    <FilterHeader
      :showSort="false"
      :showScan="false"
      :placeholder="'请输入VIN码或客户姓名'"
      :filter-list="filterList"
      @search="onSearch"
      @filterSearch="onFilterSearch"
    />

    <!-- 筛选标签 -->
    <div class="filter-tabs">
      <van-tabs v-model:active="activeTab" @change="onTabChange" color="#2261DD">
        <van-tab name="all" title="全部"></van-tab>
        <van-tab name="pending" title="待处理"></van-tab>
        <van-tab name="approved" title="已批准"></van-tab>
        <van-tab name="rejected" title="已拒绝"></van-tab>
      </van-tabs>
    </div>

    <!-- 预授权列表 -->
    <div class="list-container">
      <van-list
        v-model:error="error"
        :loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <ListItem
          v-for="item in list"
          :key="item.id"
          @click="goToDetail(item)"
        >
          <template #header>
            <div class="item-header">
              <div class="item-title">{{ item.customerName }}</div>
              <div class="item-status" :class="getStatusClass(item.status)">
                {{ getStatusText(item.status) }}
              </div>
            </div>
          </template>

          <template #card-info>
            <div class="item-content">
              <div class="item-row">
                <span class="label">VIN码：</span>
                <span class="value">{{ item.vin }}</span>
              </div>
              <div class="item-row">
                <span class="label">车型：</span>
                <span class="value">{{ item.model }}</span>
              </div>
              <div class="item-row">
                <span class="label">申请时间：</span>
                <span class="value">{{ formatDate(item.applyTime) }}</span>
              </div>
            </div>

            <div class="item-footer">
              <span class="amount">预授权金额：¥{{ item.amount }}</span>
              <van-button
                size="small"
                :type="getButtonVariant(item.status)"
                @click.stop="handleAction(item)"
              >
                {{ getButtonText(item.status) }}
              </van-button>
            </div>
          </template>
        </ListItem>
      </van-list>
    </div>

    <!-- 浮动操作按钮 -->
    <van-button
      class="fab-button"
      type="primary"
      icon="plus"
      round
      @click="createAuthorization"
    >
      新建预授权
    </van-button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Toast } from 'vant'
import FilterHeader from '@/libs/components/FilterHeader.vue'
import ListItem from '@/components/ListItem.vue'

const router = useRouter()

// 响应式数据
const activeTab = ref('all')
const loading = ref(false)
const finished = ref(false)
const error = ref(false)
const list = ref([])

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
      { label: '其他', value: 'other' }
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
    customerName: '张三',
    vin: 'LSJA24U72JF234567',
    model: 'Leapmotor C10',
    applyTime: '2024-12-01 10:30:25',
    amount: '2,800.00',
    status: 'pending'
  },
  {
    id: 2,
    customerName: '李四',
    vin: 'LSJA24U72JF234568',
    model: 'Leapmotor T03',
    applyTime: '2024-12-01 14:20:10',
    amount: '3,200.00',
    status: 'approved'
  },
  {
    id: 3,
    customerName: '王五',
    vin: 'LSJA24U72JF234569',
    model: 'Leapmotor C10',
    applyTime: '2024-12-02 09:15:33',
    amount: '1,500.00',
    status: 'rejected'
  },
  {
    id: 4,
    customerName: '赵六',
    vin: 'LSJA24U72JF234570',
    model: 'Leapmotor T03',
    applyTime: '2024-12-02 16:45:12',
    amount: '4,200.00',
    status: 'pending'
  }
]

// 初始化数据
list.value = [...mockData]

// 方法定义
const onSearch = (params) => {
  Toast(`搜索：${params.searchValue}`)
  // 实现搜索逻辑
  filterListByParams(params.searchValue, activeTab.value, {})
}

const onFilterSearch = (filterParams) => {
  Toast('应用筛选条件')
  filterListByParams('', activeTab.value, filterParams)
}

const onTabChange = (name) => {
  filterListByParams('', name, {})
}

const onLoad = () => {
  // 模拟异步加载
  setTimeout(() => {
    loading.value = false
    finished.value = true
  }, 1000)
}

const filterListByParams = (search, tab, filters) => {
  let filtered = [...mockData]

  // 按搜索值过滤
  if (search && search.searchValue) {
    const searchValue = search.searchValue
    filtered = filtered.filter(item =>
      item.vin.includes(searchValue) || item.customerName.includes(searchValue)
    )
  }

  // 按标签过滤
  if (tab !== 'all') {
    filtered = filtered.filter(item => item.status === tab)
  }

  // 按高级筛选过滤
  if (filters.customerType) {
    filtered = filtered.filter(item =>
      filters.customerType === 'individual' ? !item.isEnterprise : item.isEnterprise
    )
  }

  if (filters.brand && filters.brand !== 'all') {
    if (filters.brand === 'c10') {
      filtered = filtered.filter(item => item.model.includes('C10'))
    } else if (filters.brand === 't03') {
      filtered = filtered.filter(item => item.model.includes('T03'))
    } else if (filters.brand === 'other') {
      filtered = filtered.filter(item => !item.model.includes('C10') && !item.model.includes('T03'))
    }
  }

  list.value = filtered
}

const getStatusClass = (status) => {
  switch (status) {
    case 'pending': return 'status-pending'
    case 'approved': return 'status-approved'
    case 'rejected': return 'status-rejected'
    default: return ''
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'pending': return '待处理'
    case 'approved': return '已批准'
    case 'rejected': return '已拒绝'
    default: return ''
  }
}

const getButtonVariant = (status) => {
  switch (status) {
    case 'pending': return 'warning'
    case 'approved': return 'primary'
    case 'rejected': return 'default'
    default: return 'primary'
  }
}

const getButtonText = (status) => {
  switch (status) {
    case 'pending': return '处理'
    case 'approved': return '详情'
    case 'rejected': return '重新申请'
    default: return '查看'
  }
}

const goToDetail = (item) => {
  router.push(`/pre-authorization/${item.id}`)
}

const handleAction = (item) => {
  switch (item.status) {
    case 'pending':
      // 处理待办事项
      Toast(`处理预授权 ${item.id}`)
      break
    case 'approved':
      goToDetail(item)
      break
    case 'rejected':
      Toast(`重新申请预授权 ${item.id}`)
      break
  }
}

const createAuthorization = () => {
  router.push('/pre-authorization/create')
}

const formatDate = (dateString) => {
  // 格式化日期的简单实现
  return dateString.split(' ')[0]
}
</script>

<style lang="scss" scoped>
.pre-auth-list {
  padding-bottom: 80px; /* 为浮动按钮留出空间 */
  min-height: 100vh;
  background-color: #f5f5f5;

  .filter-tabs {
    background-color: #fff;
    margin-top: 10px;

    :deep(.van-tab) {
      font-size: 14px;
    }
  }

  .list-container {
    margin-top: 10px;
    padding: 0 10px;
  }

  .item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;

    .item-title {
      font-size: 16px;
      font-weight: bold;
      color: #333;
    }

    .item-status {
      font-size: 12px;
      padding: 4px 8px;
      border-radius: 12px;
      color: #fff;

      &.status-pending {
        background-color: #ff976a;
      }

      &.status-approved {
        background-color: #00c48f;
      }

      &.status-rejected {
        background-color: #ee0a24;
      }
    }
  }

  .item-content {
    margin-bottom: 10px;

    .item-row {
      display: flex;
      margin-bottom: 5px;
      font-size: 14px;
      color: #666;

      .label {
        min-width: 80px;
        color: #999;
      }

      .value {
        flex: 1;
        color: #333;
      }
    }
  }

  .item-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .amount {
      font-size: 14px;
      color: #ff5000;
      font-weight: bold;
    }
  }

  .fab-button {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 100;
    width: auto;
    height: 50px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}
</style>
