<template>
  <div class="repair-work-page">
    <!-- 顶部标签页 -->
    <van-tabs v-model:active="activeTab" class="work-tabs" sticky offset-top="0">
      <van-tab title="派工" name="dispatch" />
      <van-tab title="施工" name="working" />
      <van-tab title="终检" name="inspection" />
    </van-tabs>

    <!-- 筛选条件 + 搜索 -->
    <div class="filter-bar">
      <div class="filter-tabs">
        <div
          v-for="filter in filters"
          :key="filter.value"
          class="filter-tab"
          :class="{ active: activeFilter === filter.value }"
          @click="handleFilterChange(filter.value)"
        >
          {{ filter.label }}
        </div>
      </div>
      <div class="search-box" @click="handleSearch">
        <van-icon name="search" size="16" color="#191A1B" />
        <span class="search-text">搜索</span>
      </div>
    </div>

    <!-- 下拉刷新 + 列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh" class="refresh-container">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <div class="card-list">
          <RepairWorkCard
            v-for="item in workOrderList"
            :key="item.id"
            :work-order="item"
            :repair-items="item.repairItems || []"
            :activeTab="activeTab"
            @delete-item="handleDeleteItem(item, $event)"
            @start-item="handleStartItem(item, $event)"
            @end-item="handleEndItem(item, $event)"
            @quality-item="handleQualityItem(item, $event)"
            @delete-work="handleDeleteWork(item)"
            @start-work="handleStartWork(item)"
            @dispatch="handleDispatch(item)"
          />
        </div>

        <!-- 空状态 -->
        <Empty v-if="!loading && workOrderList.length === 0" />
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import RepairWorkCard from './components/RepairWorkCard.vue'
import Empty from './components/Empty.vue'

const router = useRouter()

// 标签页
const activeTab = ref('dispatch')

// 筛选条件
const filters = [
  { label: '全部', value: 'all' },
  { label: '今天', value: 'today' },
  { label: '7天内', value: 'week' },
  { label: '我的', value: 'mine' }
]
const activeFilter = ref('all')

