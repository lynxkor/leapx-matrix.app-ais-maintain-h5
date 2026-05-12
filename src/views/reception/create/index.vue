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
          <span><img src="@/assets/image/car.png" alt="" /></span>
          <span>换车</span>
        </span>
        <span
          v-if="detail.orderStatus != 180 && detail.orderStatus != 210"
          class="edit-plate"
          @click="onEditPlate"
        >
          <span><img src="@/assets/image/edit.png" alt="" /></span>
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

      <div class="divider"></div>

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
              <div
                :class="['type-item', { active: repairPersonType === 'other' }]"
                @click="onSelectRepairPersonType('other')"
              >
                其他
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
                    @input="onRepairPersonNameChange"
                  />
                  <van-icon
                    v-if="!repairPersonInputDisabled"
                    name="edit"
                    size="16"
                    color="#888888"
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
                    @input="onRepairPersonPhoneChange"
                  />
                  <van-icon
                    v-if="!repairPersonInputDisabled"
                    name="edit"
                    size="16"
                    color="#888888"
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
              <div class="section-title">
                <div>进店里程数</div>
                <div class="editable-value" @click="showMileageInput = true">
                  <span class="number">{{ detail.mileage }}</span>
                  <span class="unit">km</span>
                  <van-icon name="edit" size="14" color="#888888" />
                </div>
              </div>
              <div class="sub-info">车联网里程数(总)：{{ detail.networkMileageTotal }} km</div>
              <div v-if="detail.networkMileageAdd" class="sub-info">
                车联网里程数(增)：{{ detail.networkMileageAdd }} km
              </div>
            </div>

            <!-- 进店电量 -->
            <div class="section-card borderB">
              <div class="section-title">
                <div>进店电量</div>
                <div class="editable-value" @click="showBatteryInput = true">
                  <span class="number">{{ detail.battery }}</span>
                  <span class="unit">%</span>
                  <van-icon name="edit" size="14" color="#888888" />
                </div>
              </div>
              <div class="sub-info">车联网电量: {{ detail.networkBattery }}%</div>
            </div>

            <!-- 车内照片 -->
            <div class="card-container marginB1">
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
            <div class="card-container marginB1">
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
                    v-model="detail.hasFault"
                    direction="horizontal"
                    @change="onHasFaultChange"
                  >
                    <van-radio name="1">是</van-radio>
                    <van-radio name="2">否</van-radio>
                  </van-radio-group>
                </div>
              </div>

              <!-- 故障模块列表 -->
              <div class="fault-modules" v-if="detail.hasFault === '1'">
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
                    <van-icon name="delete-o" @click="onDeleteFaultModule(module)" />
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
                <span v-if="detail.hasFault === '1'" class="required">*</span>客户故障描述
              </div>
              <van-field
                v-model="detail.customerFaultDesc"
                type="textarea"
                placeholder="请输入客户故障描述"
                rows="3"
                autosize
                show-word-limit
                maxlength="500"
                :disabled="detail.hasFault === '2'"
                style="background: #f5f5f5; border-radius: 6px"
              />
            </div>
          </div>
        </div>
      </van-tab>

      <van-tab v-if="isPreCheckCompleted" title="项目零件" name="parts">
        <div class="tab-content parts-tab">
          <!-- 费用汇总 -->
          <div style="padding: 12px; background: #fff">
            <div class="cost-summary">
              <div class="summary-row">
                <span class="label">维修项目</span>
                <span class="amount">¥{{ computedWorkCost }}</span>
              </div>
              <span class="operator">+</span>
              <div class="summary-row">
                <span class="label">维修配件</span>
                <span class="amount">¥{{ computedPartsCost }}</span>
              </div>
              <span class="operator">=</span>
              <div class="summary-row total">
                <span class="label">费用合计</span>
                <span class="amount">¥{{ computedTotalCost }}</span>
              </div>
            </div>
          </div>

          <!-- 维修项目零件内容 - 使用 RepairItemContent 组件 -->
          <RepairItemContent
            ref="repairItemContentRef"
            :service-proxy-id="detail.id"
            :initial-items="partsData.repairItemRespList"
            :initial-parts="partsData.sparePartRespList"
            isComponent
          />

          <!-- 添加按钮 -->
          <div class="add-buttons">
            <div class="add-btn" @click="onAddParts">
              <van-icon name="plus" />
              <span>添加项目/零件</span>
            </div>
            <div class="add-btn" @click="onAddPackage">
              <van-icon name="plus" />
              <span>添加套餐及其他</span>
            </div>
          </div>
        </div>
      </van-tab>

      <van-tab v-if="isPreCheckCompleted" title="签字确认" name="signature">
        <div class="tab-content signature-tab">
          <!-- 费用合计 -->
          <div class="signature-section">
            <div class="signature-row">
              <span class="label">费用合计</span>
              <span class="value">¥{{ computedTotalCost }}</span>
            </div>
            <div class="signature-row">
              <span class="label">维修类型</span>
              <span class="value">{{ signatureData.repairItemTypeDetailCollect }}</span>
            </div>
            <div class="signature-row" @click="onOpenDeliveryTimePicker">
              <span class="label">预计交车时间</span>
              <div class="value-wrapper">
                <span :class="['value', { placeholder: !signatureData.expectFinishAt }]">
                  {{ signatureData.expectFinishAt || '请选择' }}
                </span>
                <van-icon
                  v-if="!signatureData.isDeliveryTimeFromApi"
                  name="arrow"
                  size="12"
                  color="#545454"
                />
              </div>
            </div>
            <!-- <div class="signature-row">
              <span class="label">开启维修直播</span>
              <van-switch v-model="signatureData.liveEnabled" size="20" active-color="#009100" />
            </div> -->
            <div class="signature-row" @click="showSignatureChannelPickerHandle">
              <span class="label">签字渠道</span>

              <div class="value-wrapper">
                <span :class="['value', { placeholder: !signatureData.signChannel }]">
                  {{ signatureData.signChannel || '请选择' }}
                </span>
                <van-icon v-if="detail.signStatus != 20" name="arrow" size="12" color="#545454" />
              </div>
            </div>
            <!-- APP/短信/零小跑渠道提示 -->
            <div v-if="signatureData.signChannel === 'APP/短信/零小跑'" class="signature-hint">
              此操作将生成待签字施工单且需要用户签字
            </div>
            <!-- 已签字状态显示 -->
            <!-- <div class="signature-row" v-if="detail.signStatus == 20">
              <span class="label">签字状态</span>
              <div class="value-wrapper">
                <span class="value signed">已签字</span>
              </div>
            </div> -->
            <div
              class="signature-action-row"
              v-if="detail.signStatus == 20 && detail.signChannel != 40"
            >
              <van-button type="primary" size="small" @click="onViewSignature">查看签字</van-button>
            </div>
            <!-- 未签字状态显示 -->
            <!-- <div class="signature-row" v-if="detail.signStatus != 20">
              <span class="label">签字状态</span>
              <div class="value-wrapper">
                <span class="value unsigned">未签字</span>
              </div>
            </div> -->
          </div>

          <!-- 附件资料 -->
          <div class="card-container marginB1">
            <div class="card-info-title marginB1">
              附件资料
              <span v-if="attachmentConfig.required === '1'" style="color: #b91919; font-size: 15px"
                >*</span
              >
            </div>
            <div class="upload-content">
              <div
                class="upload-box"
                v-for="(file, index) in signatureData.attachments"
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
                  @click="handleAttachmentDelete(file)"
                />
              </div>
              <div
                class="upload-box upload-placeholder"
                v-if="signatureData.attachments.length < (attachmentConfig.maxNum || 3)"
                @click="uploadGeneric('attachment')"
              >
                <svg class="icon upload-img" aria-hidden="true">
                  <use xlink:href="#icon-lxp-h5upload-mob"></use>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </van-tab>
    </van-tabs>

    <!-- 底部操作栏 -->
    <div class="bottom-bar">
      <span v-if="serviceProxyId" class="more-btn" @click="onMore">更多</span>
      <template v-if="activeTab === 'inspection'">
        <span v-if="!isSaved" class="save-btn" @click="onSave">保存</span>
        <template v-else>
          <span
            :class="['save-btn', { disabled: isInspectionSaveDisabled }]"
            @click="onInspectionSave"
            >保存</span
          >
          <span v-if="!detail.previewingFinishAt" class="complete-btn" @click="onComplete"
            >预检完成</span
          >
        </template>
      </template>
      <template v-else-if="activeTab === 'parts'">
        <span :class="['save-btn', { disabled: isPartsSaveDisabled }]" @click="onPartsSave"
          >保存</span
        >
      </template>
      <template v-else-if="activeTab === 'signature'">
        <span
          v-if="detail.orderStatus === 110"
          :class="['complete-btn', { disabled: isConfirmAndSignDisabled }]"
          @click="onConfirmAndSign"
          >制单确认并签字</span
        >
      </template>
    </div>
    <!-- 更换车牌 -->
    <van-dialog
      v-model:show="changePlateDialog"
      title="更换车牌"
      show-cancel-button
      confirmButtonText="保存"
      cancelButtonText="取消"
      confirmButtonColor="#009100"
      cancelButtonColor="#191A1B"
      @confirm="onConfirmChangePlate"
      @opened="onPlateDialogOpened"
      @closed="onPlateDialogClosed"
      :style="{ marginBottom: showPlateKeyboard ? '220px' : '0' }"
    >
      <template #title>
        <div class="dialog-title">实名认证车辆</div>
        <div class="dialog-subtitle">原车牌：{{ detail.plateNo }}</div>
      </template>
      <template #default>
        <div class="plate-input-wrapper">
          <div class="plate-input-box">
            <div
              v-for="(char, index) in plateInputChars"
              :key="index"
              :class="['plate-char', { active: currentPlateIndex === index }]"
              @click="onPlateCharClick(index)"
            >
              {{ char }}
            </div>
          </div>
        </div>
      </template>
    </van-dialog>

    <!-- 车牌键盘 - 放在弹框外面 -->
    <van-popup
      v-model:show="showPlateKeyboard"
      position="bottom"
      :style="{ height: '220px' }"
      :overlay="false"
      @open="onKeyboardOpen"
    >
      <div class="plate-keyboard">
        <!-- 省份键盘 -->
        <div v-if="currentPlateIndex === 0" class="keyboard-content">
          <div class="keyboard-row" v-for="(row, rowIndex) in provinceRows" :key="rowIndex">
            <span
              v-for="item in row"
              :key="item"
              :class="['key-item', { disabled: !item }]"
              @click="onKeyboardKeyClick(item)"
            >
              {{ item }}
            </span>
          </div>
        </div>
        <!-- 字母键盘 -->
        <div v-else-if="currentPlateIndex === 1" class="keyboard-content">
          <div class="keyboard-tabs">
            <span
              :class="['tab-item', { active: keyboardTab === 'letter' }]"
              @click="keyboardTab = 'letter'"
              >字母</span
            >
            <span
              :class="['tab-item', { active: keyboardTab === 'province' }]"
              @click="keyboardTab = 'province'"
              >省份</span
            >
          </div>
          <template v-if="keyboardTab === 'letter'">
            <div class="keyboard-row" v-for="(row, rowIndex) in letterRows" :key="rowIndex">
              <span
                v-for="item in row"
                :key="item"
                :class="['key-item', { disabled: !item }]"
                @click="onKeyboardKeyClick(item)"
              >
                {{ item }}
              </span>
            </div>
          </template>
          <template v-else>
            <div class="keyboard-row" v-for="(row, rowIndex) in provinceRows" :key="rowIndex">
              <span
                v-for="item in row"
                :key="item"
                :class="['key-item', { disabled: !item }]"
                @click="onKeyboardKeyClick(item)"
              >
                {{ item }}
              </span>
            </div>
          </template>
        </div>
        <!-- 数字字母混合键盘 -->
        <div v-else class="keyboard-content">
          <div class="keyboard-row" v-for="(row, rowIndex) in numberLetterRows" :key="rowIndex">
            <span
              v-for="item in row"
              :key="item"
              :class="[
                'key-item',
                { disabled: !item, special: item === '删除' || item === '完成' },
              ]"
              @click="onKeyboardKeyClick(item)"
            >
              {{ item }}
            </span>
          </div>
        </div>
      </div>
    </van-popup>
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
    <!-- 预计交车时间选择器 -->
    <ais-popup
      :show="showDeliveryTimePicker"
      position="bottom"
      title="预计交车时间"
      @close="onCloseDeliveryTimePicker"
      :style="{ background: '#f4f4f4', height: '70%' }"
    >
      <template #content>
        <div class="delivery-time-picker">
          <!-- 日期列 -->
          <div class="date-column">
            <div
              v-for="(item, index) in deliveryDateList"
              :key="index"
              :class="['picker-item', { active: selectedDeliveryDate === item.value }]"
              @click="onSelectDeliveryDate(item)"
            >
              {{ item.label }}
            </div>
          </div>
          <!-- 时间列 -->
          <div class="time-column">
            <div
              v-for="(item, index) in deliveryTimeList"
              :key="index"
              :class="['picker-item', { active: selectedDeliveryTime === item.value }]"
              @click="onSelectDeliveryTime(item)"
            >
              <span class="time-text">{{ item.label }}</span>
              <van-icon
                v-if="selectedDeliveryTime === item.value"
                name="success"
                size="16"
                color="#009100"
              />
            </div>
          </div>
        </div>
      </template>
    </ais-popup>

    <!-- 签字渠道选择器 -->
    <ais-popup
      :show="showSignatureChannelPicker"
      position="bottom"
      title="选择签字渠道"
      @close="showSignatureChannelPicker = false"
      :style="{ background: '#f4f4f4', height: '50%' }"
    >
      <template #content>
        <div class="signature-channel-picker">
          <div
            v-for="(item, index) in signatureChannelList"
            :key="index"
            :class="['picker-item', { active: signatureData.signChannel === item.label }]"
            @click="onSelectSignatureChannel(item)"
          >
            <div class="channel-content">
              <span class="channel-text">{{ item.label }}</span>
              <span v-if="item.value === '999'" class="channel-hint"
                >将生成待签字施工单且需要用户签字</span
              >
            </div>
            <van-icon
              v-if="signatureData.signChannel === item.label"
              name="success"
              size="16"
              color="#009100"
            />
          </div>
        </div>
      </template>
    </ais-popup>

    <!-- 更多操作 -->
    <van-action-sheet
      v-model:show="showMoreActions"
      :actions="moreActionsList"
      cancel-text="取消"
      close-on-click-action
      @select="onSelectMoreAction"
    >
    </van-action-sheet>
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
    <!-- 作废原因弹框 -->
    <ais-popup
      :show="showCancelReason"
      position="bottom"
      title="作废原因"
      @close="showCancelReason = false"
      :style="{ background: '#f4f4f4', height: '70%' }"
    >
      <template #content>
        <div class="cancel-reason-content">
          <van-field
            v-model="cancelReason"
            type="textarea"
            placeholder="请输入作废原因"
            rows="4"
            autosize
            show-word-limit
            maxlength="500"
            style="background: #f4f4f4; border-radius: 6px"
          />
        </div>
      </template>
      <template #footer>
        <van-button
          type="primary"
          size="small"
          block
          :loading="cancelLoading"
          @click="onConfirmCancel"
        >
          确定
        </van-button>
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

    <!-- 进店里程数编辑弹框 -->
    <van-dialog
      v-model:show="showMileageInput"
      title="进店里程数"
      show-cancel-button
      confirmButtonText="保存"
      cancelButtonText="取消"
      confirmButtonColor="#009100"
      cancelButtonColor="#191A1B"
      @confirm="onConfirmMileage"
      @opened="onMileageDialogOpened"
    >
      <div class="input-dialog-content">
        <van-field
          v-model="mileageInputValue"
          type="number"
          placeholder="请输入里程数"
          :border="false"
        >
          <template #button>
            <span class="input-unit">km</span>
          </template>
        </van-field>
      </div>
    </van-dialog>

    <!-- 进店电量编辑弹框 -->
    <van-dialog
      v-model:show="showBatteryInput"
      title="进店电量"
      show-cancel-button
      confirmButtonText="保存"
      cancelButtonText="取消"
      confirmButtonColor="#009100"
      cancelButtonColor="#191A1B"
      @confirm="onConfirmBattery"
      @opened="onBatteryDialogOpened"
    >
      <div class="input-dialog-content">
        <van-field
          v-model="batteryInputValue"
          type="number"
          placeholder="请输入电量"
          :border="false"
        >
          <template #button>
            <span class="input-unit">%</span>
          </template>
        </van-field>
      </div>
    </van-dialog>

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

    <!-- 三包预警提示框 -->
    <van-dialog
      v-model:show="showWarrantyAlertDialog"
      :show-confirm-button="false"
      :show-cancel-button="false"
      close-on-click-overlay
      class="warranty-alert-dialog"
    >
      <div class="warranty-alert-content">
        <template v-for="item in remindList" :key="item.type">
          <!-- 预授权提醒 -->
          <div v-if="item.type === RemindInfoTypeEnum.PRE_AUTH" class="alert-section">
            <div class="section-title">{{ item.typeLabel }}</div>
            <div class="section-message">{{ item.content || '暂无提醒信息' }}</div>
            <div class="section-action-btn" @click="onGenerateAuthorization">生成预授权</div>
          </div>

          <!-- 三包预警 -->
          <div v-if="item.type === RemindInfoTypeEnum.THREE_GUARANTEES" class="alert-section">
            <div class="section-title">{{ item.typeLabel }}</div>
            <div class="warranty-alerts">
              <div
                v-for="(alarm, alarmIndex) in item.content"
                :key="alarmIndex"
                :class="['warranty-alert-card', getAlarmColor(alarm.alarmLevel)]"
              >
                <div class="alert-header">
                  <span :class="['alert-tag', getAlarmColor(alarm.alarmLevel)]">
                    {{ getAlarmLabel(alarm.alarmLevel) }}
                  </span>
                  <span class="alert-title">{{ alarm.title }}</span>
                </div>
                <div class="alert-partno">{{ alarm.partNo }}</div>
                <div class="alert-details">
                  <div
                    v-for="(detail, dIndex) in alarm.details"
                    :key="dIndex"
                    class="alert-detail-item"
                  >
                    {{ detail }}
                  </div>
                </div>
              </div>
              <p v-if="!item.content || item.content.length === 0">暂无提醒信息</p>
            </div>
          </div>
          <!-- 服务活动提醒 -->
          <template v-else-if="item.type === RemindInfoTypeEnum.SERVICE_ACTIVITY">
            <div class="info-title">{{ item.typeLabel }}</div>
            <div class="info-content">{{ item.content || '暂无提醒信息' }}</div>
          </template>
          <!-- 车辆标识 -->
          <template v-else-if="item.type === '5'">
            <div class="info-title">{{ item.typeLabel }}</div>
            <div class="info-content">
              该车辆为<template v-for="(tag, index) in item.content.split(',')" :key="index">【{{ tag }}】</template>，请注意接待
            </div>
          </template>
          <!-- 其他提醒 -->
          <template v-else>
            <div class="info-title">{{ item.typeLabel }}</div>
            <div class="info-content">{{ item.content || '暂无提醒信息' }}</div>
          </template>
        </template>

        <div class="alert-confirm-btn" @click="onConfirmWarrantyAlert">我知道了</div>
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
import AisPopup from '@/libs/components/AisPopup.vue'
import RepairItemContent from '@/components/SelectRepairItem/RepairItemContent.vue'
import {
  uploadFileByUrl,
  deleteAttachmentConfig,
  getUploadConfig,
  getFileList
} from '@/libs/api/fileConfig'

