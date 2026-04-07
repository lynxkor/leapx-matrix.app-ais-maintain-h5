<template>
  <div class="add-parts">
    <!-- Tab导航 -->
    <van-tabs v-model:active="activeTab" sticky offset-top="44px">
      <van-tab title="添加维修项目" name="project">
        <div class="tab-content">
          <!-- 搜索框 -->
          <div class="search-header">
            <van-search
              v-model="searchValue"
              placeholder="输入维修项目代码、名称、拼音简码"
              shape="round"
              :autofocus="false"
              @search="onSearch"
              @clear="onSearchClear"
              @focus="onSearchFocus"
              style="width: 100%"
            >
              <template #left-icon>
                <van-icon name="search" size="16" color="#191A1B" />
              </template>
            </van-search>
          </div>
          <!-- 搜索结果弹窗遮罩 -->
          <div v-if="showSearchPopup" class="search-overlay" @click="onClosePopup"></div>
          <!-- 搜索结果弹窗 -->
          <div v-if="showSearchPopup" class="search-popup">
            <!-- 搜索结果列表 -->
            <template v-if="searchResults.length > 0 && editingList.length === 0">
              <div
                v-for="(item, index) in searchResults"
                :key="index"
                class="result-card"
                @click="onAddToEdit(item)"
              >
                <div class="result-card-left">
                  <div class="result-name">
                    <van-highlight :keywords="searchValue" :source-string="item.name" />
                  </div>
                  <div class="result-code">{{ item.code }}</div>
                </div>
                <div class="result-card-right">
                  <div class="result-price">¥{{ item.price }}</div>
                  <div class="result-discount">
                    <span class="discount-label">优惠</span>
                    <span class="discount-value">¥{{ item.discount }}</span>
                  </div>
                </div>
              </div>
            </template>
            <!-- 编辑详情卡片列表 -->
            <template v-if="editingList.length > 0">
              <div v-for="(item, index) in editingList" :key="item.code" class="edit-detail-card">
                <!-- 删除按钮 -->
                <div class="delete-btn" @click="onRemoveFromEdit(index)">
                  <van-icon name="delete-o" size="16" color="#B91919" />
                </div>
                <!-- 卡片内容 -->
                <div class="card-content">
                  <!-- 上半部分 -->
                  <div class="card-top">
                    <div class="card-left">
                      <div class="name-row">
                        <span class="card-name">{{ item.name }}</span>
                      </div>
                      <div class="card-code">{{ item.code }}</div>
                      <div class="category-row" @click="onSelectCategoryForEdit(item, index)">
                        <span class="category-text">{{ item.category || '请选择分类' }}</span>
                        <van-icon name="arrow" size="16" color="#545454" />
                      </div>
                    </div>
                    <div class="card-right">
                      <div class="price-value">¥{{ item.price || '0.00' }}</div>
                      <div class="discount-row">
                        <span class="discount-label">优惠</span>
                        <span class="discount-value">¥{{ item.discount || '0.00' }}</span>
                      </div>
                    </div>
                  </div>
                  <!-- 下半部分 -->
                  <div class="card-bottom">
                    <div class="subtotal">¥{{ item.subtotal || '0.00' }}</div>
                    <div class="quantity-stepper">
                      <span
                        class="stepper-btn minus"
                        :class="{ disabled: item.quantity <= 1 }"
                        @click="onMinusEditQuantity(index)"
                        >-</span
                      >
                      <input
                        v-model="item.quantity"
                        type="number"
                        class="stepper-input"
                        @input="onEditQuantityChange(index)"
                      />
                      <span class="stepper-btn plus" @click="onPlusEditQuantity(index)">+</span>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>
          <!-- 已添加列表 -->
          <div v-if="addedList.length > 0" class="added-list">
            <div v-for="item in addedList" :key="item.code" class="added-card">
              <!-- 删除按钮 -->
              <div class="delete-btn" @click="onDeleteAdded(item.code)">
                <van-icon name="delete-o" size="16" color="#B91919" />
              </div>
              <!-- 卡片内容 -->
              <div class="card-content">
                <!-- 上半部分 -->
                <div class="card-top">
                  <div class="card-left">
                    <div class="name-row">
                      <span class="card-name">{{ item.name }}</span>
                    </div>
                    <div class="card-code">{{ item.code }}</div>
                    <div class="category-row" @click="onSelectCategory(item)">
                      <span class="category-text">{{ item.category || '请选择分类' }}</span>
                      <van-icon name="arrow" size="16" color="#545454" />
                    </div>
                  </div>
                  <div class="card-right">
                    <div class="price-value">¥{{ item.price || '0.00' }}</div>
                    <div class="discount-row">
                      <span class="discount-label">优惠</span>
                      <span class="discount-value">¥{{ item.discount || '0.00' }}</span>
                    </div>
                  </div>
                </div>
                <!-- 下半部分 -->
                <div class="card-bottom">
                  <div class="subtotal">¥{{ item.subtotal || '0.00' }}</div>
                  <div class="quantity-stepper">
                    <span
                      class="stepper-btn minus"
                      :class="{ disabled: item.quantity <= 1 }"
                      @click="onMinusQuantity(item.code)"
                      >-</span
                    >
                    <input
                      v-model="item.quantity"
                      type="number"
                      class="stepper-input"
                      @input="onQuantityChange(item.code)"
                    />
                    <span class="stepper-btn plus" @click="onPlusQuantity(item.code)">+</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- 空状态 -->
          <div v-if="!searchValue && addedList.length === 0" class="empty-state">
            <img src="@/assets/image/noList.png" alt="" />
            <div class="empty-text">还没有添加维修项目</div>
          </div>
        </div>
      </van-tab>

      <van-tab title="添加维修零件" name="parts">
        <div class="tab-content">
          <!-- 搜索框 -->
          <div class="search-header">
            <van-search
              v-model="searchValue"
              placeholder="输入维修零件代码、名称、拼音简码"
              shape="round"
              @search="onSearch"
              @clear="onSearchClear"
              @focus="onSearchFocus"
              style="width: 100%"
            >
              <template #left-icon>
                <van-icon name="search" size="16" color="#191A1B" />
              </template>
            </van-search>
          </div>
          <!-- 搜索结果弹窗遮罩 -->
          <div v-if="showSearchPopup" class="search-overlay" @click="onClosePopup"></div>
          <!-- 搜索结果弹窗 -->
          <div v-if="showSearchPopup" class="search-popup">
            <!-- 搜索结果列表 -->
            <template v-if="searchResults.length > 0 && editingList.length === 0">
              <div
                v-for="(item, index) in searchResults"
                :key="index"
                class="result-card"
                @click="onAddToEdit(item)"
              >
                <div class="result-card-left">
                  <div class="result-name">
                    <van-highlight :keywords="searchValue" :source-string="item.name" />
                  </div>
                  <div class="result-code">{{ item.code }}</div>
                </div>
                <div class="result-card-right">
                  <div class="result-price">¥{{ item.price }}</div>
                  <div class="result-discount">
                    <span class="discount-label">优惠</span>
                    <span class="discount-value">¥{{ item.discount }}</span>
                  </div>
                </div>
              </div>
            </template>
            <!-- 编辑详情卡片列表 -->
            <template v-if="editingList.length > 0">
              <div v-for="(item, index) in editingList" :key="item.code" class="edit-detail-card">
                <!-- 删除按钮 -->
                <div class="delete-btn" @click="onRemoveFromEdit(index)">
                  <van-icon name="delete-o" size="16" color="#B91919" />
                </div>
                <!-- 卡片内容 -->
                <div class="card-content">
                  <!-- 上半部分 -->
                  <div class="card-top">
                    <div class="card-left">
                      <div class="name-row">
                        <span class="card-name">{{ item.name }}</span>
                      </div>
                      <div class="card-code">{{ item.code }}</div>
                      <div class="category-row" @click="onSelectCategoryForEdit(item, index)">
                        <span class="category-text">{{ item.category || '请选择分类' }}</span>
                        <van-icon name="arrow" size="16" color="#545454" />
                      </div>
                    </div>
                    <div class="card-right">
                      <div class="price-value">¥{{ item.price || '0.00' }}</div>
                      <div class="discount-row">
                        <span class="discount-label">优惠</span>
                        <span class="discount-value">¥{{ item.discount || '0.00' }}</span>
                      </div>
                    </div>
                  </div>
                  <!-- 下半部分 -->
                  <div class="card-bottom">
                    <div class="subtotal">¥{{ item.subtotal || '0.00' }}</div>
                    <div class="quantity-stepper">
                      <span
                        class="stepper-btn minus"
                        :class="{ disabled: item.quantity <= 1 }"
                        @click="onMinusEditQuantity(index)"
                        >-</span
                      >
                      <input
                        v-model="item.quantity"
                        type="number"
                        class="stepper-input"
                        @input="onEditQuantityChange(index)"
                      />
                      <span class="stepper-btn plus" @click="onPlusEditQuantity(index)">+</span>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>
          <!-- 已添加列表 -->
          <div v-if="addedList.length > 0" class="added-list">
            <div v-for="item in addedList" :key="item.code" class="added-card">
              <!-- 删除按钮 -->
              <div class="delete-btn" @click="onDeleteAdded(item.code)">
                <van-icon name="delete-o" size="16" color="#B91919" />
              </div>
              <!-- 卡片内容 -->
              <div class="card-content">
                <!-- 上半部分 -->
                <div class="card-top">
                  <div class="card-left">
                    <div class="name-row">
                      <span class="card-name">{{ item.name }}</span>
                    </div>
                    <div class="card-code">{{ item.code }}</div>
                    <div class="category-row" @click="onSelectCategory(item)">
                      <span class="category-text">{{ item.category || '请选择分类' }}</span>
                      <van-icon name="arrow" size="16" color="#545454" />
                    </div>
                  </div>
                  <div class="card-right">
                    <div class="price-value">¥{{ item.price || '0.00' }}</div>
                    <div class="discount-row">
                      <span class="discount-label">优惠</span>
                      <span class="discount-value">¥{{ item.discount || '0.00' }}</span>
                    </div>
                  </div>
                </div>
                <!-- 下半部分 -->
                <div class="card-bottom">
                  <div class="subtotal">¥{{ item.subtotal || '0.00' }}</div>
                  <div class="quantity-stepper">
                    <span
                      class="stepper-btn minus"
                      :class="{ disabled: item.quantity <= 1 }"
                      @click="onMinusQuantity(item.code)"
                      >-</span
                    >
                    <input
                      v-model="item.quantity"
                      type="number"
                      class="stepper-input"
                      @input="onQuantityChange(item.code)"
                    />
                    <span class="stepper-btn plus" @click="onPlusQuantity(item.code)">+</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- 空状态 -->
          <div v-if="!searchValue && addedList.length === 0" class="empty-state">
            <img src="@/assets/image/noList.png" alt="" />
            <div class="empty-text">还没有添加维修零件</div>
          </div>
        </div>
      </van-tab>
    </van-tabs>

    <!-- 底部保存按钮 -->
    <div class="bottom-bar">
      <van-button class="save-btn" :disabled="addedList.length === 0" @click="onSave"
        >保存</van-button
      >
    </div>

    <!-- 分类选择弹窗 -->
    <ais-popup
      :show="showCategoryPicker"
      position="bottom"
      title="选择分类"
      @close="showCategoryPicker = false"
      :style="{ background: '#f4f4f4', height: '50%' }"
    >
      <template #content>
        <div class="category-list">
          <div
            v-for="(item, index) in categoryList"
            :key="index"
            :class="['category-item', { active: selectedCategory === item }]"
            @click="onConfirmCategory(item)"
          >
            <span class="category-text">{{ item }}</span>
            <van-icon v-if="selectedCategory === item" name="success" size="16" color="#009100" />
          </div>
        </div>
      </template>
    </ais-popup>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import AisPopup from '@/libs/components/AisPopup.vue'
