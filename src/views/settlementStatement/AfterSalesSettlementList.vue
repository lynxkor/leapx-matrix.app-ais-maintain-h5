<template>
  <div class="after-sales-settlement-list">
    <!-- 加载中 -->
    <van-loading v-if="isLoading" color="#00AA00" class="page-loading" />

    <template v-else>
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
        <!-- 客户签字模块：仅已交车展示，并按签字状态展示 -->
        <div v-if="isCompleted" class="sign-section" @click="handleSignClick">
          <div class="sign-header">
            <span class="sign-title">客户签字</span>
            <div class="sign-status">
              <span :class="signStatusClass">{{ signStatusText }}</span>
              <svg class="chevron-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M6 4L10 8L6 12"
                  :stroke="signStatusClass === 'status-green' ? '#009100' : '#888888'"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
          </div>
          <div class="sign-desc">为保障双方合理权益，请完成客户签字确认</div>
        </div>

        <!-- 结算信息卡片 -->
        <div class="settle-info-card">
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
              <div class="record-time">{{ record.createTime }}</div>
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
                <div class="repair-type">{{ item.checkoutTypeName }}-{{ item.warrantyTypeName }}</div>
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
    <AisPopup v-model:show="showAddPayment" title="创建收款记录" position="bottom" round>
      <template #content>
        <div class="payment-form">
          <div class="payment-card">
            <div class="payment-card-title">支付方式</div>
            <div class="payment-method-grid">
              <div
                v-for="item in paymentMethods"
                :key="item.value"
                class="payment-method-item"
                :class="{ active: paymentForm.paymentMethod === item.value }"
                @click="selectPaymentMethod(item)"
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
                type="number"
                placeholder="请输入支付金额"
              />
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="payment-submit-btn" @click="handlePaymentSubmit">确认结算</div>
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
      closeable
      :popup-style="{ height: '330px' }"
    >
      <template #content>
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
              <span class="channel-desc">将生成待签字施工单且需要用户签字</span>
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
        <div class="sign-popup-footer">
          <div class="sign-popup-btn" @click="handleSignSuccess">确定</div>
        </div>
      </template>
    </AisPopup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { showToast } from 'vant'
import { useRouter, useRoute } from 'vue-router'
import AisPopup from '@/libs/components/AisPopup.vue'
import {
  getServiceStatementDetail,
  getServiceStatementListByServiceProxy,
  signSettlementStatement,
  submitSettlementStatement,
  addReceiptRecord,
  receiptCompletion
} from '@/api/settlementStatement'

const router = useRouter()
const route = useRoute()

// 加载状态
const isLoading = ref(true)

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
const signStatus = ref('not_signed')

const isSuccessResponse = (res) => res?.code === 200 || res?.code === 0 || res?.success === true

const getFallbackBaseInfo = () => ({
  serviceProxyCode: route.query.serviceProxyCode || '',
  vehProfileVin: route.query.vehProfileVin || ''
})

