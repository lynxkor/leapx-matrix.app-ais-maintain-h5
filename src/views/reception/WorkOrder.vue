<template>
  <div class="reception-work-order">
    <!-- 筛选搜索头部 -->
    <FilterHeader
      placeholder="输入工单号/车牌号/VIN/车主"
      :showScan="true"
      :showSort="false"
      :filterList="filterList"
      @filterSearch="onFilterSearch"
      @search="onSearch"
    />

    <!-- Tab导航 -->
    <van-tabs v-model:active="activeTab" sticky offset-top="46px" @change="onTabChange">
      <van-tab title="当天" name="today"></van-tab>
      <van-tab title="7天内" name="week"></van-tab>
      <van-tab title="全部" name="all"></van-tab>
    </van-tabs>

    <!-- 列表内容 -->
    <div class="common-scroll-content" ref="scrollEle">
      <RefreshList
        :requestData="requestData"
        :needRefresh="needRefresh"
        @setData="onSetData"
        @onError="onListError"
      >
        <div v-if="list.length > 0">
          <list-item
            v-for="item in list"
            :key="item.id"
            class="work-order-card"
            @click="onCardClick(item)"
          >
            <template #card-info>
              <WorkOrderCard :item="item" />
            </template>
          </list-item>
        </div>
        <div v-else class="no-list">
          <img src="@/assets/image/noList.png" alt="" />
        </div>
      </RefreshList>
    </div>

    <!-- 底部按钮 -->
    <div class="bottom-bar">
      <div class="create-btn" @click="onCreateOrder">新建施工单</div>
    </div>

    <!-- 全屏Loading -->
    <van-overlay :show="loading && isExplicitRefresh">
      <div class="loading-wrapper">
        <van-loading size="24px" vertical color="#009100">请稍候...</van-loading>
      </div>
    </van-overlay>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import FilterHeader from '@/libs/components/FilterHeader.vue'
import { useGlobalStore } from '@/stores/global'
import ListItem from '@/components/ListItem.vue'
import RefreshList from '@/libs/components/RefreshList.vue'
import WorkOrderCard from '@/components/WorkOrderCard.vue'
import { getList, getEquityList } from '@/api/reception'

const router = useRouter()
const globalStore = useGlobalStore()
globalStore.getEnumData()
const needRefresh = ref(false)
const loading = ref(false)
const isExplicitRefresh = ref(false) // 是否显式刷新（搜索/Tab切换）

// Tab状态
const activeTab = ref('today')

// 搜索参数
const searchParams = ref({})

// 列表数据
const list = ref([])

// 筛选配置
const filterList = ref([
  {
    title: '工单状态',
    key: 'orderStatusList',
    nodeType: 'multiple',
    options: [
      { label: '接车预检中', value: 100 },
      { label: '制单中', value: 110 },
      { label: '待派工', value: 120 },
      { label: '施工中', value: 140 },
      { label: '待终检', value: 150 },
      { label: '待交车', value: 160 },
      { label: '已交车', value: 180 },
      { label: '反结算', value: 200 },
      { label: '已作废', value: 210 },
    ],
  },
  // {
  //   title: '维修类型',
  //   key: 'repairItemTypeDetailCollect',
  //   nodeType: 'multiple',
  //   options: [
  //     { label: '一般维修', value: '898A364C-DD79-EC11-B0F9-9216EACB73F2' },
  //     { label: '钣喷', value: '1073B058-DD79-EC11-B0F9-9216EACB73F2' },
  //     { label: '美容，装潢', value: '137F5860-DD79-EC11-B0F9-9216EACB73F2' },
  //     { label: '精品附件', value: '9C938267-DD79-EC11-B0F9-9216EACB73F2' },
  //     { label: '三电维修', value: 'EC34606E-DD79-EC11-B0F9-9216EACB73F2' },
  //     { label: '保养', value: '6EA3066F-82AC-E911-B0BB-FC82BA5F9EDF' },
  //     { label: '保修', value: '019D2E08-67B6-75D9-ACC4-9A832B44F9E9' },
  //   ],
  // },
])

// 请求参数
const requestData = computed(() => {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
  const weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0)

  const formatDate = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }

  const data = {
    pageNum: 1,
    pageSize: 10,
    ...searchParams.value,
  }
  console.log('data', data, activeTab.value)
  if (activeTab.value === 'today') {
    data.createTimeStart = formatDate(todayStart)
    data.createTimeEnd = formatDate(todayEnd)
  } else if (activeTab.value === 'week') {
    data.createTimeStart = formatDate(weekAgo)
    data.createTimeEnd = formatDate(todayEnd)
  } else if (activeTab.value === 'all') {
    // all 不传日期参数，同时清除可能存在的旧日期值
    data.createTimeStart = null
    data.createTimeEnd = null
  }
  return {
    api: getList,
    data,
  }
})

