<template>
  <ais-popup
    v-model:show="innerShow"
    position="bottom"
    title="更换车辆"
    :style="{ background: '#f4f4f4', height: '80%' }"
  >
    <template #content>
      <div class="change-car-content">
        <!-- 搜索框 -->
        <div class="search-box">
          <div class="search-input-wrapper">
            <van-search
              v-model="carSearchValue"
              class="search-input"
              clearable
              placeholder="请输入车牌号/VIN/车主姓名"
              shape="round"
              :autofocus="true"
              @search="onCarSearch"
            >
              <template #left-icon>
                <van-icon name="search" size="16" color="#191A1B" />
              </template>
              <template #right-icon>
                <span class="search-btn" @click="onCarSearch(carSearchValue)">搜索</span>
              </template>
            </van-search>
          </div>
        </div>
        <!-- 搜索结果列表 -->
        <div v-if="!selectedCarInfo && carSearchResults.length > 0" class="search-results">
          <div
            v-for="(item, index) in carSearchResults"
            :key="index"
            class="result-item"
            @click="onSelectCar(item)"
          >
            <span class="result-text">
              <van-highlight
                :keywords="carSearchValue"
                :source-string="
                  (item.vehiclePlateNo || '无车牌') +
                  '/' +
                  item.vin +
                  '/' +
                  (item.vehicleProfileOwnerResp?.ownerName || '')
                "
              />
            </span>
          </div>
        </div>

        <!-- 选中车辆信息卡片 -->
        <div v-if="selectedCarInfo" class="car-info-card">
          <div class="card-header">
            <span class="plate-no">{{ selectedCarInfo.vehiclePlateNo || '无车牌' }}</span>
          </div>
          <div class="card-info-list">
            <div class="info-row">
              <span class="label">车型</span>
              <span class="value">{{
                selectedCarInfo.vehicleModelName || selectedCarInfo.vehicleModel || ''
              }}</span>
            </div>
            <div class="info-row">
              <span class="label">VIN</span>
              <span class="value">{{ selectedCarInfo.vin }}</span>
            </div>
            <div class="info-row">
              <span class="label">保修日期</span>
              <span class="value">{{ selectedCarInfo.warrantyDate }}</span>
            </div>
            <div class="info-row">
              <span class="label">车主</span>
              <span class="value"
                >{{ selectedCarInfo.vehicleProfileOwnerResp?.ownerName || '' }}
                {{ selectedCarInfo.vehicleProfileOwnerResp?.mobilephone || '' }}</span
              >
            </div>
            <div class="info-row">
              <span class="label">绑车人</span>
              <span class="value"
                >{{ selectedCarInfo.vehicleProfileOwnerResp?.bindingUser || '' }}
                {{ selectedCarInfo.vehicleProfileOwnerResp?.bindingPhone || '' }}</span
              >
            </div>
          </div>
          <div class="card-footer">
            <span class="change-car-btn" @click="onConfirm">更换为该车辆</span>
          </div>
        </div>

        <!-- 无结果提示 -->
        <div
          v-if="!selectedCarInfo && carSearchValue && carSearchResults.length === 0 && hasSearched"
          class="no-result"
        >
          <img src="@/assets/image/noList.png" alt="" />
        </div>
      </div>
    </template>
  </ais-popup>
</template>

<script setup>
/**
 * 换车弹窗组件
 *
 * 职责：内聚换车弹窗的搜索/选择/重置/关闭交互
 *  - 内部维护搜索关键字、搜索结果、选中车辆、是否已搜索 等状态
 *  - 弹窗关闭时自动重置内部状态
 *  - 点击「更换为该车辆」时通过 `confirm` 事件抛出原始车辆数据，由父组件按各自业务字段做映射
 *
 * 显隐桥接：
 *  - AisPopup 仅 emit `update:show`（无 close 事件），这里通过本地 `innerShow`
 *    与 `props.show` 双向同步，再以 `update:show` 通知父组件，支持父组件 v-model:show 绑定
 */
import { ref, watch } from 'vue'
import { showToast } from 'vant'
import AisPopup from '@/libs/components/AisPopup.vue'
import { getVehicleInfo } from '@/api/reception'

