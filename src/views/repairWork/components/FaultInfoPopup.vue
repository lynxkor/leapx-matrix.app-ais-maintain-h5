<template>
  <van-popup
    v-model:show="visible"
    overlay-class="fullScreen-popup"
    :style="{ width: '100vw', height: '100%' }"
    teleport="body"
    position="bottom"
    z-index="5055"
    @close="handleClose"
  >
    <div class="fault-info-page">
      <!-- 标题栏 -->
      <div class="page-header">
        <div class="close-btn" @click="handleClose">
          <van-icon name="arrow-left" />
        </div>
        <div class="header-title">填写故障信息</div>
        <div class="header-right"></div>
      </div>

      <!-- 施工单编号 -->
      <div class="order-number-section">
        <div class="order-number">
          施工单编号：{{ orderNo }}
        </div>
      </div>

      <!-- 本次进店是否存在故障 -->
      <div class="section-card">
        <div class="section-row">
          <span class="section-label">本次进店是否存在故障</span>
          <div class="radio-group">
            <div
              class="radio-item"
              :class="{ active: hasFault === true }"
              @click="hasFault = true"
            >
              <van-icon v-if="hasFault === true" name="checked" color="var(--leap-color-primary)" size="20" />
              <span>是</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 故障模块 -->
      <div class="section-card">
        <div class="section-header-row">
          <span class="section-title">故障模块</span>
        </div>
        <div class="module-content">
          <!-- 添加故障模块按钮 -->
          <div class="add-module-btn" @click="showAddModulePopup = true">
            <van-icon name="add-o" size="20" color="var(--leap-color-primary)" />
            <span class="add-text">添加故障模块</span>
          </div>
          <!-- 故障模块列表 -->
          <div
            v-for="(item, index) in faultModules"
            :key="index"
            class="module-item"
          >
            <span class="module-text">{{`${item.vrtName}-${item.vfgName}-${item.cccName}`}}</span>
            <van-icon name="delete-o" size="16" color="#3B3E3B" @click="handleDeleteModule(index)" />
          </div>
        </div>
      </div>

      <!-- 故障描述 -->
      <div class="section-card">
        <div class="section-header-row">
          <span class="section-title">故障描述</span>
        </div>
        <div class="textarea-wrapper">
          <van-field
            v-model="faultDescription"
            type="textarea"
            placeholder="请输入"
            rows="3"
            autosize
            :maxlength="500"
            class="fault-textarea"
          />
        </div>
      </div>

      <!-- 底部保存按钮 -->
      <div class="bottom-bar">
        <div
          class="save-btn"
          :class="{ 'is-disabled': submitting }"
          @click="handleSubmit"
        >
          保存
        </div>
      </div>

      <!-- 添加故障模块弹窗 -->
      <AddFaultInfoPopup
        v-model:visible="showAddModulePopup"
        :existing-modules="faultModules"
        @select="handleModuleSelect"
      />
    </div>
  </van-popup>
</template>

<script setup>
import { ref, watch } from 'vue'
import { showToast, showSuccessToast } from 'vant'
import AddFaultInfoPopup from './AddFaultInfoPopup.vue'
import { updateFaultRecord } from '../../../api/repairWork'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  serviceProxyId: {
    type: String,
    default: ''
  },
  orderNo: {
    type: String,
    default: ''
  },
  order: {
    type: Object,
    default: () => {}
  }
})

const emit = defineEmits(['update:modelValue', 'refresh'])

const visible = ref(props.modelValue)

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  (newVal) => {
    visible.value = newVal
  }
)

// 监听 visible 变化
watch(visible, (newVal) => {
  if (!newVal) {
    emit('update:modelValue', false)
  }
})

// 是否存在故障
const hasFault = ref(true)

// 故障模块列表
const faultModules = ref([])

// 故障描述
const faultDescription = ref('')

// 显示添加模块弹窗
const showAddModulePopup = ref(false)

// 提交中标志（防重复提交）
const submitting = ref(false)

// 删除故障模块
const handleDeleteModule = (index) => {
  faultModules.value.splice(index, 1)
}

// 处理模块选择（从弹窗接收单条数据）
const handleModuleSelect = (module) => {
  faultModules.value.push(module)
}

