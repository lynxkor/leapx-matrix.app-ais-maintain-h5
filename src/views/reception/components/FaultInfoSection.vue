<template>
  <div class="fault-info">
    <!-- 是否存在故障 -->
    <div class="section-card">
      <div class="fault-header">
        <span class="title">本次是否因故障进店</span>
        <template v-if="readonly">
          <span class="fault-status-text">{{ String(currentFault) === '1' ? '是' : '否' }}</span>
        </template>
        <div v-else class="radio-group">
          <van-radio-group
            v-model="currentFault"
            direction="horizontal"
            @change="onHasFaultChange"
          >
            <van-radio name="1">是</van-radio>
            <van-radio name="0">否</van-radio>
          </van-radio-group>
        </div>
      </div>

      <!-- 故障模块列表 -->
      <div
        v-if="Number(currentFault) === 1"
        class="fault-modules"
        data-scroll-target="faultModules"
      >
        <div v-if="!readonly" class="add-module" @click="onAddFaultModule">
          <van-icon name="plus" />
          <span>添加故障模块</span>
        </div>

        <!-- 模块列表容器，支持滚动 -->
        <div class="modules-container" :class="{ expanded: showAllModules }">
          <div
            v-for="(module, index) in displayModules"
            :key="index"
            class="fault-module-item"
          >
            <span class="module-name">{{
              module.vrtName + '-' + module.vfgName + '-' + module.cccName
            }}</span>
            <img
              v-if="!readonly"
              src="@/assets/images/trash.svg"
              @click="onDeleteFaultModule(module)"
            />
          </div>
        </div>

        <!-- 查看全部按钮 -->
        <div v-if="faultModules.length > 3" class="view-all" @click="onViewAllModules">
          <span>{{ showAllModules ? '收起' : '查看全部' }}</span>
          <van-icon :name="showAllModules ? 'arrow-up' : 'arrow-down'" />
        </div>
      </div>
    </div>

    <!-- 客户故障描述 -->
    <div class="section-card">
      <div class="section-title" style="justify-content: flex-start">
        <span v-if="!readonly && Number(currentFault) === 1" class="required">*</span>客户故障描述
      </div>
      <template v-if="readonly">
        <div class="fault-desc-text">{{ customerFaultDesc || '无' }}</div>
      </template>
      <van-field
        v-else
        v-model="customerFaultDesc"
        type="textarea"
        placeholder="请输入客户故障描述"
        rows="3"
        autosize
        show-word-limit
        maxlength="500"
        :disabled="customerFaultDescDisabled"
        data-scroll-target="customerFaultDesc"
        style="background: #f5f5f5; border-radius: 6px"
      />
    </div>

    <!-- 添加故障模块弹框 -->
    <ais-popup
      :show="addFaultModuleShow"
      position="bottom"
      title="添加故障模块"
      :style="{ height: '80%', background: '#F4F4F4' }"
      @close="onCloseFaultModulePopup"
    >
      <template #content>
        <div class="fault-module-content">
          <!-- 搜索框 -->
          <div class="search-box">
            <div class="search-input-wrapper">
              <van-search
                v-model="faultSearchValue"
                class="search-input"
                clearable
                placeholder="请输入CCC"
                shape="round"
                :autofocus="true"
                @search="onFaultSearch"
                @clear="onFaultSearchClear"
              >
                <template #left-icon>
                  <van-icon name="search" size="16" color="#191A1B" />
                </template>
                <template #right-icon>
                  <span class="search-btn" @click="onFaultSearch(faultSearchValue)">搜索</span>
                </template>
              </van-search>
            </div>
          </div>
          <!-- 搜索结果列表 -->
          <div class="fault-list">
            <div
              v-for="item in faultModuleList"
              :key="item.cccId"
              class="fault-item"
              @click="onAddFaultModuleItem(item)"
            >
              <van-highlight
                :keywords="faultSearchValue"
                :source-string="item.vrtName + '-' + item.vfgName + '-' + item.cccName"
              />
            </div>
            <!-- 无结果 -->
            <div v-if="faultModuleList.length === 0 && faultSearchValue" class="no-result">
              <img src="@/assets/image/noCCC.png" alt="" />
            </div>
          </div>
        </div>
      </template>
    </ais-popup>

    <!-- 是否存在故障确认弹框 -->
    <van-action-sheet
      v-model:show="showFaultConfirm"
      :show-cancel="true"
      cancel-text="取消"
      @cancel="onCancelFaultConfirm"
      @close="onCancelFaultConfirm"
    >
      <div class="fault-confirm-content">
        <div class="confirm-text">
          若本次进店无故障，会清空"故障模块、客户故障描述"。确定更改吗？
        </div>
        <div class="confirm-actions">
          <div class="action-btn confirm" @click="onConfirmFaultChange">确定</div>
        </div>
      </div>
    </van-action-sheet>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import AisPopup from '@/libs/components/AisPopup.vue'
