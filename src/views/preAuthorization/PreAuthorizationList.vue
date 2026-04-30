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
        ref="refreshListRef"
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
              <span class="order-no">{{ item.code }}</span>
              <span class="status-tag" :class="getStatusClass(item.approvalStatusLabel)">
                {{ item.approvalStatusLabel }}
              </span>
            </div>
          </template>

          <template #card-info>
            <van-row class="card-info">
              <van-col span="24" class="card-info-col">
                <span class="card-info-title">VIN</span>
                <span class="card-info-des">{{ item.vehProfileVin }}</span>
              </van-col>
              <van-col span="24" class="card-info-col">
                <span class="card-info-title">门店名称</span>
                <span class="card-info-des">{{ item.dealerName }}</span>
              </van-col>
              <van-col span="24" class="card-info-col">
                <span class="card-info-title">保修时间</span>
                <span class="card-info-des"
                  >{{ item.guaranteeStartDate }} - {{ item.warrantyEndTime }}</span
                >
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
                <span class="card-info-des">{{ item.creatorName }}</span>
              </van-col>
              <van-col span="24" class="card-info-col">
                <span class="card-info-title">预交时间</span>
                <span class="card-info-des">{{ item.estimateDeliverTime }}</span>
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
import { ref, reactive, onMounted, onActivated, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import FilterHeader from '@/libs/components/FilterHeader.vue'
import RefreshList from '@/libs/components/RefreshList.vue'
import ListItem from '@/components/ListItem.vue'
import AisButton from '@/components/AisButton.vue'
import { preAuthPage, preAuthGetStoreArea } from '@/api/authorization'
import { callPhone } from '@/libs/utils/nativeFn'

const router = useRouter()

// 定义 onBeforeBack，点击返回时直接退出 WebView
const onBeforeBack = () => {
  // 调用原生方法退出 WebView
  const navigatorType = navigator.userAgent.toLowerCase()
  if (navigatorType.includes('android')) {
    if (window.Android && window.Android.goback) {
      window.Android.goback()
    }
  } else if (navigatorType.includes('iphone') || navigatorType.includes('ipad')) {
    if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.revert) {
      window.webkit.messageHandlers.revert.postMessage(null)
    }
  } else {
    window.close()
  }
}

// 暴露给 baseLayout
defineExpose({
  onBeforeBack
})

// 响应式数据
const activeTab = ref('all')
const dataList = ref([])
const showEmpty = ref(false)
const filterHeaderRef = ref(null)
const refreshListRef = ref(null)

// FilterHeader 配置
const filterList = ref([
  {
    title: '门店所属区域',
    key: 'dealerUnitIdList',
    nodeType: 'multiple',
    default: [],
    options: []
  },
  {
    title: '预授权类型',
    key: 'preAuthTypeList',
    nodeType: 'multiple',
    default: [],
    options: [
      { label: '技术预授权', value: 1 },
      { label: '保修预授权', value: 2 }
    ]
  }
])

// 获取门店所属区域数据
const getStoreAreaOptions = async() => {
  try {
    const res = await preAuthGetStoreArea()
    if (res?.data) {
      filterList.value[0].options = res.data.map((item) => ({
        label: item.orgName,
        value: item.orgCode
      }))
    }
  } catch (error) {
    console.error('获取门店所属区域失败', error)
  }
}

onMounted(() => {
  getStoreAreaOptions()
})

// 当从其他页面返回时（keepAlive），滚动到顶部并刷新列表
onActivated(() => {
  nextTick(() => {
    // 滚动到顶部
    const container = document.querySelector('.layout-content')
    if (container) {
      container.scrollTo({ top: 0, behavior: 'instant' })
    }
    // 刷新列表数据
    if (refreshListRef.value) {
      requestData.data.pageNum = 1
      refreshListRef.value.search(requestData.data)
    }
  })
})

// requestData 配置
const requestData = reactive({
  data: {
    pageNum: 1,
    pageSize: 10,
    dealerUnitIdList: [],
    preAuthTypeList: [],
    appSearchKeyWord: ''
  },
  api: (params) => preAuthPage(params)
})

// 方法定义
const onSearch = (params) => {
  // 更新 requestData.data 中的搜索关键词，但不触发自动查询
  requestData.data = {
    ...requestData.data,
    appSearchKeyWord: params.searchValue,
    pageNum: 1
  }
  // 手动触发搜索
  if (refreshListRef.value) {
    refreshListRef.value.search(requestData.data)
  }
}

const onFilterSearch = (filterParams) => {
  // 点击开始筛选时，手动调用 RefreshList 的 search 方法触发查询
  if (refreshListRef.value) {
    refreshListRef.value.search({
      ...requestData.data,
      ...filterParams,
      pageNum: 1
    })
  }
}

const setData = (res) => {
  // RefreshList emit: { list: records, isRefresh: current === 1 }
  const list = res?.list || []
  if (res?.isRefresh) {
    dataList.value = [...list]
  } else {
    dataList.value.push(...list)
  }
  showEmpty.value = dataList.value.length === 0
}

const resetFilters = () => {
  activeTab.value = 'all'
  requestData.data = {
    pageNum: 1,
    pageSize: 10,
    dealerUnitIdList: [],
    preAuthTypeList: [],
    appSearchKeyWord: ''
  }
  showEmpty.value = false
}

const handleResetFilter = () => {
  activeTab.value = 'all'
  requestData.data = {
    pageNum: 1,
    pageSize: 10,
    dealerUnitIdList: [],
    preAuthTypeList: [],
    appSearchKeyWord: ''
  }
  showEmpty.value = false
  // 重置 FilterHeader 的筛选条件
  if (filterHeaderRef.value) {
    filterHeaderRef.value.resetFilters()
  }
}

const getStatusClass = (label) => {
  if (!label) return ''
  if (label === '未提交') return 'status-blue'
  if (label === '审核中') return 'status-yellow'
  if (label === '审核通过') return 'status-green'
  if (label === '已驳回' || label === '已拒绝') return 'status-red'
  return ''
}

const handleContact = (item) => {
  const phone = item.creatorMobile
  if (phone) {
    callPhone(phone)
  } else {
    showToast('暂无联系电话')
  }
}

const goToDetail = (item) => {
  router.push(`/pre-authorization/detail/${item.id}`)
}

const createAuthorization = () => {
  router.push('/pre-authorization/create')
}
</script>

<style lang="scss" scoped>
.pre-auth-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-bottom: 89px;
  background-color: #f5f5f5;

  &::-webkit-scrollbar {
    display: none;
  }

  .filter-fixed {
    position: sticky;
    top: 0;
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
    padding: 12px 12px 77px 12px;
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
      font-weight: 600;
      color: #191a1b;
    }

    .status-tag {
      font-family: 'PingFang SC';
      font-size: 12px;
      font-weight: 600;
    }
  }

  .card-info {
    box-sizing: border-box;
    margin-top: 8px;
    display: flex;
    flex-direction: column;
    gap: 6px;

    .card-info-col {
      font-family: 'PingFang SC';
      font-size: 14px;
      line-height: 20px;
      display: flex;
      gap: 12px;

      .card-info-title {
        color: #545454;
        width: 58px;
        flex-shrink: 0;
      }

      .card-info-des {
        color: #191a1b;
        flex: 1;
        word-break: break-all;
        margin-left: 12px;
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
.status-blue {
  color: #2261dd;
}

.status-yellow {
  color: #c8a12b;
}

.status-green {
  color: #009100;
}

.status-red {
  color: #E43122;
}
</style>
