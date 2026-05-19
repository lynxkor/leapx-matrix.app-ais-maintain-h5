<template>
  <div class="select-package">
    <!-- Tab导航 -->
    <van-tabs v-model:active="activeTab" sticky offset-top="44px" @change="onTabChange">
      <van-tab title="维修套餐" name="repair">
        <div class="tab-content">
          <!-- 搜索框 -->
          <div class="search-header">
            <van-search
              v-model="searchValue"
              placeholder="输入套餐代码、名称"
              shape="round"
              :autofocus="false"
              @search="onSearch"
              @clear="onSearchClear"
              style="width: 100%"
            >
              <template #left-icon>
                <van-icon name="search" size="16" color="#191A1B" />
              </template>
            </van-search>
          </div>
          <!-- 列表 -->
          <div class="package-list">
            <div
              v-for="item in packageList"
              :key="item.spellCode"
              class="package-item"
              @click="onPackageClick(item)"
            >
              <div class="item-info">
                <div class="item-name">{{ item.packageName }}</div>
                <div class="item-code">{{ item.spellCode }}</div>
              </div>
              <div v-if="item.used" class="item-status">已选</div>
            </div>
            <div v-if="packageList.length === 0 && !loading" class="no-data">
              <img src="@/assets/image/noList.png" alt="" />
            </div>
          </div>
        </div>
      </van-tab>

      <van-tab title="权益套餐" name="equity">
        <div class="tab-content">
          <div class="search-header">
            <van-search
              v-model="searchValue"
              placeholder="输入套餐代码、名称"
              shape="round"
              @search="onSearch"
              @clear="onSearchClear"
              style="width: 100%"
            >
              <template #left-icon>
                <van-icon name="search" size="16" color="#191A1B" />
              </template>
            </van-search>
          </div>
          <div class="package-list">
            <div
              v-for="(item, index) in equityList"
              :key="index"
              class="package-item"
              @click="onEquityClick(item)"
            >
              <div class="item-info">
                <div class="item-name">
                  {{ item.rightsName }}({{ item.remainTimes }}/{{ item.totalRemainTimes }})
                </div>
                <div class="item-code">{{ item.rightsCode }}</div>
              </div>
              <div v-if="item.used" class="item-status">已选</div>
            </div>
            <div v-if="equityList.length === 0 && !loading" class="no-data">
              <img src="@/assets/image/noList.png" alt="" />
            </div>
          </div>
        </div>
      </van-tab>

      <van-tab title="商城订单" name="mall">
        <div class="tab-content">
          <div class="search-header">
            <van-search
              v-model="searchValue"
              placeholder="输入套餐代码、名称"
              shape="round"
              @search="onSearch"
              @clear="onSearchClear"
              style="width: 100%"
            >
              <template #left-icon>
                <van-icon name="search" size="16" color="#191A1B" />
              </template>
            </van-search>
          </div>
          <div class="package-list">
            <div
              v-for="(item, index) in mallList"
              :key="index"
              class="package-item"
              @click="onMallClick(item)"
            >
              <div class="item-info">
                <div class="item-name">{{ item.interestsGoodsName }}</div>
                <div class="item-code">{{ item.interestsGoodsCode }}</div>
              </div>
              <div v-if="item.used" class="item-status">已选</div>
            </div>
            <div v-if="mallList.length === 0 && !loading" class="no-data">
              <img src="@/assets/image/noList.png" alt="" />
            </div>
          </div>
        </div>
      </van-tab>

      <van-tab title="免保项目" name="free">
        <div class="tab-content">
          <div class="search-header">
            <van-search
              v-model="searchValue"
              placeholder="输入套餐代码、名称"
              shape="round"
              @search="onSearch"
              @clear="onSearchClear"
              style="width: 100%"
            >
              <template #left-icon>
                <van-icon name="search" size="16" color="#191A1B" />
              </template>
            </van-search>
          </div>
          <div class="package-list">
            <div
              v-for="(item, index) in freeList"
              :key="index"
              class="package-item"
              @click="onFreeClick(item)"
            >
              <div class="item-info">
                <div class="item-name">{{ item.repairItemName }}</div>
                <div class="item-code">{{ item.repairItemCode }}</div>
              </div>
              <div v-if="item.used" class="item-status used">已使用</div>
            </div>
            <div v-if="freeList.length === 0 && !loading" class="no-data">
              <img src="@/assets/image/noList.png" alt="" />
            </div>
          </div>
        </div>
      </van-tab>

      <van-tab title="服务活动" name="service">
        <div class="tab-content">
          <div class="search-header">
            <van-search
              v-model="searchValue"
              placeholder="输入套餐代码、名称"
              shape="round"
              @search="onSearch"
              @clear="onSearchClear"
              style="width: 100%"
            >
              <template #left-icon>
                <van-icon name="search" size="16" color="#191A1B" />
              </template>
            </van-search>
          </div>
          <div class="package-list">
            <div
              v-for="(item, index) in serviceList"
              :key="index"
              class="package-item"
              @click="onServiceClick(item)"
            >
              <div class="item-info">
                <div class="item-name">{{ item.activityName }}</div>
                <div class="item-code">{{ item.schemeName }}</div>
              </div>
              <div v-if="item.used" class="item-status used">已使用</div>
            </div>
            <div v-if="serviceList.length === 0 && !loading" class="no-data">
              <img src="@/assets/image/noList.png" alt="" />
            </div>
          </div>
        </div>
      </van-tab>
    </van-tabs>

    <!-- 全屏Loading -->
    <van-overlay :show="loading">
      <div class="loading-wrapper">
        <van-loading size="24px" vertical color="#009100">请稍候...</van-loading>
      </div>
    </van-overlay>

    <!-- 维修套餐详情弹窗 -->
    <ais-popup
      :show="showPackageDetail"
      position="bottom"
      closeable
      close-icon="cross"
      close-icon-position="top-left"
      title="维修套餐"
      @close="showPackageDetail = false"
      style="height: 80vh"
    >
      <van-overlay :show="packageSubmitting" style="z-index: 100">
        <div class="loading-wrapper">
          <van-loading size="24px" vertical color="#009100">请稍候...</van-loading>
        </div>
      </van-overlay>
      <template #content>
        <!-- 套餐信息 -->
        <div class="package-info">
          <div class="package-name">{{ selectedPackage.name }}</div>
          <div class="package-code">{{ selectedPackage.code }}</div>
        </div>
        <!-- 内容区域 -->
        <div class="package-detail">
          <!-- 维修项目列表 -->
          <div
            v-for="(item, index) in selectedPackage.itemRespList"
            :key="index"
            class="repair-card"
          >
            <div class="repair-card-content">
              <div class="repair-left">
                <div class="repair-name-row">
                  <span class="repair-name">{{ item.repairItemName }}</span>
                  <!-- <span class="repair-tag">{{ item.repairItemTypeName }}</span> -->
                </div>
                <div class="repair-code">{{ item.repairItemCode }}</div>
                <div class="repair-category">{{ item.repairItemTypeName }}</div>
              </div>
              <div class="repair-right">
                <div class="repair-price">¥{{ item.price }}</div>
                <div class="repair-discount">优惠 ¥{{ item.discountAmount }}</div>
              </div>
            </div>
            <div class="repair-card-bottom">
              <div class="repair-info-row">
                <span class="info-item">
                  <span class="info-label">项目金额</span>
                  <span class="info-value">¥{{ item.actualAmount }}</span>
                </span>
              </div>
            </div>
            <!-- 维修配件列表 -->
            <div v-if="expandedPartsIndex === index" class="parts-list">
              <div v-for="(part, pIndex) in item.partRespList" :key="pIndex" class="part-card">
                <div class="part-card-content">
                  <div class="part-left">
                    <div class="part-name-row">
                      <span class="part-name">{{ part.partsName }}</span>
                      <!-- <span class="part-tag">{{ part.repairItemTypeName }}</span> -->
                    </div>
                    <div class="part-code">{{ part.partsCode }}</div>
                    <div class="part-category">{{ part.repairItemTypeName }}</div>
                  </div>
                  <div class="part-right">
                    <div class="part-price">
                      ¥{{ safeCalc(part.price, part.quantity, part.discountAmount) }}
                    </div>
                    <div class="part-discount">优惠 ¥{{ part.discountAmount }}</div>
                  </div>
                </div>
                <div class="part-card-bottom">
                  <div class="part-info-row">
                    <span class="info-item">
                      <span class="info-value">¥{{ part.price || '0.00' }}</span>
                    </span>
                    <span class="info-item">
                      <span class="info-label">数量</span>
                      <span class="info-value">x{{ part.quantity }}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <!-- 展开/收起查看配件按钮 -->
            <div
              v-if="item.partRespList && item.partRespList.length > 0"
              class="expand-btn"
              @click="togglePartsExpand(index)"
            >
              <span class="expand-text">{{
                expandedPartsIndex === index ? '收起维修配件' : '查看维修配件'
              }}</span>
              <van-icon
                :name="expandedPartsIndex === index ? 'arrow-up' : 'arrow-down'"
                size="12"
                color="#009100"
              />
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="detail-actions" :class="{ 'single-btn': isPackageSelected }">
          <div v-if="isPackageSelected" class="cancel-btn" @click="onCancelPackage">取消选择</div>
          <div v-else class="confirm-btn full-btn" @click="onConfirmPackage">选择</div>
        </div>
      </template>
    </ais-popup>

    <!-- 服务活动详情弹窗 -->
    <ais-popup
      :show="showServiceDetail"
      position="bottom"
      closeable
      close-icon="cross"
      close-icon-position="top-left"
      title="服务活动"
      @close="showServiceDetail = false"
      style="height: 80vh"
    >
      <van-overlay :show="serviceSubmitting" style="z-index: 100">
        <div class="loading-wrapper">
          <van-loading size="24px" vertical color="#009100">请稍候...</van-loading>
        </div>
      </van-overlay>
      <template #content>
        <!-- 活动信息 -->
        <div class="package-info">
          <div class="package-name">{{ selectedService.activityResponse.activityName }}</div>
        </div>
        <!-- 维修项目列表 -->
        <div v-if="selectedService.itemResponseList && selectedService.itemResponseList.length > 0">
          <div class="mall-title">项目零件</div>
          <div class="package-detail">
            <div
              v-for="(item, index) in selectedService.itemResponseList"
              :key="index"
              class="repair-card"
              :class="{ selected: item.selected }"
              @click="onToggleItem(item)"
            >
              <div class="repair-card-content">
                <div class="checkbox-wrapper">
                  <div :class="['checkbox', { checked: item.selected }]">
                    <van-icon v-if="item.selected" name="success" size="14" color="#fff" />
                  </div>
                </div>
                <div class="repair-left">
                  <div class="repair-name-row">
                    <span class="repair-name">{{ item.repairItemName }}</span>
                    <span class="repair-tag">{{ item.repairItemTypeName }}</span>
                  </div>
                  <div class="repair-code">{{ item.repairItemCode }}</div>
                  <div class="repair-category">{{ item.checkoutTypeName }}</div>
                </div>
                <div class="repair-right">
                  <div class="repair-price">¥{{ item.claimPrice }}</div>
                  <div class="repair-discount">优惠 ¥{{ item.discountAmount }}</div>
                </div>
              </div>
              <div class="repair-card-bottom">
                <div class="repair-info-row">
                  <span class="info-item">
                    <span class="info-label">索赔价</span>
                    <span class="info-value">¥{{ item.claimPrice || '0.00' }}</span>
                  </span>
                  <span class="info-item">
                    <span class="info-label">工时数</span>
                    <span class="info-value">x{{ item.quantity }}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 维修零件列表 -->
        <div v-if="selectedService.partResponseList && selectedService.partResponseList.length > 0">
          <div class="mall-title">维修零件</div>
          <div v-show="partsExpanded" class="package-detail">
            <div
              v-for="(part, pIndex) in selectedService.partResponseList"
              :key="pIndex"
              class="repair-card"
              :class="{ selected: part.selected, disabled: part.allowDelete == 0 }"
              @click="onTogglePart(part)"
            >
              <div class="repair-card-content">
                <div class="checkbox-wrapper">
                  <div
                    :class="[
                      'checkbox',
                      { checked: part.selected },
                      { disabled: part.allowDelete == 0 },
                    ]"
                  >
                    <van-icon v-if="part.selected" name="success" size="14" color="#fff" />
                  </div>
                </div>
                <div class="repair-left">
                  <div class="repair-name-row">
                    <span class="repair-name">{{ part.oldPartName }}</span>
                    <span class="repair-tag">{{ part.repairItemTypeName }}</span>
                  </div>
                  <div class="repair-code">{{ part.oldPartCode }}</div>
                  <!-- <div class="repair-category">{{ part.checkoutTypeName }}</div> -->
                </div>
                <div class="repair-right">
                  <div class="repair-price">¥{{ part.unitPrice }}</div>
                  <div class="repair-discount">优惠 ¥{{ part.discountAmount }}</div>
                </div>
              </div>
              <div class="repair-card-bottom">
                <div class="repair-info-row">
                  <span class="info-item">
                    <span class="info-label">数量</span>
                    <span class="info-value">x{{ part.quantity }}</span>
                  </span>
                  <span class="info-item">
                    <span class="info-label">是否允许删除:</span>
                    <span class="info-value">{{ part.allowDelete == 1 ? '是' : '否' }}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div class="expand-btn" @click="partsExpanded = !partsExpanded">
            <span class="expand-text">{{ partsExpanded ? '收起' : '展开' }}维修配件</span>
            <van-icon :name="partsExpanded ? 'arrow-up' : 'arrow-down'" size="14" color="#009100" />
          </div>
        </div>
      </template>
      <template #footer>
        <div class="detail-actions" :class="{ 'single-btn': isServiceSelected }">
          <div v-if="isServiceSelected" class="cancel-btn" @click="onCancelService">取消选择</div>
          <div v-else class="confirm-btn full-btn" @click="onConfirmService">选择</div>
        </div>
      </template>
    </ais-popup>

    <!-- 免保项目详情弹窗 -->
    <ais-popup
      :show="showFreeDetail"
      position="bottom"
      closeable
      close-icon="cross"
      close-icon-position="top-left"
      title="免保项目"
      @close="showFreeDetail = false"
      style="height: 80vh"
    >
      <van-overlay :show="freeSubmitting" style="z-index: 100">
        <div class="loading-wrapper">
          <van-loading size="24px" vertical color="#009100">请稍候...</van-loading>
        </div>
      </van-overlay>
      <template #content>
        <!-- 免保项目信息 -->
        <div class="package-info">
          <div class="package-name">{{ selectedFree.data.policyName }}</div>
          <div class="package-code">{{ selectedFree.data.repairItemCode }}</div>
        </div>
        <!-- 内容区域 -->
        <div class="package-detail">
          <!-- 配件列表 -->
          <div
            v-for="(part, index) in selectedFree.partDetailList"
            :key="index"
            class="repair-card"
          >
            <div class="repair-card-content">
              <div class="repair-left">
                <div class="repair-name-row">
                  <span class="repair-name">{{ part.partName }}</span>
                  <!-- <span class="repair-tag">{{ part.vehicleRegisteredModelName }}</span> -->
                </div>
                <div class="repair-code">{{ part.partCode }}</div>
              </div>
              <div class="repair-right">
                <div class="repair-price">x{{ part.partQuantity }}</div>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="detail-actions" :class="{ 'single-btn': isFreeSelected }">
          <div v-if="isFreeSelected" class="cancel-btn" @click="onCancelFree">取消选择</div>
          <div v-else class="confirm-btn full-btn" @click="onConfirmFree">选择</div>
        </div>
      </template>
    </ais-popup>

    <!-- 商城订单详情弹窗 -->
    <ais-popup
      :show="showMallDetail"
      position="bottom"
      closeable
      close-icon="cross"
      close-icon-position="top-left"
      title="商城订单"
      @close="showMallDetail = false"
      style="height: 80vh"
    >
      <van-overlay :show="mallSubmitting" style="z-index: 100">
        <div class="loading-wrapper">
          <van-loading size="24px" vertical color="#009100">请稍候...</van-loading>
        </div>
      </van-overlay>
      <template #content>
        <!-- 商品明细标题 -->
        <div class="mall-title">商品明细</div>
        <!-- 内容区域 -->
        <div class="package-detail">
          <!-- 商品维修项目列表 -->
          <div
            v-for="(item, index) in selectedMall.ownersEquityOrderItemList"
            :key="index"
            class="repair-card"
          >
            <div class="repair-card-content">
              <div class="repair-left">
                <div class="repair-name-row">
                  <span class="repair-name">{{ item.repairItemName }}</span>
                  <span class="repair-tag">{{ item.repairItemTypeName }}</span>
                </div>
                <div class="repair-code">{{ item.repairItemCode }}</div>
                <div class="repair-category">{{ item.checkoutTypeName }}</div>
              </div>
              <div class="repair-right">
                <div class="repair-price">¥{{ item.receivableAmount }}</div>
                <div class="repair-discount">优惠 ¥{{ item.discountAmount }}</div>
              </div>
            </div>
            <div class="repair-card-bottom">
              <div class="repair-info-row">
                <span class="info-item">
                  <span class="info-label">工时数</span>
                  <span class="info-value">¥{{ item.workingHours || '0.00' }}</span>
                </span>
                <span class="info-item">
                  <span class="info-label">工时单价</span>
                  <span class="info-value">¥{{ item.unitPrice }}</span>
                </span>
              </div>
            </div>
            <!-- 维修配件列表 -->
            <div v-if="expandedMallPartsIndex === index" class="parts-list">
              <div
                v-for="(part, pIndex) in item.ownersEquityOrderPartsList"
                :key="pIndex"
                class="part-card"
              >
                <div class="part-card-content">
                  <div class="part-left">
                    <div class="part-name-row">
                      <span class="part-name">{{ part.partsName }}</span>
                    </div>
                    <div class="part-code">{{ part.partsCode }}</div>
                  </div>
                  <div class="part-right">
                    <div class="part-price">¥{{ part.unitPrice || '0.00' }}</div>
                  </div>
                </div>
                <div class="part-card-bottom">
                  <div class="part-info-row">
                    <span class="info-item">
                      <span class="info-value">¥{{ part.unitPrice || '0.00' }}</span>
                    </span>
                    <span class="info-item">
                      <span class="info-label">数量</span>
                      <span class="info-value">x{{ part.totalAmount }}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <!-- 展开/收起查看配件按钮 -->
            <div
              v-if="item.ownersEquityOrderPartsList && item.ownersEquityOrderPartsList.length > 0"
              class="expand-btn"
              @click="expandedMallPartsIndex = expandedMallPartsIndex === index ? -1 : index"
            >
              <span class="expand-text">{{
                expandedMallPartsIndex === index ? '收起维修配件' : '查看维修配件'
              }}</span>
              <van-icon
                :name="expandedMallPartsIndex === index ? 'arrow-up' : 'arrow-down'"
                size="12"
                color="#009100"
              />
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="detail-actions" :class="{ 'single-btn': isMallSelected }">
          <div v-if="isMallSelected" class="cancel-btn" @click="onCancelMall">取消选择</div>
          <div v-else class="confirm-btn full-btn" @click="onConfirmMall">选择</div>
        </div>
      </template>
    </ais-popup>

    <!-- 权益套餐详情弹窗 -->
    <ais-popup
      :show="showEquityDetail"
      position="bottom"
      closeable
      close-icon="cross"
      close-icon-position="top-left"
      title="权益套餐"
      @close="showEquityDetail = false"
      style="height: 80vh"
    >
      <van-overlay :show="equitySubmitting" style="z-index: 100">
        <div class="loading-wrapper">
          <van-loading size="24px" vertical color="#009100">请稍候...</van-loading>
        </div>
      </van-overlay>
      <template #content>
        <!-- 套餐信息 -->
        <div class="package-info">
          <div class="package-name">{{ selectedEquity.data.rightsName }}</div>
          <div class="package-code">{{ selectedEquity.data.rightsCode }}</div>
        </div>
        <!-- 维修项目列表 -->
        <div v-if="selectedEquity.repairItemList && selectedEquity.repairItemList.length > 0">
          <div class="mall-title">维修项目</div>
          <div class="package-detail">
            <div
              v-for="(item, index) in selectedEquity.repairItemList"
              :key="index"
              class="repair-card"
            >
              <div class="repair-card-content">
                <div class="repair-left">
                  <div class="repair-name-row">
                    <span class="repair-name">{{ item.repairItemName }}</span>
                    <span class="repair-tag">{{ item.repairItemTypeName }}</span>
                  </div>
                  <div class="repair-code">{{ item.repairItemCode }}</div>
                  <div class="repair-category">{{ item.checkoutTypeName }}</div>
                </div>
                <div class="repair-right">
                  <div class="repair-price">¥{{ item.price }}</div>
                  <div class="repair-discount">优惠 ¥{{ item.discountAmount }}</div>
                </div>
              </div>
              <div class="repair-card-bottom">
                <div class="repair-info-row">
                  <span class="info-item">
                    <span class="info-label">工时</span>
                    <span class="info-value">¥{{ item.workHour || '0.00' }}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 维修零件列表 -->
        <div v-if="selectedEquity.repairPartList && selectedEquity.repairPartList.length > 0">
          <div class="mall-title">维修零件</div>
          <div class="package-detail">
            <div
              v-for="(part, pIndex) in selectedEquity.repairPartList"
              :key="pIndex"
              class="repair-card"
            >
              <div class="repair-card-content">
                <div class="repair-left">
                  <div class="repair-name-row">
                    <span class="repair-name">{{ part.partsName }}</span>
                    <span class="repair-tag">{{ part.repairItemTypeName }}</span>
                  </div>
                  <div class="repair-code">{{ part.partsCode }}</div>
                  <div class="repair-category">{{ part.checkoutTypeName }}</div>
                </div>
                <div class="repair-right">
                  <div class="repair-price">¥{{ part.partsAmount }}</div>
                  <div class="repair-discount" v-if="Number(part.discountAmount) > 0">
                    优惠 ¥{{ part.discountAmount }}
                  </div>
                </div>
              </div>
              <div class="repair-card-bottom">
                <div class="repair-info-row">
                  <div class="info-left">
                    <span class="info-item">
                      <span class="info-label">单价</span>
                      <span class="info-value">¥{{ part.price }}</span>
                    </span>
                    <span class="info-item">
                      <span class="info-label">数量</span>
                      <span class="info-value">x{{ part.quantity }}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <div class="detail-actions" :class="{ 'single-btn': isEquitySelected }">
          <div v-if="isEquitySelected" class="cancel-btn" @click="onCancelEquity">取消选择</div>
          <div v-else class="confirm-btn full-btn" @click="onConfirmEquity">选择</div>
        </div>
      </template>
    </ais-popup>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, closeToast, showLoadingToast } from 'vant'
