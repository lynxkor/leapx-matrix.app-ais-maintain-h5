<template>
  <van-popup v-model:show="visible" round position="bottom">
    <div class="checkout-picker">
      <div class="checkout-picker-title">选择结算类型</div>
      <div class="close-btn" @click="handleClose">
        <van-icon name="cross" />
      </div>
      <van-cascader
        v-model="cascaderValue"
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
import { computed, ref, watch } from 'vue'
import { getEnum, getRepairItemTypeMap } from '@/api/repairWork'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  currentItem: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:show', 'confirm'])

const visible = computed({
  get: () => props.show,
  set: (val) => emit('update:show', val)
})

const cascaderValue = ref('')
const options = ref([])
const fieldNames = {
  text: 'text',
  value: 'value',
  children: 'children'
}

// 缓存原始数据，用于 confirm 时查找名称
let checkoutTypesRaw = []
let repairItemTypesRaw = []

const loadOptions = async() => {
  const [maintenanceTypesRes, checkoutTypesRes, repairItemTypesRes] = await Promise.all([
    getEnum('MaintenanceTypeEnum'),
    getEnum('StatementTypeEnum'),
    getRepairItemTypeMap()
  ])

  const maintenanceTypes = maintenanceTypesRes?.data || []
  checkoutTypesRaw = checkoutTypesRes?.data || []
  repairItemTypesRaw = repairItemTypesRes?.data || []

  options.value = maintenanceTypes.map((mt) => ({
    text: mt.message,
    value: mt.code,
    children: checkoutTypesRaw.map((ct) => ({
      text: ct.message,
      value: ct.code,
      children: repairItemTypesRaw
        .filter((rit) => rit.checkoutTypeId === ct.code)
        .map((rit) => ({
          text: rit.name,
          value: rit.id
        }))
    }))
  }))
  console.log(maintenanceTypes, checkoutTypesRaw, repairItemTypesRaw, options.value)
}

// 弹窗打开时加载数据
watch(visible, async(val) => {
  if (val && options.value.length === 0) {
    await loadOptions()
  }
  // 回显当前选中值
  if (val && props.currentItem) {
    cascaderValue.value = props.currentItem.warrantyTypeId || ''
  }
})

const onFinish = ({ selectedOptions }) => {
  const [level1, level2, level3] = selectedOptions || []

  emit('confirm', {
    repairItemTypeId: level1?.value || '',
    repairItemTypeName: level1?.text || '',
    checkoutTypeId: level2?.value || '',
    checkoutTypeName: level2?.text || '',
    warrantyTypeId: level3?.value || '',
    warrantyTypeName: level3?.text || ''
  })
}

const handleClose = () => {
  visible.value = false
}

</script>

<style lang="scss" scoped>
.checkout-picker {
  padding: 16px 0;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
  position: relative;

  .checkout-picker-title {
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
}
</style>