import { getRepairItem, getMaintenanceParts } from '@/api/reception'
import './add-parts.scss'

const router = useRouter()

// Tab状态
const activeTab = ref('project')

// 统一的搜索值
const searchValue = ref('')

// 搜索弹窗显示状态
const showSearchPopup = ref(false)

// 统一的编辑列表（弹窗中）
const editingList = ref([])

// 统一的搜索结果
const searchResults = ref([])

// 统一的已添加列表
const addedList = ref([])

// 分类选择
const showCategoryPicker = ref(false)
const selectedCategory = ref('')
const currentEditItem = ref(null)

// 分类列表
const categoryList = ref(['一般维修-保险-无', '一般维修-非保险-无', '质保维修-无', '活动维修-无'])

// 搜索
const onSearch = async (value) => {
  if (!value || !value.trim()) {
    searchResults.value = []
    showSearchPopup.value = false
    return
  }
  // 如果当前有编辑详情，再次搜索时清空编辑列表，显示搜索结果
  if (editingList.value.length > 0) {
    // 将编辑中的项目合并到已添加列表
    editingList.value.forEach((item) => {
      const exists = addedList.value.find((p) => p.code === item.code)
      if (!exists) {
        addedList.value.push({ ...item })
      }
    })
    editingList.value = []
  }

  try {
    if (activeTab.value === 'project') {
      // 维修项目搜索
      const res = await getRepairItem({ nameOrCodeOrPinyinLike: value.trim() })
      if (res.code === 200) {
        searchResults.value = (res.data || []).map((item) => ({
          ...item,
          code: item.code || '',
          name: item.name || '',
          price: item.workhourPrice || 0,
          discount: 0,
        }))
      } else {
        searchResults.value = []
      }
    } else {
      // 维修配件搜索
      const res = await getMaintenanceParts({ nameOrCodeOrPinyinLike: value.trim() })
      if (res.code === 200) {
        searchResults.value = (res.data || []).map((item) => ({
          ...item,
          code: item.partsCode || item.code || '',
          name: item.partsName || item.name || '',
          price: item.price || 0,
          discount: 0,
        }))
      } else {
        searchResults.value = []
      }
    }
  } catch (error) {
    console.error('搜索失败:', error)
    searchResults.value = []
  }
  showSearchPopup.value = searchResults.value.length > 0
}

