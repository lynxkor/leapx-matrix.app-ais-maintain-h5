<template>
  <div class="work-order-create">
    <!-- 车辆信息卡片 -->
    <div class="vehicle-card">
      <div class="plate-row">
        <span class="plate-no">{{ detail.plateNo }}</span>
        <span class="appointment-tag" style="opacity: 0">预约客户</span>
        <span
          v-if="detail.orderStatus === 100"
          class="edit-plate edit-plate-after"
          @click="onChangeCar"
        >
          <span style="position: relative; top: 2px;"><img src="@/assets/image/change-car.svg" alt="" /></span>
          <span>换车</span>
        </span>
        <span
          v-if="detail.orderStatus != 180 && detail.orderStatus != 210"
          class="edit-plate"
          @click="onEditPlate"
        >
          <span style="position: relative; top: 1px;"><img src="@/assets/image/edit.svg" alt="" /></span>
          <span>修改车牌</span>
        </span>
      </div>
      <div class="vehicle-model">{{ detail.vehicleModel }} · {{ detail.vin }}</div>
      <div class="info-row">
        <span class="label">保修日期：</span>
        <span class="value"
          >{{ detail.vehicleProfileServiceResp.warrantyStartdate }} 至
          {{ detail.vehicleProfileServiceResp.warrantyEnddate }}</span
        >
      </div>
      <div class="info-row">
        <span class="label">车主：</span>
        <span class="value">{{ detail.owner }} {{ detail.ownerPhone }}</span>
      </div>
      <div class="info-row">
        <span class="label">绑车人：</span>
        <span class="value">{{ detail.bindingUser }} {{ detail.binderPhone }}</span>
      </div>
      <!-- 送修人折叠面板 -->
      <van-collapse v-model="repairPersonCollapse" class="collapse-panel">
        <van-collapse-item name="repairPerson">
          <template #title>
            <div class="select-row">
              <span class="label">送修人</span>
              <div class="value-wrapper">
                <span class="tag">[{{ detail.repairPersonTag }}]</span>
                <span class="value">{{ detail.repairPerson }} {{ detail.repairPersonPhone }}</span>
              </div>
            </div>
          </template>
          <div class="collapse-content">
            <!-- 类型选择 -->
            <div class="type-selector">
              <div
                :class="['type-item', { active: repairPersonType === 'other' }]"
                @click="onSelectRepairPersonType('other')"
              >
                送修人
              </div>
              <div
                :class="['type-item', { active: repairPersonType === 'owner' }]"
                @click="onSelectRepairPersonType('owner')"
              >
                车主
              </div>
              <div
                :class="['type-item', { active: repairPersonType === 'bindingUser' }]"
                @click="onSelectRepairPersonType('bindingUser')"
              >
                绑车人
              </div>
            </div>
            <!-- 送修人信息 -->
            <div class="repair-person-info">
              <div class="info-row">
                <span class="label">{{ repairPersonInputLabel }}姓名</span>
                <div class="value-wrapper">
                  <input
                    v-model="repairPersonNameInput"
                    type="text"
                    :placeholder="repairPersonInputDisabled ? '' : '请输入姓名'"
                    class="edit-input"
                    :disabled="repairPersonInputDisabled"
                    data-scroll-target="repairPersonName"
                    @input="onRepairPersonNameChange"
                  />
                  <img
                    v-if="!repairPersonInputDisabled"
                    src="@/assets/images/icon_edit.svg"
                    class="edit-icon"
                  />
                </div>
              </div>
              <div class="info-row">
                <span class="label">{{ repairPersonInputLabel }}手机</span>
                <div class="value-wrapper">
                  <input
                    v-model="repairPersonPhoneInput"
                    type="tel"
                    :placeholder="repairPersonInputDisabled ? '' : '请输入手机号'"
                    class="edit-input"
                    :disabled="repairPersonInputDisabled"
                    maxlength="11"
                    data-scroll-target="repairPersonPhone"
                    @input="onRepairPersonPhoneChange"
                  />
                  <img
                    v-if="!repairPersonInputDisabled"
                    src="@/assets/images/icon_edit.svg"
                    class="edit-icon"
                  />
                </div>
              </div>
            </div>
          </div>
        </van-collapse-item>
      </van-collapse>

      <!-- 业务类型 -->
      <div class="select-row">
        <span class="label">业务类型</span>
        <span class="value">{{
          businessTypeList.find((i) => i.value === computedBusinessType)?.label
        }}</span>
      </div>
    </div>

    <!-- Tab导航 -->
    <van-tabs v-model:active="activeTab" sticky offset-top="42px" @scroll="onTabScroll">
      <van-tab title="环检信息" name="inspection">
        <div class="tab-content">
          <div class="inspection-info">
            <!-- 进店里程数 -->
            <div class="section-card borderB">
              <div class="section-title section-field">
                <div>进店里程数</div>
                <div class="editable-field">
                  <van-field
                    v-model="detail.mileage"
                    type="number"
                    placeholder="请输入"
                    :border="false"
                  >
                    <template #button>
                      <span class="unit">km</span>
                      <img src="@/assets/images/icon_edit.svg" class="edit-icon" />
                    </template>
                  </van-field>
                </div>
              </div>
              <div class="sub-info">车联网里程数(总)：{{ detail.networkMileageTotal }} km</div>
              <div v-if="detail.networkMileageAdd" class="sub-info">
                车联网里程数(增)：{{ detail.networkMileageAdd }} km
              </div>
            </div>

            <!-- 进店电量 -->
            <div class="section-card borderB">
              <div class="section-title section-field">
                <div>进店电量</div>
                <div class="editable-field">
                  <van-field
                    v-model="detail.battery"
                    type="number"
                    placeholder="请输入"
                    :border="false"
                    max="100"
                    min="0"
                  >
                    <template #button>
                      <span class="unit">%</span>
                      <img src="@/assets/images/icon_edit.svg" class="edit-icon" />
                    </template>
                  </van-field>
                </div>
              </div>
              <div class="sub-info">车联网电量: {{ detail.networkBattery }}%</div>
            </div>

            <!-- 车内照片 -->
            <div class="card-container marginB1" data-scroll-target="interiorPhotos">
              <div class="card-info-title marginB1">
                车内照片
                <span v-if="interiorConfig.required === '1'" style="color: #b91919; font-size: 15px"
                  >*</span
                >
              </div>
              <div class="upload-content">
                <div
                  class="upload-box"
                  v-for="(file, index) in detail.interiorImages"
                  :key="file.id || index"
                >
                  <img
                    style="width: 100%; height: 100%; margin-bottom: 0"
                    :src="getFilePreviewUrl(file)"
                    @click="showImg(getFilePreviewUrl(file))"
                  />
                  <img
                    class="delete_icon"
                    src="@/assets/image/delete_icon.png"
                    @click="handleInteriorDelete(file)"
                  />
                </div>
                <div
                  class="upload-box upload-placeholder"
                  v-if="detail.interiorImages.length < (interiorConfig.maxNum || 3)"
                  @click="uploadGeneric('interior')"
                >
                  <svg class="icon upload-img" aria-hidden="true">
                    <use xlink:href="#icon-lxp-h5upload-mob"></use>
                  </svg>
                </div>
              </div>
            </div>

            <!-- 车外照片 -->
            <div class="card-container marginB1" data-scroll-target="exteriorPhotos">
              <div class="card-info-title marginB1">
                车外照片
                <span v-if="exteriorConfig.required === '1'" style="color: #b91919; font-size: 15px"
                  >*</span
                >
              </div>
              <div class="upload-content">
                <div
                  class="upload-box"
                  v-for="(file, index) in detail.exteriorImages"
                  :key="file.id || index"
                >
                  <img
                    style="width: 100%; height: 100%; margin-bottom: 0"
                    :src="getFilePreviewUrl(file)"
                    @click="showImg(getFilePreviewUrl(file))"
                  />
                  <img
                    class="delete_icon"
                    src="@/assets/image/delete_icon.png"
                    @click="handleExteriorDelete(file)"
                  />
                </div>
                <div
                  class="upload-box upload-placeholder"
                  v-if="detail.exteriorImages.length < (exteriorConfig.maxNum || 3)"
                  @click="uploadGeneric('exterior')"
                >
                  <svg class="icon upload-img" aria-hidden="true">
                    <use xlink:href="#icon-lxp-h5upload-mob"></use>
                  </svg>
                </div>
              </div>
            </div>

            <!-- 异常描述 -->
            <div class="section-card">
              <div class="section-title" style="justify-content: flex-start">
                <span class="required">*</span>异常描述
              </div>
              <van-field
                v-model="detail.abnormalDesc"
                type="textarea"
                placeholder="请输入异常描述"
                rows="3"
                autosize
                show-word-limit
                maxlength="500"
                data-scroll-target="abnormalDesc"
                style="background: #f5f5f5; border-radius: 6px"
              />
            </div>
            <div class="section-card">
              <div class="section-title" style="justify-content: flex-start">客户诉求</div>
              <van-field
                v-model="detail.customerComment"
                type="textarea"
                placeholder="请输入客户诉求"
                rows="3"
                autosize
                show-word-limit
                maxlength="500"
                style="background: #f5f5f5; border-radius: 6px"
              />
            </div>
            <div class="section-card">
              <div class="section-title" style="justify-content: flex-start">
                <span class="required">*</span>客户经理建议
              </div>
              <van-field
                v-model="detail.testResult"
                type="textarea"
                placeholder="请输入客户经理建议"
                rows="3"
                autosize
                show-word-limit
                maxlength="500"
                data-scroll-target="testResult"
                style="background: #f5f5f5; border-radius: 6px"
              />
            </div>
          </div>
          <div class="fault-info">
            <!-- 是否存在故障 -->
            <div class="section-card">
              <div class="fault-header">
                <span class="title">本次是否因故障进店</span>
                <div class="radio-group">
                  <van-radio-group
                    v-model="detail.currentFault"
                    direction="horizontal"
                    @change="onHasFaultChange"
                  >
                    <van-radio name="1">是</van-radio>
                    <van-radio name="0">否</van-radio>
                  </van-radio-group>
                </div>
              </div>

              <!-- 故障模块列表 -->
              <div class="fault-modules" v-if="Number(detail.currentFault) === 1" data-scroll-target="faultModules">
                <div class="add-module" @click="onAddFaultModule">
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
                    <img src="@/assets/images/trash.svg"  @click="onDeleteFaultModule(module)"/>
                  </div>
                </div>

                <!-- 查看全部按钮 -->
                <div
                  v-if="detail.faultModules.length > 3"
                  class="view-all"
                  @click="onViewAllModules"
                >
                  <span>{{ showAllModules ? '收起' : '查看全部' }}</span>
                  <van-icon :name="showAllModules ? 'arrow-up' : 'arrow-down'" />
                </div>
              </div>
            </div>

            <!-- 客户故障描述 -->
            <div class="section-card">
              <div class="section-title" style="justify-content: flex-start">
                <span v-if="Number(detail.currentFault) === 1" class="required">*</span>客户故障描述
              </div>
              <van-field
                v-model="detail.customerFaultDesc"
                type="textarea"
                placeholder="请输入客户故障描述"
                rows="3"
                autosize
                show-word-limit
                maxlength="500"
                :disabled="detail.currentFault == 0 || Number(detail.confirmFault) === 1 || (detail.currentFault == 1 && detail.confirmFault == 1)"
                data-scroll-target="customerFaultDesc"
                style="background: #f5f5f5; border-radius: 6px"
              />
            </div>
          </div>
        </div>
      </van-tab>
    </van-tabs>

    <!-- 底部操作栏 -->
    <div class="bottom-bar">
      <span :class="['save-btn', { disabled: savingLoading }]" @click="onSave">保存</span>
    </div>
    <!-- 更换车牌 -->
    <!-- 更换车牌 -->
    <PlateKeyboard
      v-model:show="changePlateDialog"
      v-model="detail.plateNo"
      title="实名认证车辆"
      :subtitle="'原车牌：' + detail.plateNo"
      :exclude-vin="detail.vin"
    />
    <!-- 换车弹框 -->
    <ais-popup
      :show="changeCarDialog"
      position="bottom"
      title="更换车辆"
      @close="onChangeCarClose"
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
              <span class="change-car-btn" @click="onConfirmChangeCar">更换为该车辆</span>
            </div>
          </div>

          <!-- 无结果提示 -->
          <div
            v-if="
              !selectedCarInfo && carSearchValue && carSearchResults.length === 0 && hasSearched
            "
            class="no-result"
          >
            <img src="@/assets/image/noList.png" alt="" />
          </div>
        </div>
      </template>
    </ais-popup>
    <!-- 添加故障模块 -->
    <ais-popup
      :show="addFaultModuleShow"
      position="bottom"
      title="添加故障模块"
      @close="onCloseFaultModulePopup"
      :style="{ height: '80%', background: '#F4F4F4' }"
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
              :key="item.vrtCode"
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
          <!-- <div class="action-btn cancel" @click="onCancelFaultConfirm">取消</div> -->
          <div class="action-btn confirm" @click="onConfirmFaultChange">确定</div>
        </div>
      </div>
    </van-action-sheet>

    <!-- 图片上传选择 -->
    <van-action-sheet
      v-model:show="showImageUploadSheet"
      cancel-text="取消"
      close-on-click-action
      @select="onSelectImageSource"
    >
      <template #default>
        <div class="action-sheet-item" @click="onSelectImageSource('camera')">拍照</div>
        <div class="action-sheet-item" @click="onSelectImageSource('album')">从相册中选择</div>
      </template>
    </van-action-sheet>

    <!-- 图片上传隐藏文件输入 -->
    <input
      ref="imageUploadRef"
      type="file"
      accept="image/*"
      style="display: none"
      @change="handleImageFileChange"
    />

    <!-- 二次确认提示框 -->
    <van-dialog
      v-model:show="showConfirmDialog2"
      :show-confirm-button="false"
      :show-cancel-button="false"
      close-on-click-overlay
      class="confirm-dialog"
    >
      <div class="confirm-dialog-content">
        <div class="confirm-section">
          <div class="confirm-title">服务活动</div>
          <div class="confirm-message">
            该车辆有服务活动未完成，您可通过"添加维修项目"功能查看使用服务活动。
          </div>
        </div>
        <div class="confirm-section">
          <div class="confirm-title">车辆标识</div>
          <div class="confirm-message">
            该车辆为「车辆标识名称一」「车辆标识名称二」，请注意接待。
          </div>
        </div>
        <div class="confirm-btn" @click="onConfirmDialogClose">我知道了</div>
      </div>
    </van-dialog>

    <!-- 全屏Loading -->
    <van-overlay :show="savingLoading">
      <div class="loading-wrapper">
        <van-loading size="24px" vertical color="#009100">请稍候...</van-loading>
      </div>
    </van-overlay>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showConfirmDialog, showImagePreview, closeToast, showLoadingToast } from 'vant'
