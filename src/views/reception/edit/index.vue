<template>
  <div class="work-order-create">
    <!-- 车辆信息卡片 -->
    <div class="vehicle-card">
      <div class="plate-row">
        <span class="plate-no">{{ detail.plateNo }}</span>
        <span class="appointment-tag">{{ detail.custTypeLabel || '随到客户' }}</span>
        <span
          v-if="!isSettled && detail.orderStatus == 100"
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
          <div class="fault-info">
            <!-- 是否存在故障 -->
            <div class="section-card">
              <div class="fault-header">
                <span class="title">本次是否因故障进店</span>
                <template v-if="isFaultReadonly">
                  <span class="fault-status-text">{{ detail.currentFault === '1' ? '是' : '否' }}</span>
                </template>
                <div v-else class="radio-group">
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
                <div v-if="!isFaultReadonly" class="add-module" @click="onAddFaultModule">
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
                    <img v-if="!isFaultReadonly" src="@/assets/images/trash.svg"  @click="onDeleteFaultModule(module)"/>
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
                <span v-if="!isFaultReadonly && Number(detail.currentFault) === 1" class="required">*</span>客户故障描述
              </div>
              <template v-if="isFaultReadonly">
                <div class="fault-desc-text">{{ detail.customerFaultDesc || '无' }}</div>
              </template>
              <van-field
                v-else
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

      <van-tab v-if="isSaved && detail.orderStatus != 100" title="项目零件" name="parts">
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
            <div style="padding: 0 12px">
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

      <van-tab v-if="isSaved && detail.orderStatus != 100" title="签字确认" name="signature">
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
                  v-if="detail.orderStatus !== 180 && detail.orderStatus !== 210"
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
            <div v-if="Number(detail.signStatus) === 20 || Number(detail.signChannel) === 40" class="signature-row">
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
            <div class="signature-row" v-if="!isSettled && Number(detail.signStatus) === 10">
              <span class="label">签字状态</span>
              <div class="value-wrapper">
                <div
                  class="signature-action-row"
                >
                  <van-button type="primary" size="small" @click="onConfirmAndSign">邀请客户签字</van-button>
                </div>
              </div>
            </div>
            <div
              class="signature-action-row"
              v-if="Number(detail.signStatus) === 20 && detail.signChannel == 30"
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
      <div class="add-btn" @click="onAddParts">
        <van-icon name="plus" />
        <span>添加项目/零件</span>
      </div>
      <div class="add-btn" @click="onAddPackage">
        <van-icon name="plus" />
        <span>添加套餐及其他</span>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="bottom-bar">
      <span v-if="!isSettled && activeTab === 'inspection'" class="more-btn" @click="onMore">更多</span>
      <template v-if="activeTab === 'inspection'">
        <span
          :class="['save-btn', { disabled: isInspectionSaveDisabled }]"
          @click="onInspectionSave"
          >保存</span
        >
        <span v-if="!isSettled && !detail.previewingFinishAt" class="complete-btn" @click="onComplete"
          >预检确认</span
        >
      </template>
      <template v-else-if="activeTab === 'parts'">
        <span
          v-if="!isSettled"
          :class="['save-btn', { disabled: isPartsSaveDisabled }]"
          @click="onPartsSave"
          >保存</span
        >
      </template>
      <template v-else-if="activeTab === 'signature'">
        <span
          v-if="detail.orderStatus !== 180 && detail.orderStatus !== 210"
          class="save-btn"
          @click="onSaveDeliveryTime"
          >保存</span
        >
        <span
          v-if="!isSettled && detail.orderStatus == 110 && ((Number(detail.signStatus) !== 10 && Number(detail.signStatus) !== 20) || !detail.signStatus)"
          :class="['complete-btn', { disabled: isConfirmAndSignDisabled }]"
          @click="onConfirmAndSignClick"
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
              <div class="section-action-btn" @click="onGenerateAuthorization">生成预授权</div>
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
          <template v-else-if="item.type === '5'">
            <div class="info-title">{{ item.typeLabel }}</div>
            <div class="info-content"><span style="white-space: nowrap">该车辆为</span><span v-for="(tag, index) in item.content.split(',')" :key="index" style="white-space: nowrap">【{{ tag }}】</span>，请注意接待</div>
          </template>
        </template>

      </div>
      <div class="alert-confirm-btn" @click="onConfirmWarrantyAlert">我知道了</div>
    </van-dialog>

    <!-- 维修类型选择弹窗 -->
    <AisCascader
      v-model:show="showCheckoutPicker"
      title="请选择"
      :options="categoryCascaderOptions"
      :model-value="currentEditItem?.warrantyTypeId || ''"
      @confirm="onCheckoutConfirm"
    />

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

    <!-- 图片上传隐藏文件输入 -->
    <input
      ref="imageUploadRef"
      type="file"
      accept="image/*"
      style="display: none"
      @change="handleImageFileChange"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showConfirmDialog, showImagePreview, closeToast, showLoadingToast } from 'vant'
