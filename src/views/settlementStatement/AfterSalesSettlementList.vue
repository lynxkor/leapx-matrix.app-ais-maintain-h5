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
        <!-- 客户签字模块 -->
        <!-- a. 有待提交的结算单则不显示 -->
        <div v-if="!hasPendingSettlement" class="sign-section" @click="handleSignClick">
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
              <span class="row-value green">¥{{ formatPrice(detailData.paidAmount) }}</span>
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
              <span class="row-value red">¥{{ formatPrice(detailData.remainAmount) }}</span>
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
      </div>

      <!-- 底部操作栏 -->
      <div class="action-bar">
        <!-- 已交车状态：只显示联系车主 -->
        <template v-if="isCompleted">
          <div class="btn-pill btn-outline" @click="handleContact">
            联系车主
          </div>
        </template>
        <!-- 待交车状态：显示联系车主和结算 -->
        <template v-else-if="isPending">
          <div class="btn-pill btn-outline" @click="handleContact">
            联系车主
          </div>
          <div class="btn-pill btn-primary" @click="handleSettle">
            结算
          </div>
        </template>
      </div>
    </template>

    <!-- 添加收款弹窗 -->
    <AisPopup v-model:show="showAddPayment" title="添加收款" position="bottom" round>
      <template #content>
        <div class="payment-form">
          <div class="form-item">
            <span class="form-label">收款金额</span>
            <div class="form-input-wrap">
              <input
                v-model="paymentForm.amount"
                class="form-input"
                type="number"
                placeholder="请输入收款金额"
              />
              <span class="form-unit">元</span>
            </div>
          </div>
          <div class="form-item" @click="showPaymentMethodPicker = true">
            <span class="form-label">收款方式</span>
            <div class="form-value-wrap">
              <span :class="{ placeholder: !paymentForm.paymentMethod }">
                {{ paymentForm.paymentMethodText || '请选择收款方式' }}
              </span>
              <svg class="arrow-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M6 4L10 8L6 12"
                  stroke="#999"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
        <div class="payment-submit-btn" @click="handlePaymentSubmit">确认收款</div>
      </template>
    </AisPopup>

    <!-- 收款方式选择器 -->
    <van-popup v-model:show="showPaymentMethodPicker" position="bottom">
      <van-picker
        :columns="paymentMethods"
        @confirm="onPaymentMethodConfirm"
        @cancel="showPaymentMethodPicker = false"
      />
    </van-popup>

    <!-- 签字渠道选择弹窗 -->
    <AisPopup v-model:show="showSignChannel" title="签字渠道" position="bottom" round>
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
          </div>
        </div>
        <div class="channel-submit-btn" @click="handleSignSuccess">确认签字</div>
      </template>
    </AisPopup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { useRouter, useRoute } from 'vue-router'
import AisPopup from '@/libs/components/AisPopup.vue'
import { callPhone } from '@/libs/utils/nativeFn'
import { getServiceStatementDetail } from '@/api/settlementStatement'

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

// 本地收款记录（用于前端临时记录）
const paymentRecords = ref([])

// 已收金额
const paidAmount = ref(0)

// 剩余应付金额
const remainingAmount = computed(() => {
  return (detailData.value.payableAmount || 0) - paidAmount.value
})

// 从路由获取来源状态：pending-待交车，completed-已交车
const sourceStatus = ref('pending')

// 从路由获取结算单ID
const statementId = ref('')

onMounted(() => {
  // 获取路由参数
  sourceStatus.value = route.query.status || 'pending'
  statementId.value = route.query.id || ''
  // 获取详情
  getDetail()
})

// 获取详情
const getDetail = async() => {
  if (!statementId.value) {
    showToast('缺少结算单ID')
    isLoading.value = false
    return
  }

  isLoading.value = true

  try {
    const res = await getServiceStatementDetail(statementId.value)
    if (res.code === 200) {
      const data = res.data || {}
      detailData.value = data
      repairItems.value = data.repairItemResps || []
      partItems.value = data.partResps || []
      invoiceRecords.value = data.invoiceRecordResps || []
    } else {
      showToast(res.msg || '获取详情失败')
    }
  } catch (error) {
    showToast('获取详情失败')
  } finally {
    isLoading.value = false
  }
}

// 是否为待交车状态
const isPending = computed(() => sourceStatus.value === 'pending')

// 是否为已交车状态
const isCompleted = computed(() => sourceStatus.value === 'completed')

const tabs = ref(['结算单1'])
const activeTab = ref(0)
const showSignChannel = ref(false)
const selectedChannel = ref('paper')

// ========== 结算状态数据 ==========
// 结算类型：warranty(保修)、contract(合同)、self_pay(自费)、insurance(保险)、internal(内部结算)
const settlementType = ref('self_pay')

// 是否已签字完成
const isSigned = ref(false)

// 是否已确认收款
const isPaymentConfirmed = ref(false)

// 签字状态
const hasPendingSettlement = ref(false)
const signStatus = ref('not_signed')

