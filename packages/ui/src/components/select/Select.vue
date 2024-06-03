<template>
  <div
    ref="select"
    v-clickoutside="clickOutsideDropbox"
    class="ev-select"
    :class="{
      selected: isDropbox,
      disabled,
    }"
  >
    <div ref="selectWrapper" class="ev-select__wrapper">
      <template v-if="!multiple">
        <span
          v-if="!clearable || !isClearableIcon"
          class="ev-input-suffix"
          @click="clickSelectInput"
        >
          <i
            class="ev-input-suffix-arrow ev-icon-s-arrow-down"
            :class="{
              selected: isDropbox,
            }"
          />
        </span>
        <input
          v-model="selectedModel"
          type="text"
          class="ev-input"
          readonly
          :placeholder="computedPlaceholder"
          :disabled="disabled"
          @click="clickSelectInput"
        />
      </template>
      <template v-else>
        <div class="ev-select-tag-wrapper">
          <span
            v-if="!clearable || !isClearableIcon"
            class="ev-input-suffix"
            @click="clickSelectInput"
          >
            <i
              class="ev-input-suffix-arrow ev-icon-s-arrow-down"
              :class="{
                selected: isDropbox,
              }"
            />
          </span>
          <input
            type="text"
            class="ev-input multiple"
            readonly
            :placeholder="computedPlaceholder"
            :disabled="disabled"
            @click="clickSelectInput"
          />
          <template v-if="!collapseTags">
            <div
              v-for="item in selectedModel"
              :key="item"
              class="ev-select-tag"
            >
              <span class="ev-tag-name">
                {{ item.name }}
              </span>
              <span
                class="ev-tag-suffix"
                @click.stop="[removeMv(item.value), changeDropboxPosition()]"
              >
                <i class="ev-tag-suffix-close ev-icon-error" />
              </span>
            </div>
          </template>
          <template v-else>
            <div v-if="selectedModel.length" class="ev-select-tag">
              <span class="ev-tag-name">
                {{ selectedModel[0].name }}
              </span>
              <span
                class="ev-tag-suffix"
                @click.stop="
                  [removeMv(selectedModel[0].value), changeDropboxPosition()]
                "
              >
                <i class="ev-tag-suffix-close ev-icon-error" />
              </span>
            </div>
            <div v-if="selectedModel.length > 1" class="ev-select-tag num">
              <span class="ev-tag-name">
                + {{ selectedModel.length - 1 }}
              </span>
            </div>
          </template>
        </div>
      </template>
      <template v-if="clearable">
        <span
          v-show="isClearableIcon"
          class="ev-input-suffix"
          @click.stop="[removeAllMv(), clickOutsideDropbox()]"
        >
          <i class="ev-icon-error" />
        </span>
      </template>
      <div class="ev-select-dropbox-wrapper">
        <div
          v-if="isDropbox"
          ref="dropbox"
          class="ev-select-dropbox"
          :style="dropboxPosition"
        >
          <input
            v-if="filterable"
            type="text"
            class="ev-input-query"
            :placeholder="searchPlaceholder"
            :value="filterTextRef"
            @input="changeFilterText"
          />
          <template v-if="checkable">
            <div
              v-if="multiple"
              class="ev-select-dropbox-item all-check"
              :class="{
                selected: allCheck,
              }"
              @click.self.prevent="
                [changeAllCheck(false), changeDropboxPosition()]
              "
            >
              <ev-checkbox
                v-model="allCheck"
                :label="allCheckLabel"
                @change="[changeAllCheck(true), changeDropboxPosition()]"
              />
            </div>
            <div ref="itemWrapper" class="ev-select-dropbox-list">
              <template v-if="multiple">
                <ev-checkbox-group v-model="mv">
                  <ul v-if="filteredItems.length" class="ev-select-dropbox-ul">
                    <li
                      v-for="(item, idx) in filteredItems"
                      :key="`${item.value}_${idx}`"
                      class="ev-select-dropbox-item"
                      :class="{
                        selected: selectedItemClass(item.value),
                        disabled: item.disabled,
                      }"
                      :title="item.name"
                      @click.self.prevent="
                        item.disabled
                          ? []
                          : [clickItem(item.value), changeDropboxPosition()]
                      "
                    >
                      <ev-checkbox
                        :label="item.value"
                        :disabled="item.disabled"
                      >
                        <i v-if="item.iconClass" :class="item.iconClass" />
                        {{ item.name }}
                      </ev-checkbox>
                    </li>
                  </ul>
                  <ul v-else>
                    <li class="ev-select-dropbox-item disabled">
                      {{ noMatchingText }}
                    </li>
                  </ul>
                </ev-checkbox-group>
              </template>
              <template v-else>
                <ul v-if="filteredItems.length" class="ev-select-dropbox-ul">
                  <li
                    v-for="(item, idx) in filteredItems"
                    :key="`${item.value}_${idx}`"
                    class="ev-select-dropbox-item"
                    :class="{
                      selected: selectedItemClass(item.value),
                      disabled: item.disabled,
                    }"
                    :title="item.name"
                    @click.stop.prevent="
                      item.disabled
                        ? []
                        : [clickItem(item.value), changeDropboxPosition()]
                    "
                  >
                    <ev-checkbox
                      :model-value="mv === item.value"
                      :disabled="item.disabled"
                    >
                      <i v-if="item.iconClass" :class="item.iconClass" />
                      {{ item.name }}
                    </ev-checkbox>
                  </li>
                </ul>
              </template>
            </div>
          </template>
          <template v-else>
            <div ref="itemWrapper" class="ev-select-dropbox-list">
              <ul v-if="filteredItems.length" class="ev-select-dropbox-ul">
                <li
                  v-for="(item, idx) in filteredItems"
                  :key="`${item.value}_${idx}`"
                  class="ev-select-dropbox-item"
                  :class="{
                    selected: selectedItemClass(item.value),
                    disabled: item.disabled,
                  }"
                  :title="item.name"
                  @click.stop.prevent="
                    item.disabled
                      ? []
                      : [clickItem(item.value), changeDropboxPosition()]
                  "
                >
                  <i v-if="item.iconClass" :class="item.iconClass" />
                  {{ item.name }}
                </li>
              </ul>
              <ul v-else>
                <li class="ev-select-dropbox-item disabled">
                  {{ noMatchingText }}
                </li>
              </ul>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import EvCheckboxGroup from '@/components/checkboxGroup/CheckboxGroup.vue';
