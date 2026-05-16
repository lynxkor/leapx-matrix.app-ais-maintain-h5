<template>
  <div class="repair-item-card">
    <div v-if="deletable && !disabled" class="card-delete" @click="$emit('delete')">
      <div class="delete-circle">
        <img :src="icon_delete" />
      </div>
    </div>
    <div v-else class="card-delete">
      <div class="delete-circle disabled">
        <img :src="icon_delete" />
      </div>
    </div>
    <div class="card-body">
      <!-- 上半区：信息行 -->
      <div class="card-info-row">
        <!-- 左列 -->
        <div class="info-left">
          <div class="name-row">
            <span class="card-name">
              <span class="card-tag" v-if="item.isOemPart == 1">原厂件</span>
              <span class="card-tag" v-else-if="item.partsId">副厂件</span>
              <span
                v-if="item.replaceSparePartRespList && item.replaceSparePartRespList.length > 0 && isReplace"
                class="replace-tag"
                @click="onReplaceTagClick(item)"
                >替<van-icon name="exchange" size="13px"
              /></span>{{ item.name }}
              <img
                v-if="nameEditable && !disabled"
                :src="icon_edit"
                class="edit-icon"
                alt=""
                @click="openNameEditPopup"
              />
            </span>
          </div>
          <div class="code-row">
            <span class="card-code">{{ item.code }}</span>
          </div>
          <div class="checkout-row" @click="!disabled && openCascaderPopup()">
            <span class="checkout-label">{{ checkoutLabel }}</span>
            <van-icon
              v-if="!item.packageId && !disabled"
              name="arrow"
              size="12"
              color="#545454"
              class="checkout-arrow"
            />
          </div>
        </div>
        <!-- 右列 -->
        <div class="info-right">
          <div class="main-price">
            ¥{{ (item.price * item.quantity - item.discountAmount).toFixed(2) || '0.00' }}
          </div>
          <div
            class="discount-wrapper"
            :class="{ 'discount-disabled': discountDisabled || disabled }"
            @click="!disabled && !discountDisabled && startEditDiscount()"
          >
            <span class="discount-tag-label">优惠</span>
            <template v-if="editingDiscount">
              <input
                ref="discountInputRef"
                v-model="tempDiscountAmount"
                class="discount-input"
                type="number"
                :min="0"
                @blur="saveDiscountAmount"
                @keydown.enter="saveDiscountAmount"
              />
            </template>
            <span v-else class="discount-tag-amount">¥{{ (+item.discountAmount || 0).toFixed(2) }}</span>
          </div>
        </div>
      </div>
      <!-- 下半区：原价 + 步进器 -->
      <div class="card-bottom-row">
        <span class="original-price">
          <em>¥{{ item.price || '0.00' }}</em>
          <em v-if="item.partsId">实际领料 {{ Number(item.actualPickNumber) || 0 }}</em>
          <em v-if="item.partsId">退料 {{ Number(item.refundedNumber) || 0 }}</em>
        </span>
        <van-stepper
          v-if="!stepperDisabled && !disabled"
          :model-value="item.quantity"
          min="0"
          class="card-stepper"
          input-width="32px"
          button-size="32px"
          @change="(val) => emit('update-item', item, { quantity: val, workHour: val })"
        />
        <span v-else class="static-quantity">{{ item.quantity }}</span>
      </div>
    </div>

    <!-- 名称编辑弹窗 -->
    <van-popup v-model:show="showNameEditPopup" round position="center" :style="{ width: '295px' }">
      <div class="name-edit-popup">
        <div class="popup-title">维修项目名称</div>
        <div class="input-container">
          <van-field
            ref="nameInputRef"
            v-model="tempName"
            placeholder="请输入维修项目名称"
            maxlength="100"
            clearable
          />
        </div>
        <div class="popup-actions">
          <div class="action-btn cancel-btn" @click="cancelNameEdit">取消</div>
          <div class="divider"></div>
          <div class="action-btn save-btn" @click="saveName">保存</div>
        </div>
      </div>
    </van-popup>

    <!-- 替换件弹窗 -->
    <ais-popup
      :show="showReplacePopup"
      position="bottom"
      closeable
      close-icon="cross"
      close-icon-position="top-left"
      title="请选择替换件"
      @close="showReplacePopup = false"
      style="max-height: 70vh"
    >
      <template #content>
        <div class="replace-list">
          <!-- 当前零件 -->
          <div class="current-part">
            <div class="current-part-info">
              <span class="current-part-name">{{ item.name }}</span>
              <span class="original-tag" v-if="item.isOemPart == 1">原厂件</span>
              <span class="original-tag" v-else>副厂件</span>
            </div>
            <div class="check-icon">
              <van-icon name="success" size="16" color="#009100" />
            </div>
          </div>
          <div class="replace-divider">替换件</div>
          <!-- 替换件列表 -->
          <div class="replace-scroll-list">
            <div
              v-for="(part, index) in replaceSparePartRespList"
              :key="index"
              class="replace-item"
              :class="{
                selected: selectedReplacePart?.partsCode === part.partsCode,
                disabled: part.isOutstock == 1,
              }"
              @click="onSelectReplacePart(part)"
            >
              <div class="replace-item-content">
                <div class="replace-info">
                  <div class="replace-name">
                   {{ part.partsCode }} {{ part.partsName }}-{{ part.stockCount || 0 }}-¥{{ part.price }}
                  </div>
                </div>
              </div>
              <!-- 选中状态图标 -->
              <div v-if="selectedReplacePart?.partsCode === part.partsCode" class="check-icon">
                <van-icon name="success" size="16" color="#009100" />
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <div :class="['confirm-btn', !selectedReplacePart?.partsCode ? 'disabled': '']" @click="onConfirmReplace">确定</div>
      </template>
    </ais-popup>
  </div>
