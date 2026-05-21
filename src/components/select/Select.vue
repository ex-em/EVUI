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
        <div
          class="ev-select-tag-wrapper"
          :class="{ 'has-max-rows': hasMaxRows }"
          :style="hasMaxRows ? { '--ev-select-tag-max-rows': tagMaxRows } : null"
          @click="clickSelectInput"
        >
          <span
            v-if="!clearable || !isClearableIcon"
            class="ev-input-suffix"
            @click.stop="clickSelectInput"
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
            :tabindex="hasMaxRows ? -1 : null"
            :placeholder="computedPlaceholder"
            :disabled="disabled"
            @click.stop="clickSelectInput"
          />
          <template v-if="!collapseTags">
            <div v-for="item in selectedModel" :key="item" class="ev-select-tag" @click.stop>
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
            <div v-if="selectedModel.length" class="ev-select-tag" @click.stop>
              <span class="ev-tag-name">
                {{ selectedModel[0].name }}
              </span>
              <span
                class="ev-tag-suffix"
                @click.stop="[removeMv(selectedModel[0].value), changeDropboxPosition()]"
              >
                <i class="ev-tag-suffix-close ev-icon-error" />
              </span>
            </div>
            <div v-if="selectedModel.length > 1" class="ev-select-tag num" @click.stop>
              <span class="ev-tag-name"> + {{ selectedModel.length - 1 }} </span>
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
        <teleport :to="teleportTarget" :disabled="!teleport">
          <div
            v-if="isDropbox"
            ref="dropbox"
            class="ev-select-dropbox"
            :class="{ teleported: !!teleport }"
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
                @click.self.prevent="[changeAllCheck(false), changeDropboxPosition()]"
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
                          item.disabled ? [] : [clickItem(item.value), changeDropboxPosition()]
                        "
                      >
                        <ev-checkbox :label="item.value" :disabled="item.disabled">
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
                        item.disabled ? [] : [clickItem(item.value), changeDropboxPosition()]
                      "
                    >
                      <ev-checkbox :model-value="mv === item.value" :disabled="item.disabled">
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
                      item.disabled ? [] : [clickItem(item.value), changeDropboxPosition()]
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
        </teleport>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
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
    teleport: {
      type: String,
      default: '',
    },
    // multiple 모드에서 tag wrapper가 몇 줄까지 노출될지 결정.
    // 0(기본) 이면 무제한 wrap, 양수면 그 줄 수까지 표시하고 그 이상은 내부 scroll.
    // 항목이 많이 선택되어 wrapper 가 폭발적으로 커질 때
    // ① teleport 모드에서 dropbox 가 window/viewport 밖으로 밀려나는 문제와
    // ② non-teleport 모드에서 wrapper height 변화로 flip 이 점프하는 문제를 막을 수 있다.
    tagMaxRows: {
      type: Number,
      default: 0,
      validator: (v) => Number.isInteger(v) && v >= 0,
    },
  },
  emits: {
    'update:modelValue': null,
    change: null,
  },
  setup(props) {
    const hasMaxRows = computed(() => props.tagMaxRows > 0);

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
      teleportTarget,
    } = useDropdown({ mv, changeMv });

    return {
      hasMaxRows,

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
      teleportTarget,
    };
  },
};
</script>

<style lang="scss">
@use '../../style/index.scss' as *;
@use '../../style/components/input.scss' as *;

.ev-select {
  $select-height: $input-default-height;
  display: block;
  position: relative;
  width: 100%;
  border-radius: $default-radius;
  cursor: pointer;

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

  // tagMaxRows > 0 (has-max-rows) 일 때만 wrapper에 overflow-y: auto가 적용된다.
  // 이때 absolute로 깔린 input.multiple이 wrapper의 wheel/touch scroll 영역을 가려
  // 마우스가 input 위에 있을 때 내부 스크롤이 동작하지 않는 회귀가 있어,
  // 해당 모드에서만 pointer-events를 통과시키고 클릭은 tag-wrapper @click 으로 위임한다.
  // 기본(tagMaxRows=0) 모드는 기존 input 클릭 동작을 그대로 유지해 사이드 이펙트를 최소화한다.
  .ev-select-tag-wrapper.has-max-rows .ev-input.multiple {
    pointer-events: none;
  }

  // has-max-rows 모드에서 input.multiple은 pointer-events:none 이라 :hover가 발화하지 않는다.
  // multi 모드에서도 select hover 시 border 색이 primary로 바뀌는 시각 피드백이 사라지지 않도록
  // 부모 hover로 cascade 시켜 유지한다.
  &:not(.disabled):hover .ev-select-tag-wrapper.has-max-rows .ev-input.multiple {
    @include evThemify() {
      border-color: evThemed('primary');
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
    padding: 3px 30px 3px 0;
    min-height: $select-height;
    flex-wrap: wrap;
    align-items: center;
    z-index: 100;

    // tagMaxRows prop이 설정된 경우에만 적용.
    // wrapper가 무제한으로 늘어나서 teleport dropbox가 window 밖에 펼쳐지거나
    // non-teleport에서 wrapper height 변화로 flip이 점프하는 문제를 옵트인 방식으로 막는다.
    &.has-max-rows {
      max-height: calc(#{$select-height} * var(--ev-select-tag-max-rows));
      overflow-y: auto;
    }
  }
}

.ev-select-tag {
  display: flex;
  position: relative;
  max-width: 100%;
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

  // ev-window(z-index: 700) 등 다른 floating layer 위에 떠야 한다.
  &.teleported {
    position: fixed;
    z-index: 710;
  }

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
