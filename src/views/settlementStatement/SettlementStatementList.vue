<template>
  <div class="settlement-statement-list">
    <!-- loading 遮罩层 -->
    <van-loading v-if="submitLoading" color="#00AA00" class="page-loading" />

    <!-- 固定顶部区域：标签页 + 快捷筛选 + 搜索 -->
    <div class="header-fixed">
      <!-- 标签页 -->
      <div class="tabs-bar">
        <div
          class="tab-item"
          :class="{ active: activeTab === 'pending' }"
          @click="switchTab('pending')"
        >
          待交车
        </div>
        <div
          class="tab-item"
          :class="{ active: activeTab === 'completed' }"
          @click="switchTab('completed')"
        >
          已交车
        </div>
      </div>

      <!-- 日期筛选标签 + 搜索按钮 -->
      <div class="filter-search-row">
        <!-- 日期筛选标签 -->
        <div class="date-tags">
          <div
            v-for="tag in dateTags"
            :key="tag.value"
            class="date-tag"
            :class="{ active: selectedDateTag === tag.value }"
            @click="selectDateTag(tag.value)"
          >
            {{ tag.label }}
          </div>
        </div>

        <!-- 搜索按钮 -->
        <div class="search-btn" @click="goToSearch">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5.5" stroke="#999" stroke-width="1.3" />
            <path d="M11 11L14 14" stroke="#999" stroke-width="1.3" stroke-linecap="round" />
          </svg>
          <span class="search-text">搜索</span>
        </div>
      </div>
    </div>

    <!-- 列表区域 -->
    <div class="list-container">
      <RefreshList
        ref="refreshListRef"
        :requestData="requestData"
        :has-no-data="dataList.length === 0"
        @setData="setData"
        @resetFilters="resetAll"
      >
        <ListItem
          v-for="item in dataList"
          :key="item.id"
          class="list-item-container"
          @click="goToDetail(item)"
        >
          <template #header>
            <div class="item-header">
              <span class="order-no">{{ item.code }}</span>
              <span class="status-tag" :class="getStatusClass(item.orderStatus)">
                {{ item.orderStatusLabel }}
              </span>
            </div>
          </template>

          <template #card-info>
            <div class="card-body">
              <!-- 车牌行 -->
              <div class="plate-row">
                <span class="plate-number">{{ item.carPlate  || '无车牌'}}</span>
                <!-- 预警图标 - 根据 alarmLevelList 数组显示多个图标: 10=绿色, 20=橙色, 30=红色 -->
                <template v-if="item.alarmLevelList && item.alarmLevelList.length > 0">
                  <svg
                    v-for="(level, index) in item.alarmLevelList"
                    :key="index"
                    class="vehicle-icon"
                    width="16"
                    height="16"
                    viewBox="0 0 15.35 13.88"
                    fill="none"
                  >
                    <path
                      :fill="getAlarmColor(level)"
                      d="M7.3351851 0C7.9718513 0 8.5651855 0.31133342 8.9285183 0.83133328L8.998518 0.93799996L14.407852 9.9700003C15.123848 11.210074 14.297827 12.772247 12.869853 12.878666L12.739853 12.883999L1.9231861 12.883999C0.49417353 12.867918 -0.42892668 11.36636 0.20185265 10.083999L0.26785263 9.9606657L5.6745195 0.93533206C6.0265875 0.35477138 6.6562138 0.00014813742 7.3351851 0ZM7.3418517 8.8866673L7.257185 8.8913336C6.9218178 8.9312248 6.6692615 9.2156019 6.6692615 9.5533333C6.6692615 9.8910656 6.9218178 10.175444 7.257185 10.215334L7.3351851 10.22L7.4198513 10.215334C7.7552185 10.175442 8.0077753 9.8910656 8.0077753 9.5533333C8.0077753 9.2156019 7.7552185 8.9312248 7.4198513 8.8913336L7.3418517 8.8866673ZM7.3351851 4.2200003C6.9972014 4.2200446 6.7127285 4.4730048 6.6731849 4.8086672L6.6685181 4.8866668L6.6685181 7.5533333L6.6731849 7.6313334C6.7130756 7.9667006 6.9974532 8.2192574 7.3351851 8.2192574C7.6729164 8.2192574 7.957294 7.9667006 7.9971848 7.6313334L8.001852 7.5533333L8.001852 4.8866668L7.9971848 4.8086672C7.9576411 4.4730048 7.6731682 4.2200446 7.3351851 4.2200003Z"
                    />
                  </svg>
                </template>
                <!-- 业务类型标签 -->
                  <template v-if="item.repairItemTypeDetailCollect">
                    <div>
                      <span
                        v-for="(tag, index) in item.repairItemTypeDetailCollect.split('/').filter(Boolean)"
                        :key="index"
                        class="svc-tag"
                      >{{ tag }}</span>
                    </div>
                  </template>
              </div>

              <!-- VIN -->
              <div class="vehicle-line">
                {{ item.vehModelName }}
                ·
                {{ item.vehProfileVin }}
                <img
                  v-if="item.vehProfileVin"
                  :src="copyIcon"
                  class="copy-icon"
                  @click.stop="handleCopyVin(item.vehProfileVin)"
                />
              </div>

              <!-- 信息行 -->
              <div class="info-rows">
                <div class="info-row">
                  <span class="info-label">送修人</span>
                  <span class="info-value">{{ item.shuttleName }}</span>
                  <span v-if="item.custType" class="cust-type-tag">{{ { '10': '预约客户', '20': '随到客户' }[item.custType] || item.custType }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">客户经理</span>
                  <span class="info-value">{{ item.creatorName }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">预计交车</span>
                  <span class="info-value">{{ item.expectFinishAt }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">开单时间</span>
                  <span class="info-value">{{ item.createTime }}</span>
                </div>
              </div>
            </div>
          </template>

          <template #btn-content>
            <div class="action-btns">
              <div
                v-if="showCancelBtn(item)"
                class="btn-pill btn-outline"
                @click.stop="handleCancel(item)"
              >
                作废
              </div>
              <div class="btn-pill btn-outline" @click.stop="handleContact(item)">联系车主</div>
              <div
                v-if="activeTab === 'pending' && item.isCreateStatementInfo === 0"
                class="btn-pill btn-primary"
                @click.stop="handleSettle(item)"
              >
                结算
              </div>
            </div>
          </template>
        </ListItem>
      </RefreshList>
    </div>

    <!-- 结算确认弹窗（存在故障） -->
    <AisPopup v-model:show="showSettlePopup" title="结算" position="bottom" round>
      <template #content>
        <div class="question-card">
          <div class="question-text">客户反馈故障是否全部解决</div>
          <div class="option-row">
            <div
              class="option-btn"
              :class="settleOption === 'resolved' ? 'active resolved-active' : ''"
              @click="settleOption = 'resolved'"
            >
              已解决
            </div>
            <div
              class="option-btn"
              :class="settleOption === 'unresolved' ? 'active unresolved-active' : ''"
              @click="settleOption = 'unresolved'"
            >
              未解决
            </div>
          </div>
        </div>

        <!-- 未解决原因单选标签 -->
        <div v-if="settleOption === 'unresolved'" class="reason-card">
          <div class="reason-text">未解决原因</div>
          <div class="reason-tags">
            <div
              v-for="reason in reasonOptions"
              :key="reason.value"
              class="reason-tag"
              :class="{ active: selectedReason === reason.value }"
              @click="selectedReason = reason.value"
            >
              {{ reason.label }}
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="settle-footer">
          <div class="submit-btn" @click="confirmSettle">确认结算</div>
        </div>
      </template>
    </AisPopup>

    <!-- 二次确认弹窗 -->
    <van-dialog
      v-model:show="showConfirmPopup"
      title=" "
      :show-confirm-button="false"
      :show-cancel-button="false"
      class="confirm-dialog-vant"
      close-on-click-overlay
    >
      <div class="confirm-dialog">
        <div class="confirm-text">确定要生成结算单吗？</div>
        <div class="confirm-actions">
          <div class="confirm-btn cancel" @click="showConfirmPopup = false">取消</div>
          <div class="confirm-divider"></div>
          <div class="confirm-btn confirm" @click="executeSettle">确定结算</div>
        </div>
      </div>
    </van-dialog>

    <!-- 活动附件上传提示弹窗 -->
    <van-dialog
      v-model:show="showUploadDialog"
      title=" "
      :show-confirm-button="false"
      :show-cancel-button="false"
      class="confirm-dialog-vant"
      close-on-click-overlay
    >
      <div class="confirm-dialog">
        <div class="confirm-text">需要上传活动附件，请上传后结算</div>
        <div class="confirm-actions">
          <div class="confirm-btn cancel" @click="showUploadDialog = false">取消</div>
          <div class="confirm-divider"></div>
          <div class="confirm-btn confirm" @click="goToUpload">去上传附件</div>
        </div>
      </div>
    </van-dialog>

    <!-- 作废弹窗 -->
    <AisPopup v-model:show="showCancelPopup" title="作废" position="bottom" round>
      <template #content>
        <div class="cancel-card">
          <div class="cancel-text">作废原因</div>
          <van-field
            v-model="cancelReason"
            rows="4"
            autosize
            type="textarea"
            maxlength="500"
            placeholder="请输入作废原因"
            show-word-limit
            class="cancel-textarea"
          />
        </div>
      </template>
      <template #footer>
        <div class="cancel-footer">
          <div class="submit-btn" @click="confirmCancel">确认作废</div>
        </div>
      </template>
    </AisPopup>

    <!-- 作废确认弹窗 -->
    <van-dialog
      v-model:show="showCancelConfirmPopup"
      title=" "
      :show-confirm-button="false"
      :show-cancel-button="false"
      class="confirm-dialog-vant"
      close-on-click-overlay
    >
      <div class="confirm-dialog">
        <div class="confirm-text">确定要作废该工单吗？</div>
        <div class="confirm-actions">
          <div class="confirm-btn cancel" @click="showCancelConfirmPopup = false">取消</div>
          <div class="confirm-divider"></div>
          <div class="confirm-btn confirm" @click="executeCancel">确定作废</div>
        </div>
      </div>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import dayjs from 'dayjs'
import RefreshList from '@/libs/components/RefreshList.vue'
import ListItem from '@/components/ListItem.vue'
import AisPopup from '@/libs/components/AisPopup.vue'
import {
  getSettlementStatementPage,
  cancelServiceProxy,
  addServiceProxyStatement
} from '@/api/settlementStatement'
import { callPhone } from '@/libs/utils/nativeFn'
import { copyText } from '@/libs/utils'
import copyIcon from '@/libs/assets/image/copy_icon.svg'
import { getEnumValue } from '@/libs/api/common'
import { usePageSafeArea } from '@/utils/safeArea'

const router = useRouter()

usePageSafeArea({ bodyClass: 'ais-page-nav-safe-area' })

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

const activeTab = ref('pending')
const searchValue = ref('')
const showEmpty = ref(false)
const selectedDateTag = ref('today')
const showSettlePopup = ref(false)
const showConfirmPopup = ref(false)
const showUploadDialog = ref(false)
const settleOption = ref('resolved')
const selectedReason = ref('')
const currentItem = ref(null)
const refreshListRef = ref(null)
const submitLoading = ref(false)

// 作废相关
const showCancelPopup = ref(false)
const showCancelConfirmPopup = ref(false)
const cancelReason = ref('')
const cancelItem = ref(null)

// 状态映射：tab -> 接口状态值
const statusMap = {
  pending: '160', // 待交车
  completed: '180' // 已交车
}

// 计算日期范围
const getDateRange = (tag) => {
  const today = dayjs()
  let createTimeStart = ''
  let createTimeEnd = ''

  if (tag === 'today') {
    // 今天：从0点开始到23:59:59
    createTimeStart = today.startOf('day').format('YYYY-MM-DD HH:mm:ss')
    createTimeEnd = today.endOf('day').format('YYYY-MM-DD HH:mm:ss')
  } else if (tag === 'week') {
    // 7天内：从今天往前推7天
    createTimeStart = today.subtract(6, 'day').startOf('day').format('YYYY-MM-DD HH:mm:ss')
    createTimeEnd = today.endOf('day').format('YYYY-MM-DD HH:mm:ss')
  }
  // 'all' 传空字符串

  return { createTimeStart, createTimeEnd }
}

// 请求数据
const requestData = reactive({
  data: {
    pageNum: 1,
    pageSize: 10,
    orderStatus: statusMap['pending'],
    appSearchKeyWord: '',
    createTimeStart: '',
    createTimeEnd: '',
    sortColumns: [{ 'column': 'create_time', 'sort': 'DESC' }]
  },
  api: getSettlementStatementPage
})

// 更新请求参数
const updateRequestData = () => {
  const { createTimeStart, createTimeEnd } = getDateRange(selectedDateTag.value)
  Object.assign(requestData.data, {
    pageNum: 1,
    orderStatus: statusMap[activeTab.value],
    appSearchKeyWord: searchValue.value,
    createTimeStart,
    createTimeEnd
  })
}

// 初始化请求参数
updateRequestData()

// 未解决原因选项
const reasonOptions = ref([])

const getReasonOptions = async() => {
  try {
    const res = await getEnumValue('UnresolvedIssueReasonEnum')
    if (res?.data) {
      reasonOptions.value = res.data.map((item) => ({
        label: item.message,
        value: item.code
      }))
    }
  } catch (error) {
    console.error('获取未解决原因枚举失败', error)
  }
}

onMounted(() => {
  getReasonOptions()
  const savedFilter = sessionStorage.getItem('settlementFilter')
  if (savedFilter) {
    try {
      const parsed = JSON.parse(savedFilter)
      if (parsed.tab && (parsed.tab === 'pending' || parsed.tab === 'completed')) {
        if (activeTab.value !== parsed.tab) {
          activeTab.value = parsed.tab
        }
      }
      if (parsed.dateTag && ['today', 'week', 'all'].includes(parsed.dateTag)) {
        if (selectedDateTag.value !== parsed.dateTag) {
          selectedDateTag.value = parsed.dateTag
        }
      }
    } catch {
      // 兼容旧格式（纯字符串）
      if (savedFilter === 'pending' || savedFilter === 'completed') {
        if (activeTab.value !== savedFilter) {
          activeTab.value = savedFilter
        }
      }
    }
    sessionStorage.removeItem('settlementFilter')
    updateRequestData()
  }
})

// 日期筛选标签
const dateTags = [
  { label: '今天', value: 'today' },
  { label: '7天内', value: 'week' },
  { label: '全部', value: 'all' }
]

// 切换日期标签
const selectDateTag = (value) => {
  if (selectedDateTag.value === value) return
  selectedDateTag.value = value
  // 切换日期筛选时重新加载数据（updateRequestData 修改 requestData.data 会触发 RefreshList watch 自动查询）
  updateRequestData()
}

// 切换标签页
const switchTab = (tab) => {
  if (activeTab.value === tab) return
  activeTab.value = tab
  // 切换tab时重新加载数据
  updateRequestData()
}

// 跳转搜索页
const goToSearch = () => {
  router.push({
    name: 'settlementStatementSearch',
    params: { initialValue: searchValue.value || '' },
    query: { tab: activeTab.value }
  })
}

// 刷新列表
const refreshList = () => {
  // 先清空数据状态
  dataList.value = []
  showEmpty.value = false
  // 使用 nextTick 等待组件渲染后再调用 search
  nextTick(() => {
    if (refreshListRef.value) {
      // 使用 search 方法直接传入最新参数
      refreshListRef.value.search(requestData.data)
    }
  })
}

const dataList = ref([])

const setData = (res) => {
  const list = Array.isArray(res.list) ? res.list : []
  if (res.isRefresh) {
    dataList.value = [...list]
  } else {
    dataList.value.push(...list)
  }
  showEmpty.value = dataList.value.length === 0
}

const resetAll = () => {
  searchValue.value = ''
  selectedDateTag.value = 'today'
  // 更新请求参数（修改 requestData.data 会触发 RefreshList watch 自动查询）
  updateRequestData()
}

const getStatusClass = (status) => {
  // 根据orderStatus返回对应样式
  if (status === 160) return 'status-orange'
  if (status === 180) return 'status-green'
  return 'status-gray'
}

// 根据预警等级返回对应颜色
const getAlarmColor = (alarmLevel) => {
  const colorMap = {
    10: '#009100', // 绿色
    20: '#C8A12B', // 橙色
    30: '#B91919' // 红色
  }
  return colorMap[alarmLevel] || '#009100'
}

// 作废按钮展示逻辑：排除已作废(210)、反结算(200)、已生成结算单(isCreateStatementInfo === 1)
const showCancelBtn = (item) => {
  const orderStatus = Number(item.orderStatus)
  // 已作废、反结算不显示
  if (orderStatus === 210 || orderStatus === 200) {
    return false
  }
  // 已生成结算单不显示
  if (item.isCreateStatementInfo === 1) {
    return false
  }
  return true
}

const handleCopyVin = (vin) => {
  copyText(vin)
}

const goToDetail = (item) => {
  // 待交车且未生成结算单时，不能进入详情页
  if (activeTab.value === 'pending' && item.isCreateStatementInfo === 0) {
    showToast('请先完成结算')
    return
  }

  const serviceProxyId = item.serviceProxyId || item.id

  if (!serviceProxyId) {
    showToast('缺少施工单ID')
    return
  }

  const filterParams = { tab: activeTab.value, dateTag: selectedDateTag.value }
  sessionStorage.setItem('settlementFilter', JSON.stringify(filterParams))
  router.push({
    path: '/settlement-statement/after-sales',
    query: {
      serviceProxyId,
      status: activeTab.value,
      dateTag: selectedDateTag.value,
      serviceProxyCode: item.serviceProxyCode || item.code || '',
      vehProfileVin: item.vehProfileVin || ''
    }
  })
}

const handleCancel = (item) => {
  cancelItem.value = item
  cancelReason.value = ''
  showCancelPopup.value = true
}

// 确认作废 - 显示二次确认弹窗
const confirmCancel = () => {
  if (!cancelReason.value.trim()) {
    showToast('请输入作废原因')
    return
  }
  showCancelPopup.value = false
  showCancelConfirmPopup.value = true
}

// 执行作废
const executeCancel = async() => {
  showCancelConfirmPopup.value = false
  try {
    const res = await cancelServiceProxy({
      id: cancelItem.value.id,
      invaildDesc: cancelReason.value.trim()
    })
    if (res.success) {
      showToast('作废成功')
      refreshList()
    } else {
      showToast(res.msg || '作废失败')
    }
  } catch {
    showToast('作废失败')
  }
}

const handleContact = (item) => {
  const phone = item.shuttlePhone
  if (phone) {
    callPhone(phone)
  } else {
    showToast('暂无联系电话')
  }
}

const currentFault = ref(0)

const handleSettle = (item) => {
  currentItem.value = item
  currentFault.value = item.currentFault ?? 0
  settleOption.value = 'resolved'
  selectedReason.value = ''
  if (currentFault.value === 1) {
    showSettlePopup.value = true
  } else {
    showConfirmPopup.value = true
  }
}

const confirmSettle = () => {
  // 非故障进店：直接弹出确认对话框
  if (currentFault.value !== 1) {
    showConfirmPopup.value = true
    return
  }
  // 存在故障：校验未解决原因
  if (settleOption.value === 'unresolved' && !selectedReason.value) {
    showToast('请选择未解决原因')
    return
  }
  showSettlePopup.value = false
  showConfirmPopup.value = true
}

// 执行结算
const executeSettle = async() => {
  showConfirmPopup.value = false
  submitLoading.value = true
  try {
    // 基于列表项数据，添加/修改结算相关字段
    const res = await addServiceProxyStatement({
      ...currentItem.value,
      serviceProxyId: currentItem.value.serviceProxyId || currentItem.value.id,
      faultSolve: settleOption.value === 'resolved' ? 1 : 0,
      faultSolveLabel: settleOption.value === 'resolved' ? '已解决' : '未解决',
      reason: settleOption.value === 'unresolved' ? selectedReason.value : ''
    })
    if (res.success) {
      showToast('结算成功')
      refreshList()
      router.push({
        path: '/settlement-statement/after-sales',
        query: {
          serviceProxyId: currentItem.value.serviceProxyId || currentItem.value.id,
          status: activeTab.value,
          serviceProxyCode: currentItem.value.serviceProxyCode || currentItem.value.code || '',
          vehProfileVin: currentItem.value.vehProfileVin || ''
        }
      })
    } else {
      showToast(res.msg || '结算失败')
    }
  } catch {
    showToast('结算失败')
  } finally {
    submitLoading.value = false
  }
}

const goToUpload = () => {
  showUploadDialog.value = false
  showToast('去上传附件')
}
</script>

<style lang="scss" scoped>
.settlement-statement-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  overflow: hidden;
  height: 100%;
  min-height: 0;
  overscroll-behavior: contain;

  &::-webkit-scrollbar {
    display: none;
  }

  // 页面加载中样式
  .page-loading {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.7);
  }

  .header-fixed {
    flex-shrink: 0;
    background: #ffffff;
  }

  .tabs-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 40px;
    height: 44px;
    background: #ffffff;

    .tab-item {
      position: relative;
      font-family: 'PingFang SC';
      font-size: 16px;
      color: #999999;
      line-height: 22px;
      padding-bottom: 6px;
      cursor: pointer;

      &.active {
        font-weight: 500;
        color: #191a1b;

        &::after {
          content: '';
          position: absolute;
          left: 50%;
          bottom: 0;
          transform: translateX(-50%);
          width: 20px;
          height: 3px;
          background: #009100;
          border-radius: 2px;
        }
      }
    }
  }

  .filter-search-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 12px 12px;
    background: #ffffff;

    .date-tags {
      display: flex;
      align-items: center;
      gap: 8px;

      .date-tag {
        padding: 5px 16px;
        font-family: 'PingFang SC';
        font-size: 12px;
        color: #191a1b;
        background: #f8f7f7;
        border-radius: 4px;
        border: 1px solid transparent;
        cursor: pointer;

        &.active {
          color: #009100;
          background: rgba(0, 145, 0, 0.08);
          border-color: #009100;
        }
      }
    }

    .search-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 0 12px 0 8px;
      height: 30px;
      background: #f8f7f7;
      border-radius: 80px;
      cursor: pointer;

      .search-icon {
        flex-shrink: 0;
      }

      .search-text {
        font-family: 'PingFang SC';
        font-size: 12px;
        color: #999999;
        white-space: nowrap;
      }
    }
  }

  .list-container {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 12px 12px 20px;
    overscroll-behavior-y: contain;
    -webkit-overflow-scrolling: touch;
  }

  :deep(.pull-refresh-content) {
    min-height: 100%;
  }

  .list-item-container {
    margin-bottom: 12px;
    background: #ffffff;
    border-radius: 6px;
    padding: 12px;

    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding-bottom: 8px;
      border-bottom: 0.5px solid #e6e6e5;

      .order-no {
        font-family: 'PingFang SC';
        font-size: 14px;
        color: #191a1b;
      }

      .status-tag {
        font-family: 'PingFang SC';
        font-size: 12px;
        font-weight: 500;

        &.status-orange {
          color: #c8a12b;
        }

        &.status-green {
          color: #009100;
        }

        &.status-gray {
          color: #999999;
        }
      }
    }

    .card-body {
      padding-top: 8px;

      .plate-row {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-bottom: 2px;
        flex-wrap: nowrap;
        overflow: visible;

        .plate-number {
          font-family: 'PingFang SC';
          font-size: 16px;
          font-weight: 500;
          color: #191a1b;
          white-space: nowrap;
        }

        .vehicle-icon {
          width: 16px;
          height: 16px;
          cursor: pointer;
          flex-shrink: 0;
        }

        .svc-tag {
          padding: 1px 4px;
          font-family: 'PingFang SC';
          font-size: 12px;
          color: #191a1b;
          background: #ffffff;
          border: 0.5px solid #191a1b;
          border-radius: 4px;
          flex-shrink: 0;
          white-space: nowrap;
          margin: 0 3px;
        }
      }

      .vehicle-line {
        font-family: 'PingFang SC';
        font-size: 12px;
        color: #545454;
        margin-bottom: 8px;
        display: flex;
        align-items: center;

        .copy-icon {
          width: 14px;
          height: 14px;
          margin-left: 2px;
          cursor: pointer;
          flex-shrink: 0;
        }
      }

      .info-rows {
        display: flex;
        flex-direction: column;
        gap: 6px;

        .info-row {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;

          .info-label {
            color: #545454;
            width: 56px;
            flex-shrink: 0;
          }

          .info-value-wrap {
            display: flex;
            align-items: center;
            gap: 4px;
            flex: 1;
          }

          .info-value {
            color: #191a1b;
            margin-left: 12px;
          }

          .cust-type-tag {
            padding: 1px 4px;
            font-family: 'PingFang SC';
            font-size: 12px;
            color: #191a1b;
            background: rgba(25, 26, 27, 0.06);
            border-radius: 4px;
          }
        }
      }
    }

    .action-btns {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 8px;
      padding-top: 8px;

      .btn-pill {
        padding: 0 16px;
        height: 32px;
        font-family: 'PingFang SC';
        font-size: 14px;
        border-radius: 38px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }

      .btn-outline {
        color: #009100;
        background: #ffffff;
        border: 1px solid #009100;
      }

      .btn-primary {
        color: #ffffff;
        background: #009100;
        border: 1px solid #009100;
      }
    }
  }
}

