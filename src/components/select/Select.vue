<template>
  <div
    ref="select"
    class="ev-select"
    :class="{
      selected: isDropbox,
      disabled: disabled,
    }"
    @click.stop="clickSelectInput"
  >
    <span
      v-if="!clearable || !isClearableIcon"
      class="ev-input-suffix"
    >
      <i
        class="ev-input-suffix-arrow ev-icon-s-arrow-down"
        :class="{
          selected: isDropbox,
        }"
      />
    </span>
    <template v-if="!multiple">
      <input
        v-model="selectedModel"
        v-clickoutside="clickOutsideDropbox"
        type="text"
        class="ev-input"
        readonly
        :placeholder="computedPlaceholder"
        :disabled="disabled"
        @change="changeMv"
      />
    </template>
    <template v-else>
      <input
        v-clickoutside="clickOutsideDropbox"
        type="text"
        class="ev-input multiple"
        readonly
        :placeholder="computedPlaceholder"
        :disabled="disabled"
      />
      <div class="ev-select-tag-wrapper">
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
              @click.stop="removeMv(item.value)"
            >
              <i class="ev-tag-suffix-close ev-icon-error" />
            </span>
          </div>
        </template>
        <template v-else>
          <div
            v-if="selectedModel.length"
            class="ev-select-tag"
          >
            <span class="ev-tag-name">
              {{ selectedModel[0].name }}
            </span>
            <span
              class="ev-tag-suffix"
              @click.stop="removeMv(selectedModel[0].value)"
            >
              <i class="ev-tag-suffix-close ev-icon-error" />
            </span>
          </div>
          <div
            v-if="selectedModel.length > 1"
            class="ev-select-tag num"
          >
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
        @click.stop="removeAllMv"
      >
        <i class="ev-icon-error" />
      </span>
    </template>
  </div>

  <teleport to="#ev-select-dropdown-modal">
    <div
      v-if="isDropbox"
      class="ev-select-dropdown"
      :style="dropdownStyle"
    >
      <input
        v-if="filterable"
        v-model="filterTextRef"
        type="text"
        class="ev-input-query"
        :placeholder="searchPlaceholder"
      />
      <div
        ref="itemWrapper"
        class="ev-select-dropdown-wrapper"
      >
        <ul
          v-if="filteredItems.length"
          class="ev-select-dropdown-ul"
        >
          <li
            v-for="(item, idx) in filteredItems"
            :key="`${item.value}_${idx}`"
            class="ev-select-dropdown-item"
            :class="{
              selected: selectedItemClass(item.value),
              disabled: item.disabled
            }"
            :title="item.name"
            @click.stop.prevent="clickItem(item.value)"
          >
            {{ item.name }}
          </li>
        </ul>
        <ul v-else>
          <li class="ev-select-dropdown-item disabled">
            {{ noMatchingText }}
          </li>
        </ul>
      </div>
    </div>
  </teleport>
</template>

<script>
import { selectClickoutside as clickoutside } from '@/directives/clickoutside';
import { useModel, useDropdown, usePosition } from './uses';

export default {
  name: 'EvSelect',
  directives: {
    clickoutside,
  },
  props: {
    modelValue: {
      type: [Boolean, String, Number, Array],
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
      removeAllMv,
      removeMv,
    } = useModel();

    const {
      isDropbox,
      filterTextRef,
      filteredItems,
      clickSelectInput,
      clickOutsideDropbox,
      clickItem,
      selectedItemClass,
    } = useDropdown({ mv });

    const {
      select,
      itemWrapper,
      dropdownStyle,
      createDropdownEl,
      observeDropbox,
    } = usePosition({ isDropbox, selectedModel });

    createDropdownEl();
    observeDropbox();

    return {
      mv,
      selectedModel,
      computedPlaceholder,
      isClearableIcon,
      changeMv,
      removeAllMv,
      removeMv,

      isDropbox,
      filterTextRef,
      filteredItems,
      clickSelectInput,
      clickOutsideDropbox,
      clickItem,
      selectedItemClass,

      select,
      itemWrapper,
      dropdownStyle,
    };
  },
};
</script>

<style lang="scss">
@import '../../style/index.scss';

.ev-select {
  $select-height: 35px;
  display: block;
  position: relative;
  width: 100%;
  min-height: $select-height;
  border-radius: $default-radius;
  cursor: pointer;

  &.disabled {
    background-color: #F5F7FA;
    border-color: #E4E7ED;
    color: #C0C4CC;
  }

  @import '../../style/components/input.scss';
  .ev-input {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    padding: 0 30px 0 15px;
    border: 1px solid #B2B2B2;
    cursor: pointer;
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
    $select-height: 35px;
    display: flex;
    width: 100%;
    height: 100%;
    min-height: $select-height;
    padding: 0 30px 0 0;
    flex-wrap: wrap;
    align-items: center;
  }
}

.ev-select-tag {
  display: flex;
  position: relative;
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

.ev-select-dropdown {
  $select-height: 35px;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  max-height: $select-height * 5;
  background-color: white;
  border: 1px solid #E4E7ED;
  color: #606266;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
  border-radius: 4px;
  box-sizing: content-box;
  z-index: 100;
  cursor: pointer;
  overflow-x: hidden;
  overflow-y: hidden;

  ul {
    background-color: #0D0D0D;
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

  .ev-select-dropdown-wrapper {
    width: 100%;
    max-height: $select-height * 4;
    overflow-y: auto;
  }
}

.ev-select-dropdown-item {
  padding: 0 15px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 15px;
  color: #0D0D0D;
  background-color: #FCFCFC;
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
  }
}
</style>
