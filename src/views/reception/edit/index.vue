<template>
  <div class="work-order-create">
    <!-- 车辆信息卡片 -->
    <div class="vehicle-card">
      <div class="plate-row">
        <span class="plate-no">{{ detail.plateNo }}</span>
        <span class="appointment-tag">{{ detail.custTypeLabel || '随到客户' }}</span>
        <span
          v-if="!isSettled && Number(detail.orderStatus) === RepairOrderStatusEnum.RECEPTION_INSPECTION"
          class="edit-plate edit-plate-after"
          @click="onChangeCar"
        >
          <span style="position: relative; top: 2px;"><img src="@/assets/image/change-car.svg" alt="" /></span>
          <span>换车</span>
        </span>
        <span
          v-if="Number(detail.orderStatus) !== RepairOrderStatusEnum.DELIVERED && Number(detail.orderStatus) !== RepairOrderStatusEnum.CANCEL"
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
        <span class="value">{{ detail.startWarrantyDate }} 至 {{ detail.endWarrantyDate }}</span>
      </div>
      <div class="info-row">
        <span class="label">车主：</span>
        <span class="value">{{ detail.customerName }} {{ detail.customerPhone }}</span>
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
                <!-- <span class="tag">[{{ detail.repairPersonTag }}]</span> -->
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
      <BusinessTypeSelector v-model="detail.businessType" :readonly="detail.isAppointment" />
    </div>

    <!-- Tab导航 -->
    <van-tabs v-model:active="activeTab" sticky offset-top="42px" @scroll="onTabScroll">
      <van-tab title="环检信息" name="inspection">
        <div class="tab-content">
          <div class="inspection-info">
            <!-- 进店里程数 -->
            <div class="section-card borderB" data-scroll-target="mileage">
              <div class="section-title section-field">
                <div><span class="required">*</span>进店里程数</div>
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
            <div v-if="detail.departureMileage" class="section-card borderB">
              <div class="section-title">
                <div>离店里程数</div>
                <div class="editable-value">
                  <span class="number">{{ detail.departureMileage }}</span>
                  <span class="unit">km</span>
                </div>
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
                <span v-if="!isSettled && interiorConfig.required === '1'" style="color: #b91919; font-size: 15px"
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
                    v-if="!isSettled"
                    class="delete_icon"
                    src="@/assets/image/delete_icon.png"
                    @click="handleInteriorDelete(file)"
                  />
                </div>
                <div
                  v-if="!isSettled && detail.interiorImages.length < (interiorConfig.maxNum || 3)"
                  class="upload-box upload-placeholder"
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
                <span v-if="!isSettled && exteriorConfig.required === '1'" style="color: #b91919; font-size: 15px"
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
                    v-if="!isSettled"
                    class="delete_icon"
                    src="@/assets/image/delete_icon.png"
                    @click="handleExteriorDelete(file)"
                  />
                </div>
                <div
                  v-if="!isSettled && detail.exteriorImages.length < (exteriorConfig.maxNum || 3)"
                  class="upload-box upload-placeholder"
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
          <FaultInfoSection
            v-model:current-fault="detail.currentFault"
            v-model:customer-fault-desc="detail.customerFaultDesc"
            v-model:fault-modules="detail.faultModules"
            mode="edit"
            :service-proxy-id="detail.id"
            :readonly="isFaultReadonly"
            :confirm-fault="detail.confirmFault"
            :loading="isDataLoading"
            @change="saveDataSnapshot"
          />
        </div>
      </van-tab>

      <van-tab v-if="isSaved && Number(detail.orderStatus) !== RepairOrderStatusEnum.RECEPTION_INSPECTION" title="项目零件" name="parts">
        <div
          class="tab-content parts-tab"
          style="min-height: 54vh"
        >
          <!-- 费用汇总 -->
          <div
            v-if="partsData.repairItemRespList.length > 0 || partsData.sparePartRespList.length > 0"
            style="padding: 12px; background: #fff"
          >
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

          <!-- 维修项目零件内容 - 已生成结算单时按 detail 格式只读展示 -->
          <template v-if="isSettled">
            <div style="padding: 12px">
              <!-- 维修项目列表（非套餐） -->
              <div v-if="nonPackageItems.length > 0">
                <div class="section-title" style="margin-bottom: 8px">维修项目</div>
                <div
                  v-for="(item, i) in nonPackageItems"
                  :key="'item-' + i"
                  class="parts-item-card"
                >
                  <div class="item-main">
                    <div class="item-left">
                      <div class="item-name">{{ item.repairItemName || item.name }}</div>
                      <div class="item-code">{{ item.repairItemCode || item.code }}</div>
                      <div class="item-code">
                        {{ item.repairItemTypeName }}-{{ item.checkoutTypeName }}-{{ item.warrantyTypeName }}
                      </div>
                    </div>
                    <div class="item-right">
                      <div class="item-amount">¥{{ item.price }} × {{ item.quantity || item.workHour }}</div>
                      <div v-if="item.discountAmount" class="item-discount">-¥{{ item.discountAmount }}</div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- 维修配件列表（非套餐） -->
              <div v-if="nonPackageParts.length > 0">
                <div class="section-title" style="margin: 12px 0 8px">维修配件</div>
                <div
                  v-for="(item, i) in nonPackageParts"
                  :key="'part-' + i"
                  class="parts-item-card"
                >
                  <div class="item-main">
                    <div class="item-left">
                      <div class="item-name">{{ item.partsName || item.name }}</div>
                      <div class="item-code">{{ item.partsCode || item.code }}</div>
                      <div class="item-code">
                        {{ item.repairItemTypeName }}-{{ item.checkoutTypeName }}-{{ item.warrantyTypeName }}
                      </div>
                    </div>
                    <div class="item-right">
                      <div class="item-amount">¥{{ item.price }} × {{ item.quantity }}</div>
                      <div v-if="item.discountAmount" class="item-discount">-¥{{ item.discountAmount }}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                v-if="nonPackageItems.length === 0 && nonPackageParts.length === 0"
                class="empty-state"
              >
                暂无项目零件数据
              </div>
            </div>
          </template>
          <div v-else>
            <RepairItemContent
              ref="repairItemContentRef"
              :service-proxy-id="route.query.id"
              :initial-items="partsData.repairItemRespList"
              :initial-parts="partsData.sparePartRespList"
              isComponent
              isReplace
              @replace="handlePartsReplace"
              @delete="handlePartsDelete"
            />
          </div>

        </div>
      </van-tab>

      <van-tab v-if="isSaved && Number(detail.orderStatus) !== RepairOrderStatusEnum.RECEPTION_INSPECTION" title="签字确认" name="signature">
        <div class="tab-content signature-tab">
          <!-- 费用合计 -->
          <div class="signature-section">
            <div class="signature-row">
              <span class="label">费用合计</span>
              <span class="value">¥{{ computedTotalCost }}</span>
            </div>
            <div class="signature-row">
              <span class="label">维修类型（汇总）</span>
              <span class="value">{{ signatureData.repairItemTypeDetailCollect }}</span>
            </div>
            <div class="signature-row" @click="onOpenDeliveryTimePicker">
              <span class="label">预计交车时间</span>
              <div class="value-wrapper">
                <span :class="['value', { placeholder: !signatureData.expectFinishAt }]">
                  {{ signatureData.expectFinishAt || '请选择' }}
                </span>
                <van-icon
                  v-if="Number(detail.orderStatus) !== RepairOrderStatusEnum.DELIVERED && Number(detail.orderStatus) !== RepairOrderStatusEnum.CANCEL"
                  name="arrow"
                  size="12"
                  color="#545454"
                  style="height: 9px;"
                />
              </div>
            </div>
            <!-- <div class="signature-row">
              <span class="label">开启维修直播</span>
              <van-switch v-model="signatureData.liveEnabled" size="20" active-color="#009100" />
            </div> -->
            <div v-if="Number(detail.signStatus) === SignStatusEnum.SIGNED || Number(detail.signChannel) === SignChannelEnum.PAPER" class="signature-row">
              <span class="label">签字渠道</span>

              <div class="value-wrapper">
                <span :class="['value', { placeholder: !signatureData.signChannel }]">
                  {{ signatureData.signChannel || '请选择' }}
                </span>
                <!-- <van-icon v-if="Number(detail.signStatus) !== 20 && Number(detail.signStatus) !== 10" name="arrow" size="12" color="#545454" /> -->
              </div>
            </div>
            <!-- APP/短信/零小跑渠道提示 -->
            <!-- <div v-if="signatureData.signChannel === 'APP/短信/零小跑' && Number(detail.signStatus) === 20" class="signature-hint">
              此操作将生成待签字施工单且需要用户签字
            </div> -->
            <!-- 已签字状态显示 -->
            <!-- <div class="signature-row" v-if="Number(detail.signStatus) === 20">
              <span class="label">签字状态</span>
              <div class="value-wrapper">
                <span class="value signed">已签字</span>
              </div>
            </div> -->
            <!-- 待签字状态显示 -->
            <div class="signature-row" v-if="!isSettled && Number(detail.signStatus) === SignStatusEnum.PENDING_SIGN">
              <span class="label">签字状态</span>
              <div class="value-wrapper">
                <div
                  class="signature-action-row"
                >
                  <van-button v-if="permissionStore.hasPermission('AISMC-app-serviceProxy-confirmToSign')" type="primary" size="small" @click="onConfirmAndSign">邀请客户签字</van-button>
                </div>
              </div>
            </div>
            <div
              class="signature-action-row"
              v-if="Number(detail.signStatus) === SignStatusEnum.SIGNED && Number(detail.signChannel) === SignChannelEnum.LXPAO"
            >
              <van-button type="primary" size="small" @click="onViewSignature">查看签字</van-button>
            </div>
            <!-- 未签字状态显示 -->
            <!-- <div class="signature-row" v-if="Number(detail.signStatus) !== 20 && Number(detail.signStatus) !== 10">
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
              <span v-if="!isSettled && attachmentConfig.required === '1'" style="color: #b91919; font-size: 15px"
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
                  v-if="!isSettled"
                  class="delete_icon"
                  src="@/assets/image/delete_icon.png"
                  @click="handleAttachmentDelete(file)"
                />
              </div>
              <div
                v-if="!isSettled && signatureData.attachments.length < (attachmentConfig.maxNum || 20)"
                class="upload-box upload-placeholder"
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

    <!-- 添加零件浮动栏 -->
    <div v-if="!isSettled && activeTab === 'parts'" class="add-parts-bar">
      <div v-if="permissionStore.hasPermission('AISMC-app-serviceProxy-repairItem-save')" class="add-btn" @click="onAddParts">
        <van-icon name="plus" />
        <span>添加项目/零件</span>
      </div>
      <div v-if="permissionStore.hasPermission('AISMC-app-serviceProxy-repairItem-save')" class="add-btn" @click="onAddPackage">
        <van-icon name="plus" />
        <span>添加套餐及其他</span>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="bottom-bar">
      <span v-if="!isCanceled && activeTab === 'inspection'" class="more-btn" @click="onMore">更多</span>
      <template v-if="activeTab === 'inspection'">
        <span v-if="permissionStore.hasPermission('AISMC-app-serviceProxy-addOrUpdate')" class="save-btn" @click="onInspectionSave">保存</span>
        <span v-if="!isSettled && !detail.previewingFinishAt && permissionStore.hasPermission('AISMC-app-serviceProxy-precheck')" class="complete-btn" @click="onComplete"
          >预检确认</span
        >
      </template>
      <template v-else-if="activeTab === 'parts'">
        <span
          v-if="!isSettled && permissionStore.hasPermission('AISMC-app-serviceProxy-repairItem-save')"
          class="save-btn"
          @click="onPartsSave"
          >保存</span
        >
      </template>
      <template v-else-if="activeTab === 'signature'">
        <span
          v-if="Number(detail.orderStatus) !== RepairOrderStatusEnum.DELIVERED && Number(detail.orderStatus) !== RepairOrderStatusEnum.CANCEL && permissionStore.hasPermission('AISMC-app-serviceProxy-addOrUpdate')"
          class="save-btn"
          @click="onSaveDeliveryTime"
          >保存</span
        >
        <span
          v-if="showConfirmAndSignBtn && permissionStore.hasPermission('AISMC-app-serviceProxy-confirmToSign')"
          :class="['complete-btn', { disabled: isConfirmAndSignDisabled }]"
          @click="onConfirmAndSignClick"
          >制单确认并签字</span
        >
      </template>
    </div>
    <!-- 更换车牌 -->
    <PlateKeyboard
      v-model:show="changePlateDialog"
      v-model="detail.plateNo"
      title="实名认证车辆"
      :subtitle="'原车牌：' + detail.plateNo"
      :exclude-vin="detail.vin"
    />
    <!-- 换车弹框 -->
    <ChangeCarPopup v-model:show="changeCarDialog" @confirm="onChangeCarSelected" />
    <!-- 预计交车时间选择器 -->
    <DateTimePicker
      v-model:show="showDeliveryTimePicker"
      v-model="signatureData.expectFinishAt"
      title="预计交车时间"
      :max-date="maxDeliveryDate"
      :min-time="minTime"
    />

    <!-- 签字渠道选择器 -->
    <ais-popup
      :show="showSignatureChannelPicker"
      position="bottom"
      title="选择签字渠道"
      @close="onCancelSignatureChannel"
      :style="{ background: '#f4f4f4', height: '35%' }"
    >
      <template #content>
        <div class="signature-channel-picker">
          <div
            v-for="(item, index) in signatureChannelList"
            :key="index"
            :class="['picker-item', { active: tempSignatureChannel === item.label }]"
            @click="tempSignatureChannel = item.label"
          >
            <div class="channel-content">
              <span class="channel-text">{{ item.label }}</span>
              <span v-if="item.value === 30" class="channel-hint"
                >将生成待签字施工单且需要用户签字</span
              >
            </div>
            <van-icon
              v-if="tempSignatureChannel === item.label"
              name="success"
              size="16"
              color="#009100"
            />
          </div>
        </div>
      </template>
      <template #footer>
        <div class="signature-channel-footer">
          <div class="cancel-btn" @click="onCancelSignatureChannel">取消</div>
          <div class="confirm-btn" @click="onConfirmSignatureChannel">确定</div>
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
          <template v-if="item.type === RemindInfoTypeEnum.PRE_AUTH">
            <div v-if="detail.isCreatePreAuth !== 1" class="alert-section">
              <div class="section-title">{{ item.typeLabel }}</div>
              <div class="section-message">{{ item.content || '暂无提醒信息' }}</div>
              <div v-if="permissionStore.hasPermission('AISMC-app-preAuth-addOrUpdate')" class="section-action-btn" @click="onGenerateAuthorization">生成预授权</div>
            </div>
            <div v-else>
              <div class="info-title">{{ item.typeLabel }}</div>
            <div class="info-content">{{ item.content || '暂无提醒信息' }}</div>
            </div>
          </template>
          <!-- 三包预警 -->
          <div v-else-if="item.type === RemindInfoTypeEnum.THREE_GUARANTEES" class="alert-section">
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
                <div v-if="Array.isArray(alarm.contents)" style="color: #373535; font-size: 13px;">
                  <div v-for="(content, cIndex) in alarm.contents" :key="cIndex">{{ content }}</div>
                </div>
                <div v-else style="color: #373535; font-size: 13px;">{{ alarm.contents }}</div>
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
          <!-- 差价提醒 -->
          <template v-else-if="item.type === RemindInfoTypeEnum.PRICE_DIFFERENCE">
            <div class="info-title">{{ item.typeLabel }}</div>
            <div class="info-content">{{ item.content || '暂无提醒信息' }}</div>
          </template>
          <!-- 车辆标识 -->
          <template v-else-if="item.type === RemindInfoTypeEnum.VEHICLE_FLAG">
            <div class="info-title">{{ item.typeLabel }}</div>
            <div class="info-content"><span style="white-space: nowrap">该车辆为</span><span v-for="(tag, index) in item.content.split(',')" :key="index" style="white-space: nowrap">【{{ tag }}】</span>，请注意接待</div>
          </template>
        </template>

      </div>
      <div class="alert-confirm-btn" @click="onConfirmWarrantyAlert">我知道了</div>
    </van-dialog>

    <!-- 套餐详情弹窗 -->
    <PackageDetailPopup
      :show="showPackageDetail"
      :package-data="selectedPackageDetail"
      :show-cancel="false"
      @close="showPackageDetail = false"
    />

    <!-- 全屏Loading -->
    <van-overlay :show="savingLoading">
      <div class="loading-wrapper">
        <van-loading size="24px" vertical color="#009100">请稍候...</van-loading>
      </div>
    </van-overlay>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showConfirmDialog, showImagePreview, closeToast, showLoadingToast } from 'vant'