// 附件配置
const uploadConfig = ref({})

// 根据附件类型获取配置
const getAttachConfig = (attachType) => {
  const detailList = uploadConfig.value?.detailList || []
  return detailList.find((item) => item.attachType === attachType) || {}
}

// 车内检查
const interiorConfig = computed(() => getAttachConfig('车内照片'))

// 车外检查
const exteriorConfig = computed(() => getAttachConfig('车外照片'))

// 附件资料配置
const attachmentConfig = computed(() => getAttachConfig('附件资料'))

// 业务类型计算：优先使用已有值，否则根据是否预约判断
const computedBusinessType = computed(() => {
  return detail.businessType || (detail.isAppointment ? 50 : 10)
})

// 图片上传相关
const currentUploadType = ref('') // 'interior' or 'exterior'
const currentUploadIndex = ref(0)
const imageUploadRef = ref(null) // 文件输入引用
const showImageUploadSheet = ref(false)

// 获取目标文件列表
const getTargetFileList = (type) => {
  switch (type) {
    case 'interior':
      return detail.interiorImages
    case 'exterior':
      return detail.exteriorImages
    case 'attachment':
      return signatureData.attachments
    default:
      return detail.interiorImages
  }
}

const getFilePreviewUrl = (file) => {
  return file?.authFileUrl || file?.url || file?.fileUrl || ''
}