import { useGlobalStore } from '@/stores/global'
import { usePageSafeArea } from '@/utils/safeArea'
import AisPopup from '@/libs/components/AisPopup.vue'
import AisCascader from '@/components/AisCascader/index.vue'
import PackageDetailPopup from '@/components/PackageDetailPopup.vue'
import RepairItemContent from '@/components/SelectRepairItem/RepairItemContent.vue'
import { useRepairItemBusinessRules, useRepairItemData } from '@/components/SelectRepairItem/hooks'
import {
  uploadFileByUrl,
  getUploadConfig,
  getFileList
} from '@/libs/api/fileConfig'
import { batchUploadImageLimit } from '@/libs/utils/nativeFn'
import { RemindInfoTypeEnum } from '@/views/repairWork/constant'
import {
  getDetail,
  getVehicleInfo,
  getVehicleMileage,
  serviceAddOrUpdate,
  servicePreCheck,
  getRemindInfo,
  saveSpRepairItem,
  spConfirmAndSign,
  serviceProxyCancel,
  saveSpFaultModule,
  deleteSpFaultModule,
  getRecentlyServiceProxy,
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
  generateDeliveryDates as _generateDeliveryDates,
  generateDeliveryTimes as _generateDeliveryTimes,
  validateMileage,
  validateRepairPerson as _validateRepairPerson,
  scrollToErrorField,
  getAttachConfig as _getAttachConfig,
  getTargetFileList as _getTargetFileList,
  handleFileDelete as _handleFileDelete,
  fetchFaultModuleList as _fetchFaultModuleList,
  onSelectImageSource as _onSelectImageSource,
  validatePreSaleWarranty,
  validateGoodWillWarranty
} from '@/utils/receptionCommon'
import '../create/create.scss'

const route = useRoute()
const router = useRouter()
const globalStore = useGlobalStore()
usePageSafeArea({ bodyClass: 'ais-page-nav-safe-area' })
const addFaultModuleShow = ref(false)
const changeCarDialog = ref(false)
const changePlateDialog = ref(false)

// 数据加载标志（用于区分用户手动操作和数据赋值）
const isDataLoading = ref(false)
// 程序化设置 currentFault 标志（配合 isDataLoading 防止 @change 弹窗干扰）
const isSettingFaultProgrammatically = ref(false)

// RepairItemContent 组件引用
const repairItemContentRef = ref(null)

// 图片上传相关
const currentUploadType = ref('') // 'interior' or 'exterior'
const currentUploadIndex = ref(0)
const imageUploadRef = ref(null) // 文件输入引用
const showImageUploadSheet = ref(false)
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

// 换车相关
const carSearchValue = ref('')
const carSearchResults = ref([])
const selectedCarInfo = ref(null)
const hasSearched = ref(false)

// 故障模块搜索相关
const faultSearchValue = ref('')

// 是否存在故障确认弹框
const showFaultConfirm = ref(false)

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
    showLoadingToast('请稍候...')
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

// 获取预警等级颜色
// 预警相关已从 receptionCommon 导入