import { useGlobalStore } from '@/stores/global'
import { usePermissionStore } from '@/stores/permission'
import { usePageSafeArea } from '@/utils/safeArea'
import AisPopup from '@/libs/components/AisPopup.vue'
import PackageDetailPopup from '@/components/PackageDetailPopup.vue'
import RepairItemContent from '@/components/SelectRepairItem/RepairItemContent.vue'
import dayjs from 'dayjs'
import {
  uploadFileByUrl,
  getUploadConfig,
  getFileList
} from '@/libs/api/fileConfig'
import { batchUploadImageLimit } from '@/libs/utils/nativeFn'
import { RemindInfoTypeEnum } from '@/views/repairWork/constant'
import {
  RepairOrderStatusEnum,
  SignChannelEnum,
  SignStatusEnum,
  CurrentFaultEnum,
  ConfirmFaultEnum,
  FAULT_REMIND_MESSAGE
} from '../constant'
import {
  getDetail,
  getVehicleMileage,
  serviceAddOrUpdate,
  servicePreCheck,
  getRemindInfo,
  saveSpRepairItem,
  spConfirmAndSign,
  serviceProxyCancel,
  checkFault,
  createRetention
} from '@/api/reception'
import { preAuthAddOrUpdate } from '@/api/authorization'
import {
  getFilePreviewUrl,
  getFileType,
  formatPhotoList,
  hasDuplicateFileId,
  getAlarmColor,
  getAlarmLabel,
  validateMileage,
  validateRepairPerson as _validateRepairPerson,
  scrollToErrorField,
  getAttachConfig as _getAttachConfig,
  getTargetFileList as _getTargetFileList,
  handleFileDelete as _handleFileDelete,
  validateAloneOrder,
  applyRecentInspectionByVin,
  hasFaultRemindType,
  validateFileExtension,
  isUploadSilentFailure,
  refreshAttachmentList
} from '@/utils/receptionCommon'
import PlateKeyboard from '@/libs/components/PlateKeyboard.vue'
import DateTimePicker from '@/libs/components/DateTimePicker.vue'
import ChangeCarPopup from '../components/ChangeCarPopup.vue'
import FaultInfoSection from '../components/FaultInfoSection.vue'
import BusinessTypeSelector from '../components/BusinessTypeSelector.vue'
import '../create/create.scss'

const route = useRoute()
const router = useRouter()
const globalStore = useGlobalStore()
const permissionStore = usePermissionStore()
usePageSafeArea({ bodyClass: 'ais-page-nav-safe-area' })
// 换车
const changeCarDialog = ref(false)
const changePlateDialog = ref(false)

// 数据加载标志（用于区分用户手动操作和数据赋值）
const isDataLoading = ref(false)

// RepairItemContent 组件引用
const repairItemContentRef = ref(null)

// 图片上传相关
const currentUploadType = ref('') // 'interior' or 'exterior'
const uploadConfig = ref({})

// 根据附件类型获取配置
// 上传配置获取已从 receptionCommon 导入，此处为组件绑定
const getAttachConfig = (attachType) => _getAttachConfig(attachType, uploadConfig)

// 车内照片配置
const interiorConfig = computed(() => getAttachConfig('车内照片'))
// 车外照片配置
const exteriorConfig = computed(() => getAttachConfig('车外照片'))
// 附件资料配置
const attachmentConfig = computed(() => getAttachConfig('附件资料'))