</template>

<script setup>
import { ref, nextTick, computed } from 'vue'
import { showToast } from 'vant'
import icon_delete from '@/assets/images/icon_delete.svg'
import icon_edit from '@/assets/images/icon_edit.svg'
import AisPopup from '@/libs/components/AisPopup.vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  stepperDisabled: {
    type: Boolean,
    default: false
  },
  discountDisabled: {
    type: Boolean,
    default: false
  },
  nameEditable: {
    type: Boolean,
    default: false
  },
  deletable: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  isReplace: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['delete', 'update-item', 'replace'])

// 名称编辑
const showNameEditPopup = ref(false)
const tempName = ref('')

// 优惠金额编辑
const editingDiscount = ref(false)
const tempDiscountAmount = ref('0')
const discountInputRef = ref(null)
const nameInputRef = ref(null)

// 替换件弹窗
const showReplacePopup = ref(false)
const selectedReplacePart = ref(null)
const replaceSparePartRespList = ref([])

const onReplaceTagClick = (item) => {
  const list = item.replaceSparePartRespList
  if (!list || list.length === 0) {
    showToast('当前无替换件')
    return
  }
  replaceSparePartRespList.value = list
  console.log('替换件:', replaceSparePartRespList.value)
  selectedReplacePart.value = null
  showReplacePopup.value = true
}

const onSelectReplacePart = (part) => {
  if (Number(part.isOutstock) === 1) {
    showToast('该零件已出库')
    return
  }
  selectedReplacePart.value = part
}

const onConfirmReplace = () => {
  if (!selectedReplacePart.value) {
    showToast('请选择替换件')
    return
  }
  emit('replace', {
    oldPart: props.item,
    newPart: selectedReplacePart.value
  })
  showReplacePopup.value = false
}

// 打开名称编辑弹窗并初始化数据
const openNameEditPopup = () => {
  if (!props.nameEditable) return
  tempName.value = props.item.name || ''
  showNameEditPopup.value = true
  nextTick(() => {
    nameInputRef.value?.focus()
  })
}

const checkoutLabel = computed(() => {
  const { item } = props
  return (
    [item.repairItemTypeName, item.checkoutTypeName, item.warrantyTypeName]
      .filter((item) => item)
      .join('-') || '请选择'
  )
})

// 开始编辑优惠金额
const startEditDiscount = () => {
  if (props.discountDisabled) return
  editingDiscount.value = true
  tempDiscountAmount.value = String(props.item.discountAmount || 0)
  nextTick(() => {
    discountInputRef.value?.focus()
  })
}

// 保存优惠金额
const saveDiscountAmount = () => {
  let amount = parseFloat(tempDiscountAmount.value) || 0
  if (amount < 0) {
    amount = 0
  }
  if (amount > props.item.price * props.item.quantity) {
    amount = props.item.price * props.item.quantity
  }
  emit('update-item', props.item, { discountAmount: amount })
  editingDiscount.value = false
}

