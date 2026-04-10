<template>
  <div class="settlement-statement-list">
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
      <!-- 空状态（筛选导致） -->
      <div v-if="showEmpty" class="empty-state">
        <img class="empty-image" src="@/libs/assets/image/no-data.png" alt="没有数据" />
        <p class="empty-text">没有找到相关内容</p>
        <van-button plain type="primary" size="normal" class="reset-btn" @click="resetAll">
          重置筛选
        </van-button>
      </div>

      <RefreshList
        v-else
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
                <span class="plate-number">{{ item.carPlate }}</span>
                <!-- 预警图标 - 根据 alarmLevel 显示不同颜色: 10=绿色, 20=橙色, 30=红色 -->
                <svg
                  v-if="item.alarmLevel"
                  class="vehicle-icon"
                  width="16"
                  height="16"
                  viewBox="0 0 15.35 13.88"
                  fill="none"
                >
                  <path :fill="getAlarmColor(item.alarmLevel)" d="M7.3351851 0C7.9718513 0 8.5651855 0.31133342 8.9285183 0.83133328L8.998518 0.93799996L14.407852 9.9700003C15.123848 11.210074 14.297827 12.772247 12.869853 12.878666L12.739853 12.883999L1.9231861 12.883999C0.49417353 12.867918 -0.42892668 11.36636 0.20185265 10.083999L0.26785263 9.9606657L5.6745195 0.93533206C6.0265875 0.35477138 6.6562138 0.00014813742 7.3351851 0ZM7.3418517 8.8866673L7.257185 8.8913336C6.9218178 8.9312248 6.6692615 9.2156019 6.6692615 9.5533333C6.6692615 9.8910656 6.9218178 10.175444 7.257185 10.215334L7.3351851 10.22L7.4198513 10.215334C7.7552185 10.175442 8.0077753 9.8910656 8.0077753 9.5533333C8.0077753 9.2156019 7.7552185 8.9312248 7.4198513 8.8913336L7.3418517 8.8866673ZM7.3351851 4.2200003C6.9972014 4.2200446 6.7127285 4.4730048 6.6731849 4.8086672L6.6685181 4.8866668L6.6685181 7.5533333L6.6731849 7.6313334C6.7130756 7.9667006 6.9974532 8.2192574 7.3351851 8.2192574C7.6729164 8.2192574 7.957294 7.9667006 7.9971848 7.6313334L8.001852 7.5533333L8.001852 4.8866668L7.9971848 4.8086672C7.9576411 4.4730048 7.6731682 4.2200446 7.3351851 4.2200003Z"/>
                </svg>
                <!-- 业务类型标签 -->
                <span v-if="item.warrantyTypeCollect" class="svc-tag">{{ item.warrantyTypeCollect }}</span>
              </div>

              <!-- VIN -->
              <div class="vehicle-line">
                {{ item.vehProfileVin }}
              </div>

              <!-- 信息行 -->
              <div class="info-rows">
                <div class="info-row">
                  <span class="info-label">车主</span>
                  <div class="info-value-wrap">
                    <span class="info-value">{{ item.customerName }}</span>
                  </div>
                </div>
                <div class="info-row">
                  <span class="info-label">客户经理</span>
                  <span class="info-value">{{ item.serviceOwnerName }}</span>
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
                v-if="activeTab === 'pending'"
                class="btn-pill btn-outline"
                @click.stop="handleCancel(item)"
              >
                作废
              </div>
              <div class="btn-pill btn-outline" @click.stop="handleContact(item)">
                联系车主
              </div>
              <div
                v-if="activeTab === 'pending'"
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

    <!-- 结算确认弹窗 -->
    <AisPopup v-model:show="showSettlePopup" title="结算" position="bottom" round>
      <template #content>
        <!-- 问题卡片 -->
        <div class="question-card">
          <div class="question-text">客户反馈故障是否全部解决</div>
          <div class="option-row">
            <div
              class="option-btn"
              :class="{ active: settleOption === 'resolved' }"
              @click="settleOption = 'resolved'"
            >
              已解决
            </div>
            <div
              class="option-btn"
              :class="{ active: settleOption === 'unresolved' }"
              @click="settleOption = 'unresolved'"
            >
              未解决
            </div>
          </div>
        </div>

        <!-- 未解决原因多选标签 -->
        <div v-if="settleOption === 'unresolved'" class="reason-card">
          <div class="reason-text">未解决原因</div>
          <div class="reason-tags">
            <div
              v-for="reason in reasonOptions"
              :key="reason"
              class="reason-tag"
              :class="{ active: selectedReasons.includes(reason) }"
              @click="toggleReason(reason)"
            >
              {{ reason }}
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <!-- 底部拖动条 + 提交按钮 -->
        <div class="settle-footer">
          <div class="submit-btn" @click="confirmSettle">
            确认结算
          </div>
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
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import dayjs from 'dayjs'
import RefreshList from '@/libs/components/RefreshList.vue'
import ListItem from '@/components/ListItem.vue'
import AisPopup from '@/libs/components/AisPopup.vue'
import { getSettlementStatementPage } from '@/api/settlementStatement'
import { callPhone } from '@/libs/utils/nativeFn'

