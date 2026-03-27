<template>
  <van-popup
    v-model:show="visible"
    position="bottom"
    :style="{ height: '80%' }"
    round
    @close="handleClose"
  >
    <div class="dispatch-work-popup">
      <!-- 标题栏 -->
      <div class="popup-header">
        <van-icon name="cross" @click="handleClose" />
        <div class="header-title">派工</div>
      </div>

      <!-- 内容区域 -->
      <div class="popup-content">
        <!-- 工位选择 -->
        <div class="selection-section">
          <div class="section-title">工位</div>
          <div class="tags-container">
            <div
              v-for="station in stations"
              :key="station.id"
              class="tag-item"
              :class="{ active: selectedStation?.id === station.id }"
              @click="selectStation(station)"
            >
              {{ station.name }}
            </div>
          </div>
        </div>

        <!-- 班组选择 -->
        <div class="selection-section">
          <div class="section-title">班组</div>
          <div class="tags-container">
            <div
              v-for="team in teams"
              :key="team.id"
              class="tag-item"
              :class="{ active: selectedTeam?.id === team.id }"
              @click="selectTeam(team)"
            >
              {{ team.name }}
            </div>
          </div>
        </div>

        <!-- 技师选择 -->
        <div class="selection-section">
          <div class="section-title">技师</div>
          <div class="tags-container">
            <div
              v-for="technician in technicians"
              :key="technician.id"
              class="tag-item"
              :class="{ active: selectedTechnician?.id === technician.id }"
              @click="selectTechnician(technician)"
            >
              {{ technician.name }}
            </div>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="popup-footer">
        <van-button
          type="primary"
          color="#009100"
          round
          block
          :disabled="!canSubmit"
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

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'submit', 'close'])

const visible = ref(props.modelValue)

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  (newVal) => {
    visible.value = newVal
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
const stations = ref([
  { id: 1, name: 'PDI工位' },
  { id: 2, name: '钣金工位' },
  { id: 3, name: '打磨工位' },
  { id: 4, name: '大保养工位' },
  { id: 5, name: '四轮定位工位' },
  { id: 6, name: '待修工位' },
  { id: 7, name: '轮胎工位' },
  { id: 8, name: '喷漆工位' },
  { id: 9, name: '高压工位' }
])

// 班组列表
const teams = ref([
  { id: 1, name: '钣金001' },
  { id: 2, name: '钣金002' },
  { id: 3, name: '钣金003' },
  { id: 4, name: '钣金004' },
  { id: 5, name: '钣金004李伟光' },
  { id: 6, name: '钣金005' },
  { id: 7, name: '钣金005荣誉维修之星团队李大齐' }
])

// 技师列表
const technicians = ref([
  { id: 1, name: '云佩玉' },
  { id: 2, name: '汤杨' },
  { id: 3, name: '昌瑞堂' },
  { id: 4, name: '何欣欣' },
  { id: 5, name: '时翔' },
  { id: 6, name: '邬浩晨' }
])

// 选中的项
const selectedStation = ref(null)
const selectedTeam = ref(null)
const selectedTechnician = ref(null)

// 是否可以提交
const canSubmit = computed(() => {
  return selectedStation.value && selectedTeam.value && selectedTechnician.value
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
  selectedTechnician.value = technician
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
}

// 提交
const handleSubmit = () => {
  if (!canSubmit.value) return

  emit('submit', {
    station: selectedStation.value,
    team: selectedTeam.value,
    technician: selectedTechnician.value
  })

  handleClose()
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
    justify-content: center;
    height: 58px;
    background-color: #f4f4f4;
    position: relative;
    flex-shrink: 0;

    .van-icon {
      position: absolute;
      left: 16px;
      font-size: 20px;
      color: #888;
      cursor: pointer;
    }

    .header-title {
      font-size: 14px;
      font-family: 'PingFang SC', sans-serif;
      font-weight: 500;
      color: #191a1b;
      line-height: 20px;
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
        color: #191a1b;
        line-height: 20px;
        margin-bottom: 12px;
      }

      .tags-container {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;

        .tag-item {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 101px;
          height: 32px;
          padding: 0 16px;
          background-color: #f8f7f7;
          border-radius: 4px;
          font-size: 14px;
          font-family: 'PingFang SC', sans-serif;
          font-weight: 400;
          color: #191a1b;
          line-height: 20px;
          cursor: pointer;
          transition: all 0.3s;
          border: 1px solid transparent;

          &.active {
            background-color: transparent;
            border-color: #009100;
            color: #009100;
          }
        }
      }
    }
  }

  // 底部按钮
  .popup-footer {
    height: 88px;
    background-color: #fff;
    border-top: 1px solid #e6e6e5;
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