import { fetchFaultModuleList as _fetchFaultModuleList } from '@/utils/receptionCommon'
import { saveSpFaultModule, deleteSpFaultModule } from '@/api/reception'
import { updateFaultAlertRecord } from '@/api/repairWork'
import { ConfirmFaultEnum } from '../constant'

const props = defineProps({
  /** 'create' | 'edit'，edit 模式下增删故障模块走接口 */
  mode: { type: String, default: 'edit' },
  /** 施工单ID：edit 模式接口入参；create 模式用于判断是否已保存以决定是否弹确认框 */
  serviceProxyId: { type: [String, Number], default: '' },
  /** 是否只读（已生成结算单/已交车/已作废） */
  readonly: { type: Boolean, default: false },
  /** 故障确认结果：用于禁用客户故障描述输入框 */
  confirmFault: { type: [String, Number], default: '' },
  /** 数据加载中：抑制 onChange 弹窗（用于初始数据回显场景） */
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['change'])

// v-model 三件套
const currentFault = defineModel('currentFault', { type: [String, Number], default: '1' })
const customerFaultDesc = defineModel('customerFaultDesc', { type: String, default: '' })
const faultModules = defineModel('faultModules', {
  type: Array,
  default: () => []
})

// 故障模块弹框状态
const addFaultModuleShow = ref(false)
const faultSearchValue = ref('')
const faultModuleList = ref([])

// 故障确认弹框
const showFaultConfirm = ref(false)
// 弹框打开时的状态快照（取消 / 点击空白处关闭时还原）
const faultConfirmSnapshot = ref({ currentFault: '1', customerFaultDesc: '', faultModules: [] })
// 标记弹框是否由"确定"触发关闭：避免 @close 在确定后误执行还原逻辑
let confirmedFaultClose = false
// 程序化写入 currentFault 会被 van-radio-group 的 watch 转成 @change，
// 进而触发 onHasFaultChange 的副作用（清空描述 / 重开弹窗 / 重新清空）。
// 该标志在程序化变更期间临时抑制其副作用，nextTick 后自动恢复。
let suppressFaultChange = false
const withFaultChangeSuppressed = (fn) => {
  suppressFaultChange = true
  fn()
  // radio-group 的 watch（flush:'pre'）在本轮 flush 内触发，nextTick 之后才复位
  nextTick(() => {
    suppressFaultChange = false
  })
}

// 故障模块展开状态
const showAllModules = ref(false)
const displayModules = computed(() =>
  showAllModules.value ? faultModules.value : faultModules.value.slice(0, 3)
)

// 添加故障模块时的请求锁（仅 edit 模式生效）
const addingFaultModule = ref(false)

// 清空故障时的请求锁
const clearingFault = ref(false)

// 客户故障描述禁用条件：选择"否" 或 已确认存在/不存在故障
const customerFaultDescDisabled = computed(() => {
  const cf = String(currentFault.value)
  const confirmed = Number(props.confirmFault) === ConfirmFaultEnum.ACCURATE
  return cf === '0' || confirmed
})

// ========== 是否存在故障 切换处理 ==========
const onHasFaultChange = (value) => {
  // 数据加载中 / 程序化还原写入导致的 change，忽略其副作用
  if (props.loading || suppressFaultChange) return
  if (Number(value) === 0) {
    // create 模式：只有已保存（serviceProxyId 存在）且有故障数据时才弹确认
    // edit 模式：只要存在故障数据就弹确认
    // const hasData = faultModules.value.length > 0 || customerFaultDesc.value
    // const needConfirm = props.mode === 'create' ? !!props.serviceProxyId && hasData : hasData
    const needConfirm = props.mode !== 'create'
    if (needConfirm) {
      // 弹窗仅在"是→否"时出现，故 currentFault 原值必为 '1'；其余字段拍快照供取消时还原
      faultConfirmSnapshot.value = {
        currentFault: '1',
        customerFaultDesc: customerFaultDesc.value,
        faultModules: [...faultModules.value]
      }
      showFaultConfirm.value = true
    } else {
      currentFault.value = '0'
      if (Number(props.confirmFault) !== ConfirmFaultEnum.ACCURATE) {
        customerFaultDesc.value = '本次进店车辆无故障'
      }
      faultModules.value = []
    }
  } else if (Number(value) === 1) {
    if (Number(props.confirmFault) !== ConfirmFaultEnum.ACCURATE) {
      customerFaultDesc.value = ''
    }
  }
}

const onCancelFaultConfirm = () => {
  // 关闭来自"确定"：仅复位标志，还原逻辑由 onConfirmFaultChange 按接口结果处理
  if (confirmedFaultClose) {
    confirmedFaultClose = false
    return
  }
  showFaultConfirm.value = false
  // 还原弹框打开前的状态：单选 / 客户故障描述 / 故障模块
  // 程序化写 currentFault 会触发 radio-group 的 @change，需抑制以免再次清空描述
  withFaultChangeSuppressed(() => {
    currentFault.value = faultConfirmSnapshot.value.currentFault
    customerFaultDesc.value = faultConfirmSnapshot.value.customerFaultDesc
    faultModules.value = faultConfirmSnapshot.value.faultModules
  })
}

const onConfirmFaultChange = async() => {
  // 标记本次关闭来自"确定"，防止随后的 @close 误触发还原
  confirmedFaultClose = true
  // 捕获还原快照（API 失败时回滚）
  const prevCustomerFaultDesc = customerFaultDesc.value
  const prevFaultModules = [...faultModules.value]

  // 关闭弹框（会触发 @close，已被 confirmedFaultClose 标记拦截）
  showFaultConfirm.value = false

  // 未保存（无 serviceProxyId）：仅本地清空
  if (!props.serviceProxyId) {
    emit('change')
    return
  }

  if (clearingFault.value) return
  clearingFault.value = true

  // confirmFault===1（已确认为"准确"）保留原客户描述，否则用默认文案
  // 原描述为空/纯空格（含回显脏数据）时回落默认文案，避免提交并回写空值
  const newCustomerContent = Number(props.confirmFault) === ConfirmFaultEnum.ACCURATE && (prevCustomerFaultDesc || '').trim()
    ? prevCustomerFaultDesc
    : '本次进店车辆无故障'

  try {
    const res = await updateFaultAlertRecord({
      id: props.serviceProxyId,
      currentFault: 0,
      customerContent: newCustomerContent
    })
    if (res.code === 200) {
      // 程序化写 currentFault='0' 会触发 @change 重开确认弹窗，需抑制
      withFaultChangeSuppressed(() => {
        faultModules.value = []
        customerFaultDesc.value = newCustomerContent
        currentFault.value = '0'
      })
      showToast('保存成功')
    } else {
      rollbackFaultState(prevCustomerFaultDesc, prevFaultModules)
      showToast(res.message || res.msg || '操作失败')
    }
  } catch (err) {
    rollbackFaultState(prevCustomerFaultDesc, prevFaultModules)
    showToast(err?.msg || err?.message || '操作失败')
  } finally {
    clearingFault.value = false
  }
}

// 回滚本地状态：还原描述/模块/单选项（程序化写 currentFault 会触发 @change，需抑制）
const rollbackFaultState = (prevDesc, prevModules) => {
  withFaultChangeSuppressed(() => {
    customerFaultDesc.value = prevDesc
    faultModules.value = prevModules
    currentFault.value = '1'
  })
}

// ========== 故障模块弹框 ==========
const onAddFaultModule = () => {
  faultSearchValue.value = ''
  faultModuleList.value = []
  addFaultModuleShow.value = true
}

const onCloseFaultModulePopup = () => {
  addFaultModuleShow.value = false
  faultSearchValue.value = ''
}

const onFaultSearch = async(value) => {
  faultSearchValue.value = value
  await _fetchFaultModuleList(faultSearchValue.value, faultModuleList)
}

const onFaultSearchClear = () => {
  faultSearchValue.value = ''
}

// 添加故障模块项
const onAddFaultModuleItem = (item) => {
  if (addingFaultModule.value) return
  // 检查是否已存在
  const exists = faultModules.value.some((m) => m.cccId === item.cccId)
  if (exists) {
    showToast('该故障模块已添加')
    return
  }

  if (props.mode === 'edit') {
    delete item.id
    addingFaultModule.value = true
    saveSpFaultModule({ ...item, serviceProxyId: props.serviceProxyId })
      .then((res) => {
        if (res.code === 200) {
          faultModules.value.push({
            ...item,
            id: res.data?.id || item.id,
            cccCode: item.cccCode,
            cccName: item.cccName,
            vfgName: item.vfgName,
            faultDesc: item.faultDescription || item.faultDesc
          })
          showToast(res.data || '保存成功')
          addFaultModuleShow.value = false
          faultSearchValue.value = ''
        } else {
          showToast(res.msg || '添加失败')
        }
      })
      .catch((err) => {
        showToast(err?.msg || '添加失败')
      })
      .finally(() => {
        addingFaultModule.value = false
      })
  } else {
    // create 模式：仅本地添加
    faultModules.value.push(item)
    showToast('添加成功')
    addFaultModuleShow.value = false
    faultSearchValue.value = ''
  }
}

// 删除故障模块
const onDeleteFaultModule = async(module) => {
  try {
    await showConfirmDialog({
      title: '提示',
      message: '是否要删除此接车施工单-故障模块？您无法撤销此操作。'
    })
  } catch {
    return
  }

  if (props.mode === 'edit') {
    deleteSpFaultModule([module.id]).then((res) => {
      if (res.code === 200) {
        const index = faultModules.value.findIndex((m) => m.id === module.id)
        if (index > -1) faultModules.value.splice(index, 1)
        showToast('删除成功')
        if (faultModules.value.length === 0) {
          showConfirmDialog({
            title: '提示',
            message: '全部故障模块已删除，请重新确认【本次进店是否存在故障】？'
          })
        }
      } else {
        showToast(res.msg || '删除失败')
      }
    })
  } else {
    // create 模式：仅本地删除（按 cccCode 匹配）
    const index = faultModules.value.findIndex((m) => m.cccCode === module.cccCode)
    if (index > -1) faultModules.value.splice(index, 1)
    showToast('删除成功')
  }
}

const onViewAllModules = () => {
  showAllModules.value = !showAllModules.value
}
</script>

<style lang="scss">
.fault-info {
  padding: 0 12px 12px 12px;
  background: #ffffff;

  .section-card {
    .fault-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;

      .title {
        font-size: 14px;
        color: #191a1b;
        font-weight: 500;
      }

      .fault-status-text {
        font-size: 14px;
        color: #545454;
      }

      .radio-group {
        display: flex;
        gap: 16px;

        .radio-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 14px;
          color: #191a1b;

          .van-icon {
            color: #009100;
            font-size: 16px;
          }

          .radio-circle {
            width: 16px;
            height: 16px;
            border: 1px solid #dce0e4;
            border-radius: 50%;
          }

          &.active {
            .van-icon {
              color: #009100;
            }
          }
        }
      }
    }

    .fault-modules {
      .add-module {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        padding: 12px;
        background: #e6f4e6;
        border-radius: 8px;
        color: #009100;
        font-size: 14px;
        margin-bottom: 12px;
      }

      // 模块列表容器
      .modules-container {
        max-height: 300px;
        overflow-y: auto;
        transition: max-height 0.3s ease;

        &.expanded {
          max-height: 300px;
        }
      }

      .fault-module-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 8px;
        border-radius: 6px;
        background: #f8f7f7;
        margin-bottom: 12px;

        .module-name {
          font-size: 14px;
          color: #191a1b;
        }

        .van-icon {
          color: #545454;
          font-size: 18px;
        }
        &.last-child {
          margin-bottom: 0;
        }
      }

      .view-all {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        padding: 0 12px;
        color: #009100;
        font-size: 12px;
        cursor: pointer;
      }
    }

    .fault-desc-text {
      font-size: 14px;
      color: #545454;
      padding: 12px;
      background: #f5f5f5;
      border-radius: 6px;
      min-height: 60px;
    }
  }
}

// 故障模块弹框样式
.fault-module-content {
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

  .no-result {
    text-align: center;
    padding: 60px 0;

    img {
      max-width: 200px;
    }
  }
}

.fault-list {
  height: 60vh;
  overflow-y: auto;

  .fault-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 7px 12px;
    border-radius: 6px;
    margin-bottom: 8px;
    font-size: 13px;
    &:last-child {
      margin-bottom: 0;
    }

    &:active {
      background: #f7f7f7;
    }
  }
}

// 故障确认弹框样式
.fault-confirm-content {
  padding: 24px 24px 10px 24px;

  .confirm-text {
    font-size: 14px;
    color: #888888;
    text-align: center;
    line-height: 20px;
    margin-bottom: 24px;
  }

  .confirm-actions {
    display: flex;
    gap: 12px;

    .action-btn {
      flex: 1;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      border-radius: 8px;
      border-top: 1px solid #eeeeee;
      &.confirm {
        color: #191a1b;
      }
    }
  }
}
</style>