const getFileSaveUrl = (file) => {
  return file?.url || file?.fileUrl || file?.authFileUrl || ''
}

const getFileType = (file, fallback = '') => {
  if (!file) return fallback
  if (file.fileType || file.ext) return file.fileType || file.ext

  const filePath = file.fileName || file.name || file.url || file.fileUrl || file.authFileUrl || ''
  const cleanPath = filePath.split('?')[0]
  const ext = cleanPath.includes('.') ? cleanPath.split('.').pop() : ''
  return ext || fallback
}

// 处理图片列表参数的通用方法
const formatPhotoList = (list, attachType, businessId) => {
  return list.map((item) => {
    // 判断是否为新上传的图片：没有 id 表示新上传
    const isNewUpload = !item.id
    if (isNewUpload) {
      // 新上传的图片：不传 id，传 fileId（取上传成功后的 id）
      return {
        businessId,
        fileId: item.uploadId, // 取上传成功后保存的 id
        fileUrl: getFileSaveUrl(item),
        fileType: getFileType(item, 'image/jpeg'),
        attachType,
        configCode: 'mcs_serviceproxy'
      }
    }
    // 旧图片：传 fileId（取原有的 id）
    return {
      fileId: item.id,
      businessId,
      fileUrl: getFileSaveUrl(item),
      fileType: getFileType(item, 'image/jpeg'),
      attachType,
      configCode: 'mcs_serviceproxy'
    }
  })
}

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
import { RemindInfoTypeEnum, AlarmLevelEnum } from '@/views/repairWork/constant'
import { preAuthAddOrUpdate } from '@/api/authorization'
import {
  getVehicleInfo,
  getVehicleMileage,
  getFaultModule,
  serviceAddOrUpdate,
  servicePreCheck,
  getDetail,
  saveSpRepairItem,
  spConfirmAndSign,
  serviceProxyCancel,
  getRemindInfo,
  saveSpFaultModule,
  deleteSpFaultModule,
  getRecentlyServiceProxy,
  checkFault,
  createRetention
} from '@/api/reception'
import './create.scss'

const route = useRoute()
const router = useRouter()
const globalStore = useGlobalStore()
const addFaultModuleShow = ref(false)
const changeCarDialog = ref(false)
const changePlateDialog = ref(false)

// RepairItemContent 组件引用
const repairItemContentRef = ref(null)

// 施工单状态
const isSaved = ref(false) // 是否已保存
const isPreCheckCompleted = ref(false) // 是否预检完成
const serviceProxyId = ref('') // 新建保存后返回的施工单id

// 换车相关
const carSearchValue = ref('')
const carSearchResults = ref([])
const selectedCarInfo = ref(null)
const hasSearched = ref(false)

// 故障模块搜索相关
const faultSearchValue = ref('')

// 是否存在故障确认弹框
const showFaultConfirm = ref(false)
const pendingFaultValue = ref('')

// 进店里程数和进店电量编辑
const showMileageInput = ref(false)
const showBatteryInput = ref(false)
const mileageInputValue = ref('')
const batteryInputValue = ref('')

// 二次确认提示框
const showConfirmDialog2 = ref(false)

const onConfirmDialogClose = () => {
  showConfirmDialog2.value = false
}

// 三包预警提示框
const showWarrantyAlertDialog = ref(false)
const remindList = ref([])

const onGenerateAuthorization = async() => {
  // 生成预授权
  try {
    showLoadingToast('请稍候...')
    const res = await preAuthAddOrUpdate({ serviceProxyId: serviceProxyId.value || route.query.id })
    closeToast()
    if (res.code === 200) {
      showToast('已成功生成预授权申请，您可至预授权申请管理查看数据并提交审批')
      showWarrantyAlertDialog.value = false
    } else {
      showToast(res.msg || '生成预授权失败')
    }
  } catch (error) {
    closeToast()
    console.error(error)
  }
}

const onConfirmWarrantyAlert = () => {
  showWarrantyAlertDialog.value = false
}

// 获取预警等级颜色
const getAlarmColor = (level) => {
  switch (level) {
    case AlarmLevelEnum.CRITICAL:
      return 'red'
    case AlarmLevelEnum.WARNING:
      return 'yellow'
    case AlarmLevelEnum.NORMAL:
      return 'green'
    case AlarmLevelEnum.EXPIRED:
      return 'gray'
    default:
      return 'gray'
  }
}

// 获取预警等级标签
const getAlarmLabel = (level) => {
  switch (level) {
    case AlarmLevelEnum.CRITICAL:
      return '红色预警'
    case AlarmLevelEnum.WARNING:
      return '黄色预警'
    case AlarmLevelEnum.NORMAL:
      return '绿色预警'
    case AlarmLevelEnum.EXPIRED:
      return '已过期'
    default:
      return '未知'
  }
}

// 获取提醒信息
const fetchRemindInfo = () => {
  const id = serviceProxyId.value || route.query.id
  if (!id) return
  setTimeout(() => {
    getRemindInfo(id).then((res) => {
      if (res.code === 200) {
        remindList.value = res.data || []
        if (remindList.value.length > 0) {
          showWarrantyAlertDialog.value = true
        }
      }
    })
  }, 1000)
}

// 送修人类型选择
const repairPersonType = ref('owner') // owner/bindingUser/other
const repairPersonNameInput = ref('')
const repairPersonPhoneInput = ref('')

// 折叠面板状态
const repairPersonCollapse = ref([])

// 车牌输入相关
const plateInputChars = ref(['', '', '', '', '', '', '', ''])
const currentPlateIndex = ref(0) // 当前选中的输入框索引
const showPlateKeyboard = ref(false) // 键盘显示状态
const keyboardTab = ref('province') // 键盘tab: province/letter

// 省份列表
const provinceList = '京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领'

// 字母列表
const letterList = 'ABCDEFGHJKLMNPQRSTUVWXYZ' // 不含I和O

// 省份键盘布局（每行10个）
const provinceRows = computed(() => {
  const provinces = provinceList.split('')
  const rows = []
  for (let i = 0; i < provinces.length; i += 10) {
    const row = provinces.slice(i, i + 10)
    while (row.length < 10) {
      row.push('')
    }
    rows.push(row)
  }
  return rows
})

// 字母键盘布局
const letterRows = computed(() => {
  const letters = letterList.split('')
  const rows = []
  // 第一行10个
  rows.push(letters.slice(0, 10))
  // 第二行10个
  rows.push(letters.slice(10, 20))
  // 第三行6个字母 + 4个空位
  const lastRow = letters.slice(20, 26)
  while (lastRow.length < 10) {
    lastRow.push('')
  }
  rows.push(lastRow)
  return rows
})

// 数字字母混合键盘布局
const numberLetterRows = computed(() => {
  return [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'P', '港', '澳'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', '学'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '警', '领', ''],
    ['删除', '', '', '', '', '', '', '', '', '完成']
  ]
})

