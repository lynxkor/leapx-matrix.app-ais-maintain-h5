<template>
  <van-popup v-model:show="visible" round position="bottom">
    <div class="ais-cascader">
      <div class="ais-cascader-title">{{ title }}</div>
      <div class="close-btn" @click="handleClose">
        <van-icon name="cross" />
      </div>
      <van-cascader
        v-model="innerValue"
        :options="options"
        title="请选择"
        :show-header="false"
        :field-names="fieldNames"
        @close="visible = false"
        @finish="onFinish"
      />
    </div>
  </van-popup>
</template>

<script setup>
/**
 * AisCascader - 通用三级级联选择器
 *
 * 纯 UI 组件，不负责数据获取。options 由调用方传入。
 *
 * @prop show       - 控制弹窗显隐，支持 v-model:show
 * @prop title      - 弹窗标题
 * @prop options    - 级联选项数组，格式 [{ text, value, children }]
 * @prop modelValue - 当前选中值，用于回显
 *
 * @emit update:show       - 双向绑定显隐
 * @emit update:modelValue - 双向绑定值
 * @emit confirm           - 选择完成，payload { selectedOptions }
 */
import { computed, ref, watch } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '请选择'
  },
  options: {
    type: Array,
    default: () => []
  },
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:show', 'update:modelValue', 'confirm'])

const visible = computed({
  get: () => props.show,
  set: (val) => emit('update:show', val)
})

const innerValue = ref('')

const fieldNames = { text: 'text', value: 'value', children: 'children' }

// 弹窗打开时回显当前值
watch(visible, (val) => {
  if (val) {
    innerValue.value = props.modelValue || ''
  }
})

const onFinish = ({ selectedOptions }) => {
  emit('confirm', { selectedOptions })
  visible.value = false
}

const handleClose = () => {
  visible.value = false
}
</script>

<style lang="scss" scoped>
.ais-cascader {
  padding: 16px 0;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
  position: relative;
  background: #f4f4f4;

  .ais-cascader-title {
    text-align: center;
    font-family: 'PingFang SC', sans-serif;
    font-size: 14px;
    font-weight: 500;
    color: #191a1b;
    line-height: 22px;
    margin-bottom: 16px;
  }
  .close-btn {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--leap-color-default-light-2);
    border-radius: 50%;
    cursor: pointer;
    position: absolute;
    top: 20px;
    left: 16px;

    .van-icon {
      font-size: 12px;
      color: #fff;
    }
  }
  ::v-deep .van-tabs__nav {
    background: #f4f4f4;
  }
  ::v-deep .van-cascader__tab {
    &::after {
      content: '/';
      transform: translateX(8px);
      color: #191a1b;
    }
    &:nth-last-child(2)::after {
      display: none;
    }
  }
  ::v-deep .van-tab--active {
    color: var(--leap-color-primary);
  }
  ::v-deep .van-tabs__line {
    display: none;
  }
  ::v-deep .van-cascader__options {
    padding: 0 12px;
  }
  ::v-deep .van-cascader__option {
    background: #fff;
    position: relative;
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 12px;
      right: 12px;
      height: 1px;
      background-color: #E6E6E5;
    }
    &:first-child {
      border-radius: 8px 8px 0 0;
    }
    &:last-child {
      border-radius: 0 0 8px 8px;
      border-bottom: 0;
    }
    &:first-child:last-child {
      border-radius: 8px;
    }
    &:last-child::after {
      display: none;
    }
  }
}
</style>