// 搜索框聚焦
const onSearchFocus = () => {
  if (searchValue.value && searchResults.value.length > 0) {
    showSearchPopup.value = true
  }
}

// 清空搜索
const onSearchClear = () => {
  searchValue.value = ''
  searchResults.value = []
  showSearchPopup.value = false
}

// 关闭弹窗 - 将编辑中的项目添加到已确认列表
const onClosePopup = () => {
  // 将编辑中的项目合并到已添加列表
  editingList.value.forEach((item) => {
    const exists = addedList.value.find((p) => p.code === item.code)
    if (!exists) {
      addedList.value.push({ ...item })
    }
  })
  editingList.value = []
  showSearchPopup.value = false
  searchValue.value = ''
  searchResults.value = []
}

// 添加到编辑列表
const onAddToEdit = (item) => {
  // 检查是否已在编辑列表中
  const existsInEdit = editingList.value.find((p) => p.code === item.code)
  if (existsInEdit) {
    showToast('该项目已添加')
    return
  }
  // 检查是否已在已确认列表中
  const existsInAdded = addedList.value.find((p) => p.code === item.code)
  if (existsInAdded) {
    showToast('该项目已添加')
    return
  }
  // 添加到编辑列表
  editingList.value.push({
    ...item,
    category: '',
    quantity: 1,
    subtotal: item.price,
  })
}

