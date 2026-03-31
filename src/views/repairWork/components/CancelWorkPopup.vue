<template>
  <van-popup
    v-model:show="visible"
    position="bottom"
    :style="{ height: '60%' }"
    round
    teleport="body"
    @close="handleClose"
  >
    <div class="cancel-work-popup">
      <!-- 标题栏 -->
      <div class="popup-header">
        <div class="close-btn" @click="handleClose">
          <van-icon name="cross" />
        </div>
        <div class="header-title">作废原因</div>
        <div class="header-right"></div>
      </div>

      <!-- 内容区域 -->
      <div class="popup-content">
        <div class="textarea-wrapper">
          <textarea
            v-model="reason"
            class="reason-textarea"
            placeholder="请输入"
            :maxlength="200"
            :autofocus="true"
          ></textarea>
        </div>
      </div>

      <!-- 底部操作栏 -->
      <div class="popup-footer">
        <div class="confirm-btn" @click="handleConfirm">
          <span>确定</span>
        </div>
        <!-- 底部安全区域 -->
        <div class="footer-safe-area"></div>
      </div>
    </div>
  </van-popup>
</template>

<script setup>
/**
 * 作废弹窗组件
 * 根据设计稿实现: https://mastergo.com/file/175060511907951?layer_id=1212:313964
 */
import { ref, watch } from 'vue'
import { showToast } from 'vant'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = ref(props.modelValue)
const reason = ref('')

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  (newVal) => {
    visible.value = newVal
    if (newVal) {
      // 打开时清空输入
      reason.value = ''
    }
  }
)

// 监听 visible 变化
watch(visible, (newVal) => {
  if (!newVal) {
    emit('update:modelValue', false)
  }
})

// 确认作废
const handleConfirm = () => {
  if (!reason.value.trim()) {
    showToast('请输入作废原因')
    return
  }
  emit('confirm', reason.value.trim())
  handleClose()
}

// 关闭弹窗
const handleClose = () => {
  visible.value = false
}
</script>

<style lang="scss" scoped>
.cancel-work-popup {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f4f4f4;

  // 标题栏
  .popup-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 58px;
    background-color: #f4f4f4;
    padding: 0 16px;
    flex-shrink: 0;

    .close-btn {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--leap-color-default-light-2);
      border-radius: 50%;
      cursor: pointer;

      .van-icon {
        font-size: 12px;
        color: #fff;
      }
    }

    .header-title {
      font-family: 'PingFang SC', sans-serif;
      font-size: 14px;
      font-weight: 500;
      color: var(--leap-color-default);
      line-height: 20px;
    }

    .header-right {
      width: 20px;
    }
  }

  // 内容区域
  .popup-content {
    flex: 1;
    padding: 0 12px;
    overflow: hidden;

    .textarea-wrapper {
      background-color: #fff;
      border-radius: 6px;
      padding: 12px;
      height: 134px;

      .reason-textarea {
        width: 100%;
        height: 100%;
        min-height: 110px;
        border: none;
        outline: none;
        resize: none;
        font-family: 'PingFang SC', sans-serif;
        font-size: 14px;
        font-weight: 400;
        color: var(--leap-color-default);
        line-height: 20px;
        background-color: rgba(0, 0, 0, 0.04);
        border-radius: 8px;
        padding: 10px 8px;

        &::placeholder {
          color: var(--leap-color-default-light-2);
        }
      }
    }
  }

  // 底部操作栏
  .popup-footer {
    flex-shrink: 0;
    background-color: #fff;
    padding: 7px 12px;

    .confirm-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 40px;
      background-color: var(--leap-color-primary);
      border-radius: 8px;
      cursor: pointer;

      span {
        font-family: 'PingFang SC', sans-serif;
        font-size: 14px;
        font-weight: 400;
        color: #fff;
        line-height: 20px;
      }
    }

    .footer-safe-area {
      height: 34px;
      background-color: #fff;
      display: flex;
      justify-content: center;
      align-items: center;

      &::after {
        content: '';
        width: 134px;
        height: 5px;
        background-color: #000;
        border-radius: 2.5px;
      }
    }
  }
}
</style>