import { useGlobalStore } from '@/stores/global'
import { usePageSafeArea } from '@/utils/safeArea'
import AisPopup from '@/libs/components/AisPopup.vue'
import {
  uploadFileByUrl,
  getUploadConfig,
  getFileList
} from '@/libs/api/fileConfig'

// 附件配置
const uploadConfig = ref({})

// 根据附件类型获取配置——已从 receptionCommon 导入，此处为组件绑定
// getAttachConfig、getTargetFileList 在下方声明

// 车内检查
const interiorConfig = computed(() => getAttachConfig('车内照片'))

// 车外检查
const exteriorConfig = computed(() => getAttachConfig('车外照片'))

// 业务类型计算：优先使用已有值，否则根据是否预约判断
const computedBusinessType = computed(() => {
  if (route.query.appointId) {
    return 50
  }
  return detail.businessType || (detail.isAppointment ? 50 : 10)
})

// 图片上传相关
const currentUploadType = ref('') // 'interior' or 'exterior'
const currentUploadIndex = ref(0)
const imageUploadRef = ref(null) // 文件输入引用
const showImageUploadSheet = ref(false)

// 获取目标文件列表
// 上传配置获取（从共享模块导入，保留组件绑定）
const getTargetFileList = (type) => _getTargetFileList(type, detail, { attachments: attachmentsList.value })
const getAttachConfig = (attachType) => _getAttachConfig(attachType, uploadConfig)