// 维修项目数据 Hook
const {
  rawCheckoutTypes,
  rawRepairItemTypes,
  rawMaintenanceTypes,
  selectedItems,
  selectedParts,
  dealerPermission,
  loadInitialData
} = useRepairItemData({ serviceProxyId: route.query.id })

// 业务规则 Hook
const {
  cascaderOptions: categoryCascaderOptions,
  showCheckoutPicker,
  onCheckoutConfirm
} = useRepairItemBusinessRules({
  dealerPermission,
  rawMaintenanceTypes,
  rawCheckoutTypes,
  rawRepairItemTypes,
  selectedItems,
  selectedParts
})

// 初始化数据
// 送修人类型选择
const repairPersonType = ref('other') // owner/bindingUser/other
const repairPersonNameInput = ref('')
const repairPersonPhoneInput = ref('')

// 折叠面板状态
const repairPersonCollapse = ref([])
// const businessTypeCollapse = ref([])

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
const fetchFaultModuleList = () => _fetchFaultModuleList(faultSearchValue.value, faultModuleList)

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
    window.location.href = `${window.APP_AIS_H5_CONFIG?.VITE_STATIC_RES_URL || import.meta.env.VITE_STATIC_RES_URL}/leapx/batteryDiagnosis?vin=${detail.vin}&vehicleModel=${detail.vehSeriesName}`
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