const props = defineProps({
  /** 是否显示弹窗（v-model:show） */
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  /** 弹窗显隐变更（v-model:show 配套） */
  'update:show',
  /** 确认更换车辆，参数为选中的原始车辆数据 */
  'confirm'
])

// 本地显隐状态：与 AisPopup 通过 v-model:show 双向同步
const innerShow = ref(props.show)

// 搜索关键字
const carSearchValue = ref('')
// 搜索结果列表
const carSearchResults = ref([])
// 选中的车辆信息（展示卡片）
const selectedCarInfo = ref(null)
// 是否已发起过搜索（用于无结果提示）
const hasSearched = ref(false)

// 重置内部状态
const resetState = () => {
  carSearchValue.value = ''
  carSearchResults.value = []
  selectedCarInfo.value = null
  hasSearched.value = false
}

// 父组件 → 内部
watch(
  () => props.show,
  (val) => {
    innerShow.value = val
  }
)

// 内部 → 父组件，并在关闭时重置内部状态
watch(innerShow, (val) => {
  emit('update:show', val)
  if (!val) resetState()
})

// 搜索车辆
const onCarSearch = async(value) => {
  // 重置选中车辆信息，展示搜索结果列表
  selectedCarInfo.value = null
  if (!value || !value.trim()) {
    carSearchResults.value = []
    hasSearched.value = false
    return
  }
  try {
    const res = await getVehicleInfo({ searchVin: value.trim() })
    carSearchResults.value = res.code === 200 ? res.data || [] : []
  } catch (error) {
    console.error('搜索车辆失败:', error)
    carSearchResults.value = []
  }
  hasSearched.value = true
}

// 选择车辆
const onSelectCar = (item) => {
  selectedCarInfo.value = item
}

// 确认更换车辆
const onConfirm = () => {
  if (!selectedCarInfo.value) {
    showToast('请选择车辆')
    return
  }
  emit('confirm', selectedCarInfo.value)
  showToast('更换车辆成功')
  innerShow.value = false
}
</script>

<style lang="scss" scoped>
// 换车弹框样式
.change-car-content {
  .search-box {
    margin-bottom: 12px;

    .search-input-wrapper {
      .search-input {
        flex: 1;
        height: 100%;
        border: none;
        background: transparent;
        font-size: 12px;
        color: #191a1b;
        outline: none;
        padding: 0;
        &::placeholder {
          color: #888888;
        }
      }

      .search-btn {
        background: #009100;
        color: #ffffff;
        font-size: 12px;
        padding: 4px 14px;
        border-radius: 13px;
        flex-shrink: 0;

        &:active {
          background: #007a00;
        }
      }
    }
  }

  .search-results {
    border-radius: 8px;
    overflow: hidden;

    .result-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 12px;
      border-bottom: 0.5px solid #e6e6e5;

      &:last-child {
        border-bottom: none;
      }

      &:active {
        background: #f7f7f7;
      }

      .result-text {
        font-size: 14px;
        color: #191a1b;
      }
    }
  }

  .car-info-card {
    background: #ffffff;
    border-radius: 6px;
    overflow: hidden;

    .card-header {
      padding: 12px 12px 0;

      .plate-no {
        font-size: 16px;
        font-weight: 600;
        color: #191a1b;
      }
    }

    .card-info-list {
      padding: 8px 12px 12px;

      .info-row {
        display: flex;
        align-items: center;
        margin-bottom: 6px;

        &:last-child {
          margin-bottom: 0;
        }

        .label {
          width: 56px;
          font-size: 14px;
          color: #545454;
          flex-shrink: 0;
        }

        .value {
          font-size: 14px;
          color: #191a1b;
          margin-left: 12px;
        }
      }
    }

    .card-footer {
      padding: 0 12px 12px;
      display: flex;
      justify-content: flex-end;
      .change-car-btn {
        border: 1px solid #009100;
        color: #009100;
        font-size: 14px;
        padding: 6px 16px;
        border-radius: 38px;
        background: #fff;
      }
      .confirm-btn {
        border: 1px solid #009100;
        color: #009100;
        font-size: 14px;
        padding: 6px 16px;
        border-radius: 38px;

        &:active {
          background: rgba(0, 145, 0, 0.1);
        }
      }
    }
  }

  .no-result {
    text-align: center;
    padding: 60px 0;

    img {
      max-width: 200px;
    }
  }
}
</style>
