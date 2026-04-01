<template>
  <div class="after-sales-settlement-list">
    <!-- 头部信息 + Tab 切换栏 -->
    <div class="sticky-header">
      <!-- 头部信息 -->
      <div class="header-info">
        <div class="info-row">
          <span class="info-label">施工单：</span>
          <span class="info-value">YS-2603132716114</span>
        </div>
        <div class="info-row">
          <span class="info-label">车辆VIN：</span>
          <span class="info-value">LFV3735241411448</span>
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
            <span class="row-value">¥{{ formatPrice(totalAmount) }}</span>
          </div>
          <div class="info-row">
            <span class="row-label">已收金额</span>
            <span class="row-value green">¥{{ formatPrice(paidAmount) }}</span>
          </div>
          <div class="info-row">
            <span class="row-label">优惠金额</span>
            <span class="row-value">¥{{ formatPrice(discountAmount) }}</span>
          </div>
          <div class="info-row">
            <span class="row-label">去零金额</span>
            <span class="row-value">¥{{ formatPrice(zeroAmount) }}</span>
          </div>
          <div class="info-divider"></div>
          <div class="info-row">
            <span class="row-label">实际应付金额</span>
            <span class="row-value">¥{{ formatPrice(actualAmount) }}</span>
          </div>
          <div class="info-row">
            <span class="row-label">剩余应付金额</span>
            <span class="row-value red">¥{{ formatPrice(remainingAmount) }}</span>
          </div>
        </div>
      </div>

      <!-- 收款记录列表 -->
      <div v-if="paymentRecords.length > 0" class="payment-records-section">
        <div class="section-title">收款记录</div>
        <div v-for="(record, index) in paymentRecords" :key="index" class="payment-record-item">
          <div class="record-left">
            <div class="record-method">{{ record.paymentMethodText }}</div>
            <div class="record-time">{{ record.paymentTime }}</div>
          </div>
          <div class="record-right">
            <div class="record-amount">+¥{{ formatPrice(record.amount) }}</div>
          </div>
        </div>
      </div>

      <!-- 维修项目 -->
      <div class="repair-section">
        <div class="section-title">维修项目</div>
        <div class="repair-item">
          <div class="repair-left">
            <div class="repair-name">前保险杠补漆</div>
            <div class="repair-code">C1031000035</div>
            <div class="repair-type">一般维修-保险-无</div>
          </div>
          <div class="repair-right">
            <div class="repair-price">¥621.50</div>
            <div class="repair-discount">优惠 ¥0.00</div>
          </div>
        </div>
        <div class="repair-item-bottom">
          <span class="original-price">¥700.00</span>
          <span class="quantity">x6.44</span>
        </div>

        <div class="repair-item">
          <div class="repair-left">
            <div class="repair-name">前保险杠补漆</div>
            <div class="repair-code">C1031000035</div>
            <div class="repair-type">一般维修-保险-无</div>
          </div>
          <div class="repair-right">
            <div class="repair-price">¥621.50</div>
            <div class="repair-discount">优惠 ¥0.00</div>
          </div>
        </div>
        <div class="repair-item-bottom">
          <span class="original-price">¥700.00</span>
          <span class="quantity">x1.00</span>
        </div>

        <div class="repair-item special">
          <div class="repair-left">
            <div class="repair-name">更换或拆装左迁门电动防夹玻璃升降器总成</div>
            <div class="repair-code">C1031000035</div>
            <div class="repair-type">一般维修-保险-无</div>
          </div>
          <div class="repair-right">
            <div class="repair-price">¥621.50</div>
            <div class="repair-discount">优惠 ¥0.00</div>
          </div>
        </div>
        <div class="repair-item-bottom">
          <span class="original-price">¥700.00</span>
          <span class="quantity">x1.00</span>
        </div>
      </div>

      <!-- 维修配件 -->
      <div class="parts-section">
        <div class="section-title">维修配件</div>
        <div class="part-item">
          <div class="part-left">
            <div class="part-name-row">
              <span class="part-name">左前大灯</span>
              <span class="part-tag">原厂件</span>
            </div>
            <div class="part-code">C1031000035</div>
            <div class="part-type">一般维修-保险-无</div>
            <div class="part-detail-row">
              <span class="part-original">¥700.00</span>
              <span class="part-actual">实际领料 1</span>
              <span class="part-return">退料 0</span>
            </div>
          </div>
          <div class="part-right">
            <div class="part-price">¥8,681.81</div>
            <div class="part-discount">优惠 ¥2.46</div>
          </div>
        </div>
        <div class="part-item-bottom">
          <span class="original-price">¥700.00</span>
          <span class="quantity">x1.00</span>
        </div>

        <div class="part-item">
          <div class="part-left">
            <div class="part-name-row">
              <span class="part-name">保险杠侧边支架</span>
              <span class="part-tag">原厂件</span>
            </div>
            <div class="part-code">C1031000035</div>
            <div class="part-type">一般维修-保险-无</div>
            <div class="part-detail-row">
              <span class="part-original">¥700.00</span>
              <span class="part-actual">实际领料 1</span>
              <span class="part-return">退料 0</span>
            </div>
          </div>
          <div class="part-right">
            <div class="part-price">¥8,681.81</div>
            <div class="part-discount">优惠 ¥2.46</div>
          </div>
        </div>
        <div class="part-item-bottom">
          <span class="original-price">¥700.00</span>
          <span class="quantity">x1.00</span>
        </div>

        <div class="part-item special">
          <div class="part-left">
            <div class="part-name-row">
              <span class="part-name">B01左前门电动防夹玻璃升降器总成</span>
              <span class="part-tag">原厂件</span>
            </div>
            <div class="part-code">C1031000035</div>
            <div class="part-type">一般维修-保险-无</div>
            <div class="part-detail-row">
              <span class="part-original">¥700.00</span>
              <span class="part-actual">实际领料 1</span>
              <span class="part-return">退料 0</span>
            </div>
          </div>
          <div class="part-right">
            <div class="part-price">¥8,681.81</div>
            <div class="part-discount">优惠 ¥2.46</div>
          </div>
        </div>
        <div class="part-item-bottom">
          <span class="original-price">¥700.00</span>
          <span class="quantity">x1.00</span>
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div v-if="showBottomAction" class="action-bar">
      <!-- 保修/合同类型：签字后显示提示，无点击交互 -->
      <div v-if="isWarrantyOrContract && isSigned" class="action-hint">
        请移步PC创建保修申请单
      </div>

      <!-- 自费/保险/内部结算：提交结算并签字 -->
      <div v-else-if="isSelfPayOrInsuranceOrInternal && !isSigned" class="action-btn" @click="handleSubmitSettlement">
        提交结算并签字
      </div>

      <!-- 自费/保险/内部结算：签字后有待支付金额 -->
      <div v-else-if="isSelfPayOrInsuranceOrInternal && isSigned && remainingAmount > 0" class="action-btn add-payment" @click="handleAddPayment">
        添加收款
      </div>

      <!-- 自费/保险/内部结算：签字后无待支付金额 -->
      <div v-else-if="isSelfPayOrInsuranceOrInternal && isSigned && remainingAmount <= 0 && !isPaymentConfirmed" class="action-btn confirm-payment" @click="handleConfirmPayment">
        确认收款
      </div>
    </div>

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
import { ref, computed } from 'vue'
import { showToast } from 'vant'
import { useRouter } from 'vue-router'
import AisPopup from '@/libs/components/AisPopup.vue'

