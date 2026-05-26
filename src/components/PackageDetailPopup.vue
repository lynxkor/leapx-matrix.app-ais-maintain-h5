<template>
  <ais-popup
    :show="show"
    position="bottom"
    closeable
    close-icon="cross"
    close-icon-position="top-left"
    :title="packageData.name.split('-')[0] || '套餐详情'"
    @close="$emit('close')"
    style="height: 50vh"
  >
    <template #content>
      <!-- 套餐信息 -->
      <div class="package-info">
        <div class="package-name">{{ packageData.name }}</div>
        <div class="package-code">{{ packageData.code }}</div>
      </div>
      <!-- 内容区域 -->
      <div class="package-detail">
        <!-- 维修项目列表 -->
        <div v-for="(item, index) in packageData.itemRespList" :key="index" class="repair-card">
          <div class="repair-card-content">
            <div class="repair-left">
              <div class="repair-name-row">
                <span class="repair-name">{{ item.repairItemName }}</span>
              </div>
              <div class="repair-code">{{ item.partsCode || item.repairItemCode }}</div>
              <div class="repair-category">{{ item.partsName || item.repairItemTypeName }}</div>
            </div>
            <div class="repair-right">
              <div class="repair-price">¥{{ item.partsAmount || item.repairAmount }}</div>
              <div class="repair-discount">优惠 ¥{{ item.discountAmount }}</div>
            </div>
          </div>
          <div class="repair-card-bottom">
            <div class="repair-info-row">
              <span class="info-item">
                <span class="info-label">项目金额</span>
                <span class="info-value">¥{{ item.price || '0.00' }}</span>
              </span>
            </div>
          </div>
          <!-- 维修配件列表 -->
          <div v-if="expandedPartsIndex === index" class="parts-list">
            <div v-for="(part, pIndex) in item.partRespList" :key="pIndex" class="part-card">
              <div class="part-card-content">
                <div class="part-left">
                  <div class="part-name-row">
                    <span class="part-name">{{ part.partsName }}</span>
                  </div>
                  <div class="part-code">{{ part.partsCode }}</div>
                  <div class="part-category">{{ part.repairItemTypeName }}</div>
                </div>
                <div class="part-right">
                  <div class="part-price">
                    ¥{{ safeCalc(part.price, part.quantity, part.discountAmount) }}
                  </div>
                  <div class="part-discount">优惠 ¥{{ part.discountAmount }}</div>
                </div>
              </div>
              <div class="part-card-bottom">
                <div class="part-info-row">
                  <span class="info-item">
                    <span class="info-value">¥{{ part.price || '0.00' }}</span>
                  </span>
                  <span class="info-item">
                    <span class="info-label">数量</span>
                    <span class="info-value">x{{ part.quantity }}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <!-- 展开/收起查看配件按钮 -->
          <div
            v-if="item.partRespList && item.partRespList.length > 0"
            class="expand-btn"
            @click="togglePartsExpand(index)"
          >
            <span class="expand-text">{{
              expandedPartsIndex === index ? '收起维修配件' : '查看维修配件'
            }}</span>
            <van-icon
              :name="expandedPartsIndex === index ? 'arrow-up' : 'arrow-down'"
              size="12"
              color="#009100"
            />
          </div>
        </div>
      </div>
    </template>
    <!-- <template #footer>
      <div class="detail-actions" :class="{ 'single-btn': showCancel }">
        <div v-if="showCancel" class="cancel-btn" @click="$emit('close')">取消选择</div>
        <div v-else class="confirm-btn full-btn" @click="$emit('confirm')">选择</div>
      </div>
    </template> -->
  </ais-popup>
</template>

<script setup>
import { ref } from 'vue'
import AisPopup from '@/libs/components/AisPopup.vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  packageData: {
    type: Object,
    default: () => ({
      name: '',
      code: '',
      itemRespList: []
    })
  },
  showCancel: {
    type: Boolean,
    default: false
  }
})

defineEmits(['close', 'confirm'])

// 配件展开状态
const expandedPartsIndex = ref(-1)

// 金额计算安全函数
const safeCalc = (price, qty, discount = 0) => {
  console.log('packageData', props.packageData)
  const p = Number(price) || 0
  const q = Number(qty) || 0
  const d = Number(discount) || 0
  return (p * q - d).toFixed(2)
}