import EvCheckbox from '@/components/checkbox/Checkbox.vue';
import { useModel, useDropdown } from './uses';
import { selectClickoutside as vClickoutside } from './clickoutside';
import type { Props, Emit } from './types';

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  placeholder: '',
  searchPlaceholder: 'Please Enter a Search Words.',
  noMatchingText: 'NO MATCHING DATA',
  items: () => [],
  disabled: false,
  clearable: false,
  multiple: false,
  checkable: false,
  collapseTags: false,
  filterable: false,
  filterText: '',
  allCheckLabel: 'Select All',
});

const emit = defineEmits<Emit>();

const {
  mv,
  selectedModel,
  computedPlaceholder,
  isClearableIcon,
  changeMv,
  removeMv,
  removeAllMv,
} = useModel(props, emit);

const {
  select,
  selectWrapper,
  dropbox,
  itemWrapper,
  isDropbox,
  dropboxPosition,
  filterTextRef,
  filteredItems,
  clickSelectInput,
  clickOutsideDropbox,
  changeFilterText,
  changeDropboxPosition,
  clickItem,
  selectedItemClass,
  allCheck,
  changeAllCheck,
} = useDropdown(props, { mv, changeMv });
</script>

<style lang="scss">
@import '../../style/index.scss';

.ev-select {
  $select-height: $input-default-height;
  display: block;
  position: relative;
  width: 100%;
  border-radius: $default-radius;
  cursor: pointer;

  @import '../../style/components/input.scss';

  &__wrapper {
    position: relative;
  }
  .ev-input {
    padding: 0 30px 0 15px;
    border: 1px solid #b2b2b2;
    cursor: pointer;

    &.multiple {
      position: absolute;
      height: 100%;
    }
  }

  .ev-input-suffix {
    display: flex;
    position: absolute;
    top: 0;
    right: 5px;
    height: 100%;
    align-items: center;

    &:hover {
      color: #409eff;
    }
  }

  .ev-input-suffix-arrow {
    transform: rotate(0deg);
    transition-duration: 0.3s;

    &.selected {
      transform: rotate(180deg);
    }
  }

  .ev-select-tag-wrapper {
    display: flex;
    width: 100%;
    height: 100%;
    padding: 3px 0;
    min-height: $select-height;
    flex-wrap: wrap;
    align-items: center;
    z-index: 100;
  }
}

.ev-select-tag {
  display: flex;
  position: relative;
  height: 24px;
  padding: 0 19px 0 8px;
  margin: 2px 0 2px 6px;
  background-color: #f4f4f5;
  align-items: center;
  border: 1px solid #e9e9eb;
  border-radius: 4px;
  color: #909399;
  font-size: $font-size-base;
  cursor: auto;

  &.num {
    padding-right: 8px;
  }

  .ev-tag-suffix {
    display: flex;
    position: absolute;
    top: 0;
    right: 3px;
    height: 100%;
    align-items: center;
    color: #0d0d0d;
    cursor: pointer;

    &:hover {
      color: #409eff;
    }
  }
}

.ev-select-dropbox-wrapper {
  height: 0;
}

.ev-select-dropbox {
  $select-height: $input-default-height;
  position: absolute;
  width: 100%;
  max-height: $select-height * 5;
  background-color: #fcfcfc;
  border: 1px solid #e4e7ed;
  color: #606266;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  z-index: 100;
  cursor: pointer;
  overflow: hidden;

  ul {
    list-style: none;
  }
  li {
    height: $select-height;
    line-height: $select-height;
  }

  .ev-input-query {
    width: 100%;
    min-height: $select-height;
    padding: 0 30px 0 15px;
    border: 0;
    border-bottom: 1px solid #b2b2b2;
    outline: 0;
    font-size: $font-size-medium;
    background-color: transparent;
  }

  .ev-select-dropbox-list {
    width: 100%;
    max-height: $select-height * 4;
    overflow-y: auto;
  }
}

.ev-select-dropbox-item {
  padding: 0 15px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 15px;
  color: #0d0d0d;
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    opacity: 0.85;
  }
  &.selected {
    color: #ebebeb;
    background-color: #730ef4;
  }
  &.disabled {
    opacity: 1;
    color: #c0c4cc;
    cursor: not-allowed;
  }
}

.all-check {
  height: 35px;
  line-height: 38px;
  border-bottom: 1px solid;
}
</style>
