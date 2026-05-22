<template>
  <div class="after-sales-settlement-list">
    <!-- 加载中 -->
    <van-loading v-if="isLoading" color="#00AA00" class="page-loading" />

    <template v-else>
      <!-- 操作 loading 遮罩层 -->
      <van-loading v-if="submitLoading" color="#00AA00" class="submit-loading" />

      <!-- 头部信息 + Tab 切换栏 -->
      <div class="sticky-header">
        <!-- 头部信息 -->
        <div class="header-info">
          <div class="info-row">
            <span class="info-label">施工单：</span>
            <span class="info-value">{{ detailData.serviceProxyCode || '-' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">车辆VIN：</span>
            <span class="info-value">{{ detailData.vehProfileVin || '-' }}</span>
          </div>
        </div>

        <!-- Tab 切换栏（多个结算单时显示） -->
        <div v-if="tabs.length > 1" class="tab-bar">
          <div
            v-for="(tab, index) in tabs"
            :key="index"
            class="tab-item"
            :class="{ active: activeTab === index }"
            @click="switchTab(index)"
          >
            {{ tab }}
          </div>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="content" :class="{ 'has-tab': tabs.length > 1 }">
        <div v-if="isEmptyDetail" class="empty-state">
          <img class="empty-image" src="@/libs/assets/image/no-data.png" alt="没有数据" />
          <p class="empty-text">未查询到对应结算单</p>
        </div>

        <template v-else>
        <!-- 客户签字模块：按签字规则展示 -->

        <!-- 结算信息卡片 -->
        <div class="settle-info-card">
          <div v-if="showSignSection" class="sign-section" @click="handleSignClick">
          <div class="sign-header">
            <span class="sign-title">客户签字</span>
            <div class="sign-status">
              <span :class="signStatusClass">{{ signActionText }}</span>
              <svg class="chevron-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M6 4L10 8L6 12"
                  :stroke="signStatusClass === 'status-red' ? '#B91919' : '#888888'"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
          </div>
          <div class="sign-desc">{{ signDescription }}</div>
        </div>
          <div class="info-title">结算信息</div>
          <div class="info-rows">
            <div class="info-row">
              <span class="row-label">总金额</span>
              <span class="row-value">¥{{ formatPrice(detailData.totalAmount) }}</span>
            </div>
            <div class="info-row">
              <span class="row-label">已收金额</span>
              <span class="row-value green">¥{{ formatPrice(paidAmountDisplay) }}</span>
            </div>
            <div class="info-row">
              <span class="row-label">优惠金额</span>
              <span class="row-value">¥{{ formatPrice(detailData.discountAmount) }}</span>
            </div>
            <div class="info-row">
              <span class="row-label">去零金额</span>
              <span class="row-value">¥{{ formatPrice(detailData.noFractionAmount) }}</span>
            </div>
            <div class="info-divider"></div>
            <div class="info-row">
              <span class="row-label">实际应付金额</span>
              <span class="row-value">¥{{ formatPrice(detailData.payableAmount) }}</span>
            </div>
            <div class="info-row">
              <span class="row-label">剩余应付金额</span>
              <span class="row-value red">¥{{ formatPrice(remainingAmount) }}</span>
            </div>
          </div>
        </div>

        <!-- 收款记录列表 -->
        <div v-if="invoiceRecords.length > 0" class="payment-records-section">
          <div class="section-title">收款记录</div>
          <div v-for="(record, index) in invoiceRecords" :key="index" class="payment-record-item">
            <div class="record-left">
              <div class="record-method">{{ getPayTypeText(record.payType) }}</div>
            </div>
            <div class="record-right">
              <div class="record-amount">+¥{{ formatPrice(record.payAmount) }}</div>
            </div>
          </div>
        </div>

        <!-- 维修项目 -->
        <div v-if="repairItems.length > 0" class="repair-section">
          <div class="section-title">维修项目</div>
          <template v-for="(item, index) in repairItems" :key="index">
            <div class="repair-item" :class="{ special: item.repairItemName && item.repairItemName.length > 15 }">
              <div class="repair-left">
                <div class="repair-name">{{ item.repairItemName }}</div>
                <div class="repair-code">{{ item.repairItemCode }}</div>
                <div class="repair-type">{{item.repairItemTypeName}}-{{ item.checkoutTypeName }}-{{ item.warrantyTypeName }}</div>
              </div>
              <div class="repair-right">
                <div class="repair-price">¥{{ formatPrice(item.repairAmount) }}</div>
                <div class="repair-discount">优惠 ¥{{ formatPrice(item.discountAmount) }}</div>
              </div>
            </div>
            <div class="repair-item-bottom">
              <span class="original-price">¥{{ formatPrice(item.price) }}</span>
              <span class="quantity">x{{ item.workHour }}</span>
            </div>
          </template>
        </div>

        <!-- 维修配件 -->
        <div v-if="partItems.length > 0" class="parts-section">
          <div class="section-title">维修配件</div>
          <template v-for="(item, index) in partItems" :key="index">
            <div class="part-item" :class="{ special: item.partsName && item.partsName.length > 15 }">
              <div class="part-left">
                <div class="part-name-row">
                  <span class="part-name">{{ item.partsName }}</span>
                  <span v-if="item.isOemPart === 1" class="part-tag">原厂件</span>
                </div>
                <div class="part-code">{{ item.partsCode }}</div>
                <div class="part-type">{{ item.checkoutTypeName }}-{{ item.warrantyTypeName }}</div>
              </div>
              <div class="part-right">
                <div class="part-price">¥{{ formatPrice(item.partsAmount) }}</div>
                <div class="part-discount">优惠 ¥{{ formatPrice(item.discountAmount) }}</div>
              </div>
            </div>
            <div class="part-item-bottom">
              <span class="original-price">¥{{ formatPrice(item.price) }}</span>
              <span class="quantity">x{{ item.quantity }}</span>
            </div>
          </template>
        </div>
        </template>
      </div>

      <!-- 底部操作栏 -->
      <div v-if="bottomActionConfig" class="action-bar">
        <div v-if="bottomActionConfig.type === 'hint'" class="action-hint">
          {{ bottomActionConfig.text }}
        </div>
        <div
          v-else
          class="btn-pill btn-primary btn-full"
          @click="handleBottomAction"
        >
          {{ bottomActionConfig.text }}
        </div>
      </div>
    </template>

    <!-- 添加收款弹窗 -->
    <AisPopup v-model:show="showAddPayment" title="创建收款记录" position="bottom" round :popupStyle="{ height: '662px' }">
      <template #content>
        <div class="payment-form">
          <div class="payment-card">
            <div class="payment-card-title">支付方式</div>
            <div class="payment-method-grid">
              <div
                v-for="item in paymentMethods"
                :key="item.value"
                class="payment-method-item"
                :class="{ active: paymentForm.paymentMethod === item.value, disabled: item.disabled }"
                @click="item.disabled ? null : selectPaymentMethod(item)"
              >
                <span class="payment-method-icon" :class="`icon-${item.iconType}`">{{ item.iconText }}</span>
                <span class="payment-method-text">{{ item.text }}</span>
              </div>
            </div>
          </div>

          <div class="payment-card amount-card">
            <div class="payment-card-title">支付金额</div>
            <div class="payment-amount-wrap">
              <input
                v-model="paymentForm.amount"
                class="payment-amount-input"
                type="text"
                inputmode="decimal"
                placeholder="请输入支付金额"
                @input="onAmountInput"
              />
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="payment-submit-btn" @click="handlePaymentSubmit">确认结算</div>
      </template>
    </AisPopup>

    <!-- 多个待结算单提示弹窗 -->
    <AisPopup
      v-model:show="showPendingTip"
      class="pending-tip-popup"
      title="提示"
      position="center"
      round
      :popup-style="{ width: '280px', borderRadius: '12px' }"
    >
      <template #content>
        <div class="pending-tip-content">
          还剩 <span class="highlight">{{ pendingSettlementCount }}个</span>结算单待提交，全部提交结算完毕生成待签字单
        </div>
      </template>
      <template #footer>
        <div class="pending-tip-btn" @click="handlePendingTipConfirm">我知道了</div>
      </template>
    </AisPopup>

    <!-- 签字渠道选择弹窗 -->
    <AisPopup
      v-model:show="showSignChannel"
      class="sign-channel-popup"
      title="签字渠道"
      position="bottom"
      round
      :overlay="true"
      :lock-scroll="false"
      :popup-style="{ height: '360px' }"
    >
      <template #content>
        <div v-if="selectedChannel !== 'paper'" class="sign-hint-text">此操作将生成待签字结算单且需要用户签字</div>
        <div class="channel-list">
          <div
            class="channel-item"
            :class="{ active: selectedChannel === 'paper' }"
            @click="selectedChannel = 'paper'"
          >
            <span class="channel-name">纸质单据</span>
            <svg
              v-if="selectedChannel === 'paper'"
              class="check-icon"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M14 4L6 12L2 8"
                stroke="#009100"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <div
            class="channel-item app-item"
            :class="{ active: selectedChannel === 'app' }"
            @click="selectedChannel = 'app'"
          >
            <div class="channel-name-wrap">
              <span class="channel-name">APP/短信/零小跑</span>
              <span class="channel-desc">将生成待签字结算单且需要用户签字</span>
            </div>
            <svg
              v-if="selectedChannel === 'app'"
              class="check-icon"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M14 4L6 12L2 8"
                stroke="#009100"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="sign-popup-footer two-btn">
          <div class="sign-popup-btn btn-cancel" @click="showSignChannel = false">取消</div>
          <div class="sign-popup-btn" @click="handleSignSuccess">确定</div>
        </div>
      </template>
    </AisPopup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { showToast, showImagePreview } from 'vant'
import { useRoute } from 'vue-router'
import AisPopup from '@/libs/components/AisPopup.vue'
import {
  getServiceStatementDetail,
  getServiceStatementListByServiceProxy,
  signSettlementStatement,
  submitSettlementStatement,
  addReceiptRecord,
  receiptCompletion
} from '@/api/settlementStatement'
import { getFileList } from '@/libs/api/fileConfig'
import { usePageSafeArea } from '@/utils/safeArea'

const route = useRoute()
usePageSafeArea({ bodyClass: 'ais-page-nav-safe-area' })

// 加载状态
const isLoading = ref(true)
const submitLoading = ref(false)

// 详情数据
const detailData = ref({})

// 维修项目列表
const repairItems = ref([])

// 配件列表
const partItems = ref([])

// 收款记录
const invoiceRecords = ref([])

// 已收金额
const paidAmount = ref(0)
const isPaymentConfirmed = ref(false)

const isEmptyDetail = computed(() => !detailData.value.id && !detailData.value.code)
const paidAmountDisplay = computed(() => paidAmount.value)
const remainingAmount = computed(() => {
  return Math.max(Number(detailData.value.remainAmount) || 0, 0)
})

// 从路由获取来源状态：pending-待交车，completed-已交车
const sourceStatus = ref('pending')

// 从路由获取施工单ID
const serviceProxyId = ref('')

// 从路由获取结算单ID
const statementId = ref('')

const statementList = ref([])
const tabs = ref([])
const activeTab = ref(0)
const showSignChannel = ref(false)
const selectedChannel = ref('paper')
const signStatus = ref(null)
const showPendingTip = ref(false)

const isSuccessResponse = (res) => res?.code === 200 || res?.code === 0 || res?.success === true

const getFallbackBaseInfo = () => ({
  serviceProxyCode: route.query.serviceProxyCode || '',
  vehProfileVin: route.query.vehProfileVin || ''
})

const getSignStatus = (statement) => {
  const backendSignStatus = Number(statement?.signStatus)

  // 20: 已签字
  if (backendSignStatus === 20) {
    return 'signed'
  }

  // 10: 待签字
  if (backendSignStatus === 10) {
    return 'pending'
  }

  // 兼容旧数据：通过时间字段判断
  if (statement?.signCompletedOn) {
    return 'signed'
  }

  if (statement?.signGeneratedOn) {
    return 'pending'
  }

  return 'not_signed'
}

const buildTabLabels = (list) => list.map((_, index) => `结算单${index + 1}`)

const applyStatementDetail = (statement = {}) => {
  detailData.value = {
    ...getFallbackBaseInfo(),
    ...statement
  }
  repairItems.value = Array.isArray(statement.repairItemResps) ? statement.repairItemResps : []
  partItems.value = Array.isArray(statement.partResps) ? statement.partResps : []
  invoiceRecords.value = Array.isArray(statement.invoiceRecordResps) ? statement.invoiceRecordResps : []
  paidAmount.value = Number(statement.paidAmount) || 0
  isPaymentConfirmed.value = Boolean(statement.receiveTime)
  signStatus.value = getSignStatus(statement)
}

onMounted(() => {
  sourceStatus.value = route.query.status || 'pending'
  serviceProxyId.value = route.query.serviceProxyId || route.query.id || ''
  statementId.value = route.query.statementId || ''
  getDetail()
})

const getDetail = async(options = {}) => {
  const { preserveActiveTab = false } = options
  const currentTabIndex = activeTab.value

  if (!serviceProxyId.value && !statementId.value) {
    showToast('缺少施工单ID')
    isLoading.value = false
    return
  }

  isLoading.value = true

  try {
    if (serviceProxyId.value) {
      const res = await getServiceStatementListByServiceProxy(serviceProxyId.value)
      const list = Array.isArray(res?.data) ? res.data : (res?.data ? [res.data] : [])

      if (isSuccessResponse(res) && list.length > 0) {
        statementList.value = list
        tabs.value = buildTabLabels(list)
        activeTab.value = preserveActiveTab ? Math.min(currentTabIndex, list.length - 1) : 0
        applyStatementDetail(list[activeTab.value])
        return
      }

      if (!statementId.value) {
        statementList.value = []
        tabs.value = []
        applyStatementDetail()
        return
      }
    }

    const res = await getServiceStatementDetail(statementId.value)
    if (isSuccessResponse(res) && res?.data) {
      const data = res.data
      statementList.value = [data]
      tabs.value = buildTabLabels(statementList.value)
      activeTab.value = 0
      applyStatementDetail(data)
      return
    }

    showToast(res?.msg || '获取详情失败')
  } catch {
    showToast('获取详情失败')
  } finally {
    isLoading.value = false
  }
}

// 是否为待交车状态
const isPending = computed(() => sourceStatus.value === 'pending')

// 是否为已交车状态
const isCompleted = computed(() => sourceStatus.value === 'completed')
const isSingleSettlement = computed(() => statementList.value.length <= 1)
// 计算数组中 isCheck 为 false 的数量
const uncheckedCount = computed(() => {
  return statementList.value.filter((item) => item.isCheck === false).length
})

// 当前结算单是否为最后一个（isCheck 为 false 且整个数组中只有一个 isCheck 为 false）
const isCurrentLastSettlement = computed(() => {
  // 当前结算单 isCheck 不为 false，不是最后一个
  if (detailData.value.isCheck !== false) {
    return false
  }
  // 当前结算单 isCheck 为 false，且整个数组中只有一个 isCheck 为 false，才是最后一个
  return uncheckedCount.value === 1
})
const shouldUseSignFlow = computed(() => isSingleSettlement.value || isCurrentLastSettlement.value)
const statementTypeLabel = computed(() => detailData.value.statementTypeLabel || '')
const statementStatusText = computed(() => detailData.value.statementStatusLabel || detailData.value.statementStatusDesc || '')
const isWarrantyOrContract = computed(() => ['保修', '合同'].some((item) => statementTypeLabel.value.includes(item)))
const isSelfPaySettlement = computed(() => ['自费', '保险', '内部结算'].some((item) => statementTypeLabel.value.includes(item)))
// 剩余待提交数量（不算当前单子）
const pendingSettlementCount = computed(() => {
  // 基于 isCheck 为 false 的数量计算
  // 如果当前单子 isCheck 为 false，则减去当前单子
  if (detailData.value.isCheck === false) {
    return Math.max(uncheckedCount.value - 1, 0)
  }
  return uncheckedCount.value
})
// signStatus: null-不需要签字, 10-待签字, 20-已签字
const showSignSection = computed(() => {
  const backendSignStatus = Number(detailData.value.signStatus)
  // null 或 undefined → 不显示签字模块
  if (backendSignStatus !== 10 && backendSignStatus !== 20) {
    return false
  }
  return true
})
const isPcPaymentCompleted = computed(() => {
  return Boolean(detailData.value.receiveTime) || statementStatusText.value.includes('已收款')
})
const bottomActionConfig = computed(() => {
  // ========== 前置条件检查 ==========
  // 详情为空、已交车状态、已确认收款 → 不显示按钮
  if (isEmptyDetail.value || isCompleted.value || isPcPaymentCompleted.value || isPaymentConfirmed.value) {
    return null
  }

  // 非待交车状态 → 不显示按钮
  if (!isPending.value) {
    return null
  }

  // ========== 核心逻辑 ==========

  // 1. isCheck === false：未提交结算，显示提交结算按钮
  if (detailData.value.isCheck === false) {
    // 判断是否为最后一个未提交的结算单
    if (shouldUseSignFlow.value) {
      return {
        type: 'button',
        text: '提交结算并签字',
        action: 'submitSign'
      }
    }
    return {
      type: 'button',
      text: '提交结算',
      action: 'submitSettlement'
    }
  }

  // 2. isCheck === true：已提交结算，判断签字状态
  // 保修/合同类型特殊处理
  if (isWarrantyOrContract.value) {
    if (signStatus.value === 'signed') {
      return {
        type: 'hint',
        text: '请移步PC创建保修申请单'
      }
    }
    // 未签字的保修/合同类型不显示按钮（等待签字）
    return null
  }

  // 自费/保险/内部结算类型
  if (isSelfPaySettlement.value || !statementTypeLabel.value) {
    // 未签字或待签字：不显示按钮，等待客户签字（签字区域会显示"请客户签字"）
    if (signStatus.value === 'not_signed' || signStatus.value === 'pending') {
      return null
    }

    // 已签字：根据剩余金额显示收款按钮
    if (signStatus.value === 'signed') {
      if (remainingAmount.value > 0) {
        return {
          type: 'button',
          text: '添加收款',
          action: 'addPayment'
        }
      }
      return {
        type: 'button',
        text: '确认收款',
        action: 'confirmPayment'
      }
    }
  }

  // 其他类型：已提交结算后不显示按钮
  return null
})
const signChannelValue = computed(() => (selectedChannel.value === 'paper' ? 40 : undefined))
const buildSettlementPayload = (includeSignChannel = false) => {
  const payload = {
    id: detailData.value.id,
    serviceProxyCode: detailData.value.serviceProxyCode,
    noFractionAmount: detailData.value.noFractionAmount,
    discountId: detailData.value.discountId,
    repairItemList: repairItems.value,
    partList: partItems.value
  }

  if (includeSignChannel && signChannelValue.value !== undefined) {
    payload.signChannel = signChannelValue.value
  }

  return payload
}
const buildReceiptPayload = () => {
  // 已有的收款记录
  const existingRecords = invoiceRecords.value.map((record) => ({
    statementId: record.statementId || detailData.value.id,
    statementCode: record.statementCode || detailData.value.code,
    payAmount: Number(record.payAmount),
    payType: record.payType,
    rightsCode: record.rightsCode || '',
    invoiceNumber: record.invoiceNumber || '',
    invoiceType: record.invoiceType || ''
  }))

  // 新增的收款记录
  const newRecord = {
    statementId: detailData.value.id,
    statementCode: detailData.value.code,
    payAmount: Number(paymentForm.value.amount),
    payType: paymentForm.value.paymentMethod,
    rightsCode: '',
    invoiceNumber: '',
    invoiceType: ''
  }

  return {
    statementId: detailData.value.id,
    invoiceRecordList: [...existingRecords, newRecord]
  }
}

// 格式化金额
const formatPrice = (price) => {
  const amount = Number(price)
  if (!Number.isFinite(amount)) return '0.00'
  return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 获取支付方式文本
const getPayTypeText = (payType) => {
  const payTypeMap = {
    10: '银行卡',
    20: '支付宝',
    30: '微信',
    40: '现金',
    50: '权益抵扣',
    60: '其他'
  }
  return payTypeMap[payType] || '未知'
}

// 添加收款弹窗
const showAddPayment = ref(false)
const paymentForm = ref({
  amount: '',
  paymentMethod: '',
  paymentMethodText: ''
})

// 收款方式选项
const paymentMethods = [
  { text: '微信', value: 30, iconText: '微', iconType: 'wechat' },
  { text: '支付宝', value: 20, iconText: '支', iconType: 'alipay' },
  { text: '银行卡', value: 10, iconText: '卡', iconType: 'card' },
  { text: '现金', value: 40, iconText: '¥', iconType: 'cash' },
  { text: '权益抵扣', value: 50, iconText: '益', iconType: 'rights', disabled: true },
  { text: '其他', value: 60, iconText: '其', iconType: 'other' }
]

const selectPaymentMethod = (item) => {
  paymentForm.value.paymentMethod = item.value
  paymentForm.value.paymentMethodText = item.text
}

const onAmountInput = () => {
  let val = paymentForm.value.amount
  // 只允许数字和小数点
  val = val.replace(/[^\d.]/g, '')
  // 小数点只能出现一次
  val = val.replace(/\.{2,}/g, '.')
  val = val.replace(/^(\d*\.)(.*)$/, (_, prefix, rest) => prefix + rest.replace(/\./g, ''))
  // 限制两位小数
  val = val.replace(/^(\d*\.\d{2}).*$/, '$1')
  // 不能以多个0开头（除非是0.x）
  val = val.replace(/^0+(\d)/, '0')
  paymentForm.value.amount = val
}

// 根据签字规则显示不同文案和颜色
// signStatus: 10-待签字, 20-已签字
const signActionText = computed(() => {
  const backendSignStatus = Number(detailData.value.signStatus)
  if (backendSignStatus === 20) {
    return '查看客户签字'
  }
  return '邀请客户签字'
})

const signDescription = computed(() => {
  const backendSignStatus = Number(detailData.value.signStatus)
  if (backendSignStatus === 20) {
    return '客户已完成签字确认'
  }
  return '为保障双方合理权益，请完成客户签字确认'
})

const signStatusClass = computed(() => {
  const backendSignStatus = Number(detailData.value.signStatus)
  // 10-待签字显示红色(#B91919)，20-已签字显示灰色(#888888)
  if (backendSignStatus === 10) {
    return 'status-red'
  }
  return 'status-gray'
})

const switchTab = (index) => {
  activeTab.value = index
  applyStatementDetail(statementList.value[index] || {})
}

// 签字模块点击
const handleSignClick = async() => {
  if (!showSignSection.value) {
    return
  }

  const backendSignStatus = Number(detailData.value.signStatus)

  // signStatus=10: 待签字，直接跳转外部页面（同APP/短信/零小跑逻辑）
  if (backendSignStatus === 10) {
    const targetUrl = `https://staticres-sitb.leapmotor.com/leapx/biling/aisInner/settlement?serviceProxyId=${serviceProxyId.value}&signChannel=3`
    window.location.href = targetUrl
    return
  }

  // signStatus=20: 已签字，调用接口获取签字图片并展示
  if (backendSignStatus === 20) {
    const currentStatementId = detailData.value.id || statementId.value
    if (!currentStatementId) {
      showToast('缺少结算单ID')
      return
    }
    try {
      const res = await getFileList({ businessId: currentStatementId, attachType: '制单签字' })
      if (res.code === 200 && res.data && res.data.length > 0) {
        const images = res.data.map(item => item.fileUrl || item.authFileUrl || item.url)
        showImagePreview({
          images,
          startPosition: 0,
          showIndex: images.length > 1,
          className: 'sign-image-preview'
        })
      } else {
        showToast('暂无签字图片')
      }
    } catch {
      showToast('获取签字图片失败')
    }
  }
}

// 提交结算并签字（只有最后一个结算单才会走这里，不需要提示）
const handleSubmitSettlement = () => {
  showSignChannel.value = true
}

// 提示弹窗确认后，继续执行操作
const handlePendingTipConfirm = () => {
  showPendingTip.value = false
  // 直接提交结算
  doSubmitSettlement()
}

const validateSettlementPayload = (payload) => {
  if (!payload.id) {
    showToast('缺少结算单ID')
    return false
  }

  if (!payload.serviceProxyCode) {
    showToast('缺少施工单编码')
    return false
  }

  return true
}

// 签字成功后的回调
const handleSignSuccess = async() => {
  // 纸质单据和APP/短信/零小跑都需要先调用接口
  if (shouldUseSignFlow.value) {
    const payload = buildSettlementPayload(true)

    if (!validateSettlementPayload(payload)) {
      return
    }

    submitLoading.value = true
    try {
      const res = await signSettlementStatement(payload)
      if (!isSuccessResponse(res)) {
        showToast(res?.msg || '提交失败')
        return
      }

      showSignChannel.value = false
      showToast('提交成功')

      // APP/短信/零小跑：接口成功后跳转到外部页面
      if (selectedChannel.value === 'app') {
        const targetUrl = `https://staticres-sitb.leapmotor.com/leapx/biling/aisInner/settlement?serviceProxyId=${serviceProxyId.value}&signChannel=3`
        window.location.href = targetUrl
        return
      }

      // 纸质单据：刷新当前页面
      await getDetail({ preserveActiveTab: true })
      return
    } catch {
      showToast('提交失败')
      return
    } finally {
      submitLoading.value = false
    }
  }

  signStatus.value = 'signed'
  showSignChannel.value = false
  showToast('提交成功')
}

const handleAddPayment = () => {
  paymentForm.value = {
    amount: remainingAmount.value ? remainingAmount.value.toFixed(2) : '',
    paymentMethod: '',
    paymentMethodText: ''
  }
  showAddPayment.value = true
}

const handleConfirmPayment = async() => {
  if (!detailData.value.id) {
    showToast('缺少结算单ID')
    return
  }

  submitLoading.value = true
  try {
    const res = await receiptCompletion(detailData.value.id)
    if (!isSuccessResponse(res)) {
      showToast(res?.msg || '确认收款失败')
      return
    }

    isPaymentConfirmed.value = true
    showToast('确认收款成功')
    await getDetail({ preserveActiveTab: true })
  } catch {
    showToast('确认收款失败')
  } finally {
    submitLoading.value = false
  }
}

const handleBottomAction = () => {
  if (!bottomActionConfig.value) {
    return
  }

  if (bottomActionConfig.value.action === 'submitSign') {
    handleSubmitSettlement()
    return
  }

  if (bottomActionConfig.value.action === 'addPayment') {
    handleAddPayment()
    return
  }

  if (bottomActionConfig.value.action === 'submitSettlement') {
    handleDirectSubmitSettlement()
    return
  }

  if (bottomActionConfig.value.action === 'confirmPayment') {
    handleConfirmPayment()
  }
}

const handleDirectSubmitSettlement = async() => {
  // 判断是否有多个待结算单
  if (pendingSettlementCount.value > 1) {
    showPendingTip.value = true
    return
  }

  await doSubmitSettlement()
}

// 实际执行提交结算
const doSubmitSettlement = async() => {
  const payload = buildSettlementPayload()

  if (!validateSettlementPayload(payload)) {
    return
  }

  submitLoading.value = true
  try {
    const res = await submitSettlementStatement(payload)
    if (!isSuccessResponse(res)) {
      showToast(res?.msg || '提交失败')
      return
    }

    showToast('提交成功')
    await getDetail({ preserveActiveTab: true })
  } catch {
    showToast('提交失败')
  } finally {
    submitLoading.value = false
  }
}

// 收款提交
const handlePaymentSubmit = async() => {
  // 校验收款金额
  if (!paymentForm.value.amount || parseFloat(paymentForm.value.amount) <= 0) {
    showToast('请输入支付金额')
    return
  }

  // 补全两位小数
  paymentForm.value.amount = parseFloat(paymentForm.value.amount).toFixed(2)

  // 校验支付方式
  if (!paymentForm.value.paymentMethod) {
    showToast('请选择支付方式')
    return
  }

  // 校验金额不能大于应付金额
  const payAmount = parseFloat(paymentForm.value.amount)
  if (payAmount > remainingAmount.value) {
    showToast('实际支付金额不能大于应付金额')
    return
  }

  const payload = buildReceiptPayload()
  if (!payload.statementId) {
    showToast('缺少结算单ID')
    return
  }

  submitLoading.value = true
  try {
    const res = await addReceiptRecord(payload)
    if (!isSuccessResponse(res)) {
      showToast(res?.msg || '创建收款记录失败')
      return
    }

    showAddPayment.value = false
    showToast('收款成功')
    await getDetail({ preserveActiveTab: true })
  } catch {
    showToast('创建收款记录失败')
  } finally {
    submitLoading.value = false
  }
}

</script>

<style lang="scss" scoped>
.after-sales-settlement-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  padding-bottom: 88px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    display: none;
  }

  // 页面加载中样式
  .page-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 80vh;
  }

  // 操作 loading 遮罩层样式
  .submit-loading {
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

  .sticky-header {
    position: fixed;
    top: var(--nav-bar-total-height, 46px);
    left: 0;
    right: 0;
    z-index: 2000;
    background: #fff;
  }

  .tab-bar {
    display: flex;
    align-items: center;
    gap: 24px;
    padding: 0 12px;
    height: 42px;
    background: #fff;
    border-bottom: 0.5px solid #e6e6e5;
    overflow-x: auto;

    &::-webkit-scrollbar {
      display: none;
    }

    .tab-item {
      flex-shrink: 0;
      font-family: 'PingFang SC';
      font-size: 14px;
      color: #545454;
      padding: 10px 0;
      position: relative;

      &.active {
        color: #009100;
        font-weight: 500;

        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: #009100;
          border-radius: 1px;
        }
      }
    }
  }

  .header-info {
    padding: 8px 12px;
    background: #fff;

    .info-row {
      display: flex;
      align-items: center;
      gap: 4px;
      font-family: 'PingFang SC';
      font-size: 14px;
      line-height: 20px;

      .info-label {
        color: #191a1b;
      }

      .info-value {
        color: #191a1b;
      }
    }
  }

  .content {
    padding: 58px 12px 0;
    margin-top: 12px;

    &.has-tab {
      padding-top: 100px;
    }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 0 24px;

    .empty-image {
      width: 200px;
      height: 120px;
      margin-bottom: 16px;
    }

    .empty-text {
      font-size: 14px;
      color: #999;
      line-height: 20px;
    }
  }

  .settle-info-card {
    background: #fff;
    border-radius: 6px;
    padding: 12px;
    margin-bottom: 12px;
    // margin-top: 12px;

    .info-title {
      font-family: 'PingFang SC';
      font-size: 14px;
      font-weight: 500;
      color: #191a1b;
      margin-bottom: 12px;
    }

    .info-rows {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .info-row {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .row-label {
          font-family: 'PingFang SC';
          font-size: 14px;
          color: #545454;
        }

        .row-value {
          font-family: 'PingFang SC';
          font-size: 14px;
          color: #191a1b;

          &.red {
            color: #b91919;
            font-weight: 500;
          }

          &.green {
            color: #009100;
            font-weight: 500;
          }
        }
      }

      .info-divider {
        height: 0.5px;
        background: #e6e6e5;
        margin: 4px 0;
      }
    }
  }

  .repair-section,
  .parts-section {
    background: #fff;
    border-radius: 6px;
    padding: 12px;
    margin-bottom: 12px;

    .section-title {
      font-family: 'PingFang SC';
      font-size: 14px;
      font-weight: 500;
      color: #191a1b;
      margin-bottom: 12px;
    }
  }

  .repair-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-top: 12px;

    &:first-of-type {
      margin-top: 0;
    }

    &.special {
      .repair-left {
        .repair-name {
          font-size: 14px;
          color: #191a1b;
          line-height: 20px;
        }
      }
    }

    .repair-left {
      flex: 1;

      .repair-name {
        font-family: 'PingFang SC';
        font-size: 14px;
        font-weight: 500;
        color: #191a1b;
        margin-bottom: 4px;
      }

      .repair-code {
        font-family: 'PingFang SC';
        font-size: 12px;
        color: #545454;
        margin-bottom: 2px;
      }

      .repair-type {
        font-family: 'PingFang SC';
        font-size: 12px;
        color: #545454;
      }
    }

    .repair-right {
      text-align: right;

      .repair-price {
        font-family: 'PingFang SC';
        font-size: 14px;
        font-weight: 500;
        color: #191a1b;
        margin-bottom: 2px;
      }

      .repair-discount {
        font-family: 'PingFang SC';
        font-size: 12px;
        color: #545454;
      }
    }
  }

  .repair-item-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 0.5px solid #e6e6e5;
    padding-bottom: 10px;

    &:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    .original-price {
      font-family: 'PingFang SC';
      font-size: 12px;
      color: #545454;
    }

    .quantity {
      font-family: 'PingFang SC';
      font-size: 14px;
      color: #191a1b;
    }
  }

  .part-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-top: 14px;

    &:first-of-type {
      margin-top: 0;
    }

    &.special {
      .part-left {
        .part-name {
          font-size: 14px;
          color: #191a1b;
          line-height: 20px;
        }
      }
    }

    .part-left {
      flex: 1;

      .part-name-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;

        .part-name {
          font-family: 'PingFang SC';
          font-size: 14px;
          font-weight: 500;
          color: #191a1b;
        }

        .part-tag {
          padding: 1px 4px;
          font-family: 'PingFang SC';
          font-size: 12px;
          color: #191a1b;
          background: rgba(25, 26, 27, 0.06);
          border-radius: 4px;
        }
      }

      .part-code {
        font-family: 'PingFang SC';
        font-size: 12px;
        color: #545454;
        margin-bottom: 2px;
      }

      .part-type {
        font-family: 'PingFang SC';
        font-size: 12px;
        color: #545454;
        margin-bottom: 4px;
      }

      .part-detail-row {
        display: flex;
        align-items: center;
        gap: 8px;

        .part-original {
          font-family: 'PingFang SC';
          font-size: 12px;
          color: #545454;
        }

        .part-actual,
        .part-return {
          font-family: 'PingFang SC';
          font-size: 12px;
          color: #545454;
        }
      }
    }

    .part-right {
      text-align: right;

      .part-price {
        font-family: 'PingFang SC';
        font-size: 14px;
        font-weight: 500;
        color: #191a1b;
        margin-bottom: 2px;
      }

      .part-discount {
        font-family: 'PingFang SC';
        font-size: 12px;
        color: #545454;
      }
    }
  }

  .part-item-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 10px;
    border-bottom: 0.5px solid #e6e6e5;

    &:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    .original-price {
      font-family: 'PingFang SC';
      font-size: 12px;
      color: #545454;
    }

    .quantity {
      font-family: 'PingFang SC';
      font-size: 14px;
      color: #191a1b;
    }
  }

  // 客户签字模块
  .sign-section {
    background: #f8f7f7;
    border: 0.5px solid #e6e6e5;
    border-radius: 6px;
    padding: 12px;
    margin-bottom: 12px;
    cursor: pointer;

    .sign-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;

      .sign-title {
        font-family: 'PingFang SC';
        font-size: 14px;
        font-weight: 500;
        color: #191a1b;
      }

      .sign-status {
        display: flex;
        align-items: center;
        gap: 4px;

        .status-red {
          font-family: 'PingFang SC';
          font-size: 14px;
          color: #009100;
        }

        .status-gray {
          font-family: 'PingFang SC';
          font-size: 14px;
          color: #888888;
        }

        .chevron-icon {
          flex-shrink: 0;
        }
      }
    }

    .sign-desc {
      font-family: 'PingFang SC';
      font-size: 14px;
      color: #888888;
    }
  }

  // 收款记录列表
  .payment-records-section {
    background: #fff;
    border-radius: 6px;
    padding: 12px;
    margin-bottom: 12px;

    .section-title {
      font-family: 'PingFang SC';
      font-size: 14px;
      font-weight: 500;
      color: #191a1b;
      // margin-bottom: 12px;
    }

    .payment-record-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 0.5px solid #e6e6e5;

      &:last-child {
        border-bottom: none;
      }

      .record-left {
        .record-method {
          font-family: 'PingFang SC';
          font-size: 14px;
          color: #191a1b;
          margin-bottom: 4px;
        }

        .record-time {
          font-family: 'PingFang SC';
          font-size: 12px;
          color: #888888;
        }
      }

      .record-right {
        .record-amount {
          font-family: 'PingFang SC';
          font-size: 14px;
          font-weight: 500;
          color: #009100;
        }
      }
    }
  }

  .action-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 88px;
    background: #fff;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 12px;
    padding-bottom: calc(12px + env(safe-area-inset-bottom));

    .action-btn {
      width: 100%;
      height: 40px;
      border-radius: 8px;
      font-family: 'PingFang SC';
      font-size: 14px;
      color: #fff !important;
      background: #009100 !important;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      opacity: 1 !important;

      &.add-payment {
        background: #009100;
      }

      &.confirm-payment {
        background: #009100;
      }
    }

    .action-hint {
      width: 100%;
      height: 40px;
      border-radius: 8px;
      background: #f2f3f5;
      border: 1px solid #e6e6e5;
      font-family: 'PingFang SC';
      font-size: 14px;
      color: #999999;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: not-allowed;
    }

    // 底部按钮样式
    .btn-pill {
      padding: 0 24px;
      height: 40px;
      font-family: 'PingFang SC';
      font-size: 14px;
      border-radius: 8px;
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

    .btn-full {
      width: 100%;
    }
  }
}