// 列表数据
const workOrderList = ref([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const currentPage = ref(1)

// 模拟数据
const mockData = {
  dispatch: [
    {
      id: 1,
      orderNo: '3318938923892839283',
      tag: '外返',
      status: 'pending',
      statusText: '待派工',
      plateNumber: '浙AA12345',
      vehicleModel: 'B10-510激光雷达版 · LFV3H6686RKYM3393',
      owner: '王小虎',
      manager: '王小丫',
      expectedDelivery: '2026-03-20 17:30',
      createTime: '2026-03-02 10:23',
      repairItems: [
        {
          name: '更换或拆装更换或更换或拆装更换或拆装气门嘴总成气门嘴总成拆装气门嘴总成气门嘴总成',
          station: '0001',
          technician: '云佩玉',
          status: 'pending'
        },
        {
          name: '更换或拆装气门嘴总成',
          station: '0001',
          technician: '云佩玉',
          status: 'working'
        }
      ]
    },
    {
      id: 2,
      orderNo: '3318938923892839284',
      tag: '内返',
      status: 'pending',
      statusText: '待派工',
      plateNumber: '浙BB67890',
      vehicleModel: 'C11-650性能版 · LFV3H6686RKYM3394',
      owner: '李明',
      manager: '张三',
      expectedDelivery: '2026-03-21 18:00',
      createTime: '2026-03-03 09:15',
      repairItems: []
    }
  ],
  working: [
    {
      id: 1,
      orderNo: '3318938923892839283',
      tag: '外返',
      status: 'pending',
      statusText: '待派工',
      plateNumber: '浙AA12345',
      vehicleModel: 'B10-510激光雷达版 · LFV3H6686RKYM3393',
      owner: '王小虎',
      manager: '王小丫',
      expectedDelivery: '2026-03-20 17:30',
      createTime: '2026-03-02 10:23',
      repairItems: [
        {
          name: '更换或拆装更换或更换或拆装更换或拆装气门嘴总成气门嘴总成拆装气门嘴总成气门嘴总成',
          station: '0001',
          technician: '云佩玉',
          status: 'pending'
        },
        {
          name: '更换或拆装气门嘴总成',
          station: '0001',
          technician: '云佩玉',
          status: 'working'
        }
      ]
    },
    {
      id: 2,
      orderNo: '3318938923892839284',
      tag: '内返',
      status: 'pending',
      statusText: '待派工',
      plateNumber: '浙BB67890',
      vehicleModel: 'C11-650性能版 · LFV3H6686RKYM3394',
      owner: '李明',
      manager: '张三',
      expectedDelivery: '2026-03-21 18:00',
      createTime: '2026-03-03 09:15',
      repairItems: []
    }
  ],
  inspection: [
    {
      id: 2,
      orderNo: '3318938923892839284',
      tag: '内返',
      status: 'pending',
      statusText: '待派工',
      plateNumber: '浙BB67890',
      vehicleModel: 'C11-650性能版 · LFV3H6686RKYM3394',
      owner: '李明',
      manager: '张三',
      expectedDelivery: '2026-03-21 18:00',
      createTime: '2026-03-03 09:15',
      repairItems: []
    }
  ]
}

// 加载数据
const loadData = async(isRefresh = false) => {
  if (isRefresh) {
    currentPage.value = 1
    finished.value = false
  }

  try {
    // 模拟API请求
    await new Promise((resolve) => setTimeout(resolve, 500))

    const tabData = mockData[activeTab.value] || []

    if (isRefresh) {
      workOrderList.value = tabData
    } else {
      workOrderList.value.push(...tabData)
    }

    // 模拟没有更多数据
    if (currentPage.value >= 2) {
      finished.value = true
    } else {
      currentPage.value++
    }
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

// 下拉刷新
const onRefresh = () => {
  refreshing.value = true
  loadData(true)
}

// 上拉加载
const onLoad = () => {
  if (!refreshing.value) {
    loading.value = true
    loadData()
  }
}

// 切换筛选
const handleFilterChange = (value) => {
  activeFilter.value = value
  onRefresh()
}

// 搜索
const handleSearch = () => {
  router.push('/repairWork/search')
}

// 维修项目操作
const handleDeleteItem = (workOrder, item) => {
  console.log('删除维修项目:', workOrder, item)
}

const handleStartItem = (workOrder, item) => {
  console.log('开始维修项目:', workOrder, item)
}

const handleEndItem = (workOrder, item) => {
  console.log('结束维修项目:', workOrder, item)
}

const handleQualityItem = (workOrder, item) => {
  console.log('质检维修项目:', workOrder, item)
}

// 工单操作
const handleDeleteWork = (workOrder) => {
  console.log('删除工单:', workOrder)
}

const handleStartWork = (workOrder) => {
  console.log('开始工单:', workOrder)
}

const handleDispatch = (workOrder) => {
  console.log('派工:', workOrder)
  // TODO: 打开派工弹窗
}

// 监听标签页切换
watch(activeTab, () => {
  onRefresh()
})
</script>

<style lang="scss" scoped>
.repair-work-page {
  min-height: 100vh;
  background-color: #f5f5f5;

  :deep(.work-tabs) {
    .van-tab {
      font-size: 14px;
      font-weight: 500;
      color: #545454;

      &.van-tab--active {
        color: var(--leap-color-primary);
        font-weight: 600;
      }
    }

    .van-tabs__line {
      background-color: var(--leap-color-primary);
      height: 2px;
      border-radius: 2px;
    }
  }

  .filter-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background-color: #fff;

    .filter-tabs {
      display: flex;
      gap: 8px;

      .filter-tab {
        height: 30px;
        padding: 2px 16px;
        background-color: var(--leap-color-default-light-5);
        border: 1px solid var(--leap-color-default-light-5);
        border-radius: 4px;
        font-family:
          'PingFang SC',
          -apple-system,
          BlinkMacSystemFont,
          sans-serif;
        font-size: 12px;
        font-weight: 400;
        line-height: 24px;
        color: var(--leap-color-default);
        cursor: pointer;
        transition: all 0.3s;

        &.active {
          background-color: transparent;
          border: 1px solid var(--leap-color-primary);
          color: var(--leap-color-primary);
        }
      }
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: 4px;
      height: 30px;
      padding: 0 12px 0 8px;
      background-color: var(--leap-color-default-light-5);
      border-radius: 80px;
      cursor: pointer;

      .search-text {
        font-family:
          'PingFang SC',
          -apple-system,
          BlinkMacSystemFont,
          sans-serif;
        font-size: 12px;
        font-weight: 400;
        line-height: 20px;
        color: var(--leap-color-default);
      }
    }
  }

  .refresh-container {
    min-height: calc(100vh - 100px);
    padding: 12px;

    .card-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
  }
}
</style>