const router = useRouter()
const route = useRoute()

const activeTab = ref('pending')
const searchValue = ref('')
const showEmpty = ref(false)
const selectedDateTag = ref('today')
const showSettlePopup = ref(false)
const showConfirmPopup = ref(false)
const showUploadDialog = ref(false)
const settleOption = ref('resolved')
const selectedReasons = ref([])
const currentItem = ref(null)
const refreshListRef = ref(null)

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
  data: computed(() => {
    const { createTimeStart, createTimeEnd } = getDateRange(selectedDateTag.value)
    return {
      pageNum: 1,
      pageSize: 10,
      orderStatus: statusMap[activeTab.value],
      appSearchKeyWord: searchValue.value,
      createTimeStart,
      createTimeEnd
    }
  }),
  api: getSettlementStatementPage
})

const reasonOptions = [
  '厂家无备件库存',
  '备件缺货',
  '故障未复现',
  '无解决方案',
  '约定下次进店检查',
  '车辆超保',
  '用户自费不修车'
]

const toggleReason = (reason) => {
  if (selectedReasons.value.includes(reason)) {
    selectedReasons.value = selectedReasons.value.filter((r) => r !== reason)
  } else {
    selectedReasons.value.push(reason)
  }
}

// 日期筛选标签
const dateTags = [
  { label: '今天', value: 'today' },
  { label: '7天内', value: 'week' },
  { label: '全部', value: 'all' }
]

// 切换日期标签
const selectDateTag = (value) => {
  selectedDateTag.value = value
  // RefreshList 组件会自动监听 requestData.data 变化并触发请求
}

// 切换标签页
const switchTab = (tab) => {
  activeTab.value = tab
  // 切换到已交车时默认显示全部日期，避免因日期过滤导致无数据
  selectedDateTag.value = tab === 'completed' ? 'all' : 'today'
  // RefreshList 组件会自动监听 requestData.data 变化并触发请求
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
  if (refreshListRef.value) {
    refreshListRef.value.reset()
  }
}

// 复制文本
const copyText = async(text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
    } else {
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-9999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    }
    showToast('复制成功')
  } catch {
    showToast('复制失败')
  }
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
  refreshList()
}

const getStatusClass = (status) => {
  // 根据orderStatus返回对应样式
  // 待交车(待结算): #c8a12b 橙色
  // 已交车(已收款): #009100 绿色
  if (status === 160) return 'status-orange'
  if (status === 180) return 'status-green'
  return 'status-gray'
}

// 根据预警等级返回对应颜色
const getAlarmColor = (alarmLevel) => {
  const colorMap = {
    '10': '#009100', // 绿色
    '20': '#C8A12B', // 橙色
    '30': '#B91919' // 红色
  }
  return colorMap[alarmLevel] || '#009100'
}

const goToDetail = (item) => {
  // 已收款状态才能点击跳转
  if (item.orderStatus === '40') {
    router.push('/settlement-statement/after-sales')
  }
}

const handleCancel = (item) => {
  showToast(`作废工单: ${item.workOrderNo}`)
}

const handleContact = (item) => {
  const phone = item.customerPhone
  if (phone) {
    callPhone(phone)
  } else {
    showToast('暂无联系电话')
  }
}

const handleSettle = (item) => {
  currentItem.value = item
  settleOption.value = 'resolved'
  selectedReasons.value = []
  showSettlePopup.value = true
}

const confirmSettle = () => {
  // 如果是未解决且没有选择原因，提示并阻止
  if (settleOption.value === 'unresolved' && selectedReasons.value.length === 0) {
    showToast('请选择未解决原因')
    return
  }
  showSettlePopup.value = false
  showConfirmPopup.value = true
  // 跳转到售后结算单页面
  router.push('/settlement-statement/after-sales')
}

const executeSettle = () => {
  showConfirmPopup.value = false
  showToast(settleOption.value === 'resolved' ? '故障已解决，结算成功' : '故障未解决，无法结算')
}

const goToUpload = () => {
  showUploadDialog.value = false
  showToast('去上传附件')
}
</script>

<style lang="scss" scoped>
.settlement-statement-list {
  min-height: 100vh;
  background-color: #f5f5f5;
  overflow-y: auto;

  &::-webkit-scrollbar {
    display: none;
  }

  .header-fixed {
    position: fixed;
    left: 0;
    right: 0;
    z-index: 100;
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
    padding: 0 12px 20px;
    margin-top: 100px;
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
          margin-left: 12px;
        }
      }

      .vehicle-line {
        font-family: 'PingFang SC';
        font-size: 12px;
        color: #545454;
        margin-bottom: 8px;
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

      &:nth-child(1) {
        color: #009100;
        background: #ffffff;
        border: 1px solid #009100;
      }

      &:nth-child(2) {
        color: #191a1b;
        background: #f8f7f7;
        border: 1px solid transparent;
      }

      &.active:nth-child(1) {
        background: rgba(0, 145, 0, 0.08);
        border-color: #009100;
      }

      &.active:nth-child(2) {
        background: #f8f7f7;
        border-color: #009100;
        color: #009100;
      }
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