import AisPopup from '@/libs/components/AisPopup.vue'
import {
  getSpecialPackageList,
  getSpecialPackageDetail,
  getSpecialEquityList,
  getSpecialGoodsList,
  getSpecialGoodsDetail,
  getSpecialFreeList,
  getSpecialActivityList,
  getSpecialActivityDetail,
  getSpecialFreeDetail,
  specialEquityUse,
  specialGoodsUse,
  specialActivityUse,
  specialFreeUse,
  specialPackageUse,
  cancelSelect
} from '@/api/reception'
import './select-package.scss'

const router = useRouter()
const route = useRoute()

// 公共参数
const serviceProxyId = computed(() => route.query.serviceProxyId || route.query.id)

// 金额计算安全函数
const safeCalc = (price, qty, discount = 0) => {
  const p = Number(price) || 0
  const q = Number(qty) || 0
  const d = Number(discount) || 0
  return (p * q - d).toFixed(2)
}

// Tab状态
const activeTab = ref('repair')

// 搜索值
const searchValue = ref('')

// Loading状态
const loading = ref(false)

// 弹窗状态
const showPackageDetail = ref(false)
const showServiceDetail = ref(false)
const showFreeDetail = ref(false)
const showMallDetail = ref(false)
const showEquityDetail = ref(false)