// 切换配件展开/收起
const togglePartsExpand = (index) => {
  expandedPartsIndex.value = expandedPartsIndex.value === index ? -1 : index
}
</script>

<style lang="scss" scoped>
.package-info {
  padding: 0 12px 0 0;

  .package-name {
    font-size: 16px;
    font-weight: 600;
    color: #191a1b;
    margin-bottom: 4px;
  }

  .package-code {
    font-size: 12px;
    color: #888888;
  }
}

.package-detail {
  padding: 12px 0 0 0;

  .repair-card {
    background: #ffffff;
    border: 0.5px solid #e6e6e5;
    border-radius: 8px;
    margin-bottom: 12px;
    overflow: hidden;

    .repair-card-content {
      display: flex;
      justify-content: space-between;
      padding: 12px;
      gap: 12px;

      .repair-left {
        display: flex;
        flex-direction: column;
        gap: 2px;
        flex: 1;

        .repair-name-row {
          display: flex;
          align-items: center;
          gap: 4px;

          .repair-name {
            font-size: 14px;
            font-weight: 500;
            color: #191a1b;
          }
        }

        .repair-code {
          font-size: 12px;
          color: #545454;
        }

        .repair-category {
          font-size: 12px;
          color: #545454;
        }
      }

      .repair-right {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 2px;

        .repair-price {
          font-size: 14px;
          font-weight: 500;
          color: #191a1b;
        }

        .repair-discount {
          font-size: 12px;
          color: #545454;
        }
      }
    }

    .repair-card-bottom {
      padding: 0 12px 12px 12px;

      .repair-info-row {
        display: flex;
        gap: 16px;
        margin-bottom: 8px;

        .info-item {
          display: flex;
          align-items: center;
          gap: 4px;

          .info-label {
            font-size: 12px;
            color: #545454;
          }

          .info-value {
            font-size: 12px;
            color: #191a1b;
          }
        }
      }
    }

    .parts-list {
      border-top: 0.5px solid #e6e6e5;
      padding: 12px;
      background: #fafafa;

      .part-card {
        margin-bottom: 8px;
        overflow: hidden;

        &:last-child {
          margin-bottom: 0;
        }

        .part-card-content {
          display: flex;
          justify-content: space-between;
          padding: 12px;
          gap: 12px;

          .part-left {
            display: flex;
            flex-direction: column;
            gap: 2px;
            flex: 1;

            .part-name-row {
              display: flex;
              align-items: center;
              gap: 4px;

              .part-name {
                font-size: 14px;
                font-weight: 500;
                color: #191a1b;
              }
            }

            .part-code {
              font-size: 12px;
              color: #545454;
            }

            .part-category {
              font-size: 12px;
              color: #545454;
            }
          }

          .part-right {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 2px;

            .part-price {
              font-size: 14px;
              font-weight: 500;
              color: #191a1b;
            }

            .part-discount {
              font-size: 12px;
              color: #545454;
            }
          }
        }

        .part-card-bottom {
          padding: 0 12px 12px 12px;

          .part-info-row {
            display: flex;
            gap: 16px;

            .info-item {
              display: flex;
              align-items: center;
              gap: 4px;

              .info-label {
                font-size: 12px;
                color: #545454;
              }

              .info-value {
                font-size: 12px;
                color: #191a1b;
              }
            }
          }
        }
      }
    }

    .expand-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 8px 0;
      cursor: pointer;

      .expand-text {
        font-size: 12px;
        color: #009100;
      }
    }
  }
}

.detail-actions {
  display: flex;
  gap: 12px;
  padding: 12px;

  &.single-btn {
    .cancel-btn {
      flex: 1;
    }
  }

  .cancel-btn {
    flex: 1;
    height: 40px;
    background: #ffffff;
    border: 1px solid #dce0e4;
    border-radius: 8px;
    font-size: 14px;
    color: #191a1b;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .confirm-btn {
    flex: 1;
    height: 40px;
    background: #009100;
    border-radius: 8px;
    font-size: 14px;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;

    &.full-btn {
      flex: 1;
    }
  }
}
</style>
