<template>
  <div class="work-order-create">
    <!-- 车辆信息卡片 -->
    <div class="vehicle-card">
      <div class="plate-row">
        <span class="plate-no">{{ detail.plateNo }}</span>
        <span v-if="detail.isAppointment" class="appointment-tag">预约客户</span>
        <span class="edit-plate edit-plate-after" @click="onChangeCar">
          <span><img src="@/assets/image/car.png" alt="" /></span>
          <span>换车</span>
        </span>
        <span class="edit-plate" @click="onEditPlate">
          <span><img src="@/assets/image/edit.png" alt="" /></span>
          <span>修改车牌</span>
        </span>
      </div>
      <div class="vehicle-model">{{ detail.vehicleModel }} · {{ detail.vin }}</div>
      <div class="info-row">
        <span class="label">保修日期：</span>
        <span class="value">{{ detail.warrantyDate }}</span>
      </div>
      <div class="info-row">
        <span class="label">车主：</span>
        <span class="value">{{ detail.owner }} {{ detail.ownerPhone }}</span>
      </div>
      <div class="info-row">
        <span class="label">绑车人：</span>
        <span class="value">{{ detail.binder }} {{ detail.binderPhone }}</span>
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
                :class="['type-item', { active: repairPersonType === 'binder' }]"
                @click="onSelectRepairPersonType('binder')"
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
                <span class="label">送修人姓名</span>
                <div class="value-wrapper">
                  <input
                    v-model="repairPersonNameInput"
                    type="text"
                    placeholder="请输入姓名"
                    class="edit-input"
                    @input="onRepairPersonNameChange"
                  />
                  <van-icon name="edit" size="16" color="#888888" />
                </div>
              </div>
              <div class="info-row">
                <span class="label">送修人手机</span>
                <div class="value-wrapper">
                  <input
                    v-model="repairPersonPhoneInput"
                    type="tel"
                    placeholder="请输入手机号"
                    class="edit-input"
                    @input="onRepairPersonPhoneChange"
                  />
                  <van-icon name="edit" size="16" color="#888888" />
                </div>
              </div>
            </div>
          </div>
        </van-collapse-item>
      </van-collapse>

      <!-- 业务类型折叠面板 -->
      <van-collapse v-model="businessTypeCollapse" class="collapse-panel">
        <van-collapse-item name="businessType">
          <template #title>
            <div class="select-row">
              <span class="label">业务类型</span>
              <span class="value">{{ detail.businessType }}</span>
            </div>
          </template>
          <div class="collapse-content">
            <div class="type-grid">
              <div
                v-for="item in businessTypeList"
                :key="item.value"
                :class="['type-item', { active: detail.businessType === item.label }]"
                @click="onSelectBusinessType(item)"
              >
                {{ item.label }}
              </div>
            </div>
          </div>
        </van-collapse-item>
      </van-collapse>
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
              <div class="sub-info">车联网里程数(总)：{{ detail.networkMileageTotal }}km</div>
              <div class="sub-info">车联网里程数(增)：{{ detail.networkMileageAdd }}km</div>
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

            <!-- 车内检查 -->
            <div class="section-card borderB">
              <div class="section-title">车内检查</div>
              <div class="image-grid">
                <div
                  v-for="(img, index) in detail.interiorImages"
                  :key="'interior-' + index"
                  class="image-item"
                >
                  <van-image :src="img" fit="cover" />
                  <span class="delete-btn" @click="onDeleteImage('interior', index)">
                    <van-icon name="cross" />
                  </span>
                </div>
                <div class="image-item upload-item" @click="onUploadImage('interior')">
                  <van-icon name="photo-o" size="24" />
                  <span>上传</span>
                </div>
              </div>
            </div>

            <!-- 车外检查 -->
            <div class="section-card borderB">
              <div class="section-title">车外检查</div>
              <div class="image-grid">
                <div
                  v-for="(img, index) in detail.exteriorImages"
                  :key="'exterior-' + index"
                  class="image-item"
                >
                  <van-image :src="img" fit="cover" />
                  <span class="delete-btn" @click="onDeleteImage('exterior', index)">
                    <van-icon name="cross" />
                  </span>
                </div>
                <div class="image-item upload-item" @click="onUploadImage('exterior')">
                  <van-icon name="photo-o" size="24" />
                  <span>上传</span>
                </div>
              </div>
            </div>

            <!-- 异常描述 -->
            <div class="section-card">
              <div class="section-title">异常描述</div>
              <van-field
                v-model="detail.abnormalDesc"
                type="textarea"
                placeholder="请输入异常描述"
                rows="3"
                autosize
                show-word-limit
                maxlength="500"
              />
            </div>
          </div>
          <div class="fault-info">
            <!-- 是否存在故障 -->
            <div class="section-card">
              <div class="fault-header">
                <span class="title">本次进店是否存在故障</span>
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
              <div class="fault-modules">
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
                    <span class="module-name">{{ module }}</span>
                    <van-icon name="delete-o" @click="onDeleteFaultModule(index)" />
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
              <div class="section-title">客户故障描述</div>
              <van-field
                v-model="detail.customerFaultDesc"
                type="textarea"
                placeholder="请输入客户故障描述"
                rows="3"
                autosize
                show-word-limit
                maxlength="500"
              />
            </div>
          </div>
        </div>
      </van-tab>

      <van-tab title="项目零件" name="parts">
        <div class="tab-content parts-tab">
          <!-- 费用汇总 -->
          <div style="padding: 12px; background: #fff">
            <div class="cost-summary">
              <div class="summary-row">
                <span class="label">维修项目</span>
                <span class="amount">¥{{ partsData.repairAmount }}</span>
              </div>
              <span class="operator">+</span>
              <div class="summary-row">
                <span class="label">维修配件</span>
                <span class="amount">¥{{ partsData.partsAmount }}</span>
              </div>
              <span class="operator">=</span>
              <div class="summary-row total">
                <span class="label">费用合计</span>
                <span class="amount">¥{{ partsData.totalAmount }}</span>
              </div>
            </div>
          </div>

          <!-- 套餐列表 -->
          <div style="padding: 12px">
            <div
              v-for="(packageItem, pIndex) in partsData.packages"
              :key="'package-' + pIndex"
              class="package-card"
            >
              <div class="package-header">
                <span class="package-name">{{ packageItem.name }}</span>
              </div>
              <!-- 项目列表 -->
              <div v-for="itemData in packageItem.items" :key="itemData.code" class="parts-item">
                <PartsItemCard
                  :data="itemData"
                  @delete="onDelete"
                  @change="onChange"
                  @categoryClick="onCategoryClick"
                />
              </div>
            </div>
          </div>
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

      <van-tab title="签字确认" name="signature">
        <div class="tab-content signature-tab">
          <!-- 费用合计 -->
          <div class="signature-section">
            <div class="signature-row">
              <span class="label">费用合计</span>
              <span class="value">¥{{ signatureData.totalAmount }}</span>
            </div>
            <div class="signature-row">
              <span class="label">维修类型</span>
              <span class="value">{{ signatureData.repairTypes }}</span>
            </div>
            <div class="signature-row" @click="showDeliveryTimePicker = true">
              <span class="label">预计交车时间</span>
              <div class="value-wrapper">
                <span :class="['value', { placeholder: !signatureData.deliveryTime }]">
                  {{ signatureData.deliveryTime || '请选择' }}
                </span>
                <van-icon name="arrow" size="12" color="#545454" />
              </div>
            </div>
            <div class="signature-row">
              <span class="label">开启维修直播</span>
              <van-switch v-model="signatureData.liveEnabled" size="20" active-color="#009100" />
            </div>
            <div class="signature-row" @click="showSignatureChannelPicker = true">
              <span class="label">签字渠道</span>
              <div class="value-wrapper">
                <span :class="['value', { placeholder: !signatureData.signatureChannel }]">
                  {{ signatureData.signatureChannel || '请选择' }}
                </span>
                <van-icon name="arrow" size="12" color="#545454" />
              </div>
            </div>
          </div>

          <!-- 附件信息 -->
          <div class="attachment-section">
            <div class="section-title">附件信息</div>
            <div class="image-grid">
              <div
                v-for="(img, index) in signatureData.attachments"
                :key="'attachment-' + index"
                class="image-item"
              >
                <van-image :src="img" fit="cover" />
                <span class="delete-btn" @click="onDeleteAttachment(index)">
                  <van-icon name="cross" />
                </span>
              </div>
              <div class="image-item upload-item" @click="onUploadAttachment">
                <van-icon name="photo-o" size="24" />
                <span>上传</span>
              </div>
            </div>
          </div>
        </div>
      </van-tab>
    </van-tabs>

    <!-- 底部操作栏 -->
    <div class="bottom-bar">
      <span class="more-btn" @click="onMore">更多</span>
      <span class="save-btn" @click="onSave">保存</span>
      <span class="complete-btn" @click="onComplete">预检完成</span>
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
                  :source-string="item.plateNo + '/' + item.vin + '/' + item.owner"
                />
              </span>
            </div>
          </div>

          <!-- 选中车辆信息卡片 -->
          <div v-if="selectedCarInfo" class="car-info-card">
            <div class="card-header">
              <span class="plate-no">{{ selectedCarInfo.plateNo }}</span>
            </div>
            <div class="card-info-list">
              <div class="info-row">
                <span class="label">车型</span>
                <span class="value">{{ selectedCarInfo.vehicleModel }}</span>
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
                  >{{ selectedCarInfo.owner }} {{ selectedCarInfo.ownerPhone }}</span
                >
              </div>
              <div class="info-row">
                <span class="label">绑车人</span>
                <span class="value"
                  >{{ selectedCarInfo.binder }} {{ selectedCarInfo.binderPhone }}</span
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
    <van-action-sheet v-model:show="showDeliveryTimePicker" title="选择预计交车时间">
      <div class="picker-content">
        <div
          v-for="item in deliveryTimeList"
          :key="item.value"
          :class="['picker-item', { active: signatureData.deliveryTime === item.label }]"
          @click="onSelectDeliveryTime(item)"
        >
          {{ item.label }}
        </div>
      </div>
    </van-action-sheet>

    <!-- 签字渠道选择器 -->
    <van-action-sheet v-model:show="showSignatureChannelPicker" title="选择签字渠道">
      <div class="picker-content">
        <div
          v-for="item in signatureChannelList"
          :key="item.value"
          :class="['picker-item', { active: signatureData.signatureChannel === item.label }]"
          @click="onSelectSignatureChannel(item)"
        >
          {{ item.label }}
        </div>
      </div>
    </van-action-sheet>

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
                placeholder="请输入VRT/VFG/CCC"
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
              v-for="(item, index) in filteredFaultModuleList"
              :key="index"
              class="fault-item"
              @click="onAddFaultModuleItem(item)"
            >
              <van-highlight :keywords="faultSearchValue" :source-string="item.text" />
            </div>
            <!-- 无结果 -->
            <div v-if="filteredFaultModuleList.length === 0 && faultSearchValue" class="no-result">
              <img src="@/assets/image/noList.png" alt="" />
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
      :style="{ background: '#f4f4f4', height: '50%' }"
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
            maxlength="200"
            style="background: #f4f4f4; border-radius: 6px"
          />
        </div>
      </template>
      <template #footer>
        <div class="confirm-btn" @click="onConfirmCancel">确定</div>
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { useGlobalStore } from '@/stores/global'
import AisPopup from '@/libs/components/AisPopup.vue'
import PartsItemCard from '@/components/PartsItemCard.vue'
import './create.scss'

