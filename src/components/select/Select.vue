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
          :style="[dropboxPosition, { width: dropboxWidth }]"
        >
          <template v-if="filterable">
            <slot
              name="search-filter"
              :item="{
                value: filterTextRef,
                onInput: changeFilterText,
                class: 'ev-input-query',
                placeholder: searchPlaceholder,
              }"
            >
              <input
                type="text"
                class="ev-input-query"
                :placeholder="searchPlaceholder"
                :value="filterTextRef"
                @input="changeFilterText"
              />
            </slot>
          </template>
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

<script>
import { selectClickoutside as clickoutside } from '@/directives/clickoutside';
import EvCheckboxGroup from '@/components/checkboxGroup/CheckboxGroup';
import EvCheckbox from '@/components/checkbox/Checkbox';
import { useModel, useDropdown } from './uses';

export default {
  name: 'EvSelect',
  components: {
    EvCheckbox,
    EvCheckboxGroup,
  },
  directives: {
    clickoutside,
  },
  props: {
    modelValue: {
      type: [Boolean, String, Number, Array, Object],
      default: null,
    },
    placeholder: {
      type: String,
      default: '',
    },
    searchPlaceholder: {
      type: String,
      default: 'Please Enter a Search Words.',
    },
    noMatchingText: {
      type: String,
      default: 'NO MATCHING DATA',
    },
    items: {
      type: Array,
      default: () => [],
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    clearable: {
      type: Boolean,
      default: false,
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    checkable: {
      type: Boolean,
      default: false,
    },
    collapseTags: {
      type: Boolean,
      default: false,
    },
    filterable: {
      type: Boolean,
      default: false,
    },
    filterText: {
      type: String,
      default: '',
    },
    allCheckLabel: {
      type: String,
      default: 'Select All',
    },
  },
  emits: {
    'update:modelValue': null,
    change: null,
  },
  setup() {
    const {
      mv,
      selectedModel,
      computedPlaceholder,
      isClearableIcon,
      changeMv,
      removeMv,
      removeAllMv,
    } = useModel();

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
      dropboxWidth,
    } = useDropdown({ mv, changeMv });

    return {
      mv,
      selectedModel,
      computedPlaceholder,
      isClearableIcon,
      changeMv,
      removeMv,
      removeAllMv,

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
      dropboxWidth,
    };
  },
};
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
    border: 1px solid #B2B2B2;
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
      color: #409EFF;
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
    padding: 3px 30px 3px 0;
    min-height: $select-height;
    flex-wrap: wrap;
    align-items: center;
    z-index: 100;
  }
}

.ev-select-tag {
  display: flex;
  position: relative;
  max-width: 100%;
  height: 24px;
  padding: 0 19px 0 8px;
  margin: 2px 0 2px 6px;
  background-color: #F4F4F5;
  align-items: center;
  border: 1px solid #E9E9EB;
  border-radius: 4px;
  color: #909399;
  font-size: $font-size-base;
  cursor: auto;

  &.num {
    padding-right: 8px;
  }

  .ev-tag-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ev-tag-suffix {
    display: flex;
    position: absolute;
    top: 0;
    right: 3px;
    height: 100%;
    align-items: center;
    color: #0D0D0D;
    cursor: pointer;

    &:hover {
      color: #409EFF;
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
  background-color: #FCFCFC;
  border: 1px solid #E4E7ED;
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
    border-bottom: 1px solid #B2B2B2;
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
  color: #0D0D0D;
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    opacity: 0.85;
  }
  &.selected {
    color: #EBEBEB;
    background-color: #730EF4;
  }
  &.disabled {
    opacity: 1;
    color: #C0C4CC;
    cursor: not-allowed;
  }
}

.all-check {
  height: 35px;
  line-height: 38px;
  border-bottom: 1px solid;
}
</style>