// 从编辑列表移除
const onRemoveFromEdit = (index) => {
  editingList.value.splice(index, 1)
}

// 在弹窗内选择分类
const onSelectCategoryForEdit = (item, _index) => {
  currentEditItem.value = item
  selectedCategory.value = item.category || ''
  showCategoryPicker.value = true
}

// 编辑模式下减少数量
const onMinusEditQuantity = (index) => {
  if (editingList.value[index].quantity > 1) {
    editingList.value[index].quantity--
    updateEditSubtotal(index)
  }
}

// 编辑模式下增加数量
const onPlusEditQuantity = (index) => {
  editingList.value[index].quantity++
  updateEditSubtotal(index)
}

// 编辑模式下数量变化
const onEditQuantityChange = (index) => {
  let value = parseFloat(editingList.value[index].quantity)
  if (isNaN(value) || value < 1) {
    editingList.value[index].quantity = 1
  } else {
    editingList.value[index].quantity = Math.floor(value)
  }
  updateEditSubtotal(index)
}

// 更新编辑模式小计
const updateEditSubtotal = (index) => {
  const price = parseFloat(editingList.value[index].price) || 0
  const discount = parseFloat(editingList.value[index].discount) || 0
  editingList.value[index].subtotal = (
    (price - discount) *
    editingList.value[index].quantity
  ).toFixed(2)
}

// 从已添加列表删除
const onDeleteAdded = (code) => {
  const index = addedList.value.findIndex((item) => item.code === code)
  if (index > -1) {
    addedList.value.splice(index, 1)
  }
}

// 选择分类（列表中）
const onSelectCategory = (item) => {
  currentEditItem.value = item
  selectedCategory.value = item.category || ''
  showCategoryPicker.value = true
}

// 确认分类
const onConfirmCategory = (category) => {
  if (currentEditItem.value) {
    currentEditItem.value.category = category
  }
  showCategoryPicker.value = false
}

// 减少数量（列表中）
const onMinusQuantity = (code) => {
  const item = addedList.value.find((p) => p.code === code)
  if (item && item.quantity > 1) {
    item.quantity--
    updateAddedSubtotal(item)
  }
}

// 增加数量（列表中）
const onPlusQuantity = (code) => {
  const item = addedList.value.find((p) => p.code === code)
  if (item) {
    item.quantity++
    updateAddedSubtotal(item)
  }
}

// 数量变化（列表中）
const onQuantityChange = (code) => {
  const item = addedList.value.find((p) => p.code === code)
  if (item) {
    let value = parseFloat(item.quantity)
    if (isNaN(value) || value < 1) {
      item.quantity = 1
    } else {
      item.quantity = Math.floor(value)
    }
    updateAddedSubtotal(item)
  }
}

// 更新已添加列表小计
const updateAddedSubtotal = (item) => {
  const price = parseFloat(item.price) || 0
  const discount = parseFloat(item.discount) || 0
  item.subtotal = ((price - discount) * item.quantity).toFixed(2)
}

// 保存
const onSave = () => {
  if (addedList.value.length === 0) {
    showToast('请添加项目或零件')
    return
  }
  showToast('保存成功')
  router.back()
}
</script>