// 维修项目折叠状态
const activeRepairItem = ref([])

// 配件展开状态
const expandedPartsIndex = ref(-1)
const partsExpanded = ref(true) // 维修零件默认展开

// 商城订单零件展开状态
const expandedMallPartsIndex = ref(-1)

// 当前详情是否已选
const isPackageSelected = ref(false)
const isServiceSelected = ref(false)
const isFreeSelected = ref(false)
const isMallSelected = ref(false)

// 提交中状态
const serviceSubmitting = ref(false)
const freeSubmitting = ref(false)
const mallSubmitting = ref(false)
const packageSubmitting = ref(false)
const equitySubmitting = ref(false)

// 选中的套餐
const selectedPackage = reactive({
  id: '',
  name: '',
  code: '',
  packageType: '10',
  totalPrice: '0.00',
  itemRespList: []
})

// 选中的服务活动
const selectedService = reactive({
  id: '',
  activityId: '',
  packageType: '50',
  activityResponse: {},
  itemResponseList: [],
  partResponseList: []
})

// 选中的免保项目
const selectedFree = reactive({
  data: {},
  packageType: '40',
  partDetailList: []
})

// 选中的商城订单
const selectedMall = ref({
  packageType: '30'
})

// 选中的权益套餐
const selectedEquity = reactive({
  data: {},
  packageType: '20',
  repairItemList: [],
  repairPartList: []
})

