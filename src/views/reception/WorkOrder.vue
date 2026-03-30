<template>
  <div class="reception-work-order">
    <!-- 筛选搜索头部 -->
    <FilterHeader
      placeholder="输入工单号/车牌号/VIN/车主"
      :showScan="true"
      :showSort="false"
      :filterList="filterList"
      search-page-route="workOrderSearch"
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
      <RefreshList :requestData="requestData" :needRefresh="needRefresh" @setData="onSetData">
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
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import FilterHeader from '@/libs/components/FilterHeader.vue'
import ListItem from '@/components/ListItem.vue'
import RefreshList from '@/libs/components/RefreshList.vue'
import WorkOrderCard from '@/components/WorkOrderCard.vue'
import { getWorkOrderList } from '@/api/workOrder'

const router = useRouter()

const needRefresh = ref(false)

// Tab状态
const activeTab = ref('today')

// 列表数据
const list = ref([])

// 筛选配置
const filterList = ref([
  {
    title: '工单状态',
    key: 'status',
    nodeType: 'single',
    options: [
      { label: '待派工', value: 'pending' },
      { label: '预检中', value: 'pending' },
      { label: '维修中', value: 'pending' },
      { label: '已完成', value: 'completed' }
    ]
  },
  {
    title: '维修类型',
    key: 'repairType',
    nodeType: 'multiple',
    options: [
      { label: '一般维修', value: 'general' },
      { label: '钣金', value: 'sheet_metal' },
      { label: '喷漆', value: 'painting' }
    ]
  }
])

// 请求参数
const requestData = computed(() => ({
  api: getWorkOrderList,
  data: {
    tabType: activeTab.value,
    pageNum: 1,
    pageSize: 10
  }
}))

// 搜索事件
const onSearch = (params) => {
  console.log('搜索参数:', params)
}

// Tab切换
const onTabChange = (name) => {
  console.log('Tab切换:', name)
}

// 设置列表数据
const onSetData = (data) => {
  if (data.isRefresh) {
    list.value = data.list
  } else {
    list.value.push(...data.list)
  }
  needRefresh.value = false
}

// 卡片点击
const onCardClick = (item) => {
  router.push({
    path: '/reception/work-order/detail',
    query: { id: item.id }
  })
}

// 新建施工单
const onCreateOrder = () => {
  router.push('/reception/vehicle-search')
}
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
</style>
