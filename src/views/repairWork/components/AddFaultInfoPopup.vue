<template>
  <van-popup
    v-model:show="innerVisible"
    position="bottom"
    round
    teleport="body"
    :style="{ height: '80vh' }"
    z-index="5056"
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
            <input
              v-model="searchKeyword"
              type="search"
              class="search-input"
              placeholder="输入VRT/VFG/CCC"
              @input="onSearchInput"
              @keydown.enter="handleSearchBtn"
            />
            <!-- 搜索按钮 -->
            <div class="search-btn" @click="handleSearchBtn">
              搜索
            </div>
          </div>
        </div>

        <!-- 搜索结果列表 -->
        <div v-if="hasSearched" class="result-list">
          <template v-if="searchResults.length">
            <div
              v-for="item in searchResults"
              :key="item.id"
              class="result-item"
              @click="handleSelect(item)"
            >
              <span class="result-text" v-html="formatSearchResults(item)"></span>
            </div>
          </template>
          <Empty v-else text="没有找到相关CCC，请联系服务部技术支持" />
        </div>
      </div>
    </div>
  </van-popup>
</template>

<script setup>
import { ref, computed } from 'vue'
import { showToast } from 'vant'
import Empty from './Empty.vue'
import { cccList } from '../../../api/repairWork'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  existingModules: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:visible', 'select'])

const innerVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const searchKeyword = ref('')
const searchResults = ref([])
const hasSearched = ref(false)

let debounceTimer = null

const searchFaultModules = async(keyword) => {
  try {
    const res = await cccList(keyword || '')
    if (res.code === 200) {
      searchResults.value = res?.data || []
    } else {
      searchResults.value = []
      showToast(res.message)
    }
  } catch {
    searchResults.value = []
    showToast('搜索故障模块失败')
  }
  hasSearched.value = true
}

const onSearchInput = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    const keyword = searchKeyword.value.trim()
    if (keyword) {
      searchFaultModules(keyword)
    } else {
      searchResults.value = []
      hasSearched.value = false
    }
  }, 300)
}

const handleSearchBtn = () => {
  clearTimeout(debounceTimer)
  const keyword = searchKeyword.value.trim()
  if (keyword) {
    searchFaultModules(keyword)
  }
}

const handleSelect = (item) => {
  const exists = props.existingModules.some(
    (m) => m.cccName === item.cccName || m.id === item.id
  )
  if (exists) {
    showToast('请勿重复添加')
    return
  }
  emit('select', item)
  handleClose()
}

const handleClose = () => {
  searchKeyword.value = ''
  searchResults.value = []
  hasSearched.value = false
  innerVisible.value = false
}

const formatSearchResults = (item) => {
  // 匹配到的key替换为高亮
  const str = `${item.vrtName}-${item.vfgName}-${item.cccName}`
  const reg = new RegExp(searchKeyword.value, 'gi')
  return str.replace(reg, `<em>${searchKeyword.value}</em>`)
}

</script>

<style lang="scss" scoped>
.add-fault-info-popup {
  .popup-container {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .popup-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 58px;
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

  .popup-content {
    flex: 1;
    padding: 0 12px 12px;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .search-input-wrapper {
    margin-bottom: 12px;
    position: sticky;
    top: 0;
    background-color: #fff;
    z-index: 9;
  }

  .search-input-container {
    display: flex;
    align-items: center;
    height: 30px;
    padding-left: 8px;
    background-color: rgba(216, 216, 216, 0.3);
    border-radius: 15px;
    gap: 6px;
  }

  .search-icon {
    flex-shrink: 0;
  }

  .search-input {
    flex: 1;
    height: 100%;
    border: none;
    outline: none;
    background: transparent;
    font-size: 12px;
    font-family: 'PingFang SC', sans-serif;
    color: var(--leap-color-default);
    line-height: 28px;
    padding: 0;

    &::placeholder {
      color: var(--leap-color-default-light-2);
    }

    // 隐藏原生搜索框清除按钮
    &::-webkit-search-cancel-button {
      -webkit-appearance: none;
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

  .result-list {
    background-color: #fff;
    border-radius: 8px;
    overflow: hidden;
    min-height: 400px;
  }

  .result-item {
    display: flex;
    align-items: center;
    height: 50px;
    padding: 0 12px;
    cursor: pointer;
    border-bottom: 0.5px solid #E6E6E5;

    &:last-child {
      border-bottom: none;
    }

    &:active {
      background-color: var(--leap-color-default-light-5);
    }

    .result-text {
      flex: 1;
      font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 14px;
      font-weight: 400;
      color: var(--leap-color-default);
      line-height: 20px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      ::v-deep em {
        font-style: normal;
        color: var(--leap-color-primary);
      }
    }
  }
}
</style>
