<template>
  <div class="settlement-preview">
    <div class="preview-content">
      <div class="preview-title">结算单预览</div>

      <div class="preview-card">
        <div class="preview-row">
          <span class="label">施工单</span>
          <span class="value">{{ detailData.serviceProxyCode || '-' }}</span>
        </div>
        <div class="preview-row">
          <span class="label">车辆VIN</span>
          <span class="value">{{ detailData.vehProfileVin || '-' }}</span>
        </div>
        <div class="preview-row">
          <span class="label">总金额</span>
          <span class="value">¥{{ formatPrice(detailData.totalAmount) }}</span>
        </div>
        <div class="preview-row">
          <span class="label">实际应付金额</span>
          <span class="value highlight">¥{{ formatPrice(detailData.payableAmount) }}</span>
        </div>
        <div class="preview-row">
          <span class="label">剩余应付金额</span>
          <span class="value highlight">¥{{ formatPrice(detailData.remainAmount) }}</span>
        </div>
      </div>

      <div v-if="repairItems.length > 0" class="preview-section">
        <div class="section-title">维修项目</div>
        <div v-for="(item, index) in repairItems" :key="index" class="preview-item">
          <div class="item-name">{{ item.repairItemName }}</div>
          <div class="item-amount">¥{{ formatPrice(item.repairAmount) }}</div>
        </div>
      </div>

      <div v-if="partItems.length > 0" class="preview-section">
        <div class="section-title">维修配件</div>
        <div v-for="(item, index) in partItems" :key="index" class="preview-item">
          <div class="item-name">{{ item.partsName }}</div>
          <div class="item-amount">¥{{ formatPrice(item.partsAmount) }}</div>
        </div>
      </div>
    </div>

    <div class="preview-footer">
      <div class="agreement-row" @click="agreed = !agreed">
        <div class="checkbox" :class="{ checked: agreed }">
          <svg v-if="agreed" width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6L5 9L10 3" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <span class="agreement-text">
          我已阅读并同意
          <span class="link" @click.stop="showAgreement = true">《零跑维保服务协议》</span>
        </span>
      </div>
      <div
        class="btn-primary"
        :class="{ disabled: !agreed }"
        @click="handleGoSign"
      >
        去签署结算单
      </div>
    </div>

    <!-- 协议弹窗 -->
    <van-dialog v-model:show="showAgreement" title="零跑维保服务协议" confirm-button-color="#009100">
      <div class="agreement-content">
        <p>本协议是用户与零跑汽车之间关于维保服务的协议。</p>
        <p>1. 用户同意按照结算单金额支付相应费用。</p>
        <p>2. 用户确认维修项目及配件内容属实。</p>
        <p>3. 签字后结算单生效。</p>
      </div>
    </van-dialog>
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
const repairItems = ref([])
const partItems = ref([])
const agreed = ref(false)
const showAgreement = ref(false)

const statementId = ref('')
const serviceProxyId = ref('')

const formatPrice = (price) => {
  const amount = Number(price)
  if (!Number.isFinite(amount)) return '0.00'
  return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const getDetail = async() => {
  const id = route.query.statementId
  const proxyId = route.query.serviceProxyId
  statementId.value = id || ''
  serviceProxyId.value = proxyId || ''

  if (!id) {
    showToast('缺少结算单信息')
    return
  }

  try {
    const res = await getServiceStatementDetail(id)
    if (res?.code === 200 || res?.code === 0 || res?.success) {
      const data = res.data || {}
      detailData.value = data
      repairItems.value = Array.isArray(data.repairItemResps) ? data.repairItemResps : []
      partItems.value = Array.isArray(data.partResps) ? data.partResps : []
    } else {
      showToast(res?.msg || '获取详情失败')
    }
  } catch {
    showToast('获取详情失败')
  }
}

const handleGoSign = () => {
  if (!agreed.value) {
    showToast('请同意零跑维保服务协议')
    return
  }
  router.push({
    path: '/settlement-statement/signing',
    query: {
      statementId: statementId.value,
      serviceProxyId: serviceProxyId.value,
      sourceStatus: route.query.sourceStatus || 'pending'
    }
  })
}

onMounted(() => {
  getDetail()
})
</script>

<style lang="scss" scoped>
.settlement-preview {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;

  .preview-content {
    flex: 1;
    padding: 12px;
    overflow-y: auto;
  }

  .preview-title {
    font-family: 'PingFang SC';
    font-size: 16px;
    font-weight: 500;
    color: #191a1b;
    margin-bottom: 12px;
  }

  .preview-card {
    background: #fff;
    border-radius: 6px;
    padding: 12px;
    margin-bottom: 12px;

    .preview-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
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

  .preview-section {
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

    .preview-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 0.5px solid #e6e6e5;

      &:last-child {
        border-bottom: none;
      }

      .item-name {
        font-family: 'PingFang SC';
        font-size: 14px;
        color: #191a1b;
        flex: 1;
      }

      .item-amount {
        font-family: 'PingFang SC';
        font-size: 14px;
        color: #009100;
        font-weight: 500;
      }
    }
  }

  .preview-footer {
    background: #fff;
    padding: 12px;
    padding-bottom: calc(12px + env(safe-area-inset-bottom));

    .agreement-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;

      .checkbox {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 1px solid #b5b5b5;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        &.checked {
          background: #009100;
          border-color: #009100;
        }
      }

      .agreement-text {
        font-family: 'PingFang SC';
        font-size: 13px;
        color: #545454;

        .link {
          color: #009100;
        }
      }
    }

    .btn-primary {
      width: 100%;
      height: 44px;
      border-radius: 8px;
      background: #009100;
      font-family: 'PingFang SC';
      font-size: 16px;
      font-weight: 500;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;

      &.disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }

  .agreement-content {
    padding: 16px;
    max-height: 300px;
    overflow-y: auto;

    p {
      font-family: 'PingFang SC';
      font-size: 14px;
      color: #545454;
      line-height: 1.6;
      margin-bottom: 8px;
    }
  }
}
</style>