const route = useRoute()
const router = useRouter()
const globalStore = useGlobalStore()
const addFaultModuleShow = ref(false)
const changeCarDialog = ref(false)
const changePlateDialog = ref(false)

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

// 送修人类型选择
const repairPersonType = ref('owner') // owner/binder/other
const repairPersonNameInput = ref('')
const repairPersonPhoneInput = ref('')

// 折叠面板状态
const repairPersonCollapse = ref([])
const businessTypeCollapse = ref([])

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
const onConfirmChangePlate = () => {
  const newPlate = plateInputChars.value.join('')
  if (newPlate.length < 7) {
    showToast('请输入完整的车牌号')
    return
  }
  detail.plateNo = newPlate
  showToast('车牌修改成功')
}

const moreActionsList = [
  { name: '权益查询', tag: '1', color: '#191a1b' },
  { name: '维修履历', tag: '2', color: '#191a1b' },
  { name: '实时故障', tag: '3', color: '#191a1b' },
  { name: '作废', tag: '4', color: '#191a1b' }
]
const faultModuleList = [
  { text: 'F02-电子电器 V21-热管理系统零跑机电' },
  { text: 'F02-电子电器 V21-热管理系统零跑机电热管理系统零跑机电' },
  { text: '发动机冒烟' },
  { text: 'F03-底盘系统 V22-悬挂系统' },
  { text: 'F04-动力系统 V23-电池管理' },
  { text: 'F05-车身系统 V24-车门控制' }
]