const getSignStatus = (statement) => {
  const backendSignStatus = Number(statement?.signStatus)

  if (backendSignStatus === 20) {
    return 'signed'
  }

  if (backendSignStatus === 10) {
    return 'not_signed'
  }

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
        showToast(res?.msg || '未查询到对应结算单')
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
const isCurrentLastSettlement = computed(() => Boolean(detailData.value.isCheck))
const shouldUseSignFlow = computed(() => isSingleSettlement.value || isCurrentLastSettlement.value)
const settleButtonText = computed(() => (shouldUseSignFlow.value ? '提交结算并签字' : '提交结算'))
const statementTypeLabel = computed(() => detailData.value.statementTypeLabel || '')
const statementStatusText = computed(() => detailData.value.statementStatusLabel || detailData.value.statementStatusDesc || '')
const isWarrantyOrContract = computed(() => ['保修', '合同'].some((item) => statementTypeLabel.value.includes(item)))
const isSelfPaySettlement = computed(() => ['自费', '保险', '内部结算'].some((item) => statementTypeLabel.value.includes(item)))
const isPcPaymentCompleted = computed(() => {
  return Boolean(detailData.value.receiveTime) || statementStatusText.value.includes('已收款')
})
const bottomActionConfig = computed(() => {
  if (isEmptyDetail.value || isCompleted.value || isPcPaymentCompleted.value || isPaymentConfirmed.value) {
    return null
  }

  if (!isPending.value) {
    return null
  }

  if (isWarrantyOrContract.value) {
    if (signStatus.value === 'signed') {
      return {
        type: 'hint',
        text: '请请移步PC创建保修申请单'
      }
    }

    return {
      type: 'button',
      text: settleButtonText.value,
      action: shouldUseSignFlow.value ? 'submitSign' : 'submitSettlement'
    }
  }

  if (isSelfPaySettlement.value || !statementTypeLabel.value) {
    if (signStatus.value !== 'signed') {
      return {
        type: 'button',
        text: settleButtonText.value,
        action: shouldUseSignFlow.value ? 'submitSign' : 'submitSettlement'
      }
    }

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

  return {
    type: 'button',
    text: settleButtonText.value,
    action: shouldUseSignFlow.value ? 'submitSign' : 'submitSettlement'
  }
})
const signChannelValue = computed(() => (selectedChannel.value === 'paper' ? 40 : ''))
const buildSettlementPayload = (includeSignChannel = false) => {
  const payload = {
    id: detailData.value.id,
    serviceProxyCode: detailData.value.serviceProxyCode,
    noFractionAmount: detailData.value.noFractionAmount,
    discountId: detailData.value.discountId,
    repairItemList: repairItems.value,
    partList: partItems.value
  }

  if (includeSignChannel) {
    payload.signChannel = signChannelValue.value
  }

  return payload
}
const buildReceiptPayload = () => ({
  statementId: detailData.value.id,
  invoiceRecordList: [
    {
      statementId: detailData.value.id,
      statementCode: detailData.value.code,
      payAmount: Number(paymentForm.value.amount),
      payType: paymentForm.value.paymentMethod,
      rightsCode: '',
      invoiceNumber: '',
      invoiceType: ''
    }
  ]
})

// 格式化金额
const formatPrice = (price) => {
  const amount = Number(price)
  if (!Number.isFinite(amount)) return '0.00'
  return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 获取支付方式文本
const getPayTypeText = (payType) => {
  const payTypeMap = {
    1: '现金',
    2: '刷卡',
    3: '微信支付',
    4: '支付宝',
    5: '银行转账',
    6: '其他',
    7: '权益抵扣'
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
  { text: '微信支付', value: 3, iconText: '微', iconType: 'wechat' },
  { text: '支付宝', value: 4, iconText: '支', iconType: 'alipay' },
  { text: '刷卡', value: 2, iconText: '卡', iconType: 'card' },
  { text: '现金', value: 1, iconText: '¥', iconType: 'cash' },
  { text: '权益抵扣', value: 7, iconText: '益', iconType: 'rights' },
  { text: '其他', value: 6, iconText: '其', iconType: 'other' }
]

const selectPaymentMethod = (item) => {
  paymentForm.value.paymentMethod = item.value
  paymentForm.value.paymentMethodText = item.text
}

// 根据签字状态显示不同文案和颜色
const signStatusText = computed(() => {
  if (signStatus.value === 'signed') {
    return '已签字'
  }
  return '待签字'
})

const signStatusClass = computed(() => {
  if (signStatus.value !== 'signed') {
    return 'status-green'
  }
  return 'status-gray'
})

const switchTab = (index) => {
  activeTab.value = index
  applyStatementDetail(statementList.value[index] || {})
}

// 签字模块点击
const handleSignClick = () => {
  if (signStatus.value === 'not_signed') {
    // c: 未签字，显示签字渠道选择弹窗
    showSignChannel.value = true
  } else {
    // b, d: 已签字或纸质单据已提交，跳转到已签字状态
    router.push(`/settlement-statement/sign/${activeTab.value}`)
  }
}

// 提交结算并签字
const handleSubmitSettlement = () => {
  showSignChannel.value = true
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
  if (isPending.value && shouldUseSignFlow.value) {
    const payload = buildSettlementPayload(true)

    if (!validateSettlementPayload(payload)) {
      return
    }

    try {
      const res = await signSettlementStatement(payload)
      if (!isSuccessResponse(res)) {
        showToast(res?.msg || '提交失败')
        return
      }

      showSignChannel.value = false
      showToast('提交成功')
      await getDetail({ preserveActiveTab: true })
      return
    } catch {
      showToast('提交失败')
      return
    }
  }

  signStatus.value = 'signed'
  showSignChannel.value = false
  showToast('提交成功')
}

const handleAddPayment = () => {
  paymentForm.value = {
    amount: '',
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

  try {
    const res = await receiptCompletion({ id: detailData.value.id })
    if (!isSuccessResponse(res)) {
      showToast(res?.msg || '确认收款失败')
      return
    }

    isPaymentConfirmed.value = true
    showToast('确认收款成功')
    await getDetail({ preserveActiveTab: true })
  } catch {
    showToast('确认收款失败')
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
  const payload = buildSettlementPayload()

  if (!validateSettlementPayload(payload)) {
    return
  }

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
  }
}

// 收款提交
const handlePaymentSubmit = async() => {
  // 校验收款金额
  if (!paymentForm.value.amount || parseFloat(paymentForm.value.amount) <= 0) {
    showToast('请输入支付金额')
    return
  }

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
  }
}

</script>

<style lang="scss" scoped>
.after-sales-settlement-list {
  min-height: 100vh;
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

  .sticky-header {
    position: fixed;
    top: 44px;
    left: 0;
    right: 0;
    z-index: 5001;
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
    margin-top: 12px;

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
    padding: 12px 0;
    border-bottom: 0.5px solid #e6e6e5;

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
    padding: 8px 0 12px;
    border-bottom: 0.5px solid #e6e6e5;

    &:last-child {
      border-bottom: none;
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
    padding: 12px 0;
    border-bottom: 0.5px solid #e6e6e5;

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
    padding: 8px 0 12px;
    border-bottom: 0.5px solid #e6e6e5;

    &:last-child {
      border-bottom: none;
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

        .status-green {
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
      margin-bottom: 12px;
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
  background: #f7f7f7;
  min-height: 520px;
  padding: 12px;

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
    height: 76px;
    border-radius: 8px;
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
</style>
