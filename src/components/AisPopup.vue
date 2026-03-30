<template>
  <van-popup
    class="popup"
    v-model:show="showValue"
    :closeable="closeable"
    :close-icon="closeIcon"
    :position="position"
    close-icon-position="top-left"
    :round="round"
  >
    <div class="popup-content">
      <h3 v-if="title" class="popup-title">{{ title }}</h3>
    </div>
    <div style="height: calc(100% - 61px); display: flex; flex-direction: column">
      <div class="popup-container">
        <slot name="content"></slot>
      </div>
      <div class="popup-footer" v-if="$slots['footer']">
        <slot name="footer"></slot>
      </div>
    </div>
  </van-popup>
</template>

<script setup>
import { defineProps, defineEmits, ref, watch } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  closeable: {
    type: Boolean,
    default: true
  },
  closeIcon: {
    type: String,
    default: 'clear'
  },
  position: {
    type: String,
    default: 'bottom'
  },
  round: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:show'])

const showValue = ref(props.show)

// 监听 props.show 的变化
watch(
  () => props.show,
  (newValue) => {
    showValue.value = newValue
  }
)

// 监听 showValue 的变化，触发 update:show 事件
watch(showValue, (newValue) => {
  emit('update:show', newValue)
})
</script>

<style lang="scss" scoped>
.popup-content {
  padding-bottom: 1.2rem;

  .popup-title {
    font-size: 14px;
    font-weight: 500;
    color: #191a1b;
    padding: 1.2rem 0;
    text-align: center;
  }
}

.popup {
  background: #f4f4f4;
}

.popup-container {
  padding: 0 1.3rem 1rem;
  flex: 1;
  overflow: auto;
}

.popup-footer {
  height: 85px;
  padding: 0.8rem 1rem;
  font-size: 14px;
  background-color: #fff;
}
</style>