// 弹框打开时初始化
const onPlateDialogOpened = () => {
  // 初始化车牌输入框，使用当前车牌号
  const currentPlate = detail.plateNo.replace(/[·•]/g, '')
  const chars = currentPlate.split('')
  // 补齐8位
  while (chars.length < 8) {
    chars.push('')
  }
  plateInputChars.value = chars.slice(0, 8)
  currentPlateIndex.value = 0
  showPlateKeyboard.value = true
}

// 弹框关闭时
const onPlateDialogClosed = () => {
  showPlateKeyboard.value = false
}

// 键盘打开
const onKeyboardOpen = () => {
  // 键盘打开时的处理
}

// 点击车牌输入框
const onPlateCharClick = (index) => {
  currentPlateIndex.value = index
  showPlateKeyboard.value = true
}

// 键盘按键点击
const onKeyboardKeyClick = (key) => {
  if (!key) return

  if (key === '删除') {
    // 删除操作
    if (currentPlateIndex.value > 0) {
      if (plateInputChars.value[currentPlateIndex.value]) {
        plateInputChars.value[currentPlateIndex.value] = ''
      } else {
        currentPlateIndex.value--
        plateInputChars.value[currentPlateIndex.value] = ''
      }
    } else {
      plateInputChars.value[0] = ''
    }
  } else if (key === '完成') {
    // 完成操作
    showPlateKeyboard.value = false
  } else {
    // 输入字符
    if (currentPlateIndex.value < 8) {
      plateInputChars.value[currentPlateIndex.value] = key
      if (currentPlateIndex.value < 7) {
        currentPlateIndex.value++
      }
    }
  }
}

// 确认更换车牌
const onConfirmChangePlate = async() => {
  const newPlate = plateInputChars.value.join('')
  if (newPlate.length < 7) {
    showToast('请输入完整的车牌号')
    return
  }

  // 如果车牌没有变化，直接关闭弹框
  if (newPlate === detail.plateNo) {
    changePlateDialog.value = false
    return
  }

  savingLoading.value = true
  try {
    // 校验新车牌号唯一性
    const res = await getVehicleInfo({ searchVin: newPlate })
    if (res.code === 200) {
      const vehicleList = res.data || []
      // 检查是否存在其他车辆使用该车牌号（排除当前车辆）
      const existingVehicle = vehicleList.find(
        (v) => v.vehiclePlateNo === newPlate && v.vin !== detail.vin
      )

      if (existingVehicle) {
        // 该车牌已具有一个VIN码，请检查确认
        showToast('该车牌已具有一个VIN码，请检查确认')
      } else {
        // 车牌唯一，直接更新页面数据并关闭弹框
        detail.plateNo = newPlate
        showToast('车牌修改成功')
        changePlateDialog.value = false
      }
    } else {
      showToast(res.msg || '校验车牌失败')
    }
  } catch (error) {
    console.error('更换车牌失败:', error)
    showToast('更换车牌失败，请稍后重试')
  } finally {
    savingLoading.value = false
  }
}

// 更多操作列表 - 动态计算作废按钮状态
const moreActionsList = computed(() => {
  // 已作废210、反结算200、已生成结算单(isCreateStatementInfo == 1)时，作废禁用
  const isCancelDisabled =
    detail.orderStatus === 210 || detail.orderStatus === 200 || detail.isCreateStatementInfo === 1

  // 获取禁用原因文本
  let disabledReason = ''
  if (detail.orderStatus === 210) {
    disabledReason = '已作废'
  } else if (detail.orderStatus === 200) {
    disabledReason = '反结算'
  } else if (detail.isCreateStatementInfo === 1) {
    disabledReason = '已生成结算单'
  }

  return [
    { name: '权益查询', tag: '1', color: '#191a1b' },
    { name: '维修履历', tag: '2', color: '#191a1b' },
    { name: '实时故障', tag: '3', color: '#191a1b' },
    {
      name: '作废',
      tag: '4',
      color: isCancelDisabled ? '#888888' : '#191a1b',
      disabled: isCancelDisabled,
      disabledReason: disabledReason
    }
  ]
})
const faultModuleList = ref([])

// 获取故障模块列表
const fetchFaultModuleList = async() => {
  try {
    const res = await getFaultModule(faultSearchValue.value.trim())
    if (res.code === 200 && res.data) {
      faultModuleList.value = (res.data || []).map((item) => ({
        ...item,
        cccId: item.id
      }))
    } else {
      faultModuleList.value = []
    }
  } catch (error) {
    console.error('获取故障模块失败:', error)
    faultModuleList.value = []
  }
}

// 作废原因弹框状态
const showCancelReason = ref(false)
// 作废原因
const cancelReason = ref('')
// 更多操作选择内容
const onSelectMoreAction = (action) => {
  if (action.name === '作废') {
    // 检查是否禁用
    if (action.disabled) {
      showToast(`该工单为${action.disabledReason}状态，无法作废`)
      return
    }
    cancelReason.value = ''
    showCancelReason.value = true
  }
  if (action.name === '维修履历') {
    router.push({
      path: '/reception/maintenance-history',
      query: {
        vin: detail.vin,
        plateNo: detail.plateNo,
        vehicleModel: detail.vehicleModel,
        id: serviceProxyId.value || detail.id || route.query.id
      }
    })
  }
  if (action.name === '权益查询') {
    router.push({
      path: '/reception/rights-query',
      query: {
        id: serviceProxyId.value || detail.id || route.query.id,
        vin: detail.vin
      }
    })
  }
  if (action.name === '实时故障') {
    window.location.href = `https://staticres.leapmotor.com/leapx/batteryDiagnosis?vin=${detail.vin}&vehicleModel=${detail.vehSeriesName}`
  }
}
// 确认作废
const onConfirmCancel = async() => {
  if (!cancelReason.value.trim()) {
    showToast('请输入作废原因')
    return
  }
  cancelLoading.value = true
  try {
    const res = await serviceProxyCancel({
      id: serviceProxyId.value || route.query.id,
      invaildDesc: cancelReason.value
    })
    if (res.code === 200) {
      showToast('作废成功')
      showCancelReason.value = false
      cancelReason.value = ''
      router.push('/reception/work-order')
    }
  } finally {
    cancelLoading.value = false
  }
}

// 是否存在故障变更
const onHasFaultChange = (value) => {
  // 如果选择"否"，弹出确认框
  if (value === '2') {
    // 如果已添加过故障模块或客户故障描述，弹出确认框
    if (detail.faultModules.length > 0 || detail.customerFaultDesc) {
      pendingFaultValue.value = value
      showFaultConfirm.value = true
    } else {
      detail.hasFault = '2'
      detail.customerFaultDesc = '本次进店车辆无故障'
    }
  } else if (value === '1') {
    // 从"否"切换到"是"，清空客户故障描述
    detail.customerFaultDesc = ''
  }
}

// 取消故障确认
const onCancelFaultConfirm = () => {
  showFaultConfirm.value = false
  // 恢复为"是"
  detail.hasFault = '1'
}

