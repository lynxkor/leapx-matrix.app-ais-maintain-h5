<template>
  <div class="pre-auth-detail">
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <div class="detail-container">
        <!-- 客户信息卡片 -->
        <ListItem>
          <template #header>
            <div class="card-title">客户信息</div>
          </template>
          <template #card-info>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">客户姓名</div>
                <div class="info-value">{{ detail.customerName }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">联系电话</div>
                <div class="info-value">{{ detail.phone }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">VIN码</div>
                <div class="info-value">{{ detail.vin }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">车型</div>
                <div class="info-value">{{ detail.model }}</div>
              </div>
            </div>
          </template>
        </ListItem>

        <!-- 预授权信息卡片 -->
        <ListItem style="margin-top: 12px;">
          <template #header>
            <div class="card-title">预授权信息</div>
          </template>
          <template #card-info>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">申请时间</div>
                <div class="info-value">{{ formatDate(detail.applyTime) }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">预授权金额</div>
                <div class="info-value amount">¥{{ detail.amount }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">有效期</div>
                <div class="info-value">{{ detail.validityPeriod }}天</div>
              </div>
              <div class="info-item">
                <div class="info-label">状态</div>
                <div class="info-value">
                  <span :class="`status-${detail.status}`">{{ getStatusText(detail.status) }}</span>
                </div>
              </div>
            </div>
          </template>
        </ListItem>

        <!-- 维修项目卡片 -->
        <ListItem style="margin-top: 12px;">
          <template #header>
            <div class="card-title">维修项目</div>
          </template>
          <template #card-info>
            <div class="repair-items">
              <div
                v-for="(item, index) in detail.repairItems"
                :key="index"
                class="repair-item"
              >
                <div class="item-info">
                  <div class="item-name">{{ item.name }}</div>
                  <div class="item-desc">{{ item.description }}</div>
                </div>
                <div class="item-price">¥{{ item.price }}</div>
              </div>
            </div>
          </template>
        </ListItem>

        <!-- 审批记录卡片 -->
        <ListItem
          v-if="detail.approvalRecords && detail.approvalRecords.length > 0"
          style="margin-top: 12px;"
        >
          <template #header>
            <div class="card-title">审批记录</div>
          </template>
          <template #card-info>
            <div class="approval-records">
              <div
                v-for="(record, index) in detail.approvalRecords"
                :key="index"
                class="approval-record"
              >
                <div class="record-header">
                  <span class="record-type">{{ record.type }}</span>
                  <span class="record-time">{{ record.time }}</span>
                </div>
                <div class="record-content">{{ record.content }}</div>
                <div class="record-operator">操作人：{{ record.operator }}</div>
              </div>
            </div>
          </template>
        </ListItem>
      </div>
    </van-pull-refresh>

    <!-- 底部操作按钮 -->
    <div class="action-buttons" v-if="showActions">
      <van-button
        v-if="detail.status === 'pending'"
        type="primary"
        block
        @click="showApprovalPopup = true"
      >
        批准
      </van-button>
      <van-button
        v-if="detail.status === 'pending'"
        type="danger"
        block
        style="margin-top: 10px;"
        @click="showRejectionPopup = true"
      >
        拒绝
      </van-button>
      <van-button
        v-if="detail.status === 'rejected'"
        type="primary"
        block
        @click="reapplyAuth"
      >
        重新申请
      </van-button>
    </div>

    <!-- 审批确认弹窗 -->
    <AisPopup
      v-model:show="showApprovalPopup"
      title="批准预授权"
      :closeable="true"
      :position="'bottom'"
      :round="true"
    >
      <template #content>
        <div class="popup-content">
          <p class="confirm-message">确定要批准此预授权申请吗？</p>
          <van-field
            v-model="approvalRemark"
            rows="3"
            autosize
            type="textarea"
            maxlength="100"
            placeholder="请输入审批意见（可选）"
            show-word-limit
          />
        </div>
      </template>
      <template #footer>
        <div class="popup-actions">
          <van-button
            style="flex: 1; margin-right: 10px;"
            @click="cancelApproval"
          >
            取消
          </van-button>
          <van-button
            style="flex: 1;"
            type="primary"
            @click="confirmApproval"
          >
            确认批准
          </van-button>
        </div>
      </template>
    </AisPopup>

    <!-- 拒绝确认弹窗 -->
    <AisPopup
      v-model:show="showRejectionPopup"
      title="拒绝预授权"
      :closeable="true"
      :position="'bottom'"
      :round="true"
    >
      <template #content>
        <div class="popup-content">
          <p class="confirm-message">确定要拒绝此预授权申请吗？</p>
          <van-field
            v-model="rejectionRemark"
            rows="3"
            autosize
            type="textarea"
            maxlength="100"
            placeholder="请输入拒绝原因"
            show-word-limit
          />
        </div>
      </template>
      <template #footer>
        <div class="popup-actions">
          <van-button
            style="flex: 1; margin-right: 10px;"
            @click="cancelRejection"
          >
            取消
          </van-button>
          <van-button
            style="flex: 1;"
            type="danger"
            @click="confirmRejection"
          >
            确认拒绝
          </van-button>
        </div>
      </template>
    </AisPopup>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Toast } from 'vant'
import AisPopup from '@/components/AisPopup.vue'
import ListItem from '@/components/ListItem.vue'

const router = useRouter()
const route = useRoute()

// 响应式数据
const refreshing = ref(false)
const showActions = ref(true)
const showApprovalPopup = ref(false)
const showRejectionPopup = ref(false)
const approvalRemark = ref('')
const rejectionRemark = ref('')

// 模拟详情数据
const detail = ref({
  id: 1,
  customerName: '张三',
  phone: '138****5678',
  vin: 'LSJA24U72JF234567',
  model: 'Leapmotor C10',
  applyTime: '2024-12-01 10:30:25',
  amount: '2,800.00',
  validityPeriod: 30,
  status: 'pending',
  repairItems: [
    {
      name: '更换刹车片',
      description: '前轮刹车片磨损严重，需要更换',
      price: '580.00'
    },
    {
      name: '机油保养',
      description: '更换全合成机油及机滤',
      price: '480.00'
    },
    {
      name: '轮胎更换',
      description: '更换前轮两条轮胎',
      price: '1,200.00'
    },
    {
      name: '空调滤芯',
      description: '更换空调滤芯',
      price: '240.00'
    }
  ],
  approvalRecords: [
    {
      type: '申请提交',
      time: '2024-12-01 10:30',
      content: '提交预授权申请，等待审核',
      operator: '服务顾问 张伟'
    }
  ]
})

// 方法定义
const onRefresh = async() => {
  // 模拟刷新数据
  setTimeout(() => {
    refreshing.value = false
    Toast('刷新完成')
  }, 1000)
}

const getStatusText = (status) => {
  switch (status) {
    case 'pending': return '待处理'
    case 'approved': return '已批准'
    case 'rejected': return '已拒绝'
    default: return ''
  }
}

const formatDate = (dateString) => {
  return dateString
}

const confirmApproval = () => {
  Toast.success('批准成功')
  // 这里可以添加实际的API调用
  detail.value.status = 'approved'
  // 更新审批记录
  detail.value.approvalRecords.push({
    type: '批准',
    time: new Date().toLocaleString(),
    content: `已批准预授权申请，审批意见：${approvalRemark.value || '无'}`,
    operator: '审批员 李明'
  })
  showActions.value = false
  showApprovalPopup.value = false
  approvalRemark.value = ''
}

const cancelApproval = () => {
  showApprovalPopup.value = false
  approvalRemark.value = ''
}

const confirmRejection = () => {
  if (!rejectionRemark.value.trim()) {
    Toast('请输入拒绝原因')
    return
  }

  Toast.info('拒绝操作')
  // 这里可以添加实际的API调用
  detail.value.status = 'rejected'
  // 更新审批记录
  detail.value.approvalRecords.push({
    type: '拒绝',
    time: new Date().toLocaleString(),
    content: `拒绝了预授权申请，原因：${rejectionRemark.value}`,
    operator: '审批员 李明'
  })
  showActions.value = false
  showRejectionPopup.value = false
  rejectionRemark.value = ''
}

const cancelRejection = () => {
  showRejectionPopup.value = false
  rejectionRemark.value = ''
}

const reapplyAuth = () => {
  Toast('重新申请操作')
  // 这里可以导航到编辑页面
  router.push(`/pre-authorization/edit/${detail.value.id}`)
}

onMounted(() => {
  // 可以在这里获取真实的详情数据
  console.log('预授权详情页加载，ID:', route.params.id)
})
</script>

<style lang="scss" scoped>
.pre-auth-detail {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 120px;

  .detail-container {
    padding: 16px 0;
  }

  .card-title {
    font-weight: bold;
    color: #323233;
    font-size: 16px;
    margin-bottom: 12px;
  }

  .info-grid {
    display: grid;
    gap: 12px;
  }

  .info-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #f2f3f5;
    align-items: center;

    &:last-child {
      border-bottom: none;
    }
  }

  .info-label {
    color: #969799;
    min-width: 80px;
  }

  .info-value {
    color: #323233;
    flex: 1;
    text-align: right;

    &.amount {
      color: #ff5000;
      font-weight: bold;
    }
  }

  .status-pending {
    color: #ff976a;
  }

  .status-approved {
    color: #00c48f;
  }

  .status-rejected {
    color: #ee0a24;
  }

  .repair-items {
    padding: 0;

    .repair-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f2f3f5;

      &:last-child {
        border-bottom: none;
      }

      .item-info {
        flex: 1;

        .item-name {
          font-weight: bold;
          color: #323233;
          margin-bottom: 4px;
        }

        .item-desc {
          font-size: 12px;
          color: #969799;
        }
      }

      .item-price {
        font-weight: bold;
        color: #ff5000;
      }
    }
  }

  .approval-records {
    padding: 0;

    .approval-record {
      padding: 12px 0;
      border-bottom: 1px solid #f2f3f5;

      &:last-child {
        border-bottom: none;
      }

      .record-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;

        .record-type {
          font-weight: bold;
          color: #323233;
        }

        .record-time {
          color: #969799;
          font-size: 12px;
        }
      }

      .record-content {
        color: #646566;
        margin-bottom: 4px;
      }

      .record-operator {
        font-size: 12px;
        color: #969799;
      }
    }
  }

  .action-buttons {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 20px 16px 16px;
    background: #fff;
    border-top: 1px solid #f2f3f5;

    .van-button {
      border-radius: 25px;
    }
  }

  .popup-content {
    .confirm-message {
      margin-bottom: 16px;
      color: #333;
      line-height: 1.5;
    }
  }

  .popup-actions {
    display: flex;
  }
}
</style>
