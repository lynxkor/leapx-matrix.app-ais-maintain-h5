<template>
  <div class="reception-work-order">
    <div class="sticky-header">
      <!-- 筛选搜索头部 -->
      <FilterHeader
        placeholder="输入工单号/车牌号/VIN/车主"
        :showScan="false"
        :showSort="false"
        :filterList="filterList"
        @filterSearch="onFilterSearch"
        @search="onSearch"
      />

      <!-- Tab导航 -->
      <van-tabs v-model:active="activeTab" @change="onTabChange">
        <van-tab title="当天" name="today"></van-tab>
        <van-tab title="7天内" name="week"></van-tab>
        <van-tab title="全部" name="all"></van-tab>
      </van-tabs>
    </div>

    <!-- 列表内容 -->
    <div class="common-scroll-content" ref="scrollEle">
      <RefreshList
        :requestData="requestData"
        :hasNoData="list.length === 0"
        :showResetButton="false"
        @setData="onSetData"
        @onError="onListError"
      >
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
      </RefreshList>
    </div>

    <!-- 底部按钮 -->
    <div class="bottom-bar" v-if="permissionStore.hasPermission('AISMC-app-serviceProxy-addOrUpdate')">
      <div class="create-btn" @click="onCreateOrder">新建施工单</div>
    </div>

    <!-- 全屏Loading -->
    <van-overlay :show="loading">
      <div class="loading-wrapper">
        <van-loading size="24px" vertical color="#009100">请稍候...</van-loading>
      </div>
    </van-overlay>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import FilterHeader from '@/libs/components/FilterHeader.vue'
import { useGlobalStore } from '@/stores/global'
import { usePermissionStore } from '@/stores/permission'
import ListItem from '@/components/ListItem.vue'
import RefreshList from '@/libs/components/RefreshList.vue'
import WorkOrderCard from '@/components/WorkOrderCard.vue'
import { getList } from '@/api/reception'
import { usePageSafeArea } from '@/utils/safeArea'
defineOptions({
  name: 'receptionWorkOrder'
})
const router = useRouter()
const globalStore = useGlobalStore()
const permissionStore = usePermissionStore()
usePageSafeArea({ bodyClass: 'ais-page-nav-safe-area' })
globalStore.getEnumData()
const loading = ref(false)
// 记录上一次实际加载列表时所用的查询条件（关键字+筛选+Tab），用于判断 RefreshList 是否会去重跳过
const lastQueryKey = ref('')

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
      { label: '已作废', value: 210 }
    ]
  }
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
    itemFlag: 1,
    sortColumns: [
      // {
      //   column: 'order_status',
      //   sort: 'ASC'
      // },
      {
        column: 'create_time',
        sort: 'DESC'
      }
    ],
    ...searchParams.value
  }
  if (activeTab.value === 'today') {
    data.createTimeStart = formatDate(todayStart)
    data.createTimeEnd = formatDate(todayEnd)
  } else if (activeTab.value === 'week') {
    data.createTimeStart = formatDate(weekAgo)
    data.createTimeEnd = formatDate(todayEnd)
  } else if (activeTab.value === 'all') {
    // all 不传日期参数，删除这两个字段
    delete data.createTimeStart
    delete data.createTimeEnd
  }
  return {
    api: getList,
    data
  }
})

// 当前查询条件快照（关键字+筛选+Tab）。不含 requestData 里随时间变化的日期字符串，
// 仅用于判断两次查询的条件是否一致
const queryKey = () => JSON.stringify({ ...searchParams.value, tab: activeTab.value })

// 触发查询：RefreshList 内部 watch 会在 requestData 变化时发请求，完成后通过 setData 关闭 loading。
// 若条件与上次实际加载一致，watch 会去重跳过（不发请求、不回调），此处兜底关闭 loading，避免遮罩卡死。
const triggerRefresh = () => {
  loading.value = true
  nextTick(() => {
    if (queryKey() === lastQueryKey.value) {
      loading.value = false
    }
  })
}

// 搜索事件
const onFilterSearch = (params) => {
  // 叠加而非覆盖：保留关键字，同时套用筛选条件
  searchParams.value = { ...searchParams.value, ...params }
  triggerRefresh()
}
const onSearch = (e) => {
  searchParams.value = {
    ...searchParams.value,
    appSearchKeyWord: e.searchValue
  }
  triggerRefresh()
}

// Tab切换
const onTabChange = (e) => {
  activeTab.value = e
  triggerRefresh()
}

// 设置列表数据
const onSetData = (data) => {
  if (data.isRefresh) {
    list.value = data.list
    lastQueryKey.value = queryKey()
  } else {
    list.value.push(...data.list)
  }
  loading.value = false
}

// 列表请求错误处理
const onListError = (msg) => {
  loading.value = false
  showToast(msg)
}

// 卡片点击
const onCardClick = (item) => {
  // 已交车(180)或已作废(210)跳转到详情页，其他（含已生成结算单）跳转到编辑页
  const path =
    item.orderStatus === 180 || item.orderStatus === 210
      ? '/reception/work-order/detail'
      : '/reception/work-order/edit'
  router.push({
    path,
    query: { id: item.id }
  })
}

// 新建施工单
const onCreateOrder = () => {
  router.push('/reception/work-order-search')
}

onMounted(() => {

})
</script>

<style lang="scss" scoped>
.reception-work-order {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f7f7f7;
  overflow: hidden;

  .sticky-header {
    flex-shrink: 0;
    background: #ffffff;
  }

  :deep(.van-tabs) {
    flex-shrink: 0;
  }

  :deep(.van-tabs__nav) {
    background: #ffffff;
  }

  .common-scroll-content {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding-bottom: 12px;

    :deep(.pull-refresh-content) {
      min-height: 100%;
    }

    :deep(.van-list-content) {
      // 确保底部留白，最后一张卡片能完整展示
      padding-bottom: 12px;
    }
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
.bottom-bar {
  flex-shrink: 0;
  background: #ffffff;
  display: flex;
  justify-content: center;
  padding: 7px 12px calc(40px + env(safe-area-inset-bottom));

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