// 过滤后的故障模块列表
const filteredFaultModuleList = computed(() => {
  if (!faultSearchValue.value || !faultSearchValue.value.trim()) {
    return faultModuleList
  }
  const keyword = faultSearchValue.value.toLowerCase()
  return faultModuleList.filter((item) => item.text.toLowerCase().includes(keyword))
})
// 作废原因弹框状态
const showCancelReason = ref(false)
// 作废原因
const cancelReason = ref('')
// 更多操作选择内容
const onSelectMoreAction = (action) => {
  console.log(action)
  if (action.name === '作废') {
    cancelReason.value = ''
    showCancelReason.value = true
  }
  if (action.name === '维修履历') {
    router.push({
      path: '/reception/maintenance-history',
      query: {
        vin: detail.vin,
        plateNo: detail.plateNo,
        vehicleModel: detail.vehicleModel
      }
    })
  }
  if (action.name === '权益查询') {
    router.push({
      path: '/reception/rights-query',
      query: {
        vin: detail.vin
      }
    })
  }
}
// 确认作废
const onConfirmCancel = () => {
  if (!cancelReason.value.trim()) {
    showToast('请输入作废原因')
    return
  }
  console.log('作废原因:', cancelReason.value)
  showToast('作废成功')
  showCancelReason.value = false
  cancelReason.value = ''
}