// 当前权益是否已选
const isEquitySelected = ref(false)

// 展开/收起配件列表
const togglePartsExpand = (index) => {
  expandedPartsIndex.value = expandedPartsIndex.value === index ? -1 : index
}

// 维修套餐列表
const packageList = ref([])

// 权益套餐列表
const equityList = ref([])

// 商城订单列表
const mallList = ref([])

// 免保项目列表
const freeList = ref([])

// 服务活动列表
const serviceList = ref([])

// 页面加载时获取维修套餐列表
onMounted(() => {
  const id = serviceProxyId.value
  if (id) {
    loading.value = true
    getSpecialPackageList({ id })
      .then((res) => {
        if (res.code === 200 && res.data) {
          packageList.value = res.data.map((item) => ({
            ...item,
            selected: false
          }))
        } else {
          showToast(res.message || '请求失败')
        }
      })
      .catch((err) => {
        showToast(err.msg || '网络错误')
      })
      .finally(() => {
        loading.value = false
      })
  }
})

// 获取列表数据的通用函数
const fetchListData = (tabName, searchKey = '') => {
  if (!serviceProxyId.value) return

  const params = { id: serviceProxyId.value }
  if (searchKey) params.searchKey = searchKey

  let api
  switch (tabName) {
    case 'repair':
      api = getSpecialPackageList(params)
      break
    case 'equity':
      api = getSpecialEquityList(params)
      break
    case 'mall':
      api = getSpecialGoodsList(params)
      break
    case 'free':
      api = getSpecialFreeList(params)
      break
    case 'service':
      api = getSpecialActivityList(params)
      break
    default:
      return
  }

  loading.value = true
  api
    .then((res) => {
      if (res.code === 200 && res.data) {
        switch (tabName) {
          case 'repair':
            packageList.value = res.data.map((item) => ({ ...item, selected: false }))
            break
          case 'equity':
            equityList.value = res.data.map((item) => ({ ...item, selected: false }))
            break
          case 'mall':
            mallList.value = res.data.map((item) => ({ ...item, selected: false }))
            break
          case 'free':
            freeList.value = res.data.map((item) => ({ ...item, selected: false }))
            break
          case 'service':
            serviceList.value = res.data.map((item) => ({ ...item, selected: item.used }))
            break
        }
      } else {
        showToast(res.message || '请求失败')
      }
    })
    .catch((err) => {
      showToast(err.msg || '网络错误')
    })
    .finally(() => {
      loading.value = false
    })
}