// 文件预览/保存/类型已从 receptionCommon 导入
const normalizeAttachmentFile = (file) => {
  const rawUrl = file?.url || file?.fileUrl || ''
  return {
    ...file,
    url: rawUrl,
    fileUrl: rawUrl,
    authFileUrl: file?.authFileUrl || rawUrl,
    fileType: getFileType(file)
  }
}
import { batchUploadImageLimit } from '@/libs/utils/nativeFn'
import {
  getVehicleInfo,
  getVehicleMileage,
  serviceAddOrUpdate,
  getRecentlyServiceProxy,
  getReservationList
} from '@/api/reception'
import {
  getFilePreviewUrl,
  getFileType,
  formatPhotoList,
  hasDuplicateFileId,
  validateMileage,
  validateRepairPerson as _validateRepairPerson,
  scrollToErrorField,
  getAttachConfig as _getAttachConfig,
  getTargetFileList as _getTargetFileList,
  handleFileDelete as _handleFileDelete,
  fetchFaultModuleList as _fetchFaultModuleList,
  onSelectImageSource as _onSelectImageSource
} from '@/utils/receptionCommon'
import PlateKeyboard from '@/libs/components/PlateKeyboard.vue'
import './create.scss'

const route = useRoute()
const router = useRouter()
const globalStore = useGlobalStore()
usePageSafeArea({ bodyClass: 'ais-page-nav-safe-area' })
const addFaultModuleShow = ref(false)
const changeCarDialog = ref(false)
const changePlateDialog = ref(false)

// 施工单状态
const serviceProxyId = ref('') // 新建保存后返回的施工单id
// 程序化设置 currentFault 标志（防止 API 赋值触发 @change 弹窗）
const isSettingFaultProgrammatically = ref(false)

// 换车相关
const carSearchValue = ref('')
const carSearchResults = ref([])
const selectedCarInfo = ref(null)
const hasSearched = ref(false)

// 故障模块搜索相关
const faultSearchValue = ref('')

// 是否存在故障确认弹框
const showFaultConfirm = ref(false)

// 二次确认提示框
const showConfirmDialog2 = ref(false)

const onConfirmDialogClose = () => {
  showConfirmDialog2.value = false
}

// 送修人类型选择
const repairPersonType = ref('other') // owner/bindingUser/other
const repairPersonNameInput = ref('')
const repairPersonPhoneInput = ref('')

// 折叠面板状态
const repairPersonCollapse = ref(['repairPerson'])

// 更多操作列表 - 动态计算作废按钮状态
const faultModuleList = ref([])

// 获取故障模块列表
const fetchFaultModuleList = () => _fetchFaultModuleList(faultSearchValue.value, faultModuleList)

// 是否存在故障变更
const onHasFaultChange = (value) => {
  // 如果是程序化赋值导致的改变，不执行弹窗逻辑
  if (isSettingFaultProgrammatically.value) {
    isSettingFaultProgrammatically.value = false
    return
  }
  // 如果选择"否"，弹出确认框
  if (Number(value) === 0) {
    // 维修类型包含一般维修或三电维修时，不允许改为"否"
    // const typeCollect = detail.repairItemTypeDetailCollect || ''
    // if (typeCollect.includes('一般维修') || typeCollect.includes('三电维修')) {
    //   showToast({ message: '当前工单维修类型包含一般维修或三电维修，请确认是否存在故障!', duration: 3000 })
    //   detail.currentFault = '1'
    //   return
    // }
    // 如果已保存过且有故障数据，弹出确认框
    if (serviceProxyId.value && (detail.faultModules.length > 0 || detail.customerFaultDesc)) {
      showFaultConfirm.value = true
    } else {
      detail.currentFault = '0'
      if (Number(detail.confirmFault) !== 1) {
        detail.customerFaultDesc = '本次进店车辆无故障'
      }
      detail.faultModules = []
    }
  } else if (Number(value) === 1) {
    if (Number(detail.confirmFault) !== 1) {
      detail.customerFaultDesc = ''
    }
  }
}