// 业务类型计算：优先使用已有值，否则根据是否预约判断
const computedBusinessType = computed(() => {
  return detail.businessType || (detail.isAppointment ? 50 : 10)
})

// getFilePreviewUrl、formatPhotoList 已从 receptionCommon 导入

// 施工单状态
const isSaved = ref(false) // 是否已保存

// 三包预警提示框
const showWarrantyAlertDialog = ref(false)
const remindList = ref([])

// 过滤出实际会渲染可见内容的提醒项（与模板 v-if/v-else-if 条件保持一致）
// const visibleRemindList = computed(() => {
//   return remindList.value.filter((item) => {
//     // 预授权：已创建预授权时内层 v-if 会隐藏内容
//     if (item.type === RemindInfoTypeEnum.PRE_AUTH && detail.isCreatePreAuth === 1) return false
//     // 已识别的类型都会渲染
//     const knownTypes = [
//       RemindInfoTypeEnum.PRE_AUTH,
//       RemindInfoTypeEnum.THREE_GUARANTEES,
//       RemindInfoTypeEnum.SERVICE_ACTIVITY,
//       RemindInfoTypeEnum.PRICE_DIFFERENCE,
//       '5'
//     ]
//     return knownTypes.includes(item.type)
//   })
// })

const onGenerateAuthorization = async() => {
  // 生成预授权
  try {
    showLoadingToast({ message: '请稍候...', forbidClick: true })
    const res = await preAuthAddOrUpdate({ serviceProxyId: detail.id || route.query.id })
    closeToast()
    if (res.code === 200) {
      showToast('已成功生成预授权申请，您可至预授权申请管理查看数据并提交审批')
      showWarrantyAlertDialog.value = false
      fetchDetail()
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

// 初始化数据
// 送修人类型选择
const repairPersonType = ref('other') // owner/bindingUser/other
const repairPersonNameInput = ref('')
const repairPersonPhoneInput = ref('')

// 折叠面板状态
const repairPersonCollapse = ref([])

// 更多操作列表 - 动态计算作废按钮状态
const moreActionsList = computed(() => {
  // 已作废210、反结算200、已生成结算单(isCreateStatementInfo == 1)时，作废禁用
  const isCancelDisabled =
    detail.orderStatus === RepairOrderStatusEnum.CANCEL || detail.orderStatus === RepairOrderStatusEnum.ANTI_SETTLEMENT || detail.isCreateStatementInfo === 1

  // 获取禁用原因文本
  let disabledReason = ''
  if (detail.orderStatus === RepairOrderStatusEnum.CANCEL) {
    disabledReason = '已作废'
  } else if (detail.orderStatus === RepairOrderStatusEnum.ANTI_SETTLEMENT) {
    disabledReason = '反结算'
  } else if (detail.isCreateStatementInfo === 1) {
    disabledReason = '已生成结算单'
  }

  return [
    { name: '权益查询', tag: '1', color: '#191a1b' },
    { name: '维修履历', tag: '2', color: '#191a1b' },
    { name: '实时故障', tag: '3', color: '#191a1b' },
    ...(
      permissionStore.hasPermission('AISMC-app-serviceProxy-cancel')
        ? [{
          name: '作废',
          tag: '4',
          color: isCancelDisabled ? '#888888' : '#191a1b',
          disabled: isCancelDisabled,
          disabledReason: disabledReason
        }]
        : []
    )
  ]
})

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
        id: route.query.id
      }
    })
  }
  if (action.name === '权益查询') {
    router.push({
      path: '/reception/rights-query',
      query: {
        id: detail.id,
        vin: detail.vin
      }
    })
  }
  if (action.name === '实时故障') {
    window.location.href = `${window.APP_AIS_H5_CONFIG?.VITE_STATIC_RES_URL || import.meta.env.VITE_STATIC_RES_URL}/leapx/batteryDiagnosis?vin=${detail.vin}&vehicleModel=${detail.vehSeriesName}&token=${localStorage.getItem('lxpToken')}`
    // router.push({
    //   path: `${window.APP_AIS_H5_CONFIG?.VITE_STATIC_RES_URL || import.meta.env.VITE_STATIC_RES_URL}/leapx/batteryDiagnosis?vin=${detail.vehProfileVin}&vehicleModel=${detail.vehModelId}`,
    //   query: {
    //     vin: detail.vehProfileVin,
    //   },
    // })
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
      id: route.query.id,
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

const onTabScroll = (e) => {
  if (e.isFixed) {
    // 触发吸顶时设置标题
    globalStore.setTitle(detail.plateNo)
  } else {
    globalStore.setTitle('施工单详情')
  }
}
// Tab状态
const activeTab = ref('inspection')
// 选择器显示状态
const showMoreActions = ref(false)

// 详情数据
const detail = reactive({
  id: '', // 施工单ID
  plateNo: '',
  custTypeLabel: '',
  isAppointment: false,
  vehicleModel: '',
  vehicleModelName: '',
  vin: '',
  vehicleModelId: '',
  warrantyDate: '',
  customerName: '',
  customerPhone: '',
  bindingUser: '',
  binderPhone: '',
  shuttleName: '',
  shuttlePhone: '',
  bindingUserId: '',
  repairPerson: '',
  repairPersonPhone: '',
  repairPersonTag: '送修人',
  businessType: null, // 初始为null，后续根据isAppointment计算
  mileage: '',
  departureMileage: '',
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
  confirmFault: '',
  faultModules: [],
  customerFaultDesc: '',
  testResult: '',
  // 新增字段
  code: '',
  dataSource: '',
  orderStatus: '',
  warrantyTypeCollect: '',
  custType: '',
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
  outPower: '',
  departureNetMileage: '',
  outNetPower: '',
  departureNetMileageElectricity: '',
  departureNetMileageExtend: '',
  electricalMileage: '',
  motorModel: '',
  motorSerialNumber: '',
  batteryModel: '',
  batterySerialNumber: '',
  enginenNumber: '',
  repairItemTypeDetailCollect: '',
  alarmLevel: '',
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

// 保存数据快照（保存成功后同步调用，确保返回拦截判断准确）
const saveDataSnapshot = () => {
  initialInspectionData.value = {
    mileage: detail.mileage,
    battery: detail.battery,
    interiorImages: [...detail.interiorImages],
    exteriorImages: [...detail.exteriorImages],
    abnormalDesc: detail.abnormalDesc,
    customerComment: detail.customerComment,
    currentFault: detail.currentFault,
    customerFaultDesc: detail.customerFaultDesc,
    businessType: detail.businessType,
    repairPerson: detail.repairPerson,
    repairPersonPhone: detail.repairPersonPhone,
    faultModules: [...detail.faultModules],
    plateNo: detail.plateNo,
    vin: detail.vin,
    vehicleModel: detail.vehicleModel,
    repairPersonTag: detail.repairPersonTag,
    testResult: detail.testResult,
    repairItemRespList: JSON.parse(JSON.stringify(partsData.repairItemRespList)),
    sparePartRespList: JSON.parse(JSON.stringify(partsData.sparePartRespList)),
    repairItemTypeDetailCollect: detail.repairItemTypeDetailCollect,
    expectFinishAt: signatureData.expectFinishAt
  }
}

// 按 id 去重，防止并发请求或异步回调导致列表中出现重复数据
const deduplicateById = (list) => {
  const seen = new Set()
  return list.filter((item) => {
    if (!item.fileId || seen.has(item.fileId)) return false
    seen.add(item.fileId)
    return true
  })
}

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
    // 车辆信息
    initial.plateNo !== current.plateNo ||
    initial.vin !== current.vin ||
    initial.vehicleModel !== current.vehicleModel ||
    // 送修人信息
    initial.repairPersonTag !== current.repairPersonTag ||
    // 经理建议
    initial.testResult !== current.testResult
  )
}

// 检查项目零件数据是否有改动
const hasPartsDataChanged = () => {
  if (!initialInspectionData.value) return false
  const initial = initialInspectionData.value
  return (
    JSON.stringify(initial.repairItemRespList) !== JSON.stringify(partsData.repairItemRespList) ||
    JSON.stringify(initial.sparePartRespList) !== JSON.stringify(partsData.sparePartRespList)
  )
}

// 检查预计交车时间是否有改动
const hasDeliveryTimeChanged = () => {
  if (!initialInspectionData.value) return false
  return initialInspectionData.value.expectFinishAt !== signatureData.expectFinishAt
}

// 检查文件列表中是否有重复的fileId
// hasDuplicateFileId 已从 receptionCommon 导入

// 项目零件数据
const partsData = reactive({
  workCostCount: '',
  barkCostCount: '',
  maintenanceCostEstimation: '',
  repairItemRespList: [],
  packageRespList: [],
  sparePartRespList: []
})

// 套餐详情弹窗
const showPackageDetail = ref(false)
const selectedPackageDetail = ref({
  name: '',
  code: '',
  itemRespList: []
})

// 签字确认数据
const signatureData = reactive({
  maintenanceCostEstimation: '',
  repairItemTypeDetailCollect: '',
  expectFinishAt: '',
  isDeliveryTimeFromApi: false,
  signChannel: '',
  attachments: []
})

// 从组件数据计算费用（computed 实现联动）
const computedWorkCost = computed(() => {
  const items = partsData.repairItemRespList || []
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
  const parts = partsData.sparePartRespList || []
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

// 制单确认并签字按钮是否禁用：需要预计交车时间
const isConfirmAndSignDisabled = computed(() => {
  if (Number(detail.signStatus) === SignStatusEnum.PENDING_SIGN) {
    return false
  }
  return !signatureData.expectFinishAt
})

// 重新计算费用合计
const recalculateCosts = () => {
  // 计算维修项目费用
  const workCost = (partsData.repairItemRespList || []).reduce((sum, item) => {
    return sum + (Number(item.price) * Number(item.workHour) - Number(item.discountAmount))
  }, 0)
  partsData.workCostCount = workCost.toFixed(2)

  // 计算维修配件费用
  const partsCost = (partsData.sparePartRespList || []).reduce((sum, item) => {
    return sum + (Number(item.price) * Number(item.quantity) - Number(item.discountAmount))
  }, 0)
  partsData.barkCostCount = partsCost.toFixed(2)

  // 费用合计
  const total = workCost + partsCost
  partsData.maintenanceCostEstimation = total.toFixed(2)
  signatureData.maintenanceCostEstimation = total.toFixed(2)
}

// 监听维修项目数量变化
watch(
  () => partsData.repairItemRespList,
  () => {
    recalculateCosts()
  },
  { deep: true }
)

// 监听维修配件数量变化
watch(
  () => partsData.sparePartRespList,
  () => {
    recalculateCosts()
  },
  { deep: true }
)

// 选择器显示状态
const showDeliveryTimePicker = ref(false)
const showSignatureChannelPicker = ref(false)
const tempSignatureChannel = ref('')

const maxDeliveryDate = new Date(Date.now() + 100 * 86400000)
const minTime = dayjs().format('HH:mm:ss')

// 签字渠道列表
const signatureChannelList = ref([
  { value: SignChannelEnum.PAPER, label: '纸质单据' },
  { value: SignChannelEnum.LXPAO, label: 'APP/短信/零小跑' }
])

// 签字渠道转换（为空时默认为APP/短信/零小跑）
const getSignChannelName = (channel) => {
  const channelMap = {
    [SignChannelEnum.PAPER]: '纸质单据',
    [SignChannelEnum.SMS]: 'APP/短信/零小跑',
    [SignChannelEnum.APP]: 'APP/短信/零小跑',
    [SignChannelEnum.LXPAO]: 'APP/短信/零小跑'
  }
  return channelMap[channel] || 'APP/短信/零小跑'
}

// 里程校验
// validateMileage 已从 receptionCommon 导入

// 获取详情
const fetchDetail = async(cb) => {
  const id = route.query.id
  if (!id) return

  savingLoading.value = true
  isDataLoading.value = true // 开始数据加载
  try {
    const res = await getDetail(id)
    if (res.code === 200) {
      const data = res.data
      // 填充详情数据
      detail.plateNo = data.carPlate || ''
      detail.isAppointment = !!data.appointmentNo // 有预约单号即为预约客户
      detail.custTypeLabel = data.custTypeLabel || ''
      detail.vehicleModel = data.vehModelName || ''
      detail.vehicleModelName = data.vehModelName || ''
      detail.vehicleModelId = data.vehModelId || ''
      detail.vehSeriesName = data.vehSeriesName || ''
      detail.vin = data.vehProfileVin || ''
      detail.customerName = data.customerName || ''
      detail.customerPhone = data.customerPhone || ''
      detail.bindingUser = data.bindingUser || ''
      detail.binderPhone = data.bindingPhone || ''
      detail.bindingUserId = data.bindingUserId || ''
      detail.shuttleName = data.shuttleName || ''
      detail.shuttlePhone = data.shuttlePhone || ''
      detail.repairPerson = data.shuttleName || data.customerName || ''
      detail.repairPersonPhone = data.shuttlePhone || data.customerPhone || ''
      detail.startWarrantyDate = data.startWarrantyDate || ''
      detail.endWarrantyDate = data.endWarrantyDate || ''
      // 计算送修人类型
      // detail.repairPersonTag =
      //   detail.repairPerson === data.customerName
      //     ? '车主'
      //     : detail.repairPerson === data.bindingUser
      //       ? '绑车人'
      //       : '其他'
      detail.id = data.id || ''
      detail.testResult = data.testResult || ''
      // 预约客户默认预约到店，否则默认自然到店
      detail.businessType = data.businessType || (detail.isAppointment ? 50 : 10)
      detail.mileage = data.mileage || ''
      detail.departureMileage = data.departureMileage || ''
      detail.networkMileageTotal = data.netMileage || ''
      detail.networkMileageAdd = data.netMileageExtend || ''
      detail.battery = data.inPower || ''
      detail.networkBattery = data.inNetPower || ''
      detail.abnormalDesc = data.anomalyDescription || ''
      detail.customerComment = data.customerComment || ''
      detail.currentFault = data.currentFault != null ? String(data.currentFault) : ''
      detail.confirmFault = data.confirmFault
      detail.customerFaultDesc = data.customerContent || ''
      detail.faultAlertRecordRespList = data.faultAlertRecordRespList || []
      // 将故障预警记录映射到faultModules用于显示
      detail.faultModules = (data.faultAlertRecordRespList || []).map((item) => ({
        ...item,
        cccCode: item.cccCode,
        cccName: item.cccName,
        vfgName: item.vfgName,
        faultDesc: item.faultDescription
      }))

      // 获取附件列表并分类回显
      const fileRes = await getFileList({
        businessId: route.query.id,
        sortColumns: [
          { 'column': 'id', 'sort': 'ASC' }
        ]
      })
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
          const fileObj = { ...item, url: item.fileUrl }
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
        // 按 id 去重，防止并发请求导致重复数据
        detail.interiorImages = deduplicateById(detail.interiorImages)
        detail.exteriorImages = deduplicateById(detail.exteriorImages)
        signatureData.attachments = deduplicateById(signatureData.attachments)
      }

      // 新增字段赋值
      detail.code = data.code || ''
      detail.dataSource = data.dataSource || ''
      detail.orderStatus = data.orderStatus || ''
      detail.warrantyTypeCollect = data.warrantyTypeCollect || ''
      detail.custType = data.custType || ''
      detail.salesDealerName = data.dealerName || ''
      detail.salesDealerCode = data.dealerCode || ''
      detail.appointmentNo = data.appointmentNo || ''
      detail.lastMileage = data.lastMileage || null
      detail.remark = data.remark || ''
      detail.status = data.status || ''
      detail.statusDesc = data.statusDesc || ''
      detail.pickStatus = data.pickStatus || ''
      detail.payType = data.payType || ''
      detail.warrantyCompany = data.warrantyCompany || ''
      detail.signChannel = data.signChannel || ''
      detail.signCompletedOn = data.signCompletedOn || ''
      detail.signGeneratedOn = data.signGeneratedOn || ''
      detail.signStatus = data.signStatus || ''
      detail.signUrlExpiredOn = data.signUrlExpiredOn || ''
      detail.appointmentType = data.appointmentType || ''
      detail.preAuthType = data.preAuthType || ''
      detail.isLockLive = data.isLockLive || ''
      detail.isCreateWarranty = data.isCreateWarranty || ''
      detail.isOutboundOrder = data.isOutboundOrder || ''
      detail.isVehRetentionRemind = data.isVehRetentionRemind || ''
      detail.isCancelStorage = data.isCancelStorage || ''
      detail.discountId = data.discountId || ''
      detail.finalCheckAt = data.finalCheckAt || ''
      detail.finalCheckerId = data.finalCheckerId || ''
      detail.finalChecker = data.finalChecker || ''
      detail.ticketStep = data.ticketStep || ''
      detail.warrantyStatus = data.warrantyStatus || ''
      detail.claimItemAmount = data.claimItemAmount || ''
      detail.claimOtherAmount = data.claimOtherAmount || ''
      detail.claimPartsAmount = data.claimPartsAmount || ''
      detail.departureMileage = data.departureMileage || ''
      detail.outPower = data.outPower || ''
      detail.departureNetMileage = data.departureNetMileage || ''
      detail.outNetPower = data.outNetPower || ''
      detail.departureNetMileageElectricity = data.departureNetMileageElectricity || ''
      detail.departureNetMileageExtend = data.departureNetMileageExtend || ''
      detail.electricalMileage = data.netMileageElectricity || ''
      detail.motorModel = data.motorModel || ''
      detail.motorSerialNumber = data.motorSerialNumber || ''
      detail.batteryModel = data.batteryModel || ''
      detail.batterySerialNumber = data.batterySerialNumber || ''
      detail.enginenNumber = data.engineNumber || ''
      detail.repairItemTypeDetailCollect = data.repairItemTypeDetailCollect || ''
      detail.alarmLevel = data.alarmLevel || ''
      detail.inCustomerContent = data.inCustomerContent || ''
      detail.customerComment = data.customerComment || ''
      detail.invaildDesc = data.invaildDesc || ''
      detail.previewingFinishAt = data.previewingFinishAt || ''
      detail.confirmedOn = data.confirmedOn || ''
      detail.expectStartAt = data.expectStartAt || ''
      detail.startAt = data.startAt || ''
      detail.finishAt = data.finishAt || ''
      detail.faultSolve = data.faultSolve || ''
      detail.faultAlert = data.faultAlert || ''
      detail.faultPeriod = data.faultPeriod || ''
      detail.earliestfaultServiceProxy = data.earliestfaultServiceProxy || ''
      detail.recentlyfaultServiceProxy = data.recentlyfaultServiceProxy || ''
      detail.isCreateStatementInfo = data.isCreateStatementInfo || 0
      detail.isPreAuth = data.isPreAuth || ''
      detail.isCreatePreAuth = data.isCreatePreAuth
      detail.preAuthRuleId = data.preAuthRuleId || ''
      detail.unresolvedReason = data.unresolvedReason || ''
      detail.faultDesc = data.faultDesc || ''
      detail.batteryUnitId = data.batteryUnitId || ''
      detail.batteryUnitName = data.batteryUnitName || ''
      detail.targetUnitCode = data.targetUnitCode || ''
      detail.beforeChangeCode = data.beforeChangeCode || ''
      detail.afterChangeCode = data.afterChangeCode || ''
      detail.isStoreLive = data.isStoreLive || ''
      detail.latelyServiceProxy = data.latelyServiceProxy || ''
      detail.earlyServiceProxy = data.earlyServiceProxy || ''

      // 签字确认数据
      signatureData.maintenanceCostEstimation =
        data.costCountResp?.maintenanceCostEstimation || '0.00'
      signatureData.repairItemTypeDetailCollect = data.repairItemTypeDetailCollect || ''
      signatureData.expectFinishAt = data.expectFinishAt || ''
      signatureData.isDeliveryTimeFromApi = !!data.expectFinishAt
      signatureData.signChannel = data.signChannelLabel || getSignChannelName(data.signChannel)

      // 项目零件数据
      if (data.costCountResp) {
        partsData.workCostCount = data.costCountResp.workCostCount || '0.00'
        partsData.barkCostCount = data.costCountResp.barkCostCount || '0.00'
        partsData.maintenanceCostEstimation =
          data.costCountResp.maintenanceCostEstimation || '0.00'
        partsData.repairItemRespList = data.costCountResp.repairItemRespList || []
        partsData.packageRespList = data.costCountResp.packageRespList || []
        partsData.sparePartRespList = data.costCountResp.sparePartRespList || []
      }

      // 设置送修人类型
      repairPersonType.value = 'other'
      repairPersonNameInput.value = detail.repairPerson
      repairPersonPhoneInput.value = detail.repairPersonPhone

      // 里程校验
      // validateMileage(data.mileage, data.lastMileage, data.netMileage)

      // 检查是否从添加项目/零件页面返回，需要更新故障状态
      if (sessionStorage.getItem('faultDetected') === '1') {
        detail.currentFault = '1'
        sessionStorage.removeItem('faultDetected')
      }

      // 保存环检数据快照
      saveDataSnapshot()

      // 判断状态
      isSaved.value = true
    } else {
      showToast(res.msg || '获取详情失败')
    }
  } catch (error) {
    console.error('获取详情失败:', error)
  } finally {
    savingLoading.value = false
    isDataLoading.value = false // 数据加载完成
    // 恢复从选择套餐/添加项目页面返回时的tab状态
    const savedTab = sessionStorage.getItem('receptionEditActiveTab')
    if (savedTab) {
      sessionStorage.removeItem('receptionEditActiveTab')
      nextTick(() => { activeTab.value = savedTab })
    }
    // 从添加项目/零件页面保存后返回，触发提醒信息刷新
    if (sessionStorage.getItem('receptionPartsSaved') === '1') {
      fetchRemindInfo()
    }
    nextTick(() => {
      cb && cb()
    })
    // 从导入套餐页面返回：判断是否需要故障提醒（nextTick 排在最后，确保覆盖上方 tab 恢复）
    if (sessionStorage.getItem('packageFaultCheck') === '1') {
      sessionStorage.removeItem('packageFaultCheck')
      nextTick(() => {
        triggerFaultRemind('0') // 导入套餐页控制了满足条件才会返回
      })
    }
  }
}
// 打开换车弹框
const onChangeCar = () => {
  changeCarDialog.value = true
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
    }
  } catch (error) {
    console.error('获取车联网里程失败:', error)
  }
}

