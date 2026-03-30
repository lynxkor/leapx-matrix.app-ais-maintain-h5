<template>
  <div class="btn-item" :style="getStyle()" v-html="renderText()" @click="onClick"></div>
</template>

<script setup>
import { defineProps, reactive, useSlots, defineEmits } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'primary'
  },
  plain: {
    type: Boolean,
    default: false
  },
  round: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    default: '#00AA00'
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'medium'
  }
})

const emit = defineEmits(['click'])

const slots = useSlots()

const style = reactive({})

const getStyle = () => {
  const { color, plain, round, loading, disabled, size, type } = props
  style.color = plain ? color : '#fff'

  // 根据不同的 type 设置不同的样式
  switch (type) {
    case 'default':
      style.background = '#fff'
      style.border = `0.5px solid #009100`
      style.color = '#009100'
      break
    case 'green-light':
      style.background = '#E6F4E6'
      style.border = `0.5px solid #E6F4E6`
      style.color = '#009100'
      break
    case 'gray-light':
      style.background = '#FFFFFF'
      style.border = `0.5px solid #F8F7F7`
      style.color = '#191A1B'
      style.border = `1px solid #E6E6E5`
      break
    default: // primary
      if (!plain) {
        style.background = '#009100'
      } else {
        style.border = `1px solid #009100`
      }
  }

  if (round) {
    style.borderRadius = '38px'
  } else {
    style.borderRadius = '8px'
  }
  if (loading || disabled) {
    style.opacity = 0.6
  } else {
    style.opacity = 1
  }
  if (size === 'medium') {
    style.fontSize = '12px'
    style.height = '28px'
  } else if (size === 'large') {
    style.fontSize = '14px'
    style.height = '32px'
  }
  return style
}

const onClick = (event) => {
  if (props.loading || props.disabled) {
    return false
  }
  emit('click', event)
}

const renderText = () => {
  let text
  if (props.loading) {
    text = `<span>${slots.default()[0]?.children}</span>`
  } else {
    // 获取默认插槽内容
    if (slots.default) {
      text = slots.default()[0]?.children || ''
    }
  }

  if (text) {
    return text
  }
}
</script>

<style lang="scss" scoped>
.btn-item {
  padding: 0 18px;
  font-family: "PingFang SC";
  font-size: 12px;
  min-width: 60px;
  height: 28px;
  box-sizing: border-box;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
