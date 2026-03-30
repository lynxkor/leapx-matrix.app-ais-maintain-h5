<template>
  <div class="search-page">
    <!-- 搜索头部 -->
    <div class="search-header">
      <!-- 返回按钮 -->
      <div class="back-btn" @click="handleBack">
        <van-icon name="arrow-left" size="24" color="#191A1B" />
      </div>

      <!-- 搜索输入框 -->
      <div class="search-input-wrapper">
        <div class="search-input-container">
          <van-icon name="search" size="16" color="#191A1B" class="search-icon" />
          <input
            v-model="searchValue"
            type="search"
            class="search-input"
            placeholder="输入施工单号/VIN/车牌/车主"
            placeholder-style="color: #888888;"
          />
          <!-- 搜索按钮 -->
          <div class="search-btn" @click="handleSearch">
            搜索
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索结果列表 -->
    <div class="search-result" v-if="hasSearched">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
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
              :active-tab="activeTab"
            />
          </div>
        </van-list>
      </van-pull-refresh>

      <!-- 空状态 -->
      <Empty v-if="!loading && workOrderList.length === 0" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useGlobalStore } from '@/stores/global'
import { goBack } from '@/libs/utils/app'
import RepairWorkCard from './components/RepairWorkCard.vue'
import Empty from './components/Empty.vue'

const globalStore = useGlobalStore()

// 设置页面标题
globalStore.title = '搜索'

// 搜索相关
const searchValue = ref('')
const activeTab = ref('dispatch')
const hasSearched = ref(false)

// 列表数据
const workOrderList = ref([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const currentPage = ref(1)

// 返回
const handleBack = () => {
  goBack()
}

// 搜索
const handleSearch = () => {
  const value = searchValue.value.trim()
  if (!value) {
    return
  }

  hasSearched.value = true
  loadData(true)
}

// 加载数据
const loadData = async(isRefresh = false) => {
  if (isRefresh) {
    currentPage.value = 1
    finished.value = false
  }

  loading.value = true

  try {
    // 模拟 API 请求
    await new Promise((resolve) => setTimeout(resolve, 500))

    // 模拟搜索结果
    const mockData = {
      dispatch: [
        {
          id: 1,
          orderNo: '3318938923892839283',
          tag: '外返',
          status: 'pending',
          statusText: '待派工',
          plateNumber: '浙 AA12345',
          vehicleModel: 'B10-510 激光雷达版 · LFV3H6686RKYM3393',
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
          plateNumber: '浙 BB67890',
          vehicleModel: 'C11-650 性能版 · LFV3H6686RKYM3394',
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
          plateNumber: '浙 AA12345',
          vehicleModel: 'B10-510 激光雷达版 · LFV3H6686RKYM3393',
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
          plateNumber: '浙 BB67890',
          vehicleModel: 'C11-650 性能版 · LFV3H6686RKYM3394',
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
          plateNumber: '浙 BB67890',
          vehicleModel: 'C11-650 性能版 · LFV3H6686RKYM3394',
          owner: '李明',
          manager: '张三',
          expectedDelivery: '2026-03-21 18:00',
          createTime: '2026-03-03 09:15',
          repairItems: []
        }
      ]
    }

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
    console.error('搜索失败:', error)
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
</script>

<style lang="scss" scoped>
.search-page {
  min-height: 100vh;
  background-color: #f7f7f7;
}

.search-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background-color: #ffffff;
  box-shadow: 0px 0px 4px 0px rgba(57, 61, 58, 0.1);
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  cursor: pointer;
}

.search-input-wrapper {
  flex: 1;
  height: 30px;
}

.search-input-container {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  padding-left: 8px;
  background-color: rgba(216, 216, 216, 0.3);
  border-radius: 15px;
  gap: 6px;
}

.search-icon {
  flex-shrink: 0;
}

.divider {
  font-size: 14px;
  color: var(--leap-color-default);
  font-weight: 300;
}

.search-input {
  flex: 1;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 12px;
  font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, sans-serif;
  color: var(--leap-color-default);

  &::placeholder {
    color: var(--leap-color-default-light-2);
  }
}

.search-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 26px;
  background-color: var(--leap-color-primary);
  border-radius: 13px;
  font-size: 12px;
  font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #ffffff;
  cursor: pointer;
  transition: opacity 0.2s;

  &:active {
    opacity: 0.8;
  }
}

.search-result {
  padding: 12px;

  .card-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
}
</style>