// 签字渠道选择弹窗
.sign-channel-popup {
  background: #fff;
  box-shadow: 0 -4px 20px rgba(25, 26, 27, 0.08);

  .sign-hint-text {
    font-family: 'PingFang SC';
    font-size: 13px;
    color: #888888;
    padding: 8px 12px 12px;
    line-height: 1.5;
  }

  .sign-popup-header {
    padding: 14px 16px 8px;

    .sign-popup-title {
      font-family: 'PingFang SC';
      font-size: 16px;
      font-weight: 500;
      color: #191a1b;
      text-align: center;
      line-height: 24px;
    }
  }

  .sign-popup-footer {
    display: flex;
    justify-content: center;
    padding: 0 12px calc(16px + env(safe-area-inset-bottom));
    background: #fff;

    &.two-btn {
      display: flex;
      gap: 12px;

      .sign-popup-btn {
        flex: 1;
      }

      .btn-cancel {
        color: #545454;
        background: #ffffff;
        border: 1px solid #e6e6e5;
      }
    }
  }

  .sign-popup-btn {
    width: 100%;
    height: 40px;
    border-radius: 8px;
    font-family: 'PingFang SC';
    font-size: 14px;
    color: #ffffff;
    background: #009100;
    border: 1px solid #009100;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
}

.channel-list {
  background: #fff;
  border-radius: 8px 8px 0 0;
  padding: 0 12px 8px;

  .channel-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 0;
    border-bottom: 0.5px solid #e6e6e5;

    &:last-of-type {
      border-bottom: none;
    }

    .channel-name {
      font-family: 'PingFang SC';
      font-size: 14px;
      color: #191a1b;
    }

    &.active .channel-name {
      color: #009100;
    }

    .check-icon {
      flex-shrink: 0;
    }

    &.app-item {
      &.active {
        .channel-name-wrap .channel-name {
          color: #009100;
        }

        .channel-name-wrap .channel-desc {
          color: #009100;
        }
      }

      .channel-name-wrap {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .channel-name {
          font-size: 14px;
          color: #191a1b;
        }

        .channel-desc {
          font-family: 'PingFang SC';
          font-size: 12px;
          color: #888;
        }
      }
    }
  }
}