const router = useRouter()

const tabs = ref(['结算单1'])
const activeTab = ref(0)
const showSignChannel = ref(false)
const selectedChannel = ref('paper')

// ========== 结算状态数据 ==========
// 结算类型：warranty(保修)、contract(合同)、self_pay(自费)、insurance(保险)、internal(内部结算)
const settlementType = ref('self_pay') // 可切换测试：'warranty', 'contract', 'self_pay', 'insurance', 'internal'

// 是否已签字完成
const isSigned = ref(false)

// 是否已确认收款（点击确认收款后）
const isPaymentConfirmed = ref(false)

// 模拟签字状态数据
// - hasPendingSettlement: 是否有待提交的结算单
// - signStatus: 'pending' | 'not_signed' | 'signed'
// - signChannel: 'paper' | 'app'
const hasPendingSettlement = ref(false) // a. 有待提交的结算单则不显示该模块
const signStatus = ref('not_signed') // c. 已提交但未签字
// const signStatus = ref('signed') // d. 已签字完成
// const signStatus = ref('pending') // b. 纸质单据已提交，显示查看客户签字

// ========== 金额计算 ==========
// 结算金额数据
const totalAmount = ref(38201.56)
const paidAmount = ref(0)
const discountAmount = ref(50.0)
const zeroAmount = ref(1.56)

// 实际应付金额
const actualAmount = computed(() => {
  return totalAmount.value - discountAmount.value - zeroAmount.value
})

// 剩余应付金额
const remainingAmount = computed(() => {
  return actualAmount.value - paidAmount.value
})

// ========== 结算类型判断 ==========
// 是否是保修或合同类型
const isWarrantyOrContract = computed(() => {
  return settlementType.value === 'warranty' || settlementType.value === 'contract'
})

// 是否是自费、保险、内部结算类型
const isSelfPayOrInsuranceOrInternal = computed(() => {
  return (
    settlementType.value === 'self_pay' ||
    settlementType.value === 'insurance' ||
    settlementType.value === 'internal'
  )
})

// 是否显示底部操作栏
const showBottomAction = computed(() => {
  // c条款: 若已在PC端收款完成，则APP端也不需要显示按钮
  if (isPaymentConfirmed.value) {
    return false
  }

  // a条款: 保修/合同类型签字后不显示按钮
  if (isWarrantyOrContract.value && isSigned.value) {
    return true // 显示提示信息
  }

  // b条款: 自费/保险/内部结算类型
  if (isSelfPayOrInsuranceOrInternal.value) {
    return true
  }

  return false
})

// 收款记录
const paymentRecords = ref([])

// 格式化金额
const formatPrice = (price) => {
  if (typeof price !== 'number') return '0.00'
  return price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
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
  { text: '现金', value: 'cash' },
  { text: '刷卡', value: 'card' },
  { text: '微信支付', value: 'wechat' },
  { text: '支付宝', value: 'alipay' },
  { text: '银行转账', value: 'bank' },
  { text: '其他', value: 'other' }
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
    return '已签字' // b, d
  }
  if (signStatus.value === 'pending') {
    return '查看客户签字' // b
  }
  return '邀请客户签字' // c
})

const signStatusClass = computed(() => {
  if (signStatus.value === 'not_signed') {
    return 'status-green' // c: 待签字绿色
  }
  return 'status-gray' // b, d: 已签字或查看客户签字灰色
})

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