// 确认故障变更
const onConfirmFaultChange = () => {
  showFaultConfirm.value = false
  // 清空故障模块，设置默认客户故障描述
  detail.faultModules = []
  detail.customerFaultDesc = '本次进店车辆无故障'
  detail.hasFault = '2'
  showToast('已更改')
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
// 选择器显示状态
const showMoreActions = ref(false)

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
  currentFault: '',
  faultAlertRecordRespList: [],
  hasFault: '1',
  faultModules: [],
  customerFaultDesc: '',
  testResult: '',
  // 新增字段
  code: '',
  dataSource: '',
  orderStatus: '',
  warrantyTypeCollect: '',
  custType: '',
  custTypeLabel: '',
  salesDealerName: '',
  salesDealerCode: '',
  appointmentNo: '',
  lastMileage: null,
  createStatementInfoDate: '',
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
  appointmentType: '',
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

// 项目零件数据
const partsData = reactive({
  repairItemRespList: [],
  sparePartRespList: [],
  repairAmount: '0.00',
  partsAmount: '0.00',
  totalAmount: '0.00'
})

// 从组件数据计算费用（computed 实现联动）
const computedWorkCost = computed(() => {
  const items = repairItemContentRef.value?.selectedItems || []
  return items
    .reduce((sum, item) => {
      return (
        sum +
        (Number(item.price) * Number(item.quantity || item.workHour) -
          Number(item.discountAmount || 0))
      )
    }, 0)
    .toFixed(2)
})

const computedPartsCost = computed(() => {
  const parts = repairItemContentRef.value?.selectedParts || []
  return parts
    .reduce((sum, item) => {
      return sum + (Number(item.price) * Number(item.quantity) - Number(item.discountAmount || 0))
    }, 0)
    .toFixed(2)
})

const computedTotalCost = computed(() => {
  const total = Number(computedWorkCost.value) + Number(computedPartsCost.value)
  return total.toFixed(2)
})

// 制单确认并签字按钮是否禁用：预计交车时间为空或者签字渠道为空
const isConfirmAndSignDisabled = computed(() => {
  return !signatureData.expectFinishAt || !signatureData.signChannel
})

// 项目零件保存按钮是否禁用：没有添加项目或者零件
const isPartsSaveDisabled = computed(() => {
  return false
  // const items = repairItemContentRef.value?.selectedItems || []
  // const parts = repairItemContentRef.value?.selectedParts || []
  // return items.length === 0 && parts.length === 0
})

// 环检信息保存按钮是否禁用：进店里程数、进店电量、送修人信息、车内车外照片、异常描述、经理建议为空
const isInspectionSaveDisabled = computed(() => {
  // 进店里程数
  if (!detail.mileage) return true
  // 进店电量
  if (!detail.battery) return true
  // 送修人信息
  if (!detail.repairPerson || !detail.repairPersonPhone) return true
  // 车内照片（根据配置判断是否必填）
  if (interiorConfig.value.required === '1' && detail.interiorImages.length === 0) return true
  // 车外照片（根据配置判断是否必填）
  if (exteriorConfig.value.required === '1' && detail.exteriorImages.length === 0) return true
  // 异常描述
  if (!detail.abnormalDesc) return true
  // 经理建议
  if (!detail.testResult) return true
  if (savingLoading.value) return true
  return false
})

// 签字确认数据
const signatureData = reactive({
  repairItemTypeDetailCollect: '',
  expectFinishAt: '',
  isDeliveryTimeFromApi: false,
  liveEnabled: false,
  signChannel: '',
  attachments: []
})

// 选择器显示状态
const showDeliveryTimePicker = ref(false)
const showSignatureChannelPicker = ref(false)

// 预计交车时间选择相关
const selectedDeliveryDate = ref('')
const selectedDeliveryTime = ref('')

// 预计交车日期列表
const deliveryDateList = ref([])
const generateDeliveryDates = () => {
  const dates = []
  const today = new Date()
  for (let i = 0; i < 100; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    dates.push({
      value: `${year}-${month}-${day}`,
      label: `${year}-${month}-${day}`
    })
  }
  deliveryDateList.value = dates
}

// 预计交车时间列表（08:00:00 到 18:00:00，每15分钟一个）
const deliveryTimeList = ref([])
const generateDeliveryTimes = () => {
  const times = []
  for (let hour = 8; hour <= 18; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`
      times.push({ value: timeStr, label: timeStr })
    }
  }
  deliveryTimeList.value = times
}

// 签字渠道列表
const signatureChannelList = ref([
  { value: 40, label: '纸质单据' },
  { value: 999, label: 'APP/短信/零小跑' }
])

// 里程校验
const validateMileage = (mileage, lastMileage, netMileage) => {
  // 1. 进店里程与上次进店里程对比
  if (mileage && lastMileage) {
    const mileageNum = Number(mileage)
    const lastMileageNum = Number(lastMileage)
    if (mileageNum < lastMileageNum) {
      showToast(`本次进店里程${mileageNum}小于上次进店里程数${lastMileageNum},请注意`)
    }
  }

  // 2. 进店里程与车联网里程对比
  if (mileage && netMileage) {
    const mileageNum = Number(mileage)
    const netMileageNum = Number(netMileage)
    const diff = Math.abs(mileageNum - netMileageNum)
    if (diff > 300) {
      showToast('进店里程数和车联网里程数不符，请注意')
    }
  }
}

// 获取详情
const fetchDetail = async() => {
  const id = serviceProxyId.value || route.query.id
  const vehicleInfoStr = route.params.vehicleInfo || route.query.vehicleInfo

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
      detail.repairPersonTag = '车主'
      repairPersonType.value = 'owner'
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
  getFileList({ businessId: id }).then((fileRes) => {
    if (fileRes.code === 200) {
      const fileList = fileRes.data || []
      // 清空列表
      detail.interiorImages = []
      detail.exteriorImages = []
      signatureData.attachments = []
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
            signatureData.attachments.push(fileObj)
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
      validateMileage(detail.mileage, detail.lastMileage, detail.networkMileageTotal)
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

  batchUploadImageLimit(maxSize, config.maxNum || 9, hasUploadNumber)
}

// 选择图片来源
const onSelectImageSource = (source) => {
  showImageUploadSheet.value = false
  if (source === 'camera') {
    // 拍照模式，让原生处理
  } else {
    // 从相册选择
    imageUploadRef.value?.click()
  }
}

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
        signatureData.attachments.push(fileObj)
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
            targetList[lastIndex] = {
              ...targetList[lastIndex],
              status: 'done',
              message: '',
              id: null, // 新上传图片不保存id，保持null
              uploadId: uploadData.id, // 保存上传成功后的id，用于fileId
              businessId: null, // 新上传图片businessId保持null
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

// 刷新附件列表
const refreshAttachmentList = () => {
  getFileList({ businessId: serviceProxyId.value || route.query.id }).then((res) => {
    if (res.code === 200) {
      const fileList = res.data || []
      // 清空所有列表
      detail.interiorImages = []
      detail.exteriorImages = []
      signatureData.attachments = []
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
            signatureData.attachments.push(fileObj)
            break
        }
      })
    }
  })
}

// 预览图片
const showImg = (url) => {
  showImagePreview([url])
}

// 删除图片/附件的通用方法
const handleFileDelete = async(file, type) => {
  // 根据 type 获取目标列表
  const targetList =
    type === 'interior'
      ? detail.interiorImages
      : type === 'exterior'
        ? detail.exteriorImages
        : signatureData.attachments

  // 判断是否为新上传的图片：有 id 但没有原始 businessId
  const isNewUpload = file.id && !file.businessId
  if (file.id && !isNewUpload) {
    // 旧图片：调用删除接口，然后直接从列表中移除（不刷新整个列表，保留新上传的图片）
    await deleteAttachmentConfig([file.id])
    const index = targetList.findIndex((item) => item.id === file.id)
    if (index > -1) {
      targetList.splice(index, 1)
    }
  } else {
    // 新上传的图片或没有 id 的临时图片：直接从列表中移除
    const index = targetList.findIndex((item) => item.id === file.id || item === file)
    if (index > -1) {
      targetList.splice(index, 1)
    }
  }
}

// 处理车内照片删除
const handleInteriorDelete = (file) => handleFileDelete(file, 'interior')

// 处理车外照片删除
const handleExteriorDelete = (file) => handleFileDelete(file, 'exterior')

// 处理附件资料删除
const handleAttachmentDelete = (file) => handleFileDelete(file, 'attachment')

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
  if (serviceProxyId.value) {
    saveSpFaultModule({ ...item, serviceProxyId: serviceProxyId.value }).then(res => {
      if (res.code === 200) {
        fetchDetailForSignature()
        showToast(res.data || '添加成功')
        addFaultModuleShow.value = false
        faultSearchValue.value = ''
      } else {
        showToast(res.msg || '添加失败')
      }
    }).catch(err => {
      showToast(err.msg || '添加失败')
    })
  } else {
    // 未保存时，直接添加到数组
    detail.faultModules.push(item)
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
    // 如果已保存，调用接口删除
    if (serviceProxyId.value && module.id) {
      deleteSpFaultModule([module.id]).then(res => {
        if (res.code === 200) {
          fetchDetailForSignature()
          showToast('删除成功')
        } else {
          showToast(res.msg || '删除失败')
        }
      })
    } else {
      // 未保存时，直接从数组删除
      const index = detail.faultModules.findIndex((m) => m.cccCode === module.cccCode)
      if (index > -1) {
        detail.faultModules.splice(index, 1)
      }
      showToast('删除成功')
    }
    if (detail.faultModules.length === 0) {
      showConfirmDialog({
        title: '提示',
        message: '全部故障模块已删除，请重新确认【本次进店是否存在故障】？'
      })
    }
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
    detail.repairPersonTag = '其他'
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
const validateRepairPerson = () => {
  if (repairPersonType.value === 'other') {
    if (!repairPersonNameInput.value.trim()) {
      showToast('请输入送修人姓名')
      return false
    }
    if (!repairPersonPhoneInput.value.trim()) {
      showToast('请输入送修人手机号')
      return false
    }
    // 手机号格式校验
    if (!/^1[3-9]\d{9}$/.test(repairPersonPhoneInput.value.trim())) {
      showToast('请输入正确的手机号')
      return false
    }
  }
  return true
}

const savingLoading = ref(false)
const cancelLoading = ref(false)

const onSave = async() => {
  console.log('保存:', detail)
  if (!validateRepairPerson()) return
  // 如果hasFault为"1"，客户故障描述必填
  if (detail.hasFault === '1' && !detail.customerFaultDesc.trim()) {
    showToast('请输入客户故障描述')
    return
  }
  // 如果hasFault为"1"，必须添加故障模块
  if (detail.hasFault === '1' && detail.faultModules.length === 0) {
    showToast('请添加故障模块')
    return
  }
  // 照片校验（根据配置判断是否必填）
  if (interiorConfig.value.required === '1' && detail.interiorImages.length === 0) {
    showToast('请上传车内照片')
    return
  }
  if (exteriorConfig.value.required === '1' && detail.exteriorImages.length === 0) {
    showToast('请上传车外照片')
    return
  }
  // 异常描述
  if (!detail.abnormalDesc) {
    showToast('请输入异常描述')
    return
  }
  // 经理建议
  if (!detail.testResult) {
    showToast('请输入客户经理建议')
    return
  }
  savingLoading.value = true
  try {
    const res = await serviceAddOrUpdate({
      customerName: detail.owner,
      customerPhone: detail.ownerPhone,
      vehModelName: detail.vehicleModelName,
      bindingPhone: detail.binderPhone,
      bindingUser: detail.bindingUser,
      carPlate: detail.plateNo,
      dealerName: detail.salesDealerName,
      dealerCode: detail.salesDealerCode,
      mileage: detail.mileage,
      lastMileage: null,
      startWarrantyDate: detail.vehicleProfileServiceResp.warrantyStartdate || '',
      expectFinishAt: signatureData.expectFinishAt,
      shuttleName: detail.repairPerson,
      shuttlePhone: detail.repairPersonPhone,
      signChannel: signatureData.signChannel === '纸质单据' ? '40' : '',
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
      batteryModel: detail.batteryModel,
      batterySerialNumber: detail.batterySerialNumber,
      engineNumber: detail.enginenNumber,
      businessType: computedBusinessType.value,
      haveRework: 0,
      customerComment: detail.customerComment,
      isCarWash: 0,
      isRetainOldParts: 0,
      testResult: detail.testResult,
      currentFault: detail.hasFault === '1' ? 1 : 0,
      customerContent: detail.customerFaultDesc,
      anomalyDescription: detail.abnormalDesc,
      currentSituation: detail.hasFault === '1' ? 20 : 10,
      faultModule: detail.faultModules.map((m) => m.cccCode).join(','),
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
      showToast('保存成功')
      isSaved.value = true
      // 新建时保存返回的施工单id
      if (res.data) {
        serviceProxyId.value = res.data
      }
      // 保存成功后获取详情数据更新
      fetchDetailForSignature()
      // 获取提醒信息
      fetchRemindInfo()
    } else {
      showToast(res.msg || '保存失败')
    }
  } catch {
    showToast('保存失败')
  } finally {
    savingLoading.value = false
  }
}

const onComplete = async() => {
  if (!validateRepairPerson()) return
  // 照片校验（根据配置判断是否必填）
  if (interiorConfig.value.required === '1' && detail.interiorImages.length === 0) {
    showToast('请上传车内照片')
    return
  }
  if (exteriorConfig.value.required === '1' && detail.exteriorImages.length === 0) {
    showToast('请上传车外照片')
    return
  }
  // 如果选择"是"，客户故障描述必填
  if (detail.hasFault === '1' && !detail.customerFaultDesc.trim()) {
    showToast('请输入客户故障描述')
    return
  }
  // 如果hasFault为"1"，必须添加故障模块
  if (detail.hasFault === '1' && detail.faultModules.length === 0) {
    showToast('请添加故障模块')
    return
  }
  // 当该车辆销售日期+60天≤开单时间时(销售日期为空时不计算)，车牌号为必填项
  const salesDate = detail?.salesDate
  if (salesDate) {
    const salesDateObj = new Date(salesDate)
    const sixtyDaysLater = new Date(salesDateObj.getTime() + 60 * 24 * 60 * 60 * 1000)
    const currentTime = new Date(detail.crearteTime)
    if (sixtyDaysLater <= currentTime && !detail.plateNo.trim()) {
      showToast('请输入车牌号')
      return
    }
  }
  showConfirmDialog({
    title: '提示',
    message: '确定预检完成吗？'
  })
    .then(async() => {
      savingLoading.value = true
      const res = await servicePreCheck(serviceProxyId.value || route.query.id)
      if (res.code === 200) {
        showToast('预检完成')
        isPreCheckCompleted.value = true
        // 预检完成后更新route.query.id
        if (serviceProxyId.value) {
          router.replace({
            query: {
              ...route.query,
              id: serviceProxyId.value,
              serviceProxyId: serviceProxyId.value
            }
          })
        }
        // 预检完成后获取详情数据，给签字确认页面赋值
        fetchDetailForSignature()
      } else {
        showToast(res.msg || '操作失败')
      }
      savingLoading.value = false
    })
    .catch(() => {
      savingLoading.value = false
    })
}

// 环检信息保存（已保存状态）
const onInspectionSave = async() => {
  if (isInspectionSaveDisabled.value) return
  savingLoading.value = true
  try {
    const res = await serviceAddOrUpdate({
      id: detail.id,
      code: detail.code,
      dataSource: detail.dataSource,
      orderStatus: detail.orderStatus,
      warrantyTypeCollect: detail.warrantyTypeCollect,
      customerName: detail.owner,
      customerPhone: detail.ownerPhone,
      custType: detail.custType,
      vehModelName: detail.vehicleModelName,
      bindingPhone: detail.binderPhone,
      bindingUser: detail.bindingUser,
      bindingUserId: detail.bindingUserId,
      carPlate: detail.plateNo,
      dealerName: detail.salesDealerName,
      dealerCode: detail.salesDealerCode,
      appointmentNo: detail.appointmentNo,
      mileage: detail.mileage,
      lastMileage: null,
      startWarrantyDate: detail.vehicleProfileServiceResp.warrantyStartdate || '',
      expectFinishAt: signatureData.expectFinishAt,
      createStatementInfoDate: detail.createStatementInfoDate,
      remark: detail.remark,
      status: detail.status,
      statusDesc: detail.statusDesc,
      pickStatus: detail.pickStatus,
      shuttleName: detail.repairPerson,
      shuttlePhone: detail.repairPersonPhone,
      payType: detail.payType,
      warrantyCompany: detail.warrantyCompany,
      signChannel: signatureData.signChannel === '纸质单据' ? '40' : '',
      signCompletedOn: detail.signCompletedOn,
      signGeneratedOn: detail.signGeneratedOn,
      signStatus: detail.signStatus,
      signUrlExpiredOn: detail.signUrlExpiredOn,
      appointmentType: detail.appointmentType,
      preAuthType: detail.preAuthType,
      isLockLive: detail.isLockLive,
      isCreateWarranty: detail.isCreateWarranty,
      isOutboundOrder: detail.isOutboundOrder,
      isVehRetentionRemind: detail.isVehRetentionRemind,
      isCancelStorage: detail.isCancelStorage,
      discountId: detail.discountId,
      finalCheckAt: detail.finalCheckAt,
      finalCheckerId: detail.finalCheckerId,
      finalChecker: detail.finalChecker,
      ticketStep: detail.ticketStep,
      warrantyStatus: detail.warrantyStatus,
      claimItemAmount: detail.claimItemAmount,
      claimOtherAmount: detail.claimOtherAmount,
      claimPartsAmount: detail.claimPartsAmount,
      departureMileage: detail.departureMileage,
      inPower: detail.battery,
      outPower: detail.outPower,
      netMileage: detail.networkMileageTotal,
      departureNetMileage: detail.departureNetMileage,
      inNetPower: detail.networkBattery,
      outNetPower: detail.outNetPower,
      departureNetMileageElectricity: detail.departureNetMileageElectricity,
      departureNetMileageExtend: detail.departureNetMileageExtend,
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
      batteryModel: detail.batteryModel,
      batterySerialNumber: detail.batterySerialNumber,
      engineNumber: detail.enginenNumber,
      repairItemTypeDetailCollect: detail.repairItemTypeDetailCollect,
      businessType: computedBusinessType.value,
      alarmLevel: detail.alarmLevel,
      isLive: detail.isLive,
      haveRework: 0,
      isCarWash: 0,
      isRetainOldParts: 0,
      inCustomerContent: detail.inCustomerContent,
      customerComment: detail.customerComment,
      testResult: detail.testResult,
      currentFault: detail.hasFault === '1' ? 1 : 0,
      customerContent: detail.customerFaultDesc,
      invaildDesc: detail.invaildDesc,
      anomalyDescription: detail.abnormalDesc,
      confirmedOn: detail.confirmedOn,
      expectStartAt: detail.expectStartAt,
      startAt: detail.startAt,
      finishAt: detail.finishAt,
      faultSolve: detail.faultSolve,
      currentSituation: detail.hasFault === '1' ? 20 : 10,
      faultAlert: detail.faultAlert,
      faultPeriod: detail.faultPeriod,
      earliestfaultServiceProxy: detail.earliestfaultServiceProxy,
      recentlyfaultServiceProxy: detail.recentlyfaultServiceProxy,
      faultModule: detail.faultModules.map((m) => m.cccCode).join(','),
      isCreateStatementInfo: 0,
      isPreAuth: detail.isPreAuth,
      isCreatePreAuth: detail.isCreatePreAuth,
      preAuthRuleId: detail.preAuthRuleId,
      unresolvedReason: detail.unresolvedReason,
      faultDesc: detail.faultDesc,
      batteryUnitId: detail.batteryUnitId,
      batteryUnitName: detail.batteryUnitName,
      targetUnitCode: detail.targetUnitCode,
      beforeChangeCode: detail.beforeChangeCode,
      afterChangeCode: detail.afterChangeCode,
      exteriorPhotoList: formatPhotoList(detail.exteriorImages, '车外照片', serviceProxyId.value || detail.id),
      interiorPhotoList: formatPhotoList(detail.interiorImages, '车内照片', serviceProxyId.value || detail.id),
      isStoreLive: detail.isStoreLive,
      latelyServiceProxy: detail.latelyServiceProxy,
      earlyServiceProxy: detail.earlyServiceProxy
    })
    if (res.code === 200) {
      showToast('保存成功')
      // 保存成功后获取详情数据更新
      fetchDetailForSignature()
    } else {
      showToast({ message: res.msg || '保存失败', duration: 3000 })
    }
  } catch (error) {
    console.error('保存失败:', error)
    showToast('保存失败')
  } finally {
    savingLoading.value = false
  }
}

// 项目零件保存
const onPartsSave = async() => {
  // 从 RepairItemContent 组件获取数据
  const items = repairItemContentRef.value?.selectedItems || []
  const parts = repairItemContentRef.value?.selectedParts || []

  // 校验项目及零件不可为空
  if (items.length === 0 && parts.length === 0) {
    showToast('项目及零件不可为空，请添加项目或者零件')
    return
  }

  savingLoading.value = true
  try {
    // 保存项目零件
    const res = await saveSpRepairItem({
      serviceProxyId: serviceProxyId.value || route.query.id,
      discountId: '',
      itemList: items,
      partsList: parts
    })
    if (res.code !== 200) {
      showToast(res.msg || '保存失败')
      return
    }
    showToast('保存成功')
    // 保存成功后获取详情数据，给签字确认页面赋值
    fetchDetailForSignature()
  } catch (error) {
    console.error('保存失败:', error)
    showToast('保存失败')
  } finally {
    savingLoading.value = false
  }
}

// 留车检查返回数据
const checkFaultData = ref(null)

// 制单确认并签字
const onConfirmAndSign = async() => {
  if (isConfirmAndSignDisabled.value) {
    return
  }
  // 从 RepairItemContent 组件获取数据
  const items = repairItemContentRef.value?.selectedItems || []
  const parts = repairItemContentRef.value?.selectedParts || []
  // 校验维修项目或零件有值（有一个有值即可）
  if (items.length === 0 && parts.length === 0) {
    showToast('项目或零件不可为空，请先添加维修项目或零件')
    return
  }

  // 先调用checkFault接口
  try {
    savingLoading.value = true
    const res = await checkFault({ serviceProxyId: detail.id })
    savingLoading.value = false
    if (res.code === 200) {
      checkFaultData.value = res.data
      // 如果isVehRetention=1，弹出留车确认框
      if (res.data?.isVehRetention === 1) {
        showConfirmDialog({
          title: '提示',
          message: '该车辆需要留车检查，请咨询客户是否同意留车?',
          confirmButtonText: '同意',
          cancelButtonText: '不同意',
          showCancelButton: true
        })
          .then(() => {
            // 同意留车，调用createRetention接口
            createRetention({
              serviceProxyId: detail.id,
              vehRetentionConfigId: res.data?.vehRetentionConfigId
            }).then(() => {
              handleConfirmAndSignProcess()
            }).catch((err) => {
              showToast(err.msg || '留车操作失败')
            })
          })
          .catch(() => {
            // 不同意留车，继续后续流程
            handleConfirmAndSignProcess()
          })
      } else {
        // 不需要留车检查，直接执行后续流程
        handleConfirmAndSignProcess()
      }
    } else {
      showToast(res.msg || '检查失败')
    }
  } catch (error) {
    savingLoading.value = false
    console.error('checkFault接口调用失败:', error)
    showToast(error.msg || '检查失败')
  }
}

// 处理制单确认并签字后续流程
const handleConfirmAndSignProcess = () => {
  // 点击"准确"，执行接口
  savingLoading.value = true
  const params = {
    serviceProxyId: detail.id,
    expectFinishAt: signatureData.expectFinishAt
  }
  // 纸质单据时才传signChannel
  if (signatureData.signChannel === '纸质单据' || Number(detail.signChannel) === 40) {
    params.signChannel = '40'
  }
  spConfirmAndSign(params)
    .then((res) => {
      if (res.code === 200) {
        showToast('操作成功')
        fetchDetail()
        if (!params.signChannel) {
          // 接口成功后跳转结算页面
          const settlementUrl = `https://staticres-sitb.leapmotor.com/leapx/biling/ais/constructionOrder?serviceProxyId=${detail.id}&signChannel=3`
          window.location.href = settlementUrl
        }
      } else {
        showToast(res.msg || '操作失败')
      }
    })
    .finally(() => {
      savingLoading.value = false
    })
}