// 是否存在故障变更
const onHasFaultChange = (value) => {
  // 如果是数据加载或程序化赋值导致的改变，不执行弹窗逻辑
  if (isDataLoading.value || isSettingFaultProgrammatically.value) {
    isSettingFaultProgrammatically.value = false
    return
  }

  // 如果选择"否"，弹出确认框
  if (Number(value) === 0) {
    // 维修类型包含一般维修或三电维修时，不允许改为"否"
    // const typeCollect = detail.repairItemTypeDetailCollect || ''
    // if (typeCollect.includes('一般维修') || typeCollect.includes('三电维修')) {
    //   showToast({ message: '当前工单维修类型包含一般维修或三电维修，请确认是否存在故障!', duration: 3000 })
    //   // 还原为"是"
    //   detail.currentFault = '1'
    //   return
    // }
    // 如果已添加过故障模块或客户故障描述，弹出确认框
    if (detail.faultModules.length > 0 || detail.customerFaultDesc) {
      showFaultConfirm.value = true
    } else {
      detail.currentFault = '0'
      if (Number(detail.confirmFault) !== 1) {
        detail.customerFaultDesc = '本次进店车辆无故障'
      }
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
  // 清空故障模块，设置默认客户故障描述
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
    globalStore.setTitle('施工单详情')
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

const currentEditItem = null // 当前编辑的项目

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
    repairItemTypeDetailCollect: detail.repairItemTypeDetailCollect
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
  if (Number(detail.signStatus) === 10) {
    return false
  }
  return !signatureData.expectFinishAt
})

// 项目零件保存按钮是否禁用：没有添加项目或者零件
const isPartsSaveDisabled = computed(() => {
  return false
  // const items = repairItemContentRef.value?.selectedItems || []
  // const parts = repairItemContentRef.value?.selectedParts || []
  // return items.length === 0 && parts.length === 0
})

// 环检信息保存按钮是否禁用：进店里程数、送修人信息、车内车外照片、异常描述、经理建议为空
const isInspectionSaveDisabled = computed(() => {
  // 进店里程数
  if (!detail.mileage) return true
  // 送修人信息
  if (!detail.repairPerson || !detail.repairPersonPhone) return true
  // 车内照片（已生成结算单时不再必填）
  if (!isSettled.value && interiorConfig.value.required === '1' && detail.interiorImages.length === 0) return true
  // 车外照片（已生成结算单时不再必填）
  if (!isSettled.value && exteriorConfig.value.required === '1' && detail.exteriorImages.length === 0) return true
  // 异常描述
  if (!detail.abnormalDesc) return true
  // 经理建议
  if (!detail.testResult) return true
  if (savingLoading.value) return true
  return false
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

// 预计交车时间选择相关
const selectedDeliveryDate = ref('')
const selectedDeliveryTime = ref('')

// 预计交车日期列表（生成未来7天）
const deliveryDateList = ref([])
const generateDeliveryDates = () => { deliveryDateList.value = _generateDeliveryDates() }
const deliveryTimeList = ref([])
const generateDeliveryTimes = () => { deliveryTimeList.value = _generateDeliveryTimes() }

// 签字渠道列表
const signatureChannelList = ref([
  { value: 40, label: '纸质单据' },
  { value: 30, label: 'APP/短信/零小跑' }
])

// 签字渠道转换（为空时默认为APP/短信/零小跑）
const getSignChannelName = (channel) => {
  const channelMap = {
    40: '纸质单据',
    10: 'APP/短信/零小跑',
    20: 'APP/短信/零小跑',
    30: 'APP/短信/零小跑'
  }
  return channelMap[channel] || 'APP/短信/零小跑'
}

// 里程校验
// validateMileage 已从 receptionCommon 导入

// 获取详情
const fetchDetail = async() => {
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
      detail.vehicleProfileServiceResp = data.vehicleProfileServiceResp || {}

      // 获取附件列表并分类回显
      const fileRes = await getFileList({ businessId: route.query.id, pageSize: 100 })
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
      signatureData.signChannel = getSignChannelName(data.signChannel)

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
      if (detail.repairPersonTag === '车主') {
        repairPersonType.value = 'owner'
        repairPersonNameInput.value = detail.customerName
        repairPersonPhoneInput.value = detail.customerPhone
      } else if (detail.repairPersonTag === '绑车人') {
        repairPersonType.value = 'bindingUser'

        repairPersonNameInput.value = detail.bindingUser
        repairPersonPhoneInput.value = detail.binderPhone
      } else {
        repairPersonType.value = 'other'

        repairPersonNameInput.value = detail.repairPerson
        repairPersonPhoneInput.value = detail.repairPersonPhone
      }

      // 里程校验
      validateMileage(data.mileage, data.lastMileage, data.netMileage)

      // 检查是否从添加项目/零件页面返回，需要更新故障状态
      if (sessionStorage.getItem('faultDetected') === '1') {
        isSettingFaultProgrammatically.value = true
        detail.currentFault = '1'
        nextTick(() => { isSettingFaultProgrammatically.value = false })
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
  }
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
  detail.customerName = selectedCarInfo.value.vehicleProfileOwnerResp?.ownerName || ''
  detail.customerPhone = selectedCarInfo.value.vehicleProfileOwnerResp?.mobilephone || ''
  detail.bindingUser = selectedCarInfo.value.vehicleProfileOwnerResp?.bindingUser || ''
  detail.binderPhone = selectedCarInfo.value.vehicleProfileOwnerResp?.bindingPhone || ''
  detail.vehicleProfileServiceResp = selectedCarInfo.value.vehicleProfileServiceResp || {}

  // 更新送修人信息为当前车主
  detail.repairPerson = detail.customerName
  detail.repairPersonPhone = detail.customerPhone
  detail.repairPersonTag = '车主'
  repairPersonType.value = 'owner'
  repairPersonNameInput.value = detail.customerName
  repairPersonPhoneInput.value = detail.customerPhone

  // 获取车联网里程数
  if (detail.vin) {
    fetchVehicleMileage(detail.vin)
  }

  // 获取上次环检信息
  if (detail.vin) {
    getRecentlyServiceProxy(detail.vin).then((res) => {
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
                businessId: detail.id
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
                businessId: detail.id
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

  showToast('更换车辆成功')
  onChangeCarClose()
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
  currentUploadIndex.value = 0
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

// 选择图片来源
const onSelectImageSource = (source) => _onSelectImageSource(source, showImageUploadSheet, imageUploadRef)
// 获取目标文件列表
const getTargetFileList = (type) => _getTargetFileList(type, detail, signatureData)

// 处理图片文件选择
const handleImageFileChange = (event) => {
  console.log('event:', event)
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
          businessId: route.query.id,
          configCode: 'mcs_serviceproxy',
          attachType: attachTypeMap[uploadType]
        }

        const res = await uploadFileByUrl([params])

        if (res.code === 200) {
          // 兼容两种返回格式：数组或对象
          const uploadData = Array.isArray(res.data) ? res.data[0] || {} : res.data || {}
          const rawUrl = uploadData.url || uploadData.fileUrl || previewUrl
          const authFileUrl = uploadData.authFileUrl || rawUrl

          // 更新文件状态 - 使用保存的 uploadType
          const targetList = getTargetFileList(uploadType)
          if (targetList.length > 0) {
            const lastIndex = targetList.length - 1
            targetList[lastIndex] = {
              ...targetList[lastIndex],
              status: 'done',
              message: '',
              id: uploadData.id, // 取上传成功的id
              businessId: detail.id, // 取施工单id
              url: rawUrl,
              fileUrl: rawUrl,
              authFileUrl
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
        businessId: detail.id,
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
          const rawUrl = uploadData.fileUrl || uploadData.url || singleUrl
          targetList[lastIndex] = {
            ...targetList[lastIndex],
            status: 'done',
            message: '',
            id: uploadData.id, // 取上传成功的id
            businessId: detail.id, // 取施工单id
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
}

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
  console.log('item22', item, detail.faultModules)
  const exists = detail.faultModules.some((m) => m.cccId === item.cccId)
  if (exists) {
    showToast('该故障模块已添加')
    return
  }
  delete item.id
  saveSpFaultModule({ ...item, serviceProxyId: detail.id }).then(res => {
    if (res.code === 200) {
      // 将新添加的故障模块加入列表显示
      detail.faultModules.push({
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
    } else {
      showToast(res.msg || '添加失败')
    }
  }).catch(err => {
    showToast(err.msg || '添加失败')
  })
}

// 删除故障模块
const onDeleteFaultModule = async(module) => {
  try {
    await showConfirmDialog({
      title: '提示',
      message: '是否要删除此接车施工单-故障模块？您无法撤销此操作。'
    })
    deleteSpFaultModule([module.id]).then(res => {
      if (res.code === 200) {
        const index = detail.faultModules.findIndex((m) => m.id === module.id)
        if (index > -1) {
          detail.faultModules.splice(index, 1)
        }
        showToast('删除成功')
        if (detail.faultModules.length === 0) {
          showConfirmDialog({
            title: '提示',
            message: '全部故障模块已删除，请重新确认【本次进店是否存在故障】？'
          })
        }
      } else {
        showToast(res.msg || '删除失败')
      }
    })
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

// 故障模块是否只读（已生成结算单、已作废、已交车不可修改）
const isFaultReadonly = computed(() =>
  detail.isCreateStatementInfo === 1 || detail.orderStatus === 180 || detail.orderStatus === 210
)

// 已生成结算单但未交车/未作废，部分字段仍可编辑
const isSettled = computed(() => detail.isCreateStatementInfo === 1)

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
  // 根据类型更新输入框的值
  if (type === 'owner') {
    repairPersonNameInput.value = detail.customerName
    repairPersonPhoneInput.value = detail.customerPhone
    detail.repairPersonTag = '车主'
  } else if (type === 'bindingUser') {
    repairPersonNameInput.value = detail.bindingUser
    repairPersonPhoneInput.value = detail.binderPhone
    detail.repairPersonTag = '绑车人'
  } else {
    // 其他：带出车主信息，支持编辑
    repairPersonNameInput.value = detail.shuttleName || detail.customerName
    repairPersonPhoneInput.value = detail.shuttlePhone || detail.customerPhone
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

// 选择业务类型
// const onSelectBusinessType = (item) => {
//   detail.businessType = item.value
//   // 收起面板
//   businessTypeCollapse.value = []
// }

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
  if (isInspectionSaveDisabled.value) return
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
  // 里程校验
  validateMileage(detail.mileage, detail.lastMileage, detail.networkMileageTotal)
  // 已生成结算单时跳过故障和照片校验
  if (!isSettled.value) {
    // 如果currentFault为1，客户故障描述必填
    if (Number(detail.currentFault) === 1 && !detail.customerFaultDesc.trim()) {
      showToast('请输入客户故障描述')
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
    // 数据没有变化，更新快照并返回
    saveDataSnapshot()
    // return { code: 200 }
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
    startWarrantyDate: detail.vehicleProfileServiceResp.warrantyStartdate,
    expectFinishAt: signatureData.expectFinishAt,
    remark: detail.remark,
    status: detail.status,
    statusDesc: detail.statusDesc,
    pickStatus: detail.pickStatus,
    shuttleName: detail.repairPerson,
    shuttlePhone: detail.repairPersonPhone,
    payType: detail.payType,
    warrantyCompany: detail.warrantyCompany,
    signChannel: signatureData.signChannel === '纸质单据' || Number(detail.signChannel) === 40 ? '40' : '',
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
    maintenanceMileage: detail.vehicleProfileServiceResp.nextMaintainMileages,
    maintenanceTime: detail.vehicleProfileServiceResp.nextMaintainDate,
    saleDate: detail.vehicleProfileServiceResp.salesDate,
    vehModelId: detail.vehicleModelId,
    vehRegisteredModelId: detail.vehicleProfileServiceResp.carSaleSversionId,
    vehRegisteredModelName: detail.vehicleProfileServiceResp.carSalesVersionName,
    vehYearTypeId: detail.vehicleProfileServiceResp.vehicleYearId,
    vehYearTypeName: detail.vehicleProfileServiceResp.vehicleYearName,
    dedicatedServiceManager: detail.vehicleProfileServiceResp.serviceUserName,
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
    currentSituation: Number(detail.currentFault) === 1 ? 20 : 10,
    // faultAlert: detail.faultAlert,
    faultPeriod: detail.faultPeriod,
    earliestfaultServiceProxy: detail.earliestfaultServiceProxy,
    recentlyfaultServiceProxy: detail.recentlyfaultServiceProxy,
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

// 项目零件保存
const onPartsSave = async() => {
  if (isPartsSaveDisabled.value) return
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
  // 售前保修只能单独开单
  if (!validatePreSaleWarranty(items, parts)) return

  // 善意保修只能单独开单
  if (!validateGoodWillWarranty(items, parts)) return
  // 记录保存前的维修类型（从当前detail取值，确保准确反映保存前的状态）
  const oldRepairItemTypeDetailCollect = detail.repairItemTypeDetailCollect || ''

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
      showToast(res.msg || '保存失败')
      return
    }
    showToast('保存成功')
    // 同步更新快照，确保返回拦截判断准确
    saveDataSnapshot()
    // 执行inspection保存（带id编辑）
    const inspectionRes = await onInspectionSave(1)
    if (inspectionRes?.code === 200) {
      isSaved.value = true
    }
    await fetchDetail()
    fetchRemindInfo()

    // 判断：原来不包含一般维修或三电维修，保存后包含了一般维修或三电维修，且本次进店是否存在故障为否
    const newRepairItemTypeDetailCollect = detail.repairItemTypeDetailCollect
    const hadGeneralOrThreeElectric = oldRepairItemTypeDetailCollect.includes('一般维修') || oldRepairItemTypeDetailCollect.includes('三电维修')
    const hasGeneralOrThreeElectric = newRepairItemTypeDetailCollect.includes('一般维修') || newRepairItemTypeDetailCollect.includes('三电维修')
    console.log('hadGeneralOrThreeElectric', hadGeneralOrThreeElectric, hasGeneralOrThreeElectric, detail.currentFault)
    if (!hadGeneralOrThreeElectric && hasGeneralOrThreeElectric && Number(detail.currentFault) === 0) {
      isSettingFaultProgrammatically.value = true
      detail.currentFault = '1'
      nextTick(() => { isSettingFaultProgrammatically.value = false })
      // 清空默认文本
      if (detail.customerFaultDesc === '本次进店车辆无故障') {
        detail.customerFaultDesc = ''
      }
      showToast({ message: '维修类型为一般维修或三电维修，系统默认调整 【本次进店是否存在故障】为是，存在故障，请填写故障模块信息!', duration: 3000 })
      // 切换tab到环检信息
      activeTab.value = 'inspection'
    }
  } catch (error) {
    console.error('保存失败:', error)
    showToast('保存失败')
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
  if (Number(detail.currentFault) === 1 && !detail.customerFaultDesc.trim()) {
    showToast('请输入客户故障描述')
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
        fetchDetail()
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
  router.push({
    path: '/reception/add-parts',
    query: {
      serviceProxyId: route.query.id,
      vehModelName: detail.vehicleModelName,
      currentFault: detail.currentFault
    }
  })
}

// 添加套餐及其他
const onAddPackage = () => {
  router.push({
    path: '/reception/select-package',
    query: {
      serviceProxyId: route.query.id
    }
  })
}

// 留车检查返回数据
const checkFaultData = ref(null)

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

  // 如果已设置不需要留车提醒，直接执行后续流程
  if (Number(detail.isVehRetentionRemind) === 1) {
    handleConfirmAndSignProcess()
    return
  }

  // 先调用checkFault接口
  try {
    savingLoading.value = true
    const res = await checkFault(detail.id)
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
  const isPaperSign = signatureData.signChannel === '纸质单据' || Number(detail.signChannel) === 40
  // signStatus == 10 时，纸质单据需调用接口保存，其他渠道直接跳转结算页面
  if (Number(detail.signStatus) === 10 && !isPaperSign) {
    const settlementUrl = `${window.APP_AIS_H5_CONFIG?.VITE_STATIC_RES_URL || import.meta.env.VITE_STATIC_RES_URL}/leapx/biling/aisInner/constructionOrder?serviceProxyId=${detail.id}&signChannel=3`
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
    params.signChannel = '40'
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
          const settlementUrl = `${window.APP_AIS_H5_CONFIG?.VITE_STATIC_RES_URL || import.meta.env.VITE_STATIC_RES_URL}/leapx/biling/aisInner/constructionOrder?serviceProxyId=${detail.id}&signChannel=3`
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
  if (detail.orderStatus === 180 || detail.orderStatus === 210) {
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
  if (signatureData.expectFinishAt) {
    selectedDeliveryDate.value = signatureData.expectFinishAt.split(' ')[0] || ''
    selectedDeliveryTime.value = signatureData.expectFinishAt.split(' ')[1] || ''
  }
  showDeliveryTimePicker.value = true
}

// 保存预计交车时间
const onSaveDeliveryTime = () => {
  if (!signatureData.expectFinishAt) {
    showToast('请选择预计交车时间')
    return
  }
  savingLoading.value = true
  serviceAddOrUpdate({
    ...detail,
    vehProfileVin: detail.vin,
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
// 点击制单确认并签字，先查询最新状态，再弹出签字渠道选择
const onConfirmAndSignClick = async() => {
  const id = route.query.id
  if (!id) return
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
    const prevSignStatus = String(detail.signStatus)
    const res = await getDetail(id)
    if (res.code === 200 && res.data) {
      const newSignStatus = String(res.data.signStatus)
      // signStatus 由非20变为20，表示工单状态已更新，需重新加载数据
      if (prevSignStatus !== '20' && newSignStatus === '20') {
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

// 获取提醒信息（预授权、三包预警、服务活动、差价等）
const fetchRemindInfo = () => {
  if (!route.query.id) return
  getRemindInfo(route.query.id).then((res) => {
    if (res.code === 200) {
      const rawData = res.data || []
      const validTypes = [RemindInfoTypeEnum.THREE_GUARANTEES, RemindInfoTypeEnum.SERVICE_ACTIVITY, RemindInfoTypeEnum.PRICE_DIFFERENCE, '5']
      const preAuthItems = rawData.filter((item) => item.type === RemindInfoTypeEnum.PRE_AUTH)
      const otherItems = rawData.filter((item) => validTypes.includes(item.type))
      remindList.value = [...preAuthItems, ...otherItems]
      if (remindList.value.length > 0) {
        showWarrantyAlertDialog.value = true
      }
    }
  })
}

onMounted(() => {
  loadInitialData()
  fetchDetail()
  // 获取枚举数据
  globalStore.getEnumData()
  // 初始化送修人输入框
  repairPersonNameInput.value = detail.repairPerson
  repairPersonPhoneInput.value = detail.repairPersonPhone
  // 初始化预计交车日期列表
  generateDeliveryDates()
  // 初始化预计交车时间列表
  generateDeliveryTimes()
  // 获取提醒信息
  if (route.query.id) {
    setTimeout(() => {
      fetchRemindInfo()
    }, 1000)
  }
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
.loading-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

// 项目零件Tab样式
.parts-section {
  padding: 12px;

  .section-title {
    font-size: 14px;
    font-weight: 500;
    color: #191a1b;
    margin-bottom: 12px;
  }

  .package-group {
    margin-bottom: 12px;
    border-radius: 8px;
    overflow: hidden;
    border-top: 0.5px solid rgba(0, 145, 0, 0.1);
    border-bottom: 0.5px solid rgba(0, 145, 0, 0.1);

    .package-group-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;

      .package-group-title {
        display: flex;
        align-items: center;
      }

      .package-label {
        font-size: 14px;
        font-weight: 500;
        color: #191a1b;
      }

      .package-code {
        font-size: 12px;
        color: #191a1b;
      }
    }
  }

  .parts-card {
    background: #ffffff;
    border: 0.5px solid rgba(0, 0, 0, 0.06);
    border-radius: 8px;
    padding: 15px 12px;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 12px;

    .card-delete {
      width: 28px;
      height: 28px;
      background: #f8e8e8;
      border-radius: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .card-content {
      flex: 1;
      min-width: 0;

      .card-top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;

        .card-info {
          flex: 1;
          min-width: 0;

          .item-name {
            font-size: 14px;
            color: #191a1b;
            font-weight: 500;
            line-height: 1.4;
          }

          .item-code {
            font-size: 12px;
            color: #545454;
            margin-top: 2px;
          }

          .item-category {
            display: inline-flex;
            align-items: center;
            gap: 2px;
            background: rgba(84, 84, 84, 0.06);
            padding: 2px 4px;
            border-radius: 4px;
            margin-top: 4px;

            .category-text {
              font-size: 12px;
              color: #545454;
            }
          }
        }

        .card-price {
          display: flex;
          flex-direction: column;
          align-items: flex-end;

          .item-price {
            font-size: 14px;
            color: #191a1b;
            font-weight: 500;
          }

          .discount-tags {
            display: flex;
            align-items: center;
            margin-top: 4px;

            .discount-tag {
              font-size: 12px;
              color: #545454;
              background: #faf6ea;
              padding: 2px 4px;
              border-radius: 4px 0 0 4px;
            }

            .discount-amount {
              font-size: 12px;
              color: #c8a12b;
              background: #faf6ea;
              padding: 2px 4px;
              border-radius: 0 4px 4px 0;
            }
          }
        }
      }

      .card-bottom {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 8px;
        padding-top: 8px;

        .item-subtotal {
          font-size: 12px;
          color: #545454;
        }

        .quantity-stepper {
          .van-stepper {
            border: 1px solid #191a1b;
            border-radius: 4px;
          }
          :deep(.van-stepper__minus),
          :deep(.van-stepper__plus),
          :deep(.van-stepper__input) {
            background: #fff;
          }

          :deep(.van-stepper__minus--disabled),
          :deep(.van-stepper__plus--disabled) {
            background-color: #fff;
          }
        }
      }
    }
  }
}

// 图片上传action sheet样式
:deep(.van-action-sheet) {
  .van-action-sheet__cancel {
    margin-bottom: 34px !important;
  }
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

:deep(.van-collapse-item__content) {
  padding: 0;
}
.section-field{
  :deep(.van-field__control) {
    width: 100px;
    text-align: right
  }
  :deep(.van-cell) {
    padding-right: 0;
  }
  :deep(.van-field__button) {
    padding-left: 3px;
    display: inline-flex;
    align-items: center;
  }
}
</style>