// Tab切换
const onTabChange = (name) => {
  searchValue.value = ''
  fetchListData(name)
}

// 搜索
const onSearch = (value) => {
  fetchListData(activeTab.value, value)
}

// 清空搜索
const onSearchClear = () => {
  searchValue.value = ''
}

// 点击维修套餐
const onPackageClick = (item) => {
  if (item.used) {
    showToast('已使用')
    return
  }
  getSpecialPackageDetail({ id: serviceProxyId.value, packageId: item.id }).then((res) => {
    if (res.code === 200) {
      const data = res.data
      selectedPackage.id = data.id
      selectedPackage.name = data.packageName || ''
      selectedPackage.code = data.code || ''
      selectedPackage.totalPrice = data.totalAmount || '0.00'
      selectedPackage.itemRespList = data.itemRespList || []
      activeRepairItem.value = []
      expandedPartsIndex.value = -1
      isPackageSelected.value = item.used
    }
  })
  showPackageDetail.value = true
}

// 点击权益套餐
const onEquityClick = (item) => {
  selectedEquity.data = item
  selectedEquity.packageType = '20'
  selectedEquity.repairItemList = item.repairItemList || []
  selectedEquity.repairPartList = item.repairPartList || []
  isEquitySelected.value = !!item.selected
  showEquityDetail.value = true
}