// 获取详情数据给签字确认页面赋值
const fetchDetailForSignature = async() => {
  const id = serviceProxyId.value || route.query.id
  if (!id) return

  try {
    savingLoading.value = true
    const res = await getDetail(id)
    savingLoading.value = false
    if (res.code === 200) {
      console.log('获取详情成功:', res)
      const data = res.data
      // 更新签字确认数据
      signatureData.repairItemTypeDetailCollect = data.repairItemTypeDetailCollect || ''
      signatureData.expectFinishAt = data.expectFinishAt || ''
      signatureData.isDeliveryTimeFromApi = !!data.expectFinishAt
      // 签字渠道：如果为空则默认为APP/短信/零小跑
      signatureData.signChannel = data.signChannel ? (Number(data.signChannel) === 40 ? '纸质单据' : 'APP/短信/零小跑') : 'APP/短信/零小跑'
      // 更新项目零件数据
      if (data.costCountResp) {
        partsData.repairItemRespList = data.costCountResp.repairItemRespList || []
        partsData.sparePartRespList = data.costCountResp.sparePartRespList || []
      }
      // 更新其他详情字段
      // 填充详情数据
      detail.plateNo = data.carPlate || ''
      detail.isAppointment = !!data.appointmentNo // 有预约单号即为预约客户
      detail.custTypeLabel = data.custTypeLabel || ''
      detail.vehicleModel = data.vehModelName || ''
      detail.vehicleModelName = data.vehModelName || ''
      detail.vehicleModelId = data.vehicleModelId || ''
      detail.vin = data.vehProfileVin || ''
      detail.owner = data.customerName || ''
      detail.ownerPhone = data.customerPhone || ''
      detail.bindingUser = data.bindingUser || ''
      detail.binderPhone = data.bindingPhone || ''
      detail.bindingUserId = data.bindingUserId || ''
      // 送修人信息从接口返回的送修人字段获取
      detail.repairPerson = data.shuttleName || ''
      detail.repairPersonPhone = data.shuttlePhone || ''
      detail.previewingFinishAt = data.previewingFinishAt || ''
      // 计算送修人类型
      detail.repairPersonTag =
        detail.repairPerson === data.customerName
          ? '车主'
          : detail.repairPerson === data.bindingUser
            ? '绑车人'
            : '其他'
      detail.testResult = data.testResult || ''
      // 预约客户默认预约到店，否则默认自然到店
      detail.businessType = data.businessType || (detail.isAppointment ? 50 : 10)
      detail.mileage = data.mileage || ''
      detail.networkMileageTotal = data.netMileage || ''
      detail.networkMileageAdd = data.netMileageExtend || ''
      detail.battery = data.inPower || ''
      detail.networkBattery = data.inNetPower || ''
      detail.abnormalDesc = data.anomalyDescription || ''
      detail.customerComment = data.customerComment || ''
      detail.currentFault = String(data.currentFault || '')
      detail.hasFault = data.currentFault === 1 ? '1' : '2'
      detail.customerFaultDesc = data.customerContent || ''
      detail.faultAlertRecordRespList = data.faultAlertRecordRespList || []
      detail.vehicleProfileServiceResp = data.vehicleProfileServiceResp || {}
      detail.id = data.id || ''
      detail.code = data.code || ''
      detail.orderStatus = data.orderStatus || ''
      detail.signStatus = data.signStatus || ''
      detail.signUrl = data.signUrl || ''
      // 将故障预警记录映射到faultModules用于显示
      if (data.faultAlertRecordRespList && data.faultAlertRecordRespList.length > 0) {
        detail.faultModules = data.faultAlertRecordRespList.map((item) => ({
          ...item,
          cccCode: item.cccCode,
          cccName: item.cccName,
          vfgName: item.vfgName,
          faultDesc: item.faultDescription
        }))
      }
      // 获取附件列表并分类回显车内车外照片
      getFileList({ businessId: id }).then((fileRes) => {
        if (fileRes.code === 200) {
          const fileList = fileRes.data || []
          // 清空已有图片列表，避免重复
          detail.interiorImages = []
          detail.exteriorImages = []
          // 用于存储最新的制单签字
          let latestSignFile = null
          // 根据 attachType 分类回显文件
          fileList.forEach((item) => {
            const fileObj = {
              ...item, url: item.fileUrl, fileUrl: item.fileUrl
            }
            if (item.attachType === '车内照片') {
              detail.interiorImages.push(fileObj)
            } else if (item.attachType === '车外照片') {
              detail.exteriorImages.push(fileObj)
            } else if (item.attachType === '制单签字') {
              // 对比createTime，保留最新的制单签字
              if (!latestSignFile || new Date(item.createTime) > new Date(latestSignFile.createTime)) {
                latestSignFile = item
              }
            }
          })
          // 将最新的制单签字赋值给detail.signUrl
          if (latestSignFile) {
            detail.signUrl = latestSignFile.fileUrl
          }
        }
      })
    } else {
      showToast(res.msg || '获取详情失败')
    }
  } catch (error) {
    savingLoading.value = false
    console.error('获取详情失败:', error)
  }
}