// 取消故障确认
const onCancelFaultConfirm = () => {
  showFaultConfirm.value = false
  // 恢复为"是"
  detail.currentFault = '1'
  isSettingFaultProgrammatically.value = true
}

// 确认故障变更
const onConfirmFaultChange = () => {
  showFaultConfirm.value = false
  detail.faultModules = []
  if (Number(detail.confirmFault) !== 1) {
    detail.customerFaultDesc = '本次进店车辆无故障'
  }
  detail.currentFault = '0'
}

const onTabScroll = (e) => {
  if (e.isFixed) {
    // 触发吸顶时设置标题
    globalStore.setTitle(detail.plateNo)
  } else {
    globalStore.setTitle('新建施工单')
  }
}
// Tab状态
const activeTab = ref('inspection')
// 故障模块展开状态
const showAllModules = ref(false)
// 计算属性：控制显示的模块列表
const displayModules = computed(() => {
  if (showAllModules.value) {
    return detail.faultModules
  }
  return detail.faultModules.slice(0, 3)
})
// 业务类型列表
const businessTypeList = ref([
  { value: 10, label: '自然到店' },
  { value: 20, label: '取送车到店' },
  { value: 30, label: '上门服务' },
  { value: 40, label: '外出驻点服务' },
  { value: 50, label: '预约到店' }
])

// 详情数据
const detail = reactive({
  id: '', // 施工单ID
  vehicleProfileServiceResp: {}, // 车辆档案
  plateNo: '',
  isAppointment: false,
  vehicleModel: '',
  vehicleModelName: '',
  vin: '',
  vehicleModelId: '',
  warrantyDate: '',
  owner: '',
  ownerPhone: '',
  bindingUser: '',
  binderPhone: '',
  bindingUserId: '',
  repairPerson: '',
  repairPersonPhone: '',
  repairPersonTag: '车主',
  businessType: null, // 初始为null，后续根据isAppointment计算
  mileage: '',
  networkMileageTotal: '',
  networkMileageAdd: '',
  battery: '',
  networkBattery: '',
  interiorImages: [],
  exteriorImages: [],
  abnormalDesc: '',
  customerComment: '',
  currentFault: '1',
  faultAlertRecordRespList: [],
  faultModules: [],
  customerFaultDesc: '',
  testResult: '',
  // 新增字段
  code: '',
  dataSource: 180,
  orderStatus: '',
  warrantyTypeCollect: '',
  custType: '',
  custTypeLabel: '',
  salesDealerName: '',
  salesDealerCode: '',
  appointmentNo: '',
  lastMileage: null,
  remark: '',
  status: '',
  statusDesc: '',
  pickStatus: '',
  payType: '',
  warrantyCompany: '',
  signChannel: '',
  signUrl: '',
  signCompletedOn: '',
  signGeneratedOn: '',
  signStatus: '',
  signUrlExpiredOn: '',
  appointmentType: 0,
  preAuthType: '',
  isLockLive: '',
  isCreateWarranty: '',
  isOutboundOrder: '',
  isVehRetentionRemind: '',
  isCancelStorage: '',
  discountId: '',
  finalCheckAt: '',
  finalCheckerId: '',
  finalChecker: '',
  ticketStep: '',
  warrantyStatus: '',
  claimItemAmount: '',
  claimOtherAmount: '',
  claimPartsAmount: '',
  departureMileage: '',
  outPower: '',
  departureNetMileage: '',
  outNetPower: '',
  departureNetMileageElectricity: '',
  departureNetMileageExtend: '',
  electricalMileage: '',
  batteryModel: '',
  batterySerialNumber: '',
  enginenNumber: '',
  repairItemTypeDetailCollect: '',
  alarmLevel: '',
  isLive: '',
  inCustomerContent: '',
  invaildDesc: '',
  previewingFinishAt: '',
  confirmedOn: '',
  expectStartAt: '',
  startAt: '',
  finishAt: '',
  faultSolve: '',
  faultAlert: '',
  faultPeriod: '',
  earliestfaultServiceProxy: '',
  recentlyfaultServiceProxy: '',
  isCreateStatementInfo: 0,
  isPreAuth: '',
  isCreatePreAuth: '',
  preAuthRuleId: '',
  unresolvedReason: '',
  faultDesc: '',
  batteryUnitId: '',
  batteryUnitName: '',
  targetUnitCode: '',
  beforeChangeCode: '',
  afterChangeCode: '',
  isStoreLive: '',
  latelyServiceProxy: '',
  earlyServiceProxy: ''
})

// 初始环检数据快照
const initialInspectionData = ref(null)

// 检查环检数据是否有改动
const hasInspectionDataChanged = () => {
  if (!initialInspectionData.value) return false
  const initial = initialInspectionData.value
  const current = detail
  return (
    initial.mileage !== current.mileage ||
    initial.battery !== current.battery ||
    JSON.stringify(initial.interiorImages) !== JSON.stringify(current.interiorImages) ||
    JSON.stringify(initial.exteriorImages) !== JSON.stringify(current.exteriorImages) ||
    initial.abnormalDesc !== current.abnormalDesc ||
    initial.customerComment !== current.customerComment ||
    initial.currentFault !== current.currentFault ||
    initial.customerFaultDesc !== current.customerFaultDesc ||
    initial.businessType !== current.businessType ||
    initial.repairPerson !== current.repairPerson ||
    initial.repairPersonPhone !== current.repairPersonPhone ||
    JSON.stringify(initial.faultModules) !== JSON.stringify(current.faultModules) ||
    initial.plateNo !== current.plateNo ||
    initial.vin !== current.vin ||
    initial.vehicleModel !== current.vehicleModel ||
    initial.repairPersonTag !== current.repairPersonTag ||
    initial.testResult !== current.testResult
  )
}

const attachmentsList = ref([])

// 里程校验
// validateMileage 已从 receptionCommon 导入

