<template>
  <van-popup
    v-model:show="visible"
    position="bottom"
    :style="{ height: '80%' }"
    round
    teleport="body"
    @close="handleClose"
  >
    <div class="dispatch-work-popup">
      <!-- 标题栏 -->
      <div class="popup-header">
        <div class="close-btn" @click="handleClose">
          <van-icon name="cross" />
        </div>
        <div class="header-title">派工</div>
        <div class="header-right"></div>
      </div>

      <!-- 内容区域 -->
      <div class="popup-content">
        <!-- 工位选择 -->
        <div class="selection-section">
          <div class="section-title">工位</div>
          <div class="tags-container">
            <template v-if="stations.length > 0">
              <div
                v-for="station in stations"
                :key="station.id"
                class="tag-item"
                :class="{ active: selectedStation?.id === station.id }"
                @click="selectStation(station)"
              >
                {{ station.name }}
              </div>
            </template>
            <div v-else class="empty-tip">暂无工位数据</div>
          </div>
        </div>

        <!-- 班组选择 -->
        <div class="selection-section">
          <div class="section-title">班组</div>
          <div class="tags-container">
            <template v-if="teams.length > 0">
              <div
                v-for="team in teams"
                :key="team.id"
                class="tag-item"
                :class="{ active: selectedTeam?.id === team.id }"
                @click="selectTeam(team)"
              >
                {{ team.name }}
              </div>
            </template>
            <div v-else class="empty-tip">暂无班组数据</div>
          </div>
        </div>

        <!-- 技师选择 -->
        <div class="selection-section">
          <div class="section-title">技师</div>
          <div class="tags-container">
            <template v-if="technicians.length > 0">
              <div
                v-for="technician in technicians"
                :key="technician.userId"
                class="tag-item"
                :class="{ active: selectedTechnician?.userId === technician.userId }"
                @click="selectTechnician(technician)"
              >
                {{ technician.userName }}
              </div>
            </template>
            <div v-else class="empty-tip">暂无技师数据</div>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="popup-footer">
        <van-button
          type="primary"
          color="var(--leap-color-primary)"
          round
          block
          :disabled="!canSubmit || submitting"
          @click="handleSubmit"
        >
          确定派工
        </van-button>
      </div>
    </div>
  </van-popup>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { showToast } from 'vant'
import {
  dispatchWorkers,
  getDealerStation,
  getDealerWorkTeam,
  getDealerTeamUserRelation
} from '../../../api/repairWork'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  workOrder: {
    type: Object,
    default: () => ({})
  },
  selectedItemIds: {
    type: Array,
    default: () => []
  },
  singleItem: {
    type: Object,
    default: () => null
  },
  serviceProxyId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'submit', 'close'])

const visible = ref(props.modelValue)

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  (newVal) => {
    visible.value = newVal
    if (newVal) {
      loadOptions()
    }
  }
)

// 监听 visible 变化
watch(visible, (newVal) => {
  if (!newVal) {
    emit('update:modelValue', false)
    emit('close')
  }
})

// 工位列表
const stations = ref([])
// 班组列表
const teams = ref([])
// 技师列表
const technicians = ref([])

// 选中的项
const selectedStation = ref(null)
const selectedTeam = ref(null)
const selectedTechnician = ref(null)

// 提交中标志（防重复提交）
const submitting = ref(false)

// 加载工位和班组
const loadOptions = async() => {
  try {
    const [stationRes, teamRes] = await Promise.all([
      getDealerStation(),
      getDealerWorkTeam()
    ])
    if (stationRes.code === 200) {
      stations.value = stationRes?.data || []
    } else {
      stations.value = []
      showToast(stationRes.message)
    }
    if (teamRes.code === 200) {
      teams.value = teamRes?.data || []
    } else {
      teams.value = []
      showToast(teamRes.message)
    }
    // 默认选中第一项
    if (stations.value.length > 0) {
      selectedStation.value = stations.value[0]
    }
    if (teams.value.length > 0) {
      selectedTeam.value = teams.value[0]
    }
  } catch {
    showToast('获取选项失败')
  }
}

// 加载技师（根据班组联动）
const loadTechnicians = async(teamId) => {
  if (!teamId) {
    technicians.value = []
    selectedTechnician.value = null
    return
  }
  try {
    const res = await getDealerTeamUserRelation({ teamId: teamId })
    if (res.code === 200) {
      technicians.value = res?.data || []
      // 默认选中第一项
      if (technicians.value.length > 0) {
        selectedTechnician.value = technicians.value[0]
      } else {
        selectedTechnician.value = null
      }
    } else {
      technicians.value = []
      selectedTechnician.value = null
      showToast(res.message)
    }
  } catch {
    technicians.value = []
    selectedTechnician.value = null
  }
}