// 结算弹窗
.question-card {
  background: #ffffff;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;

  .question-text {
    font-family: 'PingFang SC';
    font-size: 14px;
    font-weight: 500;
    color: #191a1b;
    margin-bottom: 12px;
  }

  .option-row {
    display: flex;
    gap: 8px;

    .option-btn {
      padding: 0 16px;
      height: 32px;
      font-family: 'PingFang SC';
      font-size: 14px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;

      // 已解决按钮默认样式
      &:first-child {
        color: #191a1b;
        background: #f8f7f7;
        border: 1px solid transparent;
      }

      // 未解决按钮默认样式
      &:last-child {
        color: #191a1b;
        background: #f8f7f7;
        border: 1px solid transparent;
      }
    }

    // 已解决选中状态
    .resolved-active {
      color: #009100 !important;
      border-color: #009100 !important;
      background: rgba(0, 145, 0, 0.08) !important;
    }

    // 未解决选中状态
    .unresolved-active {
      color: #009100 !important;
      border-color: #009100 !important;
      background: rgba(0, 145, 0, 0.08) !important;
    }
  }
}

// 未解决原因卡片
.reason-card {
  background: #ffffff;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;

  .reason-text {
    font-family: 'PingFang SC';
    font-size: 14px;
    font-weight: 500;
    color: #191a1b;
    margin-bottom: 12px;
  }

  .reason-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .reason-tag {
      padding: 0 12px;
      height: 32px;
      font-family: 'PingFang SC';
      font-size: 14px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #191a1b;
      background: #f8f7f7;
      border: 1px solid transparent;

      &.active {
        color: #009100;
        border-color: #009100;
        background: rgba(0, 145, 0, 0.08);
      }
    }
  }
}