// 点击商城订单
const onMallClick = (item) => {
  if (item.used) {
    showToast('已使用')
    return
  }
  getSpecialGoodsDetail({
    id: serviceProxyId.value,
    packageId: item.id
  }).then((res) => {
    if (res.code === 200) {
      const data = res.data
      selectedMall.value = { ...data, packageType: '30' }
      isMallSelected.value = item.used
      showMallDetail.value = true
    }
  })
}

// 点击免保项目
const onFreeClick = (item) => {
  if (item.used) {
    showToast('已使用')
    return
  }
  getSpecialFreeDetail({
    id: serviceProxyId.value,
    packageId: item.id
  }).then((res) => {
    if (res.code === 200) {
      const data = res.data
      selectedFree.data = data || {}
      selectedFree.packageType = '40'
      selectedFree.partDetailList = data.partDetailList || []
      isFreeSelected.value = item.used
    }
  })
  showFreeDetail.value = true
}

// 点击服务活动
const onServiceClick = (item) => {
  if (item.used) {
    showToast('已使用')
    return
  }
  showLoadingToast('请稍候...')
  getSpecialActivityDetail({
    activityId: item.activityId,
    id: serviceProxyId.value,
    packageId: item.id
  }).then((res) => {
    closeToast()
    if (res.code === 200) {
      const data = res.data
      selectedService.id = data.id
      selectedService.activityId = data.activityId
      selectedService.activityResponse = data.activityResponse || {}
      // 根据activityType判断packageType: 4->50, 其他->60
      selectedService.packageType = Number(data.activityResponse?.activityType) === 4 ? '50' : '60'
      // 为每个项目和配件添加selected字段，默认false
      selectedService.itemResponseList = (data.itemResponseList || []).map((item) => ({
        ...item,
        selected: false
      }))
      selectedService.partResponseList = (data.partResponseList || []).map((part) => ({
        ...part,
        selected: Number(part.allowDelete) === 0 // allowDelete == 0 时默认选中
      }))
      isServiceSelected.value = item.used
      showServiceDetail.value = true
    } else {
      showToast(res.msg || '获取详情失败')
    }
  }).catch(() => {
    closeToast()
  })
}