// 监听班组变化，联动技师
watch(selectedTeam, (newTeam) => {
  if (newTeam) {
    loadTechnicians(newTeam.id || newTeam.dealerWorkTeamId)
  } else {
    technicians.value = []
    selectedTechnician.value = null
  }
})

// 是否可以提交：工位必选，班组和技师任选其一
const canSubmit = computed(() => {
  return selectedStation.value && (selectedTeam.value || selectedTechnician.value)
})

// 选择工位
const selectStation = (station) => {
  selectedStation.value = station
}

// 选择班组
const selectTeam = (team) => {
  selectedTeam.value = team
}

// 选择技师
const selectTechnician = (technician) => {
  if (selectedTechnician.value?.userId === technician.userId) {
    selectedTechnician.value = null
  } else {
    selectedTechnician.value = technician
  }
}

// 关闭弹窗
const handleClose = () => {
  visible.value = false
  resetSelection()
}

// 重置选择
const resetSelection = () => {
  selectedStation.value = null
  selectedTeam.value = null
  selectedTechnician.value = null
  stations.value = []
  teams.value = []
  technicians.value = []
}

// 构建派工基础数据
const buildDispatchBase = () => {
  const dealerStationName = stations.value.find(item => item.id === selectedStation.value?.id)
  const dealerWorkTeamName = teams.value.find(item => item.id === selectedTeam.value?.id)
  const repairTechnicianName = technicians.value.find(item => item.userId === selectedTechnician.value?.userId)
  return {
    serviceProxyId: props.serviceProxyId || props.workOrder?.id,
    dealerStationId: selectedStation.value?.id,
    dealerStationName: dealerStationName?.name,
    dealerWorkTeamId: selectedTeam.value?.id,
    dealerWorkTeamName: dealerWorkTeamName?.name,
    repairTechnicianId: selectedTechnician.value?.userId,
    repairTechnicianName: repairTechnicianName?.userName
  }
}

// 提交派工
const handleSubmit = async() => {
  if (!canSubmit.value) return
  if (submitting.value) return
  submitting.value = true

  try {
    let dispatchItems = []

    if (props.selectedItemIds.length > 0) {
      // 批量模式
      dispatchItems = props.selectedItemIds.map(item => ({
        ...item,
        ...buildDispatchBase()
      }))
    } else if (props.singleItem) {
      // 单个模式
      dispatchItems = [{
        ...props.singleItem,
        ...buildDispatchBase()
      }]
    }

    if (dispatchItems.length === 0) return

    const res = await dispatchWorkers(dispatchItems)
    if (res.code === 200) {
      showToast('派工成功')
      emit('submit')
      handleClose()
    } else {
      showToast(res.message)
    }
  } catch (error) {
    showToast(error?.msg || '派工失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.dispatch-work-popup {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f4f4f4;

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
      font-size: 14px;
      font-family: 'PingFang SC', sans-serif;
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
    overflow-y: auto;
    padding: 12px;

    .selection-section {
      background-color: #fff;
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 12px;

      .section-title {
        font-size: 14px;
        font-family: 'PingFang SC', sans-serif;
        font-weight: 500;
        color: var(--leap-color-default);
        line-height: 20px;
        margin-bottom: 12px;
      }

      .tags-container {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        .empty-tip {
          width: 100%;
          text-align: center;
          padding: 16px 0;
          font-size: 14px;
          font-family: 'PingFang SC', sans-serif;
          color: var(--leap-color-default-light-2);
        }

        .tag-item {
          min-width: 30%;
          height: 32px;
          line-height: 32px;
          text-align: center;
          padding: 0 16px;
          background-color: var(--leap-color-default-light-5);
          border-radius: 4px;
          font-size: 14px;
          font-family: 'PingFang SC', sans-serif;
          font-weight: 400;
          color: var(--leap-color-default);
          cursor: pointer;
          transition: all 0.3s;
          border: 1px solid transparent;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          &.active {
            background-color: transparent;
            border-color: var(--leap-color-primary);
            color: var(--leap-color-primary);
          }
        }
      }
    }
  }

  // 底部按钮
  .popup-footer {
    height: 88px;
    background-color: #fff;
    border-top: 1px solid var(--leap-color-default-light-4);
    display: flex;
    justify-content: center;
    padding: 7px 12px 0;
    flex-shrink: 0;

    .van-button {
      height: 40px;
      font-size: 14px;
      font-family: 'PingFang SC', sans-serif;
      font-weight: 400;
    }
  }
}
</style>