// 添加项目/零件
const onAddParts = () => {
  router.push({
    path: '/reception/add-parts',
    query: {
      serviceProxyId: serviceProxyId.value || detail.id || route.query.id
    }
  })
}

// 添加套餐及其他
const onAddPackage = () => {
  router.push({
    path: '/reception/select-package',
    query: {
      serviceProxyId: serviceProxyId.value || route.query.id
    }
  })
}

// 打开预计交车时间选择器
const onOpenDeliveryTimePicker = () => {
  // 如果是接口返回的交车时间，不允许点击
  if (signatureData.isDeliveryTimeFromApi) {
    return
  }
  // 如果没有值，默认选中第一个日期和第一个时间
  if (!signatureData.expectFinishAt) {
    if (deliveryDateList.value.length > 0) {
      selectedDeliveryDate.value = deliveryDateList.value[0].value
    }
    if (deliveryTimeList.value.length > 0) {
      selectedDeliveryTime.value = deliveryTimeList.value[0].value
    }
  }
  showDeliveryTimePicker.value = true
}

// 选择预计交车日期
const onSelectDeliveryDate = (item) => {
  selectedDeliveryDate.value = item.value
}

// 选择预计交车时间 - 选中后直接确认并关闭
const onSelectDeliveryTime = (item) => {
  selectedDeliveryTime.value = item.value
  // 选中时间后直接确认
  if (selectedDeliveryDate.value && selectedDeliveryTime.value) {
    signatureData.expectFinishAt = `${selectedDeliveryDate.value} ${selectedDeliveryTime.value}`
    showDeliveryTimePicker.value = false
  }
}

