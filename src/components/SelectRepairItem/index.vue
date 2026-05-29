<!-- 使用方式 -->
<!--
  弹窗模式：
  <SelectRepairItem
    v-model:visible="showAddRepairPopup"
    mode="popup"
    :service-proxy-id="workOrder.serviceProxyId"
    @confirm="handleAddRepairConfirm"
  />

  页面模式（默认）：
  <SelectRepairItem
    :service-proxy-id="workOrder.serviceProxyId"
    @confirm="handleAddRepairConfirm"
  />
-->
<template>
  <!-- 弹窗模式 -->
  <van-popup
    v-if="isPageMode === false"
    v-model:show="innerVisible"
    position="bottom"
    teleport="body"
    :style="{ width: '100vw', height: '100%' }"
    z-index="5055"
    safe-area-inset-top
    class="add-repair-item-popup"
  >
    <RepairItemContent
      ref="contentRef"
      show-header
      :service-proxy-id="serviceProxyId"
      :current-fault="currentFault"
      @close="handleClose"
      @confirm="onConfirm"
    />
  </van-popup>

  <!-- 页面模式 -->
  <div v-else class="add-repair-item-popup">
    <RepairItemContent
      ref="contentRef"
      :service-proxy-id="serviceProxyId"
      :current-fault="currentFault"
      @close="handleClose"
      @confirm="onConfirm"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import RepairItemContent from './RepairItemContent.vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  serviceProxyId: {
    type: String,
    default: ''
  },
  currentFault: {
    type: [String, Number],
    default: ''
  },
  mode: {
    type: String,
    default: 'page', // 'popup' | 'page'
    validator: (v) => ['popup', 'page'].includes(v)
  }
})

const emit = defineEmits(['update:visible', 'confirm'])

const route = useRoute()
const isPageMode = computed(() => props.mode === 'page')
const serviceProxyId = computed(() => props.serviceProxyId || route.query.serviceProxyId || '')
const currentFault = computed(() => route.query.currentFault || props.currentFault)

const innerVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const contentRef = ref(null)

const handleClose = () => {
  if (!isPageMode.value) {
    contentRef.value?.resetData()
    innerVisible.value = false
  }
}

const onConfirm = (data) => {
  emit('confirm', data)
  handleClose()
}

// 弹窗模式：监听 visible 变化加载数据
watch(() => props.visible, async(newVal) => {
  if (newVal) {
    await nextTick()
    contentRef.value?.resetData()
    await contentRef.value?.loadInitialData()
    contentRef.value?.saveItemsSnapshot()
  }
}, {
  immediate: true
})

// 页面模式：挂载时自动加载并保存初始快照
onMounted(async() => {
  if (isPageMode.value) {
    await contentRef.value?.loadInitialData()
    contentRef.value?.saveItemsSnapshot()
  }
})
</script>

<style lang="scss" scoped>
.add-repair-item-popup {
  height: 100%;
}
</style>