// 是否存在故障变更
const onHasFaultChange = (value) => {
  // 如果选择"否"，弹出确认框
  if (value === '2') {
    pendingFaultValue.value = value
    showFaultConfirm.value = true
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
  // 清空故障模块和客户故障描述
  detail.faultModules = []
  detail.customerFaultDesc = ''
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
  { value: 'natural', label: '自然到店' },
  { value: 'appointment', label: '预约到店' },
  { value: 'door_service', label: '上门服务' },
  { value: 'pickup', label: '取送车服务' },
  { value: 'outstation', label: '外出驻点' }
])

// 详情数据
const detail = reactive({
  plateNo: '浙AA12345',
  isAppointment: true,
  vehicleModel: 'B10-510激光雷达版',
  vin: 'LFV3H6686RKYM3393',
  warrantyDate: '2026-01-01 至 2029-12-31',
  owner: '王小虎',
  ownerPhone: '13012345678',
  binder: '张小龙',
  binderPhone: '13012341234',
  repairPerson: '王小虎',
  repairPersonPhone: '13012345678',
  repairPersonTag: '车主',
  businessType: '预约到店',
  mileage: '47004',
  networkMileageTotal: '47003.00',
  networkMileageAdd: '1002.00',
  battery: '74',
  networkBattery: '74',
  interiorImages: [
    'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
    'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
    'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'
  ],
  exteriorImages: [
    'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
    'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
    'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
    'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
    'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
    'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'
  ],
  abnormalDesc:
    '这是一条异常描述内容，这是一条异常描述内容，这是一条异常描述内容这是一条异常描述内容，这是一条异常描述内容异常描述内容',
  hasFault: '1',
  faultModules: [
    'F02-电子电器 V21-热管理系统零跑机电',
    'F03-底盘系统 V22-悬挂系统',
    'F0333-底盘系统 V22-悬挂系统',
    'F0111-底盘系统 V22-悬挂系统'
  ],
  customerFaultDesc: '客户说主驾空调不出暖风'
})

// 项目零件数据
const partsData = reactive({
  repairAmount: '17,676.00',
  partsAmount: '20,525.56',
  totalAmount: '38,201.56',
  packages: [
    {
      name: '省心保养套餐-9AB102382372389238',
      items: [
        {
          name: '前保险杠补漆',
          code: 'C1031000035',
          category: '一般维修-保险-无',
          price: '621.50',
          discount: '0.00',
          subtotal: '700.00',
          quantity: 1
        },
        {
          name: '前保险杠补漆',
          code: 'C1031000035',
          category: '一般维修-保险-无',
          price: '621.50',
          discount: '0.00',
          subtotal: '700.00',
          quantity: 1
        }
      ]
    },
    {
      name: '省心保养套餐-9AB102382372389238',
      items: [
        {
          name: '前保险杠补漆',
          code: 'C1031000035',
          category: '一般维修-保险-无',
          price: '621.50',
          discount: '0.00',
          subtotal: '700.00',
          quantity: 1
        },
        {
          name: '前保险杠补漆',
          code: 'C1031000035',
          category: '一般维修-保险-无',
          price: '621.50',
          discount: '0.00',
          subtotal: '700.00',
          quantity: 1
        }
      ]
    }
  ]
})