// 格式化金额
const formatPrice = (price) => {
  if (typeof price !== 'number' || !price) return '0.00'
  return price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 获取支付方式文本
const getPayTypeText = (payType) => {
  const payTypeMap = {
    1: '现金',
    2: '刷卡',
    3: '微信支付',
    4: '支付宝',
    5: '银行转账',
    6: '其他'
  }
  return payTypeMap[payType] || '未知'
}

// 添加收款弹窗
const showAddPayment = ref(false)
const showPaymentMethodPicker = ref(false)
const paymentForm = ref({
  amount: '',
  paymentMethod: '',
  paymentMethodText: ''
})

// 收款方式选项
const paymentMethods = [
  { text: '现金', value: 1 },
  { text: '刷卡', value: 2 },
  { text: '微信支付', value: 3 },
  { text: '支付宝', value: 4 },
  { text: '银行转账', value: 5 },
  { text: '其他', value: 6 }
]

// 收款方式选择确认
const onPaymentMethodConfirm = ({ selectedOptions }) => {
  paymentForm.value.paymentMethod = selectedOptions[0].value
  paymentForm.value.paymentMethodText = selectedOptions[0].text
  showPaymentMethodPicker.value = false
}

// 根据签字状态显示不同文案和颜色
const signStatusText = computed(() => {
  if (signStatus.value === 'signed') {
    return '已签字'
  }
  if (signStatus.value === 'pending') {
    return '查看客户签字'
  }
  return '邀请客户签字'
})

const signStatusClass = computed(() => {
  if (signStatus.value === 'not_signed') {
    return 'status-green'
  }
  return 'status-gray'
})

// 联系车主
const handleContact = () => {
  const phone = detailData.value.customerPhone
  if (phone) {
    callPhone(phone)
  } else {
    showToast('暂无联系电话')
  }
}

// 结算
const handleSettle = () => {
  showSignChannel.value = true
}

const switchTab = (index) => {
  activeTab.value = index
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
  if (tabs.value.length > 1) {
    showToast(`还剩 ${tabs.value.length - 1} 个结算单待提交，全部提交结算完毕生成待签字单`)
  } else {
    showSignChannel.value = true
  }
}

// 签字成功后的回调
const handleSignSuccess = () => {
  isSigned.value = true
  showSignChannel.value = false
}

// 添加收款
const handleAddPayment = () => {
  // 重置表单
  paymentForm.value = {
    amount: '',
    paymentMethod: '',
    paymentMethodText: ''
  }
  showAddPayment.value = true
}

// 确认收款
const handleConfirmPayment = () => {
  isPaymentConfirmed.value = true
  showToast('收款已完成')
  // 跳转到售后结算单列表
  router.push('/settlement-statement/after-sales')
}

// 收款提交
const handlePaymentSubmit = () => {
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

  // 添加收款记录
  const newRecord = {
    amount: payAmount,
    paymentMethod: paymentForm.value.paymentMethod,
    paymentMethodText: paymentForm.value.paymentMethodText,
    paymentTime: formatDateTime(new Date())
  }
  paymentRecords.value.push(newRecord)

  // 更新已收金额
  paidAmount.value += payAmount

  // 关闭弹窗
  showAddPayment.value = false

  // 显示成功提示
  showToast('收款成功')
}

// 格式化日期时间
const formatDateTime = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
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
      max-width: 351px;
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
      max-width: 351px;
      height: 40px;
      border-radius: 8px;
      background: #009100;
      font-family: 'PingFang SC';
      font-size: 14px;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: default;
    }

    // 底部按钮样式
    .btn-pill {
      padding: 0 24px;
      height: 40px;
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

// 签字渠道选择弹窗
.channel-list {
  background: #fff;
  border-radius: 8px 8px 0 0;
  padding: 0 12px;

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

  .channel-submit-btn {
    margin: 16px 12px;
    height: 44px;
    background: #009100;
    border-radius: 8px;
    font-family: 'PingFang SC';
    font-size: 16px;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
}

// 添加收款弹窗
.payment-form {
  background: #fff;
  padding: 16px 12px;

  .form-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 0;
    border-bottom: 0.5px solid #e6e6e5;

    &:last-child {
      border-bottom: none;
    }

    .form-label {
      font-family: 'PingFang SC';
      font-size: 14px;
      color: #191a1b;
      flex-shrink: 0;
    }

    .form-input-wrap {
      display: flex;
      align-items: center;
      gap: 8px;

      .form-input {
        width: 150px;
        border: none;
        outline: none;
        text-align: right;
        font-family: 'PingFang SC';
        font-size: 14px;
        color: #191a1b;
        background: transparent;

        &::placeholder {
          color: #999;
        }
      }

      .form-unit {
        font-family: 'PingFang SC';
        font-size: 14px;
        color: #666;
      }
    }

    .form-value-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: 'PingFang SC';
      font-size: 14px;
      color: #191a1b;

      .placeholder {
        color: #999;
      }

      .arrow-icon {
        flex-shrink: 0;
      }
    }
  }
}

.payment-submit-btn {
  margin: 16px 12px;
  height: 44px;
  background: #009100;
  border-radius: 8px;
  font-family: 'PingFang SC';
  font-size: 16px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
</style>