// 获取详情
const fetchDetail = async() => {
  const id = serviceProxyId.value || route.query.id
  // 从sessionStorage获取车辆信息
  const vehicleInfoStr = sessionStorage.getItem('vehicleInfo')

  // 如果有车辆信息，则从车辆搜索页面跳转过来
  if (vehicleInfoStr && !route.query.serviceProxyId) {
    try {
      const item = JSON.parse(vehicleInfoStr)
      // 直接拷贝 item 所有值到 detail
      Object.assign(detail, item)
      // 设置一些派生字段用于页面显示
      detail.plateNo = item.vehiclePlateNo || ''
      detail.vehicleModel = item.vehicleModelName || item.vehicleModel || ''
      detail.owner = item.vehicleProfileOwnerResp?.ownerName || ''
      detail.ownerPhone = item.vehicleProfileOwnerResp?.mobilephone || ''
      detail.bindingUser = item.vehicleProfileOwnerResp?.bindingUser || ''
      detail.binderPhone = item.vehicleProfileOwnerResp?.bindingPhone || ''
      // 默认送修人为车主
      detail.repairPerson = item.vehicleProfileOwnerResp?.ownerName || ''
      detail.repairPersonPhone = item.vehicleProfileOwnerResp?.mobilephone || ''
      // detail.repairPersonTag = '车主'
      // repairPersonType.value = 'owner'
      // 初始化输入框
      repairPersonNameInput.value = item.vehicleProfileOwnerResp?.ownerName || ''
      repairPersonPhoneInput.value = item.vehicleProfileOwnerResp?.mobilephone || ''
      detail.vehicleProfileServiceResp = item.vehicleProfileServiceResp || {}
      // 获取车联网里程数
      if (detail.vin) {
        fetchVehicleMileage(detail.vin)
      }
    } catch (e) {
      console.error('解析车辆信息失败:', e)
    }
    return
  }

  if (!id) return
  // 调用接口获取详情
  console.log('获取详情:', id)

  // 获取附件列表并分类回显
  getFileList({ businessId: id, pageSize: 100 }).then((fileRes) => {
    if (fileRes.code === 200) {
      const fileList = fileRes.data || []
      // 清空列表
      detail.interiorImages = []
      detail.exteriorImages = []
      attachmentsList.value = []
      // 用于存储最新的制单签字
      let latestSignFile = null
      // 根据 attachType 分类回显文件
      fileList.forEach((item) => {
        const fileObj = normalizeAttachmentFile(item)
        switch (item.attachType) {
          case '车内照片':
            detail.interiorImages.push(fileObj)
            break
          case '车外照片':
            detail.exteriorImages.push(fileObj)
            break
          case '附件资料':
            attachmentsList.value.push(fileObj)
            break
          case '制单签字':
            // 对比createTime，保留最新的制单签字
            if (!latestSignFile || new Date(item.createTime) > new Date(latestSignFile.createTime)) {
              latestSignFile = item
            }
            break
        }
      })
      // 将最新的制单签字赋值给detail.signUrl
      if (latestSignFile) {
        detail.signUrl = latestSignFile.fileUrl
      }
    }
  })
}
// 换车
const onChangeCar = () => {
  carSearchValue.value = ''
  carSearchResults.value = []
  selectedCarInfo.value = null
  hasSearched.value = false
  changeCarDialog.value = true
}

// 关闭换车弹框
const onChangeCarClose = () => {
  changeCarDialog.value = false
  carSearchValue.value = ''
  carSearchResults.value = []
  selectedCarInfo.value = null
  hasSearched.value = false
}