// 添加收款弹窗
.payment-form {
  min-height: 520px;

  .payment-card {
    background: #fff;
    border-radius: 8px;
    padding: 20px 16px;
    margin-bottom: 12px;
  }

  .payment-card-title {
    font-family: 'PingFang SC';
    font-size: 18px;
    font-weight: 500;
    color: #191a1b;
    line-height: 28px;
    margin-bottom: 16px;
  }

  .payment-method-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .payment-method-item {
    height: 40px;
    border-radius: 4px;
    background: #f7f7f7;
    border: 1px solid transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;

    &.active {
      background: #fff;
      border-color: #00a000;

      .payment-method-text {
        color: #00a000;
      }
    }

    &.disabled {
      opacity: 0.5;
      cursor: not-allowed;

      .payment-method-text {
        color: #999;
      }
    }
  }

  .payment-method-icon {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: #fff;
    flex-shrink: 0;

    &.icon-wechat {
      background: #1aad19;
    }

    &.icon-alipay {
      background: #1677ff;
    }

    &.icon-card {
      background: #18b7d5;
    }

    &.icon-cash {
      background: #ffbf1f;
    }

    &.icon-rights {
      background: #63c86b;
    }

    &.icon-other {
      background: #b5b5b5;
    }
  }

  .payment-method-text {
    font-family: 'PingFang SC';
    font-size: 14px;
    color: #191a1b;
    line-height: 20px;
  }

  .amount-card {
    margin-bottom: 0;
  }

  .payment-amount-wrap {
    padding-top: 24px;
    padding-bottom: 10px;
    border-bottom: 0.5px solid #e6e6e5;
  }

  .payment-amount-input {
    width: 100%;
    border: none;
    outline: none;
    background: transparent;
    text-align: center;
    font-family: 'PingFang SC';
    font-size: 16px;
    color: #191a1b;
    line-height: 24px;

    &::placeholder {
      color: #b5b5b5;
    }
  }
}

.payment-submit-btn {
  width: 100%;
  height: 44px;
  background: #009100;
  border-radius: 8px;
  font-family: 'PingFang SC';
  font-size: 16px;
  font-weight: 500;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

// 多个待结算单提示弹窗
.pending-tip-popup {
  .pending-tip-content {
    padding: 20px 16px;
    font-family: 'PingFang SC';
    font-size: 14px;
    color: #191a1b;
    text-align: center;
    line-height: 22px;

    .highlight {
      color: #009100;
      font-weight: 500;
    }
  }

  .pending-tip-btn {
    width: calc(100% - 24px);
    height: 40px;
    margin: 0 12px 12px;
    background: #009100;
    border-radius: 8px;
    font-family: 'PingFang SC';
    font-size: 14px;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
}
</style>

<style lang="scss">
.sign-image-preview .van-image-preview__image img {
  background: #fff;
}
</style>
