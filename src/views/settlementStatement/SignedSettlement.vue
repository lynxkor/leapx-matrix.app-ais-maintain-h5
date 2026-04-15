<template>
  <div class="signed-settlement-page">
    <div class="signed-content">
      <div class="success-icon">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="32" fill="#009100" fill-opacity="0.1" />
          <path d="M20 32L28 40L44 24" stroke="#009100" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
      <div class="success-title">结算单已签署</div>
      <div class="success-desc">客户签字已完成，结算单已生效</div>

      <div class="info-card">
        <div class="info-row">
          <span class="label">施工单</span>
          <span class="value">{{ detailData.serviceProxyCode || '-' }}</span>
        </div>
        <div class="info-row">
          <span class="label">车辆VIN</span>
          <span class="value">{{ detailData.vehProfileVin || '-' }}</span>
        </div>
        <div class="info-row">
          <span class="label">结算金额</span>
          <span class="value highlight">¥{{ formatPrice(detailData.payableAmount) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import { getServiceStatementDetail } from '@/api/settlementStatement'

const router = useRouter()
const route = useRoute()

const detailData = ref({})

const formatPrice = (price) => {
  const amount = Number(price)
  if (!Number.isFinite(amount)) return '0.00'
  return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const getDetail = async() => {
  const id = route.query.statementId
  if (!id) {
    showToast('缺少结算单信息')
    return
  }

  try {
    const res = await getServiceStatementDetail(id)
    if (res?.code === 200 || res?.code === 0 || res?.success) {
      detailData.value = res.data || {}
    }
  } catch {
    // 静默失败
  }
}

// 拦截返回按钮
const onBeforeBack = () => {
  const isSigned = route.query.signed === 'true'
  if (isSigned) {
    router.replace('/settlement-statement/after-sales')
    return false
  }
  // 未签字时允许默认返回行为
  return true
}

defineExpose({
  onBeforeBack
})

onMounted(() => {
  getDetail()
})
</script>

<style lang="scss" scoped>
.signed-settlement-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 24px 12px;

  .signed-content {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .success-icon {
    margin-bottom: 16px;
  }

  .success-title {
    font-family: 'PingFang SC';
    font-size: 18px;
    font-weight: 500;
    color: #191a1b;
    margin-bottom: 8px;
  }

  .success-desc {
    font-family: 'PingFang SC';
    font-size: 14px;
    color: #545454;
    margin-bottom: 24px;
  }

  .info-card {
    width: 100%;
    background: #fff;
    border-radius: 6px;
    padding: 16px;

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 0.5px solid #e6e6e5;

      &:last-child {
        border-bottom: none;
      }

      .label {
        font-family: 'PingFang SC';
        font-size: 14px;
        color: #545454;
      }

      .value {
        font-family: 'PingFang SC';
        font-size: 14px;
        color: #191a1b;

        &.highlight {
          color: #009100;
          font-weight: 500;
        }
      }
    }
  }
}
</style>