// 结算弹窗高度
:deep(.popup) {
  height: 602px !important;
}

// 作废弹窗高度
:deep(.popup.cancel-popup) {
  height: 280px !important;
}

.settle-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  .submit-btn {
    width: 100%;
    height: 40px;
    background: #009100;
    border-radius: 8px;
    font-family: 'PingFang SC';
    font-size: 14px;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
}

// 作废弹窗样式
.cancel-card {
  background: #ffffff;
  border-radius: 6px;
  padding: 12px;

  .cancel-text {
    font-family: 'PingFang SC';
    font-size: 14px;
    font-weight: 500;
    color: #191a1b;
    margin-bottom: 12px;
  }

  .cancel-textarea {
    background: #f8f7f7;
    border-radius: 6px;
    padding: 12px;

    :deep(.van-field__control) {
      background: transparent;
    }
  }
}

.cancel-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  .submit-btn {
    width: 100%;
    height: 40px;
    background: #009100;
    border-radius: 8px;
    font-family: 'PingFang SC';
    font-size: 14px;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
}

// 二次确认弹窗
.confirm-dialog {
  background: #ffffff;
  border-radius: 8px;
  overflow: hidden;

  .confirm-text {
    height: 80px;
    display: flex;
    justify-content: center;
    font-family: 'PingFang SC';
    font-size: 16px;
    color: #222222;
    padding: 0 24px;
  }

  .confirm-actions {
    height: 54px;
    display: flex;
    align-items: center;
    border-top: 0.5px solid #e6e6e5;

    .confirm-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'PingFang SC';
      font-size: 14px;
      cursor: pointer;

      &.cancel {
        color: #222222;
      }

      &.confirm {
        color: #009100;
      }
    }

    .confirm-divider {
      width: 0.5px;
      height: 54px;
      background: #e6e6e5;
    }
  }
}

:deep(.confirm-dialog-vant) {
  width: 295px;
  background: #ffffff;
  border-radius: 8px;
  padding: 0;

  .van-dialog__content {
    padding: 0;
  }
}
</style>