// 取消名称编辑
const cancelNameEdit = () => {
  showNameEditPopup.value = false
  tempName.value = ''
}

// 保存名称
const saveName = () => {
  const name = tempName.value.trim()
  if (name) {
    emit('update-item', props.item, { name, repairItemName: name })
  }
  showNameEditPopup.value = false
  tempName.value = ''
}

// 打开维修类型等切换弹窗
const openCascaderPopup = () => {
  // 获取维修类型、工时、工时类型、保内、保外、优惠、名称、单价、数量
  const { item } = props
  if (!item.packageId) {
    emit('update-item', item, { _action: 'checkout' })
  }
}
</script>

<style lang="scss" scoped>
.repair-item-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 4px;
  border-bottom: 0.5px solid var(--leap-color-default-light-4);
  background-color: #fff;
  &:last-child {
    border-bottom: none;
  }

  // 删除按钮
  .card-delete {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    .delete-circle {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      background: #f8e8e8;
      border-radius: 60px;
      cursor: pointer;

      &:active {
        opacity: 0.7;
      }

      &.disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }
    }
  }

  // 卡片主体
  .card-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;

    // 上半区：信息行
    .card-info-row {
      display: flex;
      justify-content: space-between;
      gap: 2px;

      // 左列：名称、代码、结算类型
      .info-left {
        .name-row {
          .card-name {
            font-size: 14px;
            line-height: 20px;
            font-weight: 500;
            color: var(--leap-color-default);
            cursor: pointer;
            max-width: 210px;
            overflow: hidden;
            text-overflow: ellipsis;
            -webkit-line-clamp: 2;
            display: -webkit-box;
            -webkit-box-orient: vertical;
          }
          .card-tag {
            font-size: 12px;
            color: #191a1b;
            background: #f2f2f2;
            padding: 2px 4px;
            border-radius: 4px;
            width:44px;
            margin-right: 4px;
          }

          .edit-icon {
            flex-shrink: 0;
            cursor: pointer;
            vertical-align: middle;
          }

          .replace-tag {
            margin-right: 4px;
            flex-shrink: 0;
            font-size: 12px;
            color: #191a1b;
            background: #f2f2f2;
            padding: 1px 3px;
            border-radius: 4px;
          }
        }

        .code-row {
          margin: 4px 0;
          .card-code {
            font-size: 12px;
            color: var(--leap-color-default-light-1);
            line-height: 17px;
          }
        }

        .checkout-row {
          display: inline-block;
          align-items: center;
          height: 20px;
          padding: 2px 4px;
          background: rgba(84, 84, 84, 0.06);
          border-radius: 4px;
          cursor: pointer;

          .checkout-label {
            font-size: 12px;
            color: var(--leap-color-default-light-1);
            line-height: 17px;
          }

          .checkout-arrow {
            margin-left: auto;
          }

          &:active {
            background: rgba(84, 84, 84, 0.1);
          }
        }
      }

      // 右列：价格、优惠
      .info-right {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 2px;
        flex-shrink: 0;

        .main-price {
          font-size: 14px;
          font-weight: 500;
          color: var(--leap-color-default);
          line-height: 20px;
          text-align: right;
        }

        .discount-wrapper {
          display: flex;
          flex-shrink: 0;
          margin-top: 3px;
          padding: 4px;
          border-radius: 4px;
          background: #faf6ea;
          align-items: center;
          justify-content: space-between;
          width: 92px;
          font-size: 12px;
          cursor: pointer;

          .discount-tag-label {
            color: var(--leap-color-default-light-1);
          }

          .discount-tag-amount {
            color: var(--leap-color-warning);
          }

          .discount-input {
            width: 50px;
            text-align: right;
            border: 1px solid var(--leap-color-default);
            border-radius: 2px;
            padding: 0 4px;
            font-size: 12px;
            color: var(--leap-color-warning);
            background: #faf6ea;
            outline: none;
            &:focus {
              border-color: #faf6ea;
            }
          }

          &.discount-disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        }
      }
    }

    // 下半区：原价 + 步进器
    .card-bottom-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 4px;
      height: 32px;

      .original-price {
        font-size: 12px;
        color: var(--leap-color-default-light-1);
        em {
          font-style: normal;
          margin-right: 8px;
        }
      }

      .static-quantity {
        font-size: 14px;
        color: var(--leap-color-default);
        font-weight: 500;
      }

      .card-stepper {
        border: 1px solid var(--leap-color-default);
        color: var(--leap-color-default);
        border-radius: 4px;
        ::v-deep .van-stepper__minus,
        ::v-deep .van-stepper__plus {
          background: #fff;
          color: var(--leap-color-default);
          font-weight: 500;
        }
        ::v-deep .van-stepper__minus--disabled,
        ::v-deep.van-stepper__plus--disabled {
          color: var(--leap-color-default-light-3);
        }
        ::v-deep .van-stepper__input {
          background: #fff;
        }
      }
    }
  }
}