// 换车弹窗确认回调：在 edit 场景下需同步送修人、车联网里程以及近期环检信息
const onChangeCarSelected = (carInfo) => {
  // 更新车辆信息
  detail.plateNo = carInfo.vehiclePlateNo || ''
  detail.vin = carInfo.vin || ''
  detail.vehicleModel = carInfo.vehicleModelName || carInfo.vehicleModel || ''
  detail.warrantyDate = carInfo.warrantyDate || ''
  detail.customerName = carInfo.vehicleProfileOwnerResp?.ownerName || ''
  detail.customerPhone = carInfo.vehicleProfileOwnerResp?.mobilephone || ''
  detail.bindingUser = carInfo.vehicleProfileOwnerResp?.bindingUser || ''
  detail.binderPhone = carInfo.vehicleProfileOwnerResp?.bindingPhone || ''

  // 更新送修人信息为当前车主
  detail.repairPerson = detail.customerName
  detail.repairPersonPhone = detail.customerPhone
  repairPersonType.value = 'other'
  repairPersonNameInput.value = detail.customerName
  repairPersonPhoneInput.value = detail.customerPhone

  // 获取车联网里程数
  if (detail.vin) {
    fetchVehicleMileage(detail.vin)
  }

  // 获取上次环检信息并回显
  applyRecentInspectionByVin(detail.vin, detail, { businessId: detail.id })
}
// 修改车牌
const onEditPlate = () => {
  changePlateDialog.value = true
}

