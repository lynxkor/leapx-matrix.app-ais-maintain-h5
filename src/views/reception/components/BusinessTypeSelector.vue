<template>
  <!-- 业务类型 -->
  <van-collapse
    v-if="!readonly"
    v-model="collapse"
    class="collapse-panel"
  >
    <van-collapse-item name="businessType">
      <template #title>
        <div class="select-row">
          <span class="label">进店类型</span>
          <span class="value">{{ currentLabel }}</span>
        </div>
      </template>
      <div class="collapse-content">
        <div class="type-selector">
          <div
            v-for="item in computedBusinessTypeList"
            :key="item.value"
            :class="['type-item', { active: modelValue === item.value }]"
            @click="onSelect(item)"
          >
            {{ item.label }}
          </div>
        </div>
      </div>
    </van-collapse-item>
  </van-collapse>
  <div v-else class="select-row">
    <span class="label">进店类型</span>
    <span class="value">{{ currentLabel }}</span>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getEnum } from '@/api/repairWork'
import { BusinessTypeEnum } from '../constant'

const props = defineProps({
  /** 当前业务类型值 */
  modelValue: { type: [String, Number], default: '' },
  /** 是否只读（只读时退化为纯文本展示） */
  readonly: { type: Boolean, default: false },
  /** 是否默认展开折叠面板 */
  defaultExpanded: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])

// 业务类型列表
const businessTypeList = ref([])
// 折叠面板状态
const collapse = ref(props.defaultExpanded ? ['businessType'] : [])

// 当前业务类型文案
const currentLabel = computed(() => {
  const label = computedBusinessTypeList.value.find((i) => i.value === props.modelValue)?.label || ''
  return label
})

// 动态的业务类型
const computedBusinessTypeList = computed(() => {
  if (!props.readonly) {
    return businessTypeList.value.filter((item) => item.value !== BusinessTypeEnum.APPOINTMENT_ARRIVAL)
  }
  return businessTypeList.value
})

// 加载业务类型枚举
const loadBusinessTypeEnum = async() => {
  try {
    const res = await getEnum('BusinessTypeEnum')
    const list = (res?.data || []).map((item) => ({
      value: Number(item.code),
      label: item.message
    }))
    businessTypeList.value = list
  } catch {
    businessTypeList.value = []
  }
}

// 选择业务类型
const onSelect = (item) => {
  emit('update:modelValue', item.value)
}

onMounted(() => {
  loadBusinessTypeEnum()
})
</script>