// 名称编辑弹窗
.name-edit-popup {
  display: flex;
  flex-direction: column;
  padding-top: 32px;
  background: #fff;
  border-radius: 8px;

  .popup-title {
    font-size: 16px;
    font-weight: 500;
    color: var(--leap-color-default);
    line-height: 24px;
    text-align: center;
    margin-bottom: 8px;
  }

  .input-container {
    position: relative;
    margin: 0 12px;
    margin-bottom: 32px;
    ::v-deep .van-field {
      background: rgba(0, 0, 0, 0.04);
      border-radius: 7px;
    }

    .error-icon {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      display: flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      cursor: pointer;

      &:active {
        opacity: 0.7;
      }
    }
  }

  .popup-actions {
    display: flex;
    align-items: center;
    height: 54px;
    border-top: 0.5px solid var(--leap-color-default-light-4);
    padding: 0 16px;

    .action-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 22px;
      font-size: 14px;
      color: var(--leap-color-default);
      line-height: 22px;
      cursor: pointer;

      &:active {
        opacity: 0.7;
      }
    }

    .save-btn {
      color: var(--leap-color-primary);
    }

    .divider {
      height: 54px;
      width: 0.5px;
      background: var(--leap-color-default-light-4);
      margin: 0 16px;
    }
  }
}

// 替换件列表
.replace-list {
  border-radius: 8px;
  overflow: hidden;
  .replace-divider {
    background: #f4f4f4;
    margin: 8px 0;
    color: #191a1b;
    font-size:14px;
  }
  // 当前零件行
  .current-part {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    border-bottom: 0.5px solid #e6e6e5;
    background: #fff;
    border-radius: 8px;

    .current-part-info {
      display: flex;
      align-items: center;
      gap: 8px;

      .current-part-name {
        font-size: 14px;
        color: #191a1b;
      }

      .original-tag {
        font-size: 12px;
        color: #191a1b;
        background: rgba(25, 26, 27, 0.06);
        padding: 1px 4px;
        border-radius: 4px;
      }
    }

    .check-icon {
      display: flex;
      align-items: center;
    }
  }

  // 可滚动替换件列表
  .replace-scroll-list {
    background: #fff;
    border-radius: 8px;
    max-height: 40vh;
    overflow-y: auto;
    padding: 4px 12px;
  }

  .replace-item {
    position: relative;
    display: flex;
    align-items: center;
    padding: 10px 0;
    border-bottom: 0.5px solid #e6e6e5;

    &:last-child {
      border-bottom: none;
    }

    &.disabled {
      opacity: 0.5;
    }

    .replace-item-content {
      flex: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .replace-info {
        .replace-name {
          font-size: 14px;
          color: #191a1b;
          margin-bottom: 4px;
        }

        .replace-code {
          font-size: 12px;
          color: rgba(25, 26, 27, 0.4);
        }
      }

      .replace-meta {
        text-align: right;

        .replace-price {
          font-size: 14px;
          font-weight: 500;
          color: #191a1b;
          margin-bottom: 4px;
        }

        .replace-stock {
          font-size: 12px;
          color: rgba(25, 26, 27, 0.4);

          &.out {
            color: #ff6600;
          }
        }
      }
    }

    .check-icon {
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
    }
  }
}
// 确认按钮
.confirm-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  background: #009100;
  color: #fff;
  font-size: 14px;
  border-radius: 8px;
  margin: 12px;
  cursor: pointer;
  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>