// 关闭预计交车时间选择器
const onCloseDeliveryTimePicker = () => {
  showDeliveryTimePicker.value = false
}

const showSignatureChannelPickerHandle = () => {
  if (detail.signStatus === 20) {
    return
  }
  showSignatureChannelPicker.value = true
}
// 查看签字
const onViewSignature = () => {
  if (detail.signUrl) {
    showImagePreview({
      images: [detail.signUrl],
      startPosition: 0,
      showIndex: false
    })
  } else {
    showToast('暂无签字图片')
  }
}
// 选择签字渠道
const onSelectSignatureChannel = (item) => {
  signatureData.signChannel = item.label
  showSignatureChannelPicker.value = false
}
// 更多操作
const onMore = () => {
  showMoreActions.value = !showMoreActions.value
}
// 进店里程数弹框打开
const onMileageDialogOpened = () => {
  mileageInputValue.value = detail.mileage
}

// 确认进店里程数
const onConfirmMileage = () => {
  if (!mileageInputValue.value.trim()) {
    showToast('请输入里程数')
    return
  }
  detail.mileage = mileageInputValue.value
  showToast('保存成功')
}

// 进店电量弹框打开
const onBatteryDialogOpened = () => {
  batteryInputValue.value = detail.battery
}

// 确认进店电量
const onConfirmBattery = () => {
  if (!batteryInputValue.value.trim()) {
    showToast('请输入电量')
    return
  }
  const value = parseInt(batteryInputValue.value)
  if (value < 0 || value > 100) {
    showToast('电量范围为0-100')
    return
  }
  detail.battery = batteryInputValue.value
  showToast('保存成功')
}

onMounted(() => {
  fetchDetail()
  if (route.query.serviceProxyId) {
    // 保存之后生成施工单，点击项目或者其他的页面跳转，返回回来之后请求detail
    isPreCheckCompleted.value = true
    fetchDetailForSignature()
    refreshAttachmentList()
  }
  // 初始化送修人输入框
  repairPersonNameInput.value = detail.repairPerson
  repairPersonPhoneInput.value = detail.repairPersonPhone
  // 初始化预计交车日期列表
  generateDeliveryDates()
  // 初始化预计交车时间列表
  generateDeliveryTimes()
  // 获取上次环检信息
  if (route.params.vehicleInfo) {
    const item = JSON.parse(route.params.vehicleInfo)
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
          signatureData.attachments.push(fileObj)
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
            targetList[lastIndex] = {
              ...targetList[lastIndex],
              status: 'done',
              message: '',
              id: null, // 新上传图片不保存id，保持null
              uploadId: uploadData.id, // 保存上传成功后的id，用于fileId
              businessId: null, // 新上传图片businessId保持null
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
</script>
<style lang="scss" scoped>
:deep(.van-action-sheet__cancel) {
  color: #191a1b;
}

.dialog-title {
  font-size: 16px;
  font-weight: 500;
  color: #191a1b;
  text-align: center;
}

.dialog-subtitle {
  font-size: 12px;
  color: #545454;
  text-align: center;
  margin-top: 2px;
}

.plate-input-wrapper {
  padding: 8px 10px 32px;
  display: flex;
  justify-content: center;
}

.plate-input-box {
  display: flex;
  align-items: center;
  gap: 4px;

  .plate-char {
    width: 30px;
    height: 40px;
    background: #ffffff;
    border: 0.5px solid #cecfce;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 500;
    color: #191a1b;
    cursor: pointer;

    &.active {
      background: rgba(0, 145, 0, 0.1);
      border-color: #009100;
      color: #009100;
    }
  }
}

.keyboard-tabs {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 8px 0;

  .tab-item {
    font-size: 14px;
    color: #545454;
    cursor: pointer;

    &.active {
      color: #009100;
      font-weight: 500;
    }
  }
}

.plate-keyboard {
  background: #d1d5db;
  padding: 8px 6px;
  height: 100%;
  box-sizing: border-box;

  .keyboard-content {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
  }

  .keyboard-row {
    display: flex;
    justify-content: center;
    gap: 4px;
    margin-bottom: 6px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .key-item {
    flex: 1;
    max-width: 32px;
    height: 36px;
    background: #ffffff;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: #191a1b;
    cursor: pointer;
    user-select: none;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);

    &:active {
      background: #e5e7eb;
    }

    &.disabled {
      background: transparent;
      box-shadow: none;
      cursor: default;
    }

    &.special {
      max-width: 50px;
      background: #a3a3a3;
      color: #ffffff;

      &:active {
        background: #737373;
      }
    }
  }
}

// 换车弹框样式
.change-car-content {
  .search-box {
    margin-bottom: 12px;

    .search-input-wrapper {
      // display: flex;
      // align-items: center;
      // height: 30px;
      // background: rgba(216, 216, 216, 0.3);
      // border-radius: 15px;
      // padding: 0 4px;

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
.signature-channel-picker {
  div:first-child {
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }
  div:last-child {
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
  }
  .picker-item:last-child {
    border-top: 1px solid #e6e6e5;
  }
}

// 二次确认提示框样式
:deep(.confirm-dialog) {
  background: #ffffff;
  border-radius: 8px;
  width: 295px;

  .van-dialog__content {
    padding: 0;
  }
}

.confirm-dialog-content {
  padding: 32px 24px 16px;

  .confirm-section {
    margin-bottom: 24px;

    &:last-of-type {
      margin-bottom: 0;
    }

    &:last-of-type {
      margin-bottom: 0;
    }
  }

  .confirm-title {
    font-size: 16px;
    font-weight: 500;
    color: #191a1b;
    margin-bottom: 8px;
  }

  .confirm-message {
    font-size: 14px;
    color: #545454;
    line-height: 22px;
  }

  .confirm-btn {
    width: 100%;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: #009100;
    border-top: 0.5px solid #e6e6e5;
    margin-top: 24px;
  }
}

// 三包预警提示框样式
:deep(.warranty-alert-dialog) {
  background: #ffffff;
  border-radius: 8px;
  width: 295px;
  max-height: 80vh;
  overflow-y: auto;

  .van-dialog__content {
    padding: 0;
  }
}

.warranty-alert-content {
  padding: 32px 24px 16px;

  .alert-section {
    margin-bottom: 24px;

    &:last-of-type {
      margin-bottom: 0;
    }

    .section-title {
      font-size: 16px;
      font-weight: 500;
      color: #191a1b;
      margin-bottom: 8px;
    }

    .section-message {
      font-size: 14px;
      color: #545454;
      line-height: 22px;
      margin-bottom: 12px;
    }

    .section-action-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 6px 16px;
      font-size: 14px;
      color: #009100;
      border: 1px solid #009100;
      border-radius: 38px;
      width: 100%;
    }
  }

  .warranty-alerts {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .warranty-alert-card {
      background: #f8e8e8;
      border-radius: 4px;
      padding: 8px;

      .alert-header {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-bottom: 4px;

        .alert-tag {
          font-size: 12px;
          padding: 1px 4px;
          border-radius: 4px;
          color: #ffffff;

          &.red {
            background: #b91919;
          }

          &.green {
            background: #009100;
          }

          &.yellow {
            background: #c8a12b;
          }
        }

        .alert-title {
          font-size: 14px;
          font-weight: 500;
          color: #b91919;
        }
      }

      .alert-partno {
        font-size: 14px;
        font-weight: 500;
        color: #b91919;
        margin-bottom: 8px;
      }

      .alert-details {
        .alert-detail-item {
          font-size: 14px;
          color: #3b3e3b;
          line-height: 22px;
        }
      }

      // 根据预警级别设置标题和零部件号颜色
      &.red {
        .alert-title,
        .alert-partno {
          color: #b91919;
        }
      }

      &.green {
        .alert-title,
        .alert-partno {
          color: #009100;
        }
      }

      &.yellow {
        .alert-title,
        .alert-partno {
          color: #c8a12b;
        }
      }
    }
  }

  .alert-confirm-btn {
    width: 100%;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: #009100;
    border-top: 0.5px solid #e6e6e5;
    margin-top: 24px;
  }
  .info-title,
  .section-title {
    color: #191a1b;
    font-weight: 600;
    margin-bottom: 8px;
  }
  .info-content,
  .section-message {
    color: #545454;
  }
}

.loading-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.action-sheet-item {
  padding: 12px;
  text-align: center;
  font-size: 16px;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
}

.action-sheet-item:last-child {
  border-bottom: none;
}
</style>