// 删除图片/附件的通用方法
// 文件删除已从 receptionCommon 导入，此处为组件绑定
const handleInteriorDelete = (file) => _handleFileDelete(file, 'interior', detail, signatureData)
const handleExteriorDelete = (file) => _handleFileDelete(file, 'exterior', detail, signatureData)
const handleAttachmentDelete = (file) => _handleFileDelete(file, 'attachment', detail, signatureData)

// 预览图片
// const onPreviewImage = (type, index) => {
//   const imageArray = type === 'interior' ? detail.interiorImages : detail.exteriorImages
//   const images = imageArray.map((item) => getFilePreviewUrl(item))
//   showImagePreview({
//     images: images,
//     startPosition: index,
//     showIndex: true
//   })
// }

// 统一图片预览方法
const showImg = (url) => {
  showImagePreview({
    images: [url],
    startPosition: 0,
    showIndex: false
  })
}

// 预览文件
// const onPreviewFile = (file) => {
//   if (file.isImage) {
//     showImagePreview({
//       images: [getFilePreviewUrl(file)],
//       startPosition: 0,
//       showIndex: false
//     })
//   }
// }
// 统一上传方法
const uploadGeneric = (type) => {
  currentUploadType.value = type
  // attachType 映射
  const attachTypeMap = {
    interior: '车内照片',
    exterior: '车外照片',
    attachment: '附件资料'
  }
  const config = getAttachConfig(attachTypeMap[type] || '车内照片')
  const maxSize = config.maxSize || 10
  console.log('maxSize22:', config)
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

// 获取目标文件列表
const getTargetFileList = (type) => _getTargetFileList(type, detail, signatureData)

// getFileType 已从 receptionCommon 导入
// 注册原生图片回调
window.getScanResult = async(url) => {
  console.log('url:', url, Array.isArray(url))
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
  // 本批次是否需要刷新：仅当至少有一张图真正上传成功 + detail.id 有值时 refresh
  let needRefresh = false
  // 记录本批次真正上传成功的类型快照。
  // 注意：不能用循环外的 currentUploadType.value——循环中存在 await，
  // 用户可能在等待期间切换上传类型，若读 .value 会 refresh 到错误的列表。
  let lastUploadedType = null

  for (const singleUrl of urlList) {
    // 保存当前上传类型，避免异步上传完成时类型已改变
    const uploadType = currentUploadType.value

    // attachType 映射
    const attachTypeMap = {
      interior: '车内照片',
      exterior: '车外照片',
      attachment: '附件资料'
    }
    const attachType = attachTypeMap[uploadType]

    // 格式校验（白名单）：native 返回 url 后、调上传接口之前拦截
    // 未配置 acceptSuffix 时 parseAcceptSuffix 返回 null → validateFileExtension 直接放行
    const attachCfg = getAttachConfig(attachType)
    console.log('[format-check][edit] singleUrl:', singleUrl)
    console.log('[format-check][edit] attachType:', attachType, 'config:', attachCfg)
    const formatCheck = validateFileExtension(singleUrl, attachCfg)
    console.log('[format-check][edit] result:', formatCheck)
    if (!formatCheck.ok) {
      showToast(`不支持的图片格式：${formatCheck.ext || '未知后缀'}，仅允许 ${formatCheck.allowed || '未配置'}`)
      continue
    }

    // 先添加临时预览（乐观 UI：让用户立刻看到上传中状态）
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
        businessId: detail.id,
        configCode: 'mcs_serviceproxy',
        attachType
      }

      const res = await uploadFileByUrl([params])

      if (res.code === 200) {
        // 兜底：HEIC 等不被支持格式 → res.code=200 但 data 字段全 null
        if (isUploadSilentFailure(res)) {
          const targetList = getTargetFileList(uploadType)
          if (targetList.length > 0) targetList.pop()
          showToast('上传失败：文件格式不被支持')
          continue
        }

        // 注意：uploadFileByUrl 返回的 id 是"前端占位用"的假 id，
        // 不能直接用于 deleteAttachmentConfig（删除会失败）。
        // 真实 id 必须等循环结束后统一 refreshAttachmentList 拿。
        // 这里只更新"乐观"状态，让 UI 看到上传完成（真实数据会被 refresh 覆盖）
        const targetList = getTargetFileList(uploadType)
        if (targetList.length > 0) {
          const lastIndex = targetList.length - 1
          const uploadData = Array.isArray(res.data) ? res.data[0] || {} : res.data || {}
          targetList[lastIndex] = {
            ...targetList[lastIndex],
            status: 'done',
            message: '',
            // 仅用 fileUrl/authFileUrl 让缩略图立刻显示，id 留空等 refresh
            url: uploadData.fileUrl || uploadData.url || singleUrl,
            fileUrl: uploadData.fileUrl || uploadData.url || singleUrl,
            authFileUrl: uploadData.authFileUrl || uploadData.fileUrl || uploadData.url || singleUrl,
            fileType: uploadData.fileType || uploadData.ext || getFileType({ url: singleUrl }, 'image/jpeg')
          }
        }

        // 本张上传成功 → 标记循环结束后需要 refresh
        needRefresh = true
        // 用循环内快照 uploadType（而非 currentUploadType.value），
        // 避免用户在 await 期间切换类型导致 refresh 到错误列表
        lastUploadedType = uploadType
        showToast('上传成功')
      } else {
        // 上传失败，移除临时文件 - 使用保存的 uploadType
        const targetList = getTargetFileList(uploadType)
        if (targetList.length > 0) {
          targetList.pop()
        }
        showToast(res.msg || '上传失败')
      }
      console.log('interior:', detail.interiorImages)
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

  // 所有 url 处理完后，按 attachType 拉服务端真实数据覆盖当前列表：
  // 1) uploadFileByUrl 返回的 id 是假的，必须靠 getFileList 拿真实 id 才能删除/保存
  // 2) detail.id 必须有值（create 场景为 null 时跳过，保留前端拼装对象）
  // 3) 仅当至少一张图真正上传成功时才 refresh
  // 4) 用循环内记录的类型快照 lastUploadedType，不用 currentUploadType.value
  if (needRefresh && detail.id && lastUploadedType) {
    const lastAttachTypeMap = {
      interior: '车内照片',
      exterior: '车外照片',
      attachment: '附件资料'
    }
    const lastAttachType = lastAttachTypeMap[lastUploadedType]
    const lastTargetList = getTargetFileList(lastUploadedType)
    await refreshAttachmentList({
      businessId: detail.id,
      attachType: lastAttachType,
      targetList: lastTargetList,
      getFileListApi: getFileList
    })
  }
}

// 送修人输入框是否禁用（车主/绑车人不可编辑，其他可编辑）
const repairPersonInputDisabled = computed(() => repairPersonType.value !== 'other')

// 送修人输入框标签文案（车主/绑车人/其他显示不同文案）
const repairPersonInputLabel = computed(() => {
  if (repairPersonType.value === 'owner') return '车主'
  if (repairPersonType.value === 'bindingUser') return '绑车人'
  return '送修人'
})

// 故障模块是否只读（已生成结算单、已作废、已交车不可修改）
const isFaultReadonly = computed(() =>
  detail.isCreateStatementInfo === 1 || Number(detail.orderStatus) === RepairOrderStatusEnum.DELIVERED || Number(detail.orderStatus) === RepairOrderStatusEnum.CANCEL
)

// 是否已作废
const isCanceled = computed(() => Number(detail.orderStatus) === RepairOrderStatusEnum.CANCEL)

// 已生成结算单但未交车/未作废，部分字段仍可编辑
const isSettled = computed(() => detail.isCreateStatementInfo === 1)

/** 制单确认并签字按钮是否可见：制单中且未签字，或存在故障确认不一致 */
const showConfirmAndSignBtn = computed(() => {
  // 制单中状态，且签字状态为空或非待签字/已签字
  const isCreatingAndUnsigned =
    !isSettled.value &&
    Number(detail.orderStatus) === RepairOrderStatusEnum.CREATING_ORDER &&
    (!detail.signStatus ||
      (Number(detail.signStatus) !== SignStatusEnum.PENDING_SIGN &&
        Number(detail.signStatus) !== SignStatusEnum.SIGNED))
  // 无故障且确认结果为不准确
  const hasFaultConflict =
    Number(detail.currentFault) === CurrentFaultEnum.NONE &&
    Number(detail.confirmFault) === ConfirmFaultEnum.INACCURATE

  return isCreatingAndUnsigned || hasFaultConflict
})

// 已生成结算单时，只读展示的非套餐项目/零件
const nonPackageItems = computed(() =>
  (partsData.repairItemRespList || []).filter(item => !item.packageType)
)
const nonPackageParts = computed(() =>
  (partsData.sparePartRespList || []).filter(item => !item.packageType)
)

// 选择送修人类型
const onSelectRepairPersonType = (type) => {
  repairPersonType.value = type
  if (type === 'owner') {
    repairPersonNameInput.value = detail.customerName
    repairPersonPhoneInput.value = detail.customerPhone
  } else if (type === 'bindingUser') {
    repairPersonNameInput.value = detail.bindingUser
    repairPersonPhoneInput.value = detail.binderPhone
  } else {
    repairPersonNameInput.value = detail.repairPerson
    repairPersonPhoneInput.value = detail.repairPersonPhone
  }
}

// 送修人姓名变化
const onRepairPersonNameChange = () => {
  detail.repairPerson = repairPersonNameInput.value
}

// 送修人手机变化
const onRepairPersonPhoneChange = () => {
  detail.repairPersonPhone = repairPersonPhoneInput.value
}

// 更多操作
const onMore = () => {
  showMoreActions.value = !showMoreActions.value
}

// 保存
const validateRepairPerson = () => _validateRepairPerson(repairPersonType.value, detail.repairPerson, detail.repairPersonPhone)

const savingLoading = ref(false)
const cancelLoading = ref(false)

// 环检信息保存（新增或编辑）
const onInspectionSave = async(type) => {
  // 进店里程数必填校验
  if (!detail.mileage) {
    showToast('请输入进店里程数')
    scrollToErrorField({ errorField: 'mileage', activeTab, repairPersonCollapse })
    return { code: -1 }
  }
  // 检查车内、车外照片是否有重复文件
  if (hasDuplicateFileId(detail.interiorImages)) {
    showToast('车内照片存在重复文件，请检查')
    scrollToErrorField({ errorField: 'interiorPhotos', activeTab, repairPersonCollapse })
    return { code: -1 }
  }
  if (hasDuplicateFileId(detail.exteriorImages)) {
    showToast('车外照片存在重复文件，请检查')
    scrollToErrorField({ errorField: 'exteriorPhotos', activeTab, repairPersonCollapse })
    return { code: -1 }
  }
  // 如果是项目零件或签字确认页，且数据没改动，则跳过校验直接返回
  if (type === 1 && !hasInspectionDataChanged()) {
    return { code: 200 }
  }

  // 环检信息页需要校验
  const repairResult = validateRepairPerson()
  if (!repairResult.valid) {
    repairPersonType.value = 'other'
    scrollToErrorField({ errorField: repairResult.errorField, activeTab, repairPersonCollapse })
    return { code: -1 }
  }
  // 里程校验（仅进店里程发生变化时校验）
  if (!initialInspectionData.value || detail.mileage !== initialInspectionData.value.mileage) {
    validateMileage(detail.mileage, detail.lastMileage, detail.networkMileageTotal)
  }
  // 已生成结算单时跳过故障和照片校验
  if (!isSettled.value) {
    // 如果currentFault为1，客户故障描述必填
    const trimedCustomerFaultDesc = detail.customerFaultDesc.trim() || ''
    if (Number(detail.currentFault) === 1 && trimedCustomerFaultDesc.length <= 4) {
      showToast('请输入客户故障描述，【客户故障描述】字段需要大于4个字')
      scrollToErrorField({ errorField: 'customerFaultDesc', activeTab, repairPersonCollapse })
      return { code: -1 }
    }
    // 如果currentFault为1，必须添加故障模块
    if (Number(detail.currentFault) === 1 && detail.faultModules.length === 0) {
      showToast('请添加故障模块')
      scrollToErrorField({ errorField: 'faultModules', activeTab, repairPersonCollapse })
      return { code: -1 }
    }
    // 照片校验（根据配置判断是否必填）
    if (interiorConfig.value.required === '1' && detail.interiorImages.length === 0) {
      showToast('请上传车内照片')
      scrollToErrorField({ errorField: 'interiorPhotos', activeTab, repairPersonCollapse })
      return { code: -1 }
    }
    if (exteriorConfig.value.required === '1' && detail.exteriorImages.length === 0) {
      showToast('请上传车外照片')
      scrollToErrorField({ errorField: 'exteriorPhotos', activeTab, repairPersonCollapse })
      return { code: -1 }
    }
  }
  // 异常描述
  if (!detail.abnormalDesc) {
    showToast('请输入异常描述')
    scrollToErrorField({ errorField: 'abnormalDesc', activeTab, repairPersonCollapse })
    return { code: -1 }
  }
  // 经理建议
  if (!detail.testResult) {
    showToast('请输入客户经理建议')
    scrollToErrorField({ errorField: 'testResult', activeTab, repairPersonCollapse })
    return { code: -1 }
  }

  // 检查数据是否有改动
  if (!hasInspectionDataChanged()) {
    showToast('数据未变更，无需保存')
    return
  }
  savingLoading.value = true
  // TODO: 待修复，不需要提交这么多字段
  const params = {
    id: detail.id,
    code: detail.code,
    dataSource: detail.dataSource,
    orderStatus: detail.orderStatus,
    warrantyTypeCollect: detail.warrantyTypeCollect,
    customerName: detail.customerName,
    customerPhone: detail.customerPhone,
    custType: detail.custType,
    vehModelName: detail.vehicleModelName,
    bindingPhone: detail.binderPhone,
    bindingUser: detail.bindingUser,
    bindingUserId: detail.bindingUserId,
    carPlate: detail.plateNo,
    appointmentNo: detail.appointmentNo,
    mileage: detail.mileage,
    lastMileage: detail.lastMileage,
    expectFinishAt: signatureData.expectFinishAt,
    remark: detail.remark,
    status: detail.status,
    statusDesc: detail.statusDesc,
    pickStatus: detail.pickStatus,
    shuttleName: detail.repairPerson,
    shuttlePhone: detail.repairPersonPhone,
    payType: detail.payType,
    warrantyCompany: detail.warrantyCompany,
    signChannel: signatureData.signChannel === '纸质单据' || Number(detail.signChannel) === SignChannelEnum.PAPER ? String(SignChannelEnum.PAPER) : '',
    // signCompletedOn: detail.signCompletedOn,
    // signGeneratedOn: detail.signGeneratedOn,
    // signStatus: detail.signStatus,
    // signUrlExpiredOn: detail.signUrlExpiredOn,
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
    exteriorPhotoList: formatPhotoList(detail.exteriorImages, '车外照片', route.query.id),
    interiorPhotoList: formatPhotoList(detail.interiorImages, '车内照片', route.query.id),
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
    vehModelId: detail.vehicleModelId,
    motorModel: detail.motorModel,
    motorSerialNumber: detail.motorSerialNumber,
    // batteryModel: detail.batteryModel,
    // batterySerialNumber: detail.batterySerialNumber,
    // engineNumber: detail.enginenNumber,
    // repairItemTypeDetailCollect: detail.repairItemTypeDetailCollect,
    businessType: computedBusinessType.value,
    alarmLevel: detail.alarmLevel,
    haveRework: 0,
    isCarWash: 0,
    isRetainOldParts: 0,
    inCustomerContent: detail.inCustomerContent,
    testResult: detail.testResult,
    currentFault: Number(detail.currentFault),
    customerContent: detail.customerFaultDesc,
    invaildDesc: detail.invaildDesc,
    anomalyDescription: detail.abnormalDesc,
    customerComment: detail.customerComment,
    previewingFinishAt: detail.previewingFinishAt,
    confirmedOn: detail.confirmedOn,
    expectStartAt: detail.expectStartAt,
    startAt: detail.startAt,
    finishAt: detail.finishAt,
    faultSolve: detail.faultSolve,
    // currentSituation: Number(detail.currentFault) === 1 ? 20 : 10,
    // faultAlert: detail.faultAlert,
    faultPeriod: detail.faultPeriod,
    // earliestfaultServiceProxy: detail.earliestfaultServiceProxy,
    // recentlyfaultServiceProxy: detail.recentlyfaultServiceProxy,
    // faultModule: detail.faultModules.map((m) => m.cccCode).join(','),
    isCreateStatementInfo: detail.isCreateStatementInfo,
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
    isStoreLive: detail.isStoreLive,
    latelyServiceProxy: detail.latelyServiceProxy,
    earlyServiceProxy: detail.earlyServiceProxy
  }
  console.log('保存参数:', params)
  try {
    const res = await serviceAddOrUpdate(params)
    savingLoading.value = false
    if (res.code === 200) {
      showToast('保存成功')
      fetchRemindInfo()
      saveDataSnapshot()
      fetchDetail()
    } else {
      showToast({ message: res.msg || '保存失败', duration: 3000 })
    }
  } catch (err) {
    showToast(err.msg || '保存失败')
    savingLoading.value = false
  }
}

// 处理零件替换事件
const handlePartsReplace = (data) => {
  console.log('handlePartsReplace 收到数据:', data)
  // 更新 partsData 中的数据源，确保页面跳转后再回来时显示的是替换后的数据
  partsData.repairItemRespList = data.selectedItems || []
  partsData.sparePartRespList = data.selectedParts || []

  // 重新计算费用
  recalculateCosts()

  console.log('更新后的 partsData:', partsData)
}

// 处理零件删除事件
const handlePartsDelete = (data) => {
  console.log('handlePartsDelete 收到数据:', data)
  // 更新 partsData 中的数据源
  partsData.repairItemRespList = data.selectedItems || []
  partsData.sparePartRespList = data.selectedParts || []

  // 重新计算费用
  recalculateCosts()

  console.log('删除后的 partsData:', partsData)
}

// 触发故障提醒：本次含 一般维修/三电维修/保修 且 currentFault=0 时，默认置为有故障并提示、切到环检 tab
const triggerFaultRemind = (currentFault) => {
  if (!hasFaultRemindType(detail.repairItemTypeDetailCollect) || Number(currentFault || detail.currentFault) !== 0) return
  detail.currentFault = '1'
  // 清空默认文本
  if (detail.customerFaultDesc === '本次进店车辆无故障') {
    detail.customerFaultDesc = ''
  }
  showToast({ message: FAULT_REMIND_MESSAGE, duration: 3000 })
  // 切换tab到环检信息
  activeTab.value = 'inspection'
}

// 项目零件保存
const onPartsSave = async() => {
  // 数据未变更，不调接口
  if (!hasPartsDataChanged()) {
    showToast('数据未变更，无需保存')
    return
  }
  // 检查车内、车外照片是否有重复文件
  if (hasDuplicateFileId(detail.interiorImages)) {
    showToast('车内照片存在重复文件，请检查')
    return
  }
  if (hasDuplicateFileId(detail.exteriorImages)) {
    showToast('车外照片存在重复文件，请检查')
    return
  }
  // 从 RepairItemContent 组件获取数据
  const items = partsData.repairItemRespList || []
  const parts = partsData.sparePartRespList || []

  // 零件如果数量为0，不允许保存，项目允许为0
  if (parts.some(i => i.quantity <= 0)) {
    showToast('备件数量必须要大于0')
    return
  }
  // 售前保修、善意保修、商城订单只能单独开单
  if (!validateAloneOrder(items, parts)) return

  savingLoading.value = true
  try {
    // 保存项目零件
    const res = await saveSpRepairItem({
      serviceProxyId: route.query.id,
      discountId: '',
      itemList: items,
      partsList: parts
    })
    if (res.code !== 200) {
      showToast(res.message || '保存失败')
      return
    }
    showToast('保存成功')
    // 执行inspection保存（带id编辑）
    const inspectionRes = await onInspectionSave(1)
    if (inspectionRes?.code === 200) {
      isSaved.value = true
    }
    // 同步更新快照，确保返回拦截判断准确
    saveDataSnapshot()
    await fetchDetail(() => {
      activeTab.value = 'signature'
    })
    fetchRemindInfo()

    // 故障提醒：本次包含 一般维修/三电维修/保修 且 currentFault=0 时触发
    triggerFaultRemind()
  } catch (error) {
    console.error('保存失败:', error)
    showToast(error?.message || '保存失败')
  } finally {
    savingLoading.value = false
  }
}

// 签字确认保存
// const onSignatureSave = async() => {
//   if (isSignatureSaveDisabled.value) return
//   // 从 RepairItemContent 组件获取数据
//   const items = repairItemContentRef.value?.selectedItems || []
//   const parts = repairItemContentRef.value?.selectedParts || []

//   // 校验项目及零件不可为空
//   // if (items.length === 0 && parts.length === 0) {
//   //   showToast('项目及零件不可为空，请添加项目或者零件')
//   //   return
//   // }

//   savingLoading.value = true
//   try {
//     // 保存项目零件
//     const res = await saveSpRepairItem({
//       serviceProxyId: route.query.id,
//       discountId: '',
//       itemList: items,
//       partsList: parts
//     })
//     if (res.code !== 200) {
//       showToast(res.msg || '保存失败')
//       return
//     }
//     showToast('保存成功')
//     // 执行inspection保存（带id编辑）
//     const inspectionRes = await onInspectionSave(1)
//     if (inspectionRes?.code === 200) {
//       isSaved.value = true
//     }
//   } catch (error) {
//     console.error('保存失败:', error)
//     showToast('保存失败')
//   } finally {
//     savingLoading.value = false
//   }
// }

const onComplete = async() => {
  // 如果环检信息有未保存的改动，提示先保存
  if (hasInspectionDataChanged()) {
    showToast('请先保存当前编辑的环检信息')
    return
  }
  // 进店里程数必填校验
  if (!detail.mileage) {
    showToast('请输入进店里程数')
    scrollToErrorField({ errorField: 'mileage', activeTab, repairPersonCollapse })
    return
  }
  const repairResult = validateRepairPerson()
  if (!repairResult.valid) {
    repairPersonType.value = 'other'
    scrollToErrorField({ errorField: repairResult.errorField, activeTab, repairPersonCollapse })
    return
  }
  // 照片校验（根据配置判断是否必填）
  if (interiorConfig.value.required === '1' && detail.interiorImages.length === 0) {
    showToast('请上传车内照片')
    scrollToErrorField({ errorField: 'interiorPhotos', activeTab, repairPersonCollapse })
    return
  }
  if (exteriorConfig.value.required === '1' && detail.exteriorImages.length === 0) {
    showToast('请上传车外照片')
    scrollToErrorField({ errorField: 'exteriorPhotos', activeTab, repairPersonCollapse })
    return
  }
  // 如果currentFault为1，客户故障描述必填
  const trimedCustomerFaultDesc = detail.customerFaultDesc.trim() || ''
  if (Number(detail.currentFault) === 1 && trimedCustomerFaultDesc.length <= 4) {
    showToast('请输入客户故障描述，【客户故障描述】字段需要大于4个字')
    scrollToErrorField({ errorField: 'customerFaultDesc', activeTab, repairPersonCollapse })
    return
  }
  showConfirmDialog({
    title: '提示',
    message: '确定预检完成吗？'
  })
    .then(async() => {
      savingLoading.value = true
      const res = await servicePreCheck(route.query.id)
      if (res.code === 200) {
        showToast('预检完成')
        fetchDetail(() => {
          activeTab.value = 'parts'
        })
      } else {
        showToast(res.msg || '操作失败')
      }
      savingLoading.value = false
    })
    .catch(() => {
      savingLoading.value = false
    })
}
// 添加项目/零件
const onAddParts = () => {
  sessionStorage.setItem('receptionEditActiveTab', activeTab.value)
  router.push({
    path: '/reception/add-parts',
    query: {
      serviceProxyId: route.query.id,
      vehModelName: detail.vehicleModelName,
      currentFault: detail.currentFault,
      isCreatePreAuth: detail.isCreatePreAuth
    }
  })
}

// 添加套餐及其他
const onAddPackage = () => {
  sessionStorage.setItem('receptionEditActiveTab', activeTab.value)
  router.push({
    path: '/reception/select-package',
    query: {
      serviceProxyId: route.query.id,
      currentFault: detail.currentFault
    }
  })
}

// 留车检查返回数据
const checkFaultData = ref(null)

// 留车调查校验
const checkVehicleRetention = async() => {
  // 如果已设置不需要留车提醒，直接执行后续流程
  if (Number(detail.isVehRetentionRemind) === 1) {
    return true
  }
  try {
    const res = await checkFault(detail.id)
    if (res.code === 200) {
      checkFaultData.value = res.data
      if (res.data?.isVehRetention === 1) {
        return new Promise((resolve) => {
          showConfirmDialog({
            title: '提示',
            message: '该车辆需要留车检查，请咨询客户是否同意留车?',
            confirmButtonText: '同意',
            cancelButtonText: '不同意',
            showCancelButton: true
          })
            .then(() => {
              createRetention({
                serviceProxyId: detail.id,
                vehRetentionConfigId: res.data?.vehRetentionConfigId
              }).then(() => {
                resolve(true)
              }).catch((err) => {
                showToast(err.msg || '留车操作失败')
                resolve(false)
              })
            })
            .catch(() => {
              resolve(true)
            })
        })
      }
      return true
    } else {
      showToast(res.msg || '检查失败')
      return false
    }
  } catch (error) {
    console.error('checkFault接口调用失败:', error)
    showToast(error.msg || '检查失败')
    return false
  }
}

// 制单确认并签字
const onConfirmAndSign = async() => {
  if (isConfirmAndSignDisabled.value) {
    return
  }
  // 等待详情数据加载完成
  if (savingLoading.value) {
    showToast('数据加载中，请稍候')
    return
  }
  // 从 RepairItemContent 组件获取数据，如果没有则使用 partsData 中的数据
  const items = repairItemContentRef.value?.selectedItems || partsData.repairItemRespList || []
  const parts = repairItemContentRef.value?.selectedParts || partsData.sparePartRespList || []
  // 校验维修项目或零件有值（有一个有值即可）
  if (items.length === 0 && parts.length === 0) {
    showToast('项目或零件不可为空，请先添加维修项目或零件')
    return
  }
  // 检查附件资料是否有重复文件
  if (hasDuplicateFileId(signatureData.attachments)) {
    showToast('附件资料存在重复文件，请检查')
    return
  }
  // 如果当前故障为是，校验是否添加了故障模块
  if (Number(detail.currentFault) === 1 && detail.faultModules.length === 0) {
    showToast('当前存在故障，请添加故障模块')
    activeTab.value = 'inspection'
    return
  }

  handleConfirmAndSignProcess()
}

// 处理制单确认并签字后续流程
const handleConfirmAndSignProcess = () => {
  const isPaperSign = signatureData.signChannel === '纸质单据' || Number(detail.signChannel) === SignChannelEnum.PAPER
  // signStatus == 10 时，纸质单据需调用接口保存，其他渠道直接跳转结算页面
  if (Number(detail.signStatus) === SignStatusEnum.PENDING_SIGN && !isPaperSign) {
    const settlementUrl = `${window.APP_AIS_H5_CONFIG?.VITE_STATIC_RES_URL || import.meta.env.VITE_STATIC_RES_URL}/leapx/biling/aisInner/constructionOrder?serviceProxyId=${detail.id}&signChannel=3&token=${localStorage.getItem('lxpToken')}`
    window.location.href = settlementUrl
    return
  }
  // 点击"准确"，执行接口
  const params = {
    serviceProxyId: detail.id,
    expectFinishAt: signatureData.expectFinishAt
  }
  console.log('signatureData.signChannel', signatureData, detail)
  savingLoading.value = true
  if (isPaperSign) {
    params.signChannel = SignChannelEnum.PAPER
  } else {
    params.signChannel = null
  }
  spConfirmAndSign(params)
    .then((res) => {
      savingLoading.value = false
      if (res.code === 200) {
        showToast('操作成功')
        fetchDetail()
        if (!params.signChannel) {
          // 接口成功后跳转结算页面
          const settlementUrl = `${window.APP_AIS_H5_CONFIG?.VITE_STATIC_RES_URL || import.meta.env.VITE_STATIC_RES_URL}/leapx/biling/aisInner/constructionOrder?serviceProxyId=${detail.id}&signChannel=3&token=${localStorage.getItem('lxpToken')}`
          window.location.href = settlementUrl
        }
      } else {
        showToast(res.msg || '操作失败')
      }
    })
    .catch(() => {
      savingLoading.value = false
    })
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

// 打开预计交车时间选择器
const onOpenDeliveryTimePicker = () => {
  if (partsData.repairItemRespList.length === 0 && partsData.sparePartRespList.length === 0) {
    showToast('请先添加维修项目或配件')
    return
  }
  // 已交车或已作废不允许修改交车时间
  if (Number(detail.orderStatus) === RepairOrderStatusEnum.DELIVERED || Number(detail.orderStatus) === RepairOrderStatusEnum.CANCEL) {
    return
  }
  showDeliveryTimePicker.value = true
}

// 保存预计交车时间
const onSaveDeliveryTime = () => {
  if (!signatureData.expectFinishAt) {
    showToast('请选择预计交车时间')
    return
  }
  if (!hasDeliveryTimeChanged()) {
    showToast('数据未变更，无需保存')
    return
  }
  savingLoading.value = true
  serviceAddOrUpdate({
    id: detail.id,
    vehProfileVin: detail.vin,
    shuttleName: repairPersonNameInput.value || detail.shuttleName,
    shuttlePhone: repairPersonPhoneInput.value || detail.shuttlePhone,
    businessType: detail.businessType,
    customerContent: detail.customerFaultDesc || detail.customerContent,
    expectFinishAt: signatureData.expectFinishAt
  }).then((res) => {
    savingLoading.value = false
    if (res.code === 200) {
      showToast('保存成功')
      fetchDetail()
    } else {
      showToast(res.msg || '保存失败')
    }
  }).catch(() => {
    savingLoading.value = false
  })
}

// 选择预计交车日期
// 点击制单确认并签字，先查询最新状态，再弹出签字渠道选择
const onConfirmAndSignClick = async() => {
  const id = route.query.id
  if (!id) return
  // 留车调查校验
  const retentionPassed = await checkVehicleRetention()
  if (!retentionPassed) return
  if (!signatureData.expectFinishAt) {
    showToast('请选择预计交车时间')
    return
  }
  // 检查环检信息和项目零件是否修改后未保存
  if (hasInspectionDataChanged()) {
    showToast('环检信息已修改，请先保存')
    return
  }
  if (hasPartsDataChanged()) {
    showToast('项目零件已修改，请先保存')
    return
  }
  showLoadingToast({ message: '请稍候...', forbidClick: true })
  try {
    // 记录查询前的 signStatus，用于判断是否发生变化
    const prevSignStatus = Number(detail.signStatus)
    const res = await getDetail(id)
    if (res.code === 200 && res.data) {
      const newSignStatus = Number(res.data.signStatus)
      // signStatus 由非已签字变为已签字，表示工单状态已更新，需重新加载数据
      if (prevSignStatus !== SignStatusEnum.SIGNED && newSignStatus === SignStatusEnum.SIGNED) {
        closeToast()
        showToast('工单状态已更新')
        await fetchDetail()
        return
      }
    }
    closeToast()
  } catch (e) {
    closeToast()
    console.error('查询工单状态失败:', e)
  }
  tempSignatureChannel.value = signatureData.signChannel || ''
  showSignatureChannelPicker.value = true
}
// 取消选择签字渠道
const onCancelSignatureChannel = () => {
  showSignatureChannelPicker.value = false
}
// 确认选择签字渠道
const onConfirmSignatureChannel = () => {
  if (!tempSignatureChannel.value) {
    showToast('请选择签字渠道')
    return
  }
  signatureData.signChannel = tempSignatureChannel.value
  showSignatureChannelPicker.value = false
  onConfirmAndSign()
}

// 获取提醒信息（预授权、三包预警、服务活动、差价等），会话周期内只弹窗一次
const fetchRemindInfo = () => {
  if (!route.query.id) return
  const remindKey = `remind_shown_${route.query.id}`
  if (sessionStorage.getItem(remindKey) && !sessionStorage.getItem('receptionPartsSaved')) return
  getRemindInfo(route.query.id).then((res) => {
    if (res.code === 200) {
      const rawData = res.data || []
      const validTypes = [RemindInfoTypeEnum.THREE_GUARANTEES, RemindInfoTypeEnum.SERVICE_ACTIVITY, RemindInfoTypeEnum.PRICE_DIFFERENCE, '5']
      const preAuthItems = rawData.filter((item) => item.type === RemindInfoTypeEnum.PRE_AUTH)
      const otherItems = rawData.filter((item) => validTypes.includes(item.type))
      remindList.value = [...preAuthItems, ...otherItems]
      if (remindList.value.length > 0) {
        showWarrantyAlertDialog.value = true
        sessionStorage.setItem(remindKey, '1')
      }
    }
  }).finally(() => {
    sessionStorage.removeItem('receptionPartsSaved')
  })
}

onMounted(() => {
  fetchDetail()
  // 获取枚举数据
  globalStore.getEnumData()
  // 初始化送修人输入框
  repairPersonNameInput.value = detail.repairPerson
  repairPersonPhoneInput.value = detail.repairPersonPhone
  // 获取上传配置
  if (route.query.id) {
    getUploadConfig({ configCode: 'mcs_serviceproxy' }).then((res) => {
      if (res.code === 200) {
        uploadConfig.value = res.data || {}
      }
    })
  }
})

// 返回按钮拦截：检查环检信息或项目零件是否有未保存改动
const onBeforeBack = () => {
  if (!hasInspectionDataChanged() && !hasPartsDataChanged()) {
    return true
  }
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
<style lang="scss" scoped>
// 签字渠道选择器
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

// 作废原因弹框样式
.cancel-reason-content {
  padding: 12px;
}

.confirm-btn {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #009100;
  border-radius: 8px;
  font-size: 14px;
  color: #ffffff;
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

// 图片上传action sheet样式
:deep(.van-action-sheet) {
  .van-action-sheet__cancel {
    margin-bottom: 34px !important;
  }
}

// 上传组件样式
.card-container {
  background: #fff;
  border-radius: 8px;
  padding: 12px 0;
}

.card-info-title {
  font-size: 14px;
  font-weight: 500;
  color: #191a1b;
}

.marginB1 {
  margin-bottom: 8px;
}

.upload-content {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.upload-box {
  width: 80px;
  height: 80px;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
  background: #f5f5f5;

  img {
    object-fit: cover;
  }

  .delete_icon {
    position: absolute;
    top: 0;
    right: 0;
    width: 20px;
    height: 20px;
    cursor: pointer;
  }
}

.upload-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #ddd;
  cursor: pointer;

  .upload-img {
    width: 32px;
    height: 32px;
    color: #888;
  }
}

// 签字确认样式
.signature-section {
  background: #fff;
  border-radius: 8px;

  .signature-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 0.5px solid #e6e6e5;

    &:last-child {
      border-bottom: none;
    }

    .label {
      font-size: 14px;
      color: #545454;
      width: 160px;
    }

    .value {
      font-size: 14px;
      color: #191a1b;

      &.signed {
        color: #009100;
      }

      &.unsigned {
        color: #b91919;
      }

      &.pending {
        color: #ff9500;
      }

      &.placeholder {
        color: #888888;
      }
    }

    .value-wrapper {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
  .signature-action-row{
    text-align: right;
    margin-top: 5px;
  }
}
</style>