// 搜索车辆
const onCarSearch = async(value) => {
  console.log('搜索车辆:', value)
  // 重置选中车辆信息，展示搜索结果列表
  selectedCarInfo.value = null
  if (!value || !value.trim()) {
    carSearchResults.value = []
    hasSearched.value = false
    return
  }

  try {
    const res = await getVehicleInfo({ searchVin: value.trim() })
    if (res.code === 200) {
      carSearchResults.value = res.data || []
    } else {
      carSearchResults.value = []
    }
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

// 获取车联网里程数
const fetchVehicleMileage = async(vin) => {
  if (!vin) return
  try {
    const res = await getVehicleMileage(vin)
    if (res.code === 200 && res.data) {
      detail.networkMileageTotal = res.data.mileage || ''
      detail.networkMileageAdd = res.data.oilMileage || ''
      detail.networkBattery = res.data.electricity || ''
      detail.electricalMileage = res.data.electricMileage || ''
      detail.mileage = res.data.mileage || ''
      detail.battery = res.data.electricity || ''
      // 获取车联网里程后进行校验
      // validateMileage(detail.mileage, detail.lastMileage, detail.networkMileageTotal)
    }
  } catch (error) {
    console.error('获取车联网里程失败:', error)
  }
}

// 确认更换车辆
const onConfirmChangeCar = () => {
  if (!selectedCarInfo.value) {
    showToast('请选择车辆')
    return
  }

  // 更新车辆信息
  detail.plateNo = selectedCarInfo.value.vehiclePlateNo || ''
  detail.vin = selectedCarInfo.value.vin || ''
  detail.vehicleModel =
    selectedCarInfo.value.vehicleModelName || selectedCarInfo.value.vehicleModel || ''
  detail.warrantyDate = selectedCarInfo.value.warrantyDate || ''
  detail.owner = selectedCarInfo.value.vehicleProfileOwnerResp?.ownerName || ''
  detail.ownerPhone = selectedCarInfo.value.vehicleProfileOwnerResp?.mobilephone || ''
  detail.bindingUser = selectedCarInfo.value.vehicleProfileOwnerResp?.bindingUser || ''
  detail.binderPhone = selectedCarInfo.value.vehicleProfileOwnerResp?.bindingPhone || ''
  detail.vehicleProfileServiceResp = selectedCarInfo.value.vehicleProfileServiceResp || {}

  // 获取车联网里程数
  if (detail.vin) {
    fetchVehicleMileage(detail.vin)
  }

  showToast('更换车辆成功')
  onChangeCarClose()
}
// 修改车牌
const onEditPlate = () => {
  changePlateDialog.value = true
}

// 通用上传方法
const uploadGeneric = (type) => {
  currentUploadType.value = type
  currentUploadIndex.value = 0
  // attachType 映射
  const attachTypeMap = {
    interior: '车内照片',
    exterior: '车外照片',
    attachment: '附件资料'
  }
  const config = getAttachConfig(attachTypeMap[type] || '车内照片')
  const maxSize = config.maxSize || 10
  // 已上传数量（最大选择数量=config.maxNum-当前已上传数量，区间1-9）
  const targetList = getTargetFileList(type)
  const hasUploadNumber = targetList.length

  // 如果已上传数量等于最大数量，不可上传（maxNum为null时不限制）
  if (config.maxNum !== null && config.maxNum !== undefined && hasUploadNumber >= config.maxNum) {
    showToast('已达到最大上传数量')
    return
  }

  // 计算最大可选数量：maxNum有值时用maxNum，无值时不限制传999
  const maxSelectNum = config.maxNum || 20
  batchUploadImageLimit(maxSize, maxSelectNum, hasUploadNumber)
}

// 选择图片来源
const onSelectImageSource = (source) => _onSelectImageSource(source, showImageUploadSheet, imageUploadRef)

// 处理图片文件选择
const handleImageFileChange = (event) => {
  const files = event.target.files
  if (files && files.length > 0) {
    const file = files[0]
    // 创建本地预览 URL
    const previewUrl = URL.createObjectURL(file)

    // attachType 映射
    const attachTypeMap = {
      interior: '车内照片',
      exterior: '车外照片',
      attachment: '附件资料'
    }

    // 先添加临时预览
    const fileObj = {
      url: previewUrl,
      fileUrl: previewUrl,
      authFileUrl: previewUrl,
      fileType: file.type || getFileType({ url: previewUrl }, 'image/jpeg'),
      status: 'uploading',
      message: '上传中...',
      id: null
    }

    // 根据当前上传类型添加到对应的文件列表
    switch (currentUploadType.value) {
      case 'interior':
        detail.interiorImages.push(fileObj)
        break
      case 'exterior':
        detail.exteriorImages.push(fileObj)
        break
      case 'attachment':
        attachmentsList.value.push(fileObj)
        break
    }

    // 调用上传接口
    const uploadFile = async() => {
      // 保存当前上传类型，避免异步上传完成时类型已改变
      const uploadType = currentUploadType.value
      try {
        const params = {
          fileUrl: previewUrl,
          businessId: serviceProxyId.value || detail.id || null,
          configCode: 'mcs_serviceproxy',
          attachType: attachTypeMap[uploadType]
        }

        const res = await uploadFileByUrl([params])

        if (res.code === 200) {
          // 兼容两种返回格式：数组或对象
          const uploadData = Array.isArray(res.data) ? res.data[0] || {} : res.data || {}

          // 更新文件状态 - 使用保存的 uploadType
          const targetList = getTargetFileList(uploadType)
          if (targetList.length > 0) {
            const lastIndex = targetList.length - 1
            const rawUrl = uploadData.url || uploadData.fileUrl || previewUrl
            const currentBusinessId = serviceProxyId.value || detail.id || null
            targetList[lastIndex] = {
              ...targetList[lastIndex],
              status: 'done',
              message: '',
              id: currentBusinessId ? uploadData.id : null, // 有施工单id时取上传id，无施工单id时为null
              uploadId: uploadData.id, // 保存上传成功后的id，用于fileId
              businessId: currentBusinessId, // 取施工单id（如果有）
              url: rawUrl,
              fileUrl: rawUrl,
              authFileUrl: uploadData.authFileUrl || rawUrl,
              fileType: uploadData.fileType || uploadData.ext || file.type || getFileType({ url: rawUrl }, 'image/jpeg')
            }
          }

          showToast('上传成功')
        } else {
          // 上传失败，移除临时文件 - 使用保存的 uploadType
          const targetList = getTargetFileList(uploadType)
          if (targetList.length > 0) {
            targetList.pop()
          }
          showToast(res.msg || '上传失败')
        }
      } catch (e) {
        console.error('上传出错:', e)
        // 出错时移除临时文件 - 使用保存的 uploadType
        const targetList = getTargetFileList(uploadType)
        if (targetList.length > 0) {
          targetList.pop()
        }
        showToast('上传出错')
      }
    }

    uploadFile()
  }
  // 清空 input 值，允许重复选择同一文件
  event.target.value = ''
}

// 预览图片
const showImg = (url) => {
  showImagePreview([url])
}

// 文件删除已从 receptionCommon 导入，此处为组件绑定
const handleInteriorDelete = (file) => _handleFileDelete(file, 'interior', detail, { attachments: attachmentsList.value })
const handleExteriorDelete = (file) => _handleFileDelete(file, 'exterior', detail, { attachments: attachmentsList.value })

// 添加故障模块
const onAddFaultModule = () => {
  faultSearchValue.value = ''
  addFaultModuleShow.value = true
}

// 关闭故障模块弹框
const onCloseFaultModulePopup = () => {
  addFaultModuleShow.value = false
  faultSearchValue.value = ''
}

// 故障模块搜索
const onFaultSearch = async(value) => {
  faultSearchValue.value = value
  await fetchFaultModuleList()
}

// 清空故障模块搜索
const onFaultSearchClear = () => {
  faultSearchValue.value = ''
}

// 添加故障模块项
const onAddFaultModuleItem = (item) => {
  // 检查是否已存在（根据cccCode匹配）
  const exists = detail.faultModules.some((m) => m.cccId === item.cccId)
  if (exists) {
    showToast('该故障模块已添加')
    return
  }
  // 如果已保存，调用接口添加
  detail.faultModules.push(item)
  showToast('添加成功')
  addFaultModuleShow.value = false
  faultSearchValue.value = ''
}

// 删除故障模块
const onDeleteFaultModule = async(module) => {
  try {
    await showConfirmDialog({
      title: '提示',
      message: '是否要删除此接车施工单-故障模块？您无法撤销此操作。'
    })
    const index = detail.faultModules.findIndex((m) => m.cccCode === module.cccCode)
    if (index > -1) {
      detail.faultModules.splice(index, 1)
    }
    showToast('删除成功')
  } catch {
    // 取消操作
  }
}

// 查看全部故障模块
const onViewAllModules = () => {
  showAllModules.value = !showAllModules.value
}

// 送修人输入框是否禁用（车主/绑车人不可编辑，其他可编辑）
const repairPersonInputDisabled = computed(() => repairPersonType.value !== 'other')

// 送修人输入框标签文案（车主/绑车人/其他显示不同文案）
const repairPersonInputLabel = computed(() => {
  if (repairPersonType.value === 'owner') return '车主'
  if (repairPersonType.value === 'bindingUser') return '绑车人'
  return '送修人'
})

// 选择送修人类型
const onSelectRepairPersonType = (type) => {
  repairPersonType.value = type
  // 根据类型更新输入框的值
  if (type === 'owner') {
    repairPersonNameInput.value = detail.owner
    repairPersonPhoneInput.value = detail.ownerPhone
    detail.repairPersonTag = '车主'
  } else if (type === 'bindingUser') {
    repairPersonNameInput.value = detail.bindingUser
    repairPersonPhoneInput.value = detail.binderPhone
    detail.repairPersonTag = '绑车人'
  } else {
    // 其他：带出车主信息，支持编辑
    repairPersonNameInput.value = detail.owner
    repairPersonPhoneInput.value = detail.ownerPhone
    detail.repairPersonTag = '送修人'
  }
  // 同步更新送修人信息
  detail.repairPerson = repairPersonNameInput.value
  detail.repairPersonPhone = repairPersonPhoneInput.value
}

// 送修人姓名变化
const onRepairPersonNameChange = () => {
  detail.repairPerson = repairPersonNameInput.value
}

// 送修人手机变化
const onRepairPersonPhoneChange = () => {
  detail.repairPersonPhone = repairPersonPhoneInput.value
}

// 保存
const validateRepairPerson = () => _validateRepairPerson(repairPersonType.value, detail.repairPerson, detail.repairPersonPhone)
// hasDuplicateFileId 已从 receptionCommon 导入

const savingLoading = ref(false)

const onSave = async() => {
  console.log('保存:', detail)
  if (savingLoading.value) return
  savingLoading.value = true
  const repairResult = validateRepairPerson()
  if (!repairResult.valid) {
    repairPersonType.value = 'other'
    scrollToErrorField({ errorField: repairResult.errorField, activeTab, repairPersonCollapse })
    savingLoading.value = false
    return
  }
  // 照片校验（根据配置判断是否必填）
  if (interiorConfig.value.required === '1' && detail.interiorImages.length === 0) {
    showToast('请上传车内照片')
    scrollToErrorField({ errorField: 'interiorPhotos', activeTab, repairPersonCollapse })
    savingLoading.value = false
    return
  }
  if (exteriorConfig.value.required === '1' && detail.exteriorImages.length === 0) {
    showToast('请上传车外照片')
    scrollToErrorField({ errorField: 'exteriorPhotos', activeTab, repairPersonCollapse })
    savingLoading.value = false
    return
  }
  // 检查车内、车外照片是否有重复文件
  if (hasDuplicateFileId(detail.interiorImages)) {
    showToast('车内照片存在重复文件，请检查')
    scrollToErrorField({ errorField: 'interiorPhotos', activeTab, repairPersonCollapse })
    savingLoading.value = false
    return
  }
  if (hasDuplicateFileId(detail.exteriorImages)) {
    showToast('车外照片存在重复文件，请检查')
    scrollToErrorField({ errorField: 'exteriorPhotos', activeTab, repairPersonCollapse })
    savingLoading.value = false
    return
  }
  // 异常描述
  if (!detail.abnormalDesc) {
    showToast('请输入异常描述')
    scrollToErrorField({ errorField: 'abnormalDesc', activeTab, repairPersonCollapse })
    savingLoading.value = false
    return
  }
  // 经理建议
  if (!detail.testResult) {
    showToast('请输入客户经理建议')
    scrollToErrorField({ errorField: 'testResult', activeTab, repairPersonCollapse })
    savingLoading.value = false
    return
  }
  // 如果currentFault为"1"，必须添加故障模块
  if (Number(detail.currentFault) === 1 && detail.faultModules.length === 0) {
    showToast('请添加故障模块')
    scrollToErrorField({ errorField: 'faultModules', activeTab, repairPersonCollapse })
    savingLoading.value = false
    return
  }
  // 里程校验
  validateMileage(detail.mileage, detail.lastMileage, detail.networkMileageTotal)
  // 如果currentFault为"1"，客户故障描述必填
  if (Number(detail.currentFault) === 1 && !detail.customerFaultDesc.trim()) {
    showToast('请输入客户故障描述')
    scrollToErrorField({ errorField: 'customerFaultDesc', activeTab, repairPersonCollapse })
    savingLoading.value = false
    return
  }

  showLoadingToast('正在保存...')
  try {
    const res = await serviceAddOrUpdate({
      id: undefined,
      dataSource: 180, // 170零小跑PC端; 180零小跑APP端,
      appointmentType: detail.appointmentType, // 预约方式，默认0未预约
      customerName: detail.owner,
      customerPhone: detail.ownerPhone,
      vehModelName: detail.vehicleModelName,
      bindingPhone: detail.binderPhone,
      bindingUser: detail.bindingUser,
      carPlate: detail.plateNo,
      mileage: detail.mileage,
      lastMileage: null,
      startWarrantyDate: detail.vehicleProfileServiceResp.warrantyStartdate || '',
      expectFinishAt: '',
      shuttleName: detail.repairPerson,
      shuttlePhone: detail.repairPersonPhone,
      signChannel: '',
      inPower: detail.battery,
      netMileage: detail.networkMileageTotal,
      inNetPower: detail.networkBattery,
      netMileageElectricity: detail.electricalMileage,
      netMileageExtend: detail.networkMileageAdd,
      vehProfileVin: detail.vin,
      maintenanceMileage: detail.vehicleProfileServiceResp.nextMaintainMileages,
      maintenanceTime: detail.vehicleProfileServiceResp.nextMaintainDate,
      saleDate: detail.salesDate || '',
      vehModelId: detail.vehicleModelId,
      vehRegisteredModelId: detail.vehicleProfileServiceResp.carSaleSversionId,
      vehRegisteredModelName: detail.vehicleProfileServiceResp.carSalesVersionName,
      vehYearTypeId: detail.vehicleProfileServiceResp.vehicleYearId,
      vehYearTypeName: detail.vehicleProfileServiceResp.vehicleYearName,
      dedicatedServiceManager: detail.vehicleProfileServiceResp.serviceUserName,
      // batteryModel: detail.batteryModel,
      // batterySerialNumber: detail.batterySerialNumber,
      // engineNumber: detail.enginenNumber,
      businessType: computedBusinessType.value,
      haveRework: 0,
      customerComment: detail.customerComment,
      isCarWash: 0,
      isRetainOldParts: 0,
      testResult: detail.testResult,
      currentFault: Number(detail.currentFault),
      customerContent: detail.customerFaultDesc,
      anomalyDescription: detail.abnormalDesc,
      currentSituation: Number(detail.currentFault) === 1 ? 20 : 10,
      // faultModule: detail.faultModules.map((m) => m.cccCode).join(','),
      isCreateStatementInfo: 0,
      exteriorPhotoList: formatPhotoList(detail.exteriorImages, '车外照片', serviceProxyId.value || null),
      interiorPhotoList: formatPhotoList(detail.interiorImages, '车内照片', serviceProxyId.value || null),
      faultAlertRecordParams: detail.faultModules.map((m) => ({
        cccId: m.id || '',
        cccName: m.cccName || '',
        vfgId: m.vfgCode || '',
        vfgName: m.vfgName || '',
        vrtId: m.vrtCode || '',
        vrtName: m.vrtName || ''
      }))
    })
    if (res.code === 200) {
      closeToast()
      showToast('保存成功')
      // 新建时保存返回的施工单id，同步设置 detail.id 防止后续编辑保存时丢失
      if (res.data) {
        serviceProxyId.value = res.data
        detail.id = res.data
      }
      router.replace({
        path: '/reception/work-order/edit',
        query: {
          id: detail.id || serviceProxyId.value || route.query.id
        }
      })
      // // 同步更新快照，防止返回时误提示
      // saveDataSnapshot()
      // // 保存成功生成施工单后，清除sessionStorage中的车辆信息
      // sessionStorage.removeItem('vehicleInfo')
      // // 保存成功后获取详情数据更新（await 确保快照同步完成后再放开 loading）
      // await fetchDetailForSignature()
      // // 获取提醒信息
      // fetchRemindInfo()
    } else {
      showToast(res.msg || '保存失败')
    }
  } catch {
    closeToast()
    showToast('保存失败')
  } finally {
    savingLoading.value = false
  }
}

onMounted(async() => {
  // 如果从预约单跳转过来，先查询预约信息获取VIN，再查询车辆信息存入sessionStorage
  if (route.query.appointId) {
    try {
      const reservationRes = await getReservationList(route.query.appointId)
      if (reservationRes.code === 200 && reservationRes.data?.vin) {
        detail.appointmentType = reservationRes?.data?.appointmentSource || 0
        const vehicleRes = await getVehicleInfo({ searchVin: reservationRes.data.vin })
        if (vehicleRes.code === 200 && vehicleRes.data?.length > 0) {
          sessionStorage.setItem('vehicleInfo', JSON.stringify(vehicleRes.data[0]))
        }
      }
    } catch (e) {
      console.error('获取预约车辆信息失败:', e)
    }
  }
  fetchDetail()
  // 获取上次环检信息
  const vehicleInfoStr = sessionStorage.getItem('vehicleInfo')
  if (vehicleInfoStr) {
    const item = JSON.parse(vehicleInfoStr)
    getRecentlyServiceProxy(item.vin).then((res) => {
      if (res.code === 200 && res.data) {
        // 已作废210、反结算200时不回显，其他状态回显上次环检信息
        const recentData = res.data
        if (recentData.orderStatus !== 210 && recentData.orderStatus !== 200) {
          // 合并车内照片到 detail.interiorImages
          if (recentData.interiorPhotoList && recentData.interiorPhotoList.length > 0) {
            detail.interiorImages = [
              ...detail.interiorImages,
              ...recentData.interiorPhotoList.map((photo) => ({
                ...photo,
                url: photo.fileUrl,
                id: null,
                businessId: null
              }))
            ]
          }
          // 合并车外照片到 detail.exteriorImages
          if (recentData.exteriorPhotoList && recentData.exteriorPhotoList.length > 0) {
            detail.exteriorImages = [
              ...detail.exteriorImages,
              ...recentData.exteriorPhotoList.map((photo) => ({
                ...photo,
                url: photo.fileUrl,
                id: null,
                businessId: null
              }))
            ]
          }
          // 回显异常描述
          if (recentData.anomalyDescription) {
            detail.abnormalDesc = recentData.anomalyDescription
          }
        }
      }
    })
  }
  // 获取上传配置
  getUploadConfig({
    configCode: 'mcs_serviceproxy'
  }).then((res) => {
    if (res.code === 200) {
      uploadConfig.value = res.data
    }
  })

  // 注册原生图片选择回调
  window.getScanResult = async(url) => {
    console.log('原生返回图片地址:', url, Array.isArray(url))
    let urlList = []
    if (typeof url === 'string') {
      if (url.startsWith('[')) {
        // JSON 数组字符串，需要解析
        try {
          urlList = JSON.parse(url)
        } catch {
          // 解析失败，当作单个 URL 处理
          urlList = [url]
        }
      } else {
        // 单个 URL 字符串
        urlList = [url]
      }
    } else if (Array.isArray(url)) {
      urlList = url
    } else {
      return
    }

    // 遍历每个 URL 进行上传处理
    for (const singleUrl of urlList) {
      // 保存当前上传类型，避免异步上传完成时类型已改变
      const uploadType = currentUploadType.value

      // attachType 映射
      const attachTypeMap = {
        interior: '车内照片',
        exterior: '车外照片',
        attachment: '附件资料'
      }

      // 先添加临时预览
      const fileObj = {
        url: singleUrl,
        fileUrl: singleUrl,
        authFileUrl: singleUrl,
        fileType: getFileType({ url: singleUrl }, 'image/jpeg'),
        status: 'uploading',
        message: '上传中...',
        id: null
      }

      // 根据当前上传类型添加到对应的文件列表
      switch (uploadType) {
        case 'interior':
          detail.interiorImages.push(fileObj)
          break
        case 'exterior':
          detail.exteriorImages.push(fileObj)
          break
        case 'attachment':
          attachmentsList.value.push(fileObj)
          break
      }

      // 调用上传接口
      try {
        const params = {
          fileUrl: singleUrl,
          businessId: serviceProxyId.value || null,
          configCode: 'mcs_serviceproxy',
          attachType: attachTypeMap[uploadType]
        }

        const res = await uploadFileByUrl([params])

        if (res.code === 200) {
          // 兼容两种返回格式：数组或对象
          const uploadData = Array.isArray(res.data) ? res.data[0] || {} : res.data || {}

          // 更新文件状态 - 使用保存的 uploadType
          const targetList = getTargetFileList(uploadType)
          if (targetList.length > 0) {
            const lastIndex = targetList.length - 1
            const rawUrl = uploadData.url || uploadData.fileUrl || singleUrl
            const currentBusinessId = serviceProxyId.value
            targetList[lastIndex] = {
              ...targetList[lastIndex],
              status: 'done',
              message: '',
              id: currentBusinessId ? uploadData.id : null, // 有施工单id时取上传id，无施工单id时为null
              uploadId: uploadData.id, // 保存上传成功后的id，用于fileId
              businessId: currentBusinessId, // 取施工单id（如果有）
              url: rawUrl,
              fileUrl: rawUrl,
              authFileUrl: uploadData.authFileUrl || rawUrl,
              fileType: uploadData.fileType || uploadData.ext || getFileType({ url: rawUrl }, 'image/jpeg')
            }
          }

          showToast('上传成功')
        } else {
          // 上传失败，移除临时文件 - 使用保存的 uploadType
          const targetList = getTargetFileList(uploadType)
          if (targetList.length > 0) {
            targetList.pop()
          }
          showToast(res.msg || '上传失败')
        }
      } catch (e) {
        console.error('上传出错:', e)
        // 出错时移除临时文件 - 使用保存的 uploadType
        const targetList = getTargetFileList(uploadType)
        if (targetList.length > 0) {
          targetList.pop()
        }
        showToast('上传出错')
      }
    }
  }
})

// 返回按钮拦截
const onBeforeBack = () => {
  if (!hasInspectionDataChanged()) return true
  showConfirmDialog({
    title: '提示',
    message: '本次操作未保存，是否退出？',
    confirmButtonText: '否',
    cancelButtonText: '是'
  }).catch(() => {
    router.go(-1)
  })
  return false
}

defineExpose({ onBeforeBack })
</script>
