<template>
  <van-popup
    v-model:show="innerVisible"
    position="bottom"
    round
    teleport="body"
    :style="{ height: '80vh' }"
    class="add-fault-info-popup"
  >
    <div class="popup-container">
      <!-- 标题栏 -->
      <div class="popup-header">
        <div class="close-btn" @click="handleClose">
          <van-icon name="cross" />
        </div>
        <div class="header-title">故障模块</div>
        <div class="header-right"></div>
      </div>

      <!-- 内容区域 -->
      <div class="popup-content">
        <!-- 搜索输入框 -->
        <div class="search-input-wrapper">
          <div class="search-input-container">
            <van-icon name="search" size="16" color="#191A1B" class="search-icon" />
            <div class="search-dropdown-wrap">
              <SearchDropdown
                v-model="selectedModuleValue"
                v-model:searchKeyword="searchKeyword"
                :options="moduleOptions"
                placeholder="搜索故障模块"
                @focus="handleModuleFocus"
                @onSearch="handleModuleSearch"
                @select="handleModuleSelect"
              />
            </div>
            <!-- 搜索按钮 -->
            <div class="search-btn" @click="handleSearchBtn">
              搜索
            </div>
          </div>
        </div>

        <!-- 已选故障模块列表 -->
        <div class="module-list">
          <div
            v-for="(item, index) in faultModules"
            :key="index"
            class="module-item"
          >
            <span class="module-text">{{ item.cccName }}</span>
            <van-icon name="delete-o" size="16" color="#3B3E3B" @click="handleDeleteModule(index)" />
          </div>
        </div>
      </div>
    </div>
  </van-popup>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { showToast } from 'vant'
import SearchDropdown from '@/libs/components/SearchDropdown.vue'
import { cccList } from '../../../api/repairWork'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'change'])

// 使用计算属性避免直接修改 prop
const innerVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

// 搜索关键词
const searchKeyword = ref('')

// 当前选中的模块值
const selectedModuleValue = ref('')

// 已选故障模块列表
const faultModules = ref([])

// 模块选项列表
const moduleOptions = ref([])

// 搜索故障模块
const searchFaultModules = async(keyword) => {
  try {
    const data = await cccList(keyword || '')
    const list = data?.data || data || []
    moduleOptions.value = list.map((item) => ({
      label: item.cccName,
      value: item
    }))
  } catch {
    moduleOptions.value = []
    showToast('搜索故障模块失败')
  }
}

// 处理模块搜索下拉框聚焦
const handleModuleFocus = () => {
  searchFaultModules('')
}

// 处理模块搜索
const handleModuleSearch = (keyword) => {
  searchFaultModules(keyword)
}

// 处理模块选择
const handleModuleSelect = (option) => {
  const moduleData = option.value
  // 避免重复添加
  const exists = faultModules.value.some(item => item.id === moduleData.id)
  if (!exists) {
    faultModules.value.push(moduleData)
  }
  // 清空搜索框
  searchKeyword.value = ''
  selectedModuleValue.value = ''
}

// 搜索按钮点击
const handleSearchBtn = () => {
  if (!searchKeyword.value.trim()) {
    return
  }
  const firstMatch = moduleOptions.value[0]
  if (firstMatch) {
    handleModuleSelect(firstMatch)
  }
}

// 监听弹窗关闭事件，关闭时传递已选择的模块列表
watch(innerVisible, (newVal, oldVal) => {
  if (!newVal && oldVal) {
    emit('change', faultModules.value)
  }
})

// 删除故障模块
const handleDeleteModule = (index) => {
  faultModules.value.splice(index, 1)
}

// 关闭弹窗
const handleClose = () => {
  innerVisible.value = false
}
</script>

<style lang="scss" scoped>
.add-fault-info-popup {
  .popup-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: #f4f4f4;
  }

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
    padding: 0 12px 12px 12px;
    overflow-y: auto;
    overflow-x: hidden;
  }

  // 搜索输入框
  .search-input-wrapper {
    flex: 1;
    height: 30px;
    margin-bottom: 12px;
  }

  .search-input-container {
    display: flex;
    align-items: center;
    width: 100%;
    height: 100%;
    padding-left: 8px;
    background-color: rgba(216, 216, 216, 0.3);
    border-radius: 15px;
    gap: 6px;
  }

  .search-icon {
    flex-shrink: 0;
  }

  .search-dropdown-wrap {
    flex: 1;
    height: 100%;
    display: flex;
    align-items: center;

    :deep(.van-cell) {
      padding: 0;
      background-color: transparent;
    }

    :deep(.van-field__control) {
      height: 100%;
      line-height: 28px;
      font-size: 12px;
      background: transparent;
      padding: 0;
    }
  }

  .search-btn {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 26px;
    background-color: var(--leap-color-primary);
    border-radius: 13px;
    font-size: 12px;
    font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, sans-serif;
    color: #ffffff;
    cursor: pointer;
    transition: opacity 0.2s;

    &:active {
      opacity: 0.8;
    }
  }

  // 模块列表
  .module-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .module-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 40px;
    padding: 0 12px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);

    .module-text {
      flex: 1;
      font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 14px;
      font-weight: 400;
      color: var(--leap-color-default);
      line-height: 20px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-right: 8px;
    }
  }
}
</style>
