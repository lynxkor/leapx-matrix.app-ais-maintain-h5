<template>
  <div class="search-wrapper">
    <div class="search-input-container">
      <van-icon name="search" size="16" color="#191A1B" class="search-icon" />
      <input
        ref="inputRef"
        v-model="keyword"
        type="search"
        class="search-input"
        :placeholder="placeholder"
        @input="onInput"
        @focus="onFocus"
        @blur="onBlur"
        @keydown.enter="onSearch"
      />
      <div v-if="showBtn" class="search-btn" @click="onSearch">搜索</div>
    </div>
  </div>

  <!-- 搜索结果弹出层 -->
  <van-popup
    v-model:show="showResult"
    position="top"
    z-index="8"
    :style="{ maxHeight: '60vh', top: '125px' }"
    class="search-result-popup"
  >
    <!-- 搜索结果列表 -->
    <div v-if="activeCards.length === 0" class="search-result-list">
      <div
        v-for="item in results"
        :key="item.id"
        class="dropdown-item"
        @click="onItemClick(item)"
      >
        <span class="item-text" v-html="highlight(item.partName || item.name)"></span>
        <span class="item-code" v-html="'—' + highlight(item.partCode || item.code)"></span>
      </div>
    </div>

    <!-- 已添加项操作卡片 -->
    <div v-if="activeCards.length > 0" class="active-card-wrapper">
      <RepairItemCard
        v-for="card in activeCards"
        :key="card.id"
        :item="card"
        @update-item="(item, updates) => emit('update-item', item, updates)"
      />
      <!-- <div class="active-card-actions">
        <div class="action-btn continue-btn" @click="onContinue">继续添加</div>
        <div class="action-btn done-btn" @click="onDone">完成</div>
      </div> -->
    </div>
  </van-popup>
</template>

<script setup>
import { ref, computed } from 'vue'
import RepairItemCard from './RepairItemCard.vue'

defineProps({
  placeholder: {
    type: String,
    default: '输入代码、名称、拼音简码'
  }
})

const emit = defineEmits(['search', 'add-item-with-parts', 'update-item', 'done'])

const keyword = ref('')
const results = ref([])
const showResult = ref(false)
const activeCards = ref([])
const isFocused = ref(false)
let debounceTimer = null

const showBtn = computed(() => isFocused.value || keyword.value.trim().length > 0)

const onInput = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    const kw = keyword.value.trim()
    if (kw) {
      emit('search', kw)
    } else {
      results.value = []
      showResult.value = false
    }
  }, 300)
}

const onFocus = () => {
  isFocused.value = true
}

const onBlur = () => {
  setTimeout(() => { isFocused.value = false }, 200)
}

const onSearch = () => {
  clearTimeout(debounceTimer)
  const kw = keyword.value.trim()
  if (kw) emit('search', kw)
}

const highlight = (text) => {
  if (!keyword.value || !text) return text || ''
  const kw = keyword.value.trim()
  if (!kw) return text
  try {
    const reg = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
    return text.replace(reg, '<em>' + kw + '</em>')
  } catch {
    return text
  }
}

// 点击搜索结果 → 传完整数据给父组件处理
const onItemClick = (item) => {
  emit('add-item-with-parts', item)
}

// 展示已添加项的操作卡片（支持多张）
const showActiveCards = (cards) => {
  activeCards.value = cards
}

// // 继续添加 — 回到搜索结果列表
// const onContinue = () => {
//   activeCards.value = []
// }

// // 完成 — 关闭弹窗
// const onDone = () => {
//   showResult.value = false
//   activeCards.value = []
//   emit('done')
// }

// 供父组件调用
const setResults = (list) => {
  results.value = list
  showResult.value = list.length > 0
  activeCards.value = []
}

const close = () => {
  showResult.value = false
  activeCards.value = []
}

const reset = () => {
  keyword.value = ''
  results.value = []
  showResult.value = false
  activeCards.value = []
  isFocused.value = false
}

defineExpose({ setResults, showActiveCards, close, reset })
</script>

<style lang="scss" scoped>
.search-wrapper {
  position: relative;
  padding: 8px 12px;
  background: #fff;
  flex-shrink: 0;
  z-index: 10;

  .search-input-container {
    display: flex;
    align-items: center;
    height: 30px;
    padding-left: 8px;
    background: rgba(216, 216, 216, 0.3);
    border-radius: 15px;
    gap: 6px;

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
      color: var(--leap-color-default);
      line-height: 28px;
      padding: 0;

      &::placeholder {
        color: var(--leap-color-default-light-2);
      }

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
      background: var(--leap-color-primary);
      border-radius: 13px;
      font-size: 12px;
      color: #ffffff;
      cursor: pointer;

      &:active {
        opacity: 0.8;
      }
    }
  }
}

.search-result-popup {
  .search-result-list {
    max-height: 60vh;
    overflow-y: auto;
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    min-height: 50px;
    padding: 10px 12px;
    border-bottom: 0.5px solid var(--leap-color-default-light-4);
    cursor: pointer;

    &:last-child {
      border-bottom: none;
    }

    &:active {
      background: var(--leap-color-default-light-5);
    }

    .item-text {
      font-size: 14px;
      color: var(--leap-color-default);
      line-height: 20px;

      ::v-deep(em) {
        font-style: normal;
        color: var(--leap-color-primary);
      }
    }

    .item-code {
      font-size: 14px;
      color: var(--leap-color-default);
      margin-left: 2px;
      flex-shrink: 0;

      ::v-deep(em) {
        font-style: normal;
        color: var(--leap-color-primary);
      }
    }
  }

  .active-card-wrapper {
    background: #fff;
    padding: 12px;

    .active-card-actions {
      display: flex;
      gap: 12px;
      margin-top: 12px;

      .action-btn {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 36px;
        border-radius: 8px;
        font-size: 14px;
        cursor: pointer;

        &:active {
          opacity: 0.8;
        }
      }

      .continue-btn {
        background: var(--leap-color-default-light-5);
        color: var(--leap-color-default-light-1);
      }

      .done-btn {
        background: var(--leap-color-primary);
        color: #ffffff;
      }
    }
  }
}
</style>