// 搜索事件
const onFilterSearch = (params) => {
  searchParams.value = params
  loading.value = true
  isExplicitRefresh.value = true
  needRefresh.value = true
}
const onSearch = (e) => {
  searchParams.value = {
    ...searchParams.value,
    appSearchKeyWord: e.searchValue,
  }
  loading.value = true
  isExplicitRefresh.value = true
  needRefresh.value = true
}

// Tab切换
const onTabChange = (e) => {
  activeTab.value = e
  loading.value = true
  isExplicitRefresh.value = true
  needRefresh.value = true
}

// 设置列表数据
const onSetData = (data) => {
  if (data.isRefresh) {
    list.value = data.list
  } else {
    list.value.push(...data.list)
  }
  needRefresh.value = false
  loading.value = false
  isExplicitRefresh.value = false
}

// 列表请求错误处理
const onListError = (msg) => {
  loading.value = false
  isExplicitRefresh.value = false
  showToast(msg)
}

// 卡片点击
const onCardClick = (item) => {
  // 已交车(180)或已作废(210), 已生成结算单(1)跳转到详情页，其他跳转到编辑页
  const path =
    item.orderStatus === 180 || item.orderStatus === 210 || item.isCreateStatementInfo == 1
      ? '/reception/work-order/detail'
      : '/reception/work-order/edit'
  router.push({
    path,
    query: { id: item.id },
  })
}

// 新建施工单
const onCreateOrder = () => {
  router.push('/reception/work-order-search')
}

onMounted(() => {
  getEquityList().then((res) => {
    console.log(res)
  })
})
</script>

<style lang="scss" scoped>
.reception-work-order {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f7f7f7;

  :deep(.van-tabs) {
    flex-shrink: 0;
  }

  :deep(.van-tabs__nav) {
    background: #ffffff;
  }
  .common-scroll-content {
    overflow-y: auto;
    height: calc(90% - 36px);
  }
}

.work-order-card {
  background: #ffffff;
  border-radius: 8px;
  margin-top: 12px;
  padding: 12px;
  box-shadow: 0px 0px 4px 0px rgba(57, 61, 58, 0.1);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .order-no {
      font-size: 14px;
      font-weight: 500;
      color: #191a1b;
    }

    .status-tag {
      font-size: 12px;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 500;
      &.status-pending {
        color: #c8a12b;
      }

      &.status-completed {
        color: #6c6e6c;
      }
    }
  }

  .vehicle-info {
    margin-bottom: 8px;
    .plate-row {
      display: flex;
      align-items: center;
      margin-bottom: 4px;

      .plate-no {
        font-size: 16px;
        font-weight: 500;
        color: #191a1b;
        margin-right: 8px;
      }

      .tag-list {
        display: flex;
        gap: 4px;
        align-items: center;
        .info-tag {
          font-size: 10px;
          padding: 1px 4px;
          height: 20px;
          background: #fff;
          color: #191a1b;
          border: 0.5px solid #191a1b;
          border-radius: 4px;
        }
      }
    }

    .vehicle-model {
      font-size: 12px;
      color: #545454;
    }
  }

  .detail-info {
    .info-row {
      display: flex;
      align-items: center;
      margin-bottom: 6px;

      &:last-child {
        margin-bottom: 0;
      }

      .label {
        width: 68px;
        font-size: 14px;
        color: #545454;
        flex-shrink: 0;
      }

      .value-wrapper {
        display: flex;
        align-items: center;
        gap: 8px;

        .value {
          font-size: 14px;
          color: #191a1b;
        }

        .appointment-tag {
          font-size: 10px;
          padding: 1px 4px;
          border-radius: 4px;
          background: #f2f2f2;
          color: #191a1b;
        }
      }

      .value {
        font-size: 14px;
        color: #191a1b;
      }
    }
  }
}
.no-list {
  height: 45vh;
  text-align: center;
  line-height: 40;
}
.bottom-bar {
  flex-shrink: 0;
  height: 80px;
  background: #ffffff;
  display: flex;
  justify-content: center;
  padding: 7px 12px 0;

  .create-btn {
    width: 100%;
    height: 40px;
    background: #009100;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.loading-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 70%;
}
</style>
