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
import { ref, computed } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import AisPopup from '@/libs/components/AisPopup.vue'
import { fetchFaultModuleList as _fetchFaultModuleList } from '@/utils/receptionCommon'
import { saveSpFaultModule, deleteSpFaultModule } from '@/api/reception'

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
// 程序化设置 currentFault 标志（防止取消还原触发重复弹窗）
const isSettingFaultProgrammatically = ref(false)

// 故障模块展开状态
const showAllModules = ref(false)
const displayModules = computed(() =>
  showAllModules.value ? faultModules.value : faultModules.value.slice(0, 3)
)

// 添加故障模块时的请求锁（仅 edit 模式生效）
const addingFaultModule = ref(false)

// 客户故障描述禁用条件：选择"否" 或 已确认存在/不存在故障
const customerFaultDescDisabled = computed(() => {
  const cf = String(currentFault.value)
  const confirmed = Number(props.confirmFault) === 1
  return cf === '0' || confirmed
})

// ========== 是否存在故障 切换处理 ==========
const onHasFaultChange = (value) => {
  // 数据加载中或程序化赋值导致的改变，不弹窗
  if (props.loading || isSettingFaultProgrammatically.value) {
    isSettingFaultProgrammatically.value = false
    return
  }
  if (Number(value) === 0) {
    // create 模式：只有已保存（serviceProxyId 存在）且有故障数据时才弹确认
    // edit 模式：只要存在故障数据就弹确认
    const hasData = faultModules.value.length > 0 || customerFaultDesc.value
    const needConfirm = props.mode === 'create' ? !!props.serviceProxyId && hasData : hasData
    if (needConfirm) {
      showFaultConfirm.value = true
    } else {
      currentFault.value = '0'
      if (Number(props.confirmFault) !== 1) {
        customerFaultDesc.value = '本次进店车辆无故障'
      }
      faultModules.value = []
    }
  } else if (Number(value) === 1) {
    if (Number(props.confirmFault) !== 1) {
      customerFaultDesc.value = ''
    }
  }
}

const onCancelFaultConfirm = () => {
  showFaultConfirm.value = false
  currentFault.value = '1'
  isSettingFaultProgrammatically.value = true
}

const onConfirmFaultChange = () => {
  showFaultConfirm.value = false
  faultModules.value = []
  if (Number(props.confirmFault) !== 1) {
    customerFaultDesc.value = '本次进店车辆无故障'
  }
  currentFault.value = '0'
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
          showToast(res.data || '添加成功')
          addFaultModuleShow.value = false
          faultSearchValue.value = ''
          emit('change')
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
        emit('change')
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

// 暴露给父级：编程式设置 currentFault 同时抑制本次 @change 弹窗
function setCurrentFaultSilent(value) {
  isSettingFaultProgrammatically.value = true
  currentFault.value = value
}

defineExpose({ setCurrentFaultSilent })
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