// 签字确认数据
const signatureData = reactive({
  totalAmount: '38,201.56',
  repairTypes: '一般维修、钣金、美容装潢、三电维修、精品附件',
  deliveryTime: '',
  liveEnabled: false,
  signatureChannel: '',
  attachments: []
})

// 选择器显示状态
const showDeliveryTimePicker = ref(false)
const showSignatureChannelPicker = ref(false)

// 预计交车时间列表
const deliveryTimeList = ref([
  { value: 'morning', label: '上午' },
  { value: 'afternoon', label: '下午' },
  { value: 'evening', label: '晚上' }
])

// 签字渠道列表
const signatureChannelList = ref([
  { value: 'wechat', label: '微信小程序' },
  { value: 'app', label: 'APP签字' },
  { value: 'offline', label: '线下签字' }
])

// 获取详情
const fetchDetail = async() => {
  const id = route.query.id
  const vehicleInfoStr = route.query.vehicleInfo

  // 如果有车辆信息，则从车辆搜索页面跳转过来
  if (vehicleInfoStr) {
    try {
      const vehicleInfo = JSON.parse(vehicleInfoStr)
      // 更新车辆信息
      detail.plateNo = vehicleInfo.plateNo || ''
      detail.vin = vehicleInfo.vin || ''
      detail.vehicleModel = vehicleInfo.vehicleModel || ''
      detail.warrantyDate = vehicleInfo.warrantyDate || ''
      detail.owner = vehicleInfo.owner || ''
      detail.ownerPhone = vehicleInfo.ownerPhone || ''
      detail.binder = vehicleInfo.binder || ''
      detail.binderPhone = vehicleInfo.binderPhone || ''
      detail.isAppointment = vehicleInfo.isAppointment || false
      detail.mileage = vehicleInfo.mileage || ''
      detail.battery = vehicleInfo.battery || ''
      // 默认送修人为车主
      detail.repairPerson = vehicleInfo.owner || ''
      detail.repairPersonPhone = vehicleInfo.ownerPhone || ''
      detail.repairPersonTag = '车主'
      repairPersonType.value = 'owner'
      // 初始化输入框
      repairPersonNameInput.value = vehicleInfo.owner || ''
      repairPersonPhoneInput.value = vehicleInfo.ownerPhone || ''
    } catch (e) {
      console.error('解析车辆信息失败:', e)
    }
    return
  }

  if (!id) return
  // TODO: 调用接口获取详情
  console.log('获取详情:', id)
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
const onCarSearch = (value) => {
  console.log('搜索车辆:', value)
  if (!value || !value.trim()) {
    carSearchResults.value = []
    hasSearched.value = false
    return
  }

  // 模拟搜索结果
  hasSearched.value = true
  carSearchResults.value = [
    {
      plateNo: '浙AA12345',
      vin: 'LFV3H6686RKYM3393',
      owner: '王小虎',
      ownerPhone: '13012345678',
      vehicleModel: 'B10-510激光雷达版',
      warrantyDate: '2026-01-01 至 2029-12-31',
      binder: '张小龙',
      binderPhone: '13012341234'
    },
    {
      plateNo: '浙BB88888',
      vin: 'LFV3H6686RKYM3394',
      owner: '李四',
      ownerPhone: '13012345679',
      vehicleModel: 'C11-510激光雷达版',
      warrantyDate: '2025-01-01 至 2028-12-31',
      binder: '王五',
      binderPhone: '13012341235'
    }
  ]
}

// 选择车辆
const onSelectCar = (item) => {
  selectedCarInfo.value = item
}

// 确认更换车辆
const onConfirmChangeCar = () => {
  if (!selectedCarInfo.value) {
    showToast('请选择车辆')
    return
  }

  // 更新车辆信息
  detail.plateNo = selectedCarInfo.value.plateNo
  detail.vin = selectedCarInfo.value.vin
  detail.vehicleModel = selectedCarInfo.value.vehicleModel
  detail.warrantyDate = selectedCarInfo.value.warrantyDate
  detail.owner = selectedCarInfo.value.owner
  detail.ownerPhone = selectedCarInfo.value.ownerPhone
  detail.binder = selectedCarInfo.value.binder
  detail.binderPhone = selectedCarInfo.value.binderPhone

  showToast('更换车辆成功')
  onChangeCarClose()
}
// 修改车牌
const onEditPlate = () => {
  changePlateDialog.value = true
}

// 删除图片
const onDeleteImage = (type, index) => {
  showConfirmDialog({
    title: '提示',
    message: '确定删除该图片吗？'
  })
    .then(() => {
      if (type === 'interior') {
        detail.interiorImages.splice(index, 1)
      } else {
        detail.exteriorImages.splice(index, 1)
      }
      showToast('删除成功')
    })
    .catch(() => {})
}

// 上传图片
const onUploadImage = (type) => {
  showToast('上传图片: ' + type)
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
const onFaultSearch = (value) => {
  console.log('搜索故障模块:', value)
}

// 清空故障模块搜索
const onFaultSearchClear = () => {
  faultSearchValue.value = ''
}

// 添加故障模块项
const onAddFaultModuleItem = (item) => {
  // 检查是否已存在
  if (detail.faultModules.includes(item.text)) {
    showToast('该故障模块已添加')
    return
  }
  detail.faultModules.push(item.text)
  showToast('添加成功')
  addFaultModuleShow.value = false
  faultSearchValue.value = ''
}

// 删除故障模块
const onDeleteFaultModule = (index) => {
  // 如果当前是展开状态，删除后需要调整索引
  const actualIndex = showAllModules.value ? index : index
  detail.faultModules.splice(actualIndex, 1)
}

// 查看全部故障模块
const onViewAllModules = () => {
  showAllModules.value = !showAllModules.value
}

// 选择送修人类型
const onSelectRepairPersonType = (type) => {
  repairPersonType.value = type
  // 根据类型更新输入框的值
  if (type === 'owner') {
    repairPersonNameInput.value = detail.owner
    repairPersonPhoneInput.value = detail.ownerPhone
    detail.repairPersonTag = '车主'
  } else if (type === 'binder') {
    repairPersonNameInput.value = detail.binder
    repairPersonPhoneInput.value = detail.binderPhone
    detail.repairPersonTag = '绑车人'
  } else {
    repairPersonNameInput.value = ''
    repairPersonPhoneInput.value = ''
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

// 选择业务类型
const onSelectBusinessType = (item) => {
  detail.businessType = item.label
  // 收起面板
  businessTypeCollapse.value = []
}

// 更多操作
const onMore = () => {
  showMoreActions.value = !showMoreActions.value
}

// 保存
const onSave = () => {
  showToast('保存成功')
}

// 预检完成
const onComplete = () => {
  showConfirmDialog({
    title: '提示',
    message: '确定预检完成吗？'
  })
    .then(() => {
      showToast('预检完成')
      router.back()
    })
    .catch(() => {})
}

const onLocalSearch = (val) => {
  console.log('onLocalSearch', val)
}

// 添加项目/零件
const onAddParts = () => {
  showToast('添加项目/零件')
}

// 添加套餐及其他
const onAddPackage = () => {
  showToast('添加套餐及其他')
}

// 删除附件
const onDeleteAttachment = (index) => {
  showConfirmDialog({
    title: '提示',
    message: '确定删除该附件吗？'
  })
    .then(() => {
      signatureData.attachments.splice(index, 1)
      showToast('删除成功')
    })
    .catch(() => {})
}

// 上传附件
const onUploadAttachment = () => {
  showToast('上传附件')
}

// 选择预计交车时间
const onSelectDeliveryTime = (item) => {
  signatureData.deliveryTime = item.label
  showDeliveryTimePicker.value = false
}

// 选择签字渠道
const onSelectSignatureChannel = (item) => {
  signatureData.signatureChannel = item.label
  showSignatureChannelPicker.value = false
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
  // 初始化送修人输入框
  repairPersonNameInput.value = detail.repairPerson
  repairPersonPhoneInput.value = detail.repairPersonPhone
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

      &:last-child {
        margin-bottom: 0;
      }

      &:active {
        background: #f7f7f7;
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
</style>