// 确认选择维修套餐
const onConfirmPackage = () => {
  showLoadingToast('请稍候...')
  specialPackageUse({
    id: serviceProxyId.value,
    packageId: selectedPackage.id
  })
    .then((res) => {
      closeToast()
      if (res.code === 200) {
        showToast('已添加')
        showPackageDetail.value = false
        router.back()
      } else {
        showToast({ message: res.msg || '保存失败', duration: 3000 })
      }
    })
    .catch((err) => {
      showToast(err.msg || '网络错误')
      closeToast()
    })
}

// 勾选/取消勾选项目
const onToggleItem = (item) => {
  item.selected = !item.selected
}

// 勾选/取消勾选配件
const onTogglePart = (part) => {
  // allowDelete == 0 时不可编辑
  if (Number(part.allowDelete) === 0) return
  part.selected = !part.selected
}

// 确认选择服务活动
const onConfirmService = () => {
  // 只发送选中的项目和配件
  const selectedItems = selectedService.itemResponseList.filter((item) => item.selected)
  const selectedParts = selectedService.partResponseList.filter((part) => part.selected)

  // 从 activityResponse 获取公共字段
  const activityResp = selectedService.activityResponse

  // 补充 itemList 缺少的字段
  const enrichedItems = selectedItems.map((item) => ({
    ...item,
    id: null,
    serviceProxyId: serviceProxyId.value,
    checkoutTypeId: activityResp.checkoutTypeId || '',
    checkoutTypeName: activityResp.checkoutTypeName || '',
    warrantyTypeId: activityResp.repairItemTypeId,
    warrantyTypeName: activityResp.repairItemTypeName,
    workHour: item.workHour || 1,
    price: item.amount,
    packageType: String(activityResp.activityType) === '4' ? '60' : '50',
    packageId: selectedService.activityId + '#' + selectedService.id,
    packageCode: activityResp.activityCode,
    packageName: activityResp.activityName
  }))

  // 补充 partsList 缺少的字段
  const enrichedParts = selectedParts.map((part) => ({
    ...part,
    id: null,
    serviceProxyId: serviceProxyId.value,
    isOemPart: activityResp.isOemPart || 1, // 是否OEM件
    partsId: part.partId || part.oldPartId || '', // 零件代码id
    partsName: part.partName || '', // 零件名称
    partsCode: part.partCode || part.oldPartCode || '', // 零件代码
    checkoutTypeId: activityResp.checkoutTypeId || '',
    checkoutTypeName: activityResp.checkoutTypeName || '',
    planPickNumber: part.quantity,
    quantity: part.quantity,
    discountAmount: part.discountAmount || 0,
    spRepairItemId: part.serviceActivityItemId,
    repairItemId: part.serviceActivityItemId,
    repairItemCode: part.repairItemCode || '',
    repairItemName: part.repairItemName || '',
    packageType: String(activityResp.activityType) === '4' ? '60' : '50',
    packageId: selectedService.activityId + '#' + selectedService.id,
    packageCode: activityResp.activityCode,
    packageName: activityResp.activityName,
    isOutstock: 0, // 新零件默认为0，下同
    actualPickNumber: 0,
    refundedNumber: 0
  }))

  const params = {
    id: serviceProxyId.value,
    packageId: selectedService.id,
    activityId: activityResp.id,
    itemList: enrichedItems,
    partsList: enrichedParts
  }
  showLoadingToast('请稍候...')
  specialActivityUse(params)
    .then((res) => {
      closeToast()
      if (res.code === 200) {
        showToast('已添加')
        showServiceDetail.value = false
        router.back()
      } else {
        showToast({ message: res.msg || '保存失败', duration: 3000 })
      }
    })
    .catch((err) => {
      showToast(err.msg || '网络错误')
      closeToast()
    })
    .finally(() => {
    })
}

// 确认选择免保项目
const onConfirmFree = () => {
  freeSubmitting.value = true
  specialFreeUse({
    id: serviceProxyId.value,
    packageId: selectedFree.data.id
  })
    .then((res) => {
      if (res.code === 200) {
        showToast('已添加')
        showFreeDetail.value = false
        router.back()
      } else {
        showToast({ message: res.msg || '保存失败', duration: 3000 })
      }
    })
    .catch((err) => {
      showToast(err.msg || '网络错误')
    })
    .finally(() => {
      freeSubmitting.value = false
    })
}