// 提交保存
const handleSubmit = async() => {
  if (submitting.value) return
  if (!faultModules.value.length) {
    showToast({
      message: '请选择故障模块',
      'z-index': 5100
    })
    return
  }
  if (!faultDescription.value) {
    showToast({
      message: '请填写故障描述',
      'z-index': 5100
    })
    return
  }
  submitting.value = true
  try {
    const faultModulesArr = faultModules.value.map(item => {
      delete item.id
      return {
        ...item
      }
    })
    const res = await updateFaultRecord({
      faultAlertRecordParams: faultModulesArr,
      customerContent: faultDescription.value,
      id: props.serviceProxyId
    })
    if (res.code === 200) {
      showSuccessToast({
        message: '保存成功',
        'z-index': 5100
      })
      emit('refresh')
      handleClose()
    } else {
      showToast({
        message: res.message,
        'z-index': 5100
      })
    }
  } catch {
    showToast({
      message: '保存失败',
      'z-index': 5100
    })
  } finally {
    submitting.value = false
  }
}

// 关闭弹窗
const handleClose = () => {
  visible.value = false
  // 重置状态
  hasFault.value = true
  faultModules.value = []
  faultDescription.value = ''
}
</script>

<style lang="scss" scoped>
.fullScreen-popup {
  max-width: 100%!important;
}
.fault-info-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f7f7f7;

  // 标题栏
  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 44px;
    background-color: #fff;
    padding: 0 16px;
    flex-shrink: 0;

    .close-btn {
      cursor: pointer;
      .van-icon {
        font-size: 16px;
        color: var(--leap-color-default-dark-1);
      }
    }

    .header-title {
      font-size: 16px;
      font-family: 'PingFang SC', sans-serif;
      font-weight: 500;
      color: var(--leap-color-default);
      line-height: 22px;
    }

    .header-right {
      width: 20px;
    }
  }

  // 施工单编号区域
  .order-number-section {
    background-color: #fff;
    padding: 10px 12px;

    .order-number {
      font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 14px;
      font-weight: 600;
      color: var(--leap-color-default);
      line-height: 20px;
    }
  }

  // 通用卡片样式
  .section-card {
    background-color: #fff;
    margin-top: 12px;
    padding: 12px;
  }

  // 标题行
  .section-header-row {
    margin-bottom: 12px;

    .section-title {
      font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 14px;
      font-weight: 600;
      color: var(--leap-color-default);
      line-height: 20px;
    }
  }

  // 本次进店是否存在故障
  .section-row {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .section-label {
      font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 14px;
      font-weight: 600;
      color: var(--leap-color-default);
      line-height: 20px;
    }

    .radio-group {
      display: flex;
      align-items: center;
      gap: 16px;

      .radio-item {
        display: flex;
        align-items: center;
        gap: 4px;
        cursor: pointer;

        span {
          font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 14px;
          font-weight: 400;
          color: var(--leap-color-default);
          line-height: 20px;
        }

        &.active {
          span {
            color: var(--leap-color-default);
          }
        }
      }
    }
  }

  // 故障模块内容
  .module-content {
    .add-module-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--leap-color-primary-light-9);
      border-radius: 6px;
      gap: 4px;
      height: 40px;
      cursor: pointer;

      .add-text {
        font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 14px;
        font-weight: 400;
        color: var(--leap-color-primary);
        line-height: 20px;
      }
    }

    .module-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      min-height: 40px;
      padding: 8px;
      background-color: var(--leap-color-default-light-5);
      border-radius: 6px;
      margin-top: 8px;

      .module-text {
        flex: 1;
        font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 14px;
        font-weight: 400;
        color: var(--leap-color-default);
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        line-clamp: 2;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
    }
  }

  // 故障描述文本框
  .textarea-wrapper {
    background-color: rgba(0, 0, 0, 0.04);
    border-radius: 6px;
    overflow: hidden;

    .fault-textarea {
      background: transparent;
      padding: 8px;

      :deep(.van-field__control) {
        font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 14px;
        font-weight: 400;
        color: var(--leap-color-default);
        line-height: 20px;

        &::placeholder {
          color: var(--leap-color-default-light-2);
        }
      }
    }
  }

  // 底部按钮
  .bottom-bar {
    margin-top: auto;
    background-color: #fff;
    padding: 7px 12px;
    padding-bottom: 34px;
    flex-shrink: 0;

    .save-btn {
      height: 40px;
      background-color: var(--leap-color-primary);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 14px;
      font-weight: 400;
      color: #fff;
      cursor: pointer;

      &.is-disabled {
        opacity: 0.6;
        pointer-events: none;
      }
    }
  }
}
</style>