// 确认选择商城订单
const onConfirmMall = () => {
  mallSubmitting.value = true
  specialGoodsUse({
    id: serviceProxyId.value,
    packageId: selectedMall.value.id
  })
    .then((res) => {
      if (res.code === 200) {
        showToast('已添加')
        showMallDetail.value = false
        // router.back()
      } else {
        showToast({ message: res.msg || '保存失败', duration: 3000 })
      }
    })
    .catch((err) => {
      showToast(err.msg || '网络错误')
    })
    .finally(() => {
      mallSubmitting.value = false
    })
}

// 替换零件
// 确认选择权益套餐
const onConfirmEquity = () => {
  showLoadingToast('请稍候...')
  const params = {
    id: serviceProxyId.value,
    equityUseId: selectedEquity.data.useId,
    equityName: selectedEquity.data.rightsName,
    equityCode: selectedEquity.data.rightsCode,
    repairItemList: selectedEquity.data.repairItemList,
    repairPartList: selectedEquity.data.repairPartList,

    // equityDistributionId: selectedEquity.data.equityDistributionId,
    verificationEquityCode: selectedEquity.data.rightsGrantCode,
    verificationCityLevel: selectedEquity.data.writeOffCityLevel,
    // name: selectedEquity.data.rightsName,
    purchaseCityLevel: selectedEquity.data.cityLevel,
    remainingUsageCount: selectedEquity.data.remainTimes,
    // equityUsageStatus: selectedEquity.data.equityUsageStatus,
    spreadType: selectedEquity.data.compensationMode,
    suggestedSpreadPrice: selectedEquity.data.suggestedSpreadPrice,
    // partsCode: selectedEquity.data.partsCode,
    // equityList: selectedEquity.data.equityList,
    totalRemainingUsage: selectedEquity.data.totalRemainTimes,
    totalUsedCount: selectedEquity.data.usedTimes
  }
  specialEquityUse(params)
    .then((res) => {
      closeToast()
      if (res.code === 200) {
        showToast('已添加')
        // router.back()
      } else {
        showToast(res.msg || '添加失败')
      }
    })
    .catch((err) => {
      showToast(err.msg || '网络错误')
      closeToast()
    })
    .finally(() => {
      closeToast()
    })
}

// 取消选择维修套餐
const onCancelPackage = () => {
  packageSubmitting.value = true
  cancelSelect({
    id: serviceProxyId.value,
    packageId: selectedPackage.id,
    packageType: selectedPackage.packageType
  })
    .then((res) => {
      if (res.code === 200) {
        showToast('已取消选择')
        showPackageDetail.value = false
        fetchListData('repair')
      } else {
        showToast(res.msg || '取消失败')
      }
    })
    .catch((err) => {
      showToast(err.msg || '网络错误')
    })
    .finally(() => {
      packageSubmitting.value = false
    })
}

// 取消选择服务活动
const onCancelService = () => {
  showLoadingToast('请稍候...')
  cancelSelect({
    id: serviceProxyId.value,
    packageId: selectedService.activityId + '#' + selectedService.id,
    packageType: '50'
  })
    .then((res) => {
      closeToast()
      if (res.code === 200) {
        showToast('已取消选择')
        showServiceDetail.value = false
        fetchListData('service')
      } else {
        showToast(res.msg || '取消失败')
      }
    })
    .catch((err) => {
      showToast(err.msg || '网络错误')
      closeToast()
    })
    .finally(() => {
    })
}

// 取消选择免保项目
const onCancelFree = () => {
  freeSubmitting.value = true
  cancelSelect({
    id: serviceProxyId.value,
    packageId: selectedFree.data.id,
    packageType: selectedFree.packageType
  })
    .then((res) => {
      if (res.code === 200) {
        showToast('已取消选择')
        showFreeDetail.value = false
        fetchListData('free')
      } else {
        showToast(res.msg || '取消失败')
      }
    })
    .catch((err) => {
      showToast(err.msg || '网络错误')
    })
    .finally(() => {
      freeSubmitting.value = false
    })
}

// 取消选择商城订单
const onCancelMall = () => {
  mallSubmitting.value = true
  cancelSelect({
    id: serviceProxyId.value,
    packageId: selectedMall.value.id,
    packageType: selectedMall.value.packageType
  })
    .then((res) => {
      if (res.code === 200) {
        showToast('已取消选择')
        showMallDetail.value = false
        fetchListData('mall')
      } else {
        showToast(res.msg || '取消失败')
      }
    })
    .catch((err) => {
      showToast(err.msg || '网络错误')
    })
    .finally(() => {
      mallSubmitting.value = false
    })
}

// 取消选择权益套餐
const onCancelEquity = () => {
  equitySubmitting.value = true
  cancelSelect({
    id: serviceProxyId.value,
    packageId: selectedEquity.data.useId,
    packageType: selectedEquity.packageType
  })
    .then((res) => {
      if (res.code === 200) {
        showToast('已取消选择')
        showEquityDetail.value = false
        fetchListData('equity')
      } else {
        showToast(res.msg || '取消失败')
      }
    })
    .catch((err) => {
      showToast(err.msg || '网络错误')
    })
    .finally(() => {
      equitySubmitting.value = false
    })
}
</script>
