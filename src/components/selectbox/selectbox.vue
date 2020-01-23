<template>
  <div
    v-click-outside="hideDropdown"
    :class="selectboxClass"
  >
    <div
      class="ev-selectbox-select-field"
      @click="onClick"
    >
      <div
        v-if="multiple"
        class="ev-selectbox-multiple-tag-view"
      >
        <div
          v-if="selectedItems.length"
          :class="`${prefixCls}-select-tag ${selectedItems.length > 1 ? 'max-width' : ''}`"
        >
          <div :class="`${prefixCls}-text-wrap`">
            <span :class="`${prefixCls}-text`">{{ multipleFieldFirstItem.name }}</span>
          </div>
          <div
            :class="`${prefixCls}-tag-close`"
            @click="removeTag(multipleFieldFirstItem, $event)"
          >
            <div :class="`${prefixCls}-tag-close-scale`">
              <span :class="`ei ei-close`"/>
            </div>
          </div>
        </div>
        <div
          v-show="selectedItems.length > 1"
          :class="`${prefixCls}-select-count-tag`"
        >
          <div :class="`${prefixCls}-text-wrap`">
            <span :class="`${prefixCls}-text`">+ {{ selectedItems.length -1 }}</span>
          </div>
        </div>
      </div>
      <input
        v-else
        :disabled="disabled"
        :readonly="readOnly"
        :class="inputFieldClass"
        :value="inputFieldValue"
        type="text"
        @keyup="onKeyUpInputField"
        @blur="onBlurInputField"
      >
      <i :class="arrowIconClass"/>
    </div>
    <transition name="fade">
      <Dropdown
        v-show="dropDownState"
        ref="dropdown"
        :style="dropdownStyle"
        :is-group="isGroup"
        :disabled="disabled"
        :size="size"
        :listbox-style="listBoxStyle"
        :multiple="multiple"
        :items="listBoxItems"
        :selected-items="selectedItems"
        @select="onSelect"
        @keyup="onKeyUpDropDownInputField"
      />
    </transition>
  </div>
</template>

<script>
  import '@/styles/lib/fontawesome.css';
  import Dropdown from '@/components/selectbox/dropdown';

  const prefixCls = 'ev-selectbox';

  export default {
    components: {
      Dropdown,
    },
    directives: {
      'click-outside': {
        bind(el, binding) {
          const selectBoxEl = el;
          const bubble = binding.modifiers.bubble;
          const handler = (e) => {
            if (bubble || (selectBoxEl !== e.target && !selectBoxEl.contains(e.target))) {
              binding.value(e);
            }
          };
          selectBoxEl.vueClickOutside = handler;

          document.addEventListener('mousedown', handler);
        },
        unbind(el) {
          const selectBoxEl = el;
          document.removeEventListener('mousedown', selectBoxEl.vueClickOutside);
          selectBoxEl.vueClickOutside = null;
        },
      },
    },
    model: {
      prop: 'vModelSelectedValue',
      event: 'change-selected-value',
    },
    props: {
      name: {
        type: String,
        default: '',
      },
      dropdownStyle: {
        type: Object,
        default() {
          return {};
        },
      },
      listBoxStyle: {
        type: Object,
        default() {
          return {};
        },
      },
      size: {
        type: String,
        default: 'medium',
        validator(value) {
          const list = ['small', 'medium', 'large'];
          return list.indexOf(value) > -1;
        },
      },
      isGroup: {
        type: Boolean,
        default: false,
      },
      disabled: {
        type: Boolean,
        default: false,
      },
      multiple: {
        type: Boolean,
        default: false,
      },
      readOnly: {
        type: Boolean,
        default: false,
      },
      vModelSelectedValue: {
        type: [String, Number, Array],
        default: null,
      },
      items: {
        type: Array,
        default() {
          return [];
        },
      },
    },
    data() {
      return {
        prefixCls,
        isUseVModel: this.$vnode.data && this.$vnode.data.model,
        dropDownState: false,
        listBoxItems: [],
        selectedValueList: [],
        inputFieldValue: '',
      };
    },
    computed: {
      arrowIconClass() {
        return {
          'ev-selectbox-arrow-icon': true,
          'ev-selectbox-arrow-icon-rotate-180': this.dropDownState,
          'ev-selectbox-arrow-icon-disabled': this.disabled,
        };
      },
      selectboxClass() {
        return {
          [`${prefixCls}`]: true,
          [`${prefixCls}-size-${this.size}`]: true,
          [`${prefixCls}-disabled`]: this.disabled,
        };
      },
      inputFieldClass() {
        return {
          [`${prefixCls}-input-text`]: true,
          [`${prefixCls}-input-text-readonly`]: this.readOnly,
          [`${prefixCls}-input-text-disabled`]: this.disabled,
        };
      },
      selectedItems() {
        let items = [];

        if (this.multiple) {
          items = this.selectedValueList.map(v => this.findItemByValue(v));
        } else {
          const foundItem = this.findItemByValue(this.selectedValueList[0]);

          if (foundItem) {
            items.push(foundItem);
          }
        }

        return items;
      },
      multipleFieldFirstItem() {
        const firstItem = (this.selectedItems.length && this.selectedItems[0]) || {};
        return this.findItemByValue(firstItem.value);
      },
    },
    watch: {
      items: {
        deep: true,
        handler() {
          this.initSettings();
        },
      },
      vModelSelectedValue() {
        this.syncSelectedValue();
      },
    },
    created() {
      this.dropdownStyle.border = this.multiple ? 1 : 0;
    },
    mounted() {
      this.syncSelectedValue();
    },
    methods: {
      initSettings() {
        this.listBoxItems = this.items.slice() || [];

        if (this.multiple) {
          this.inputFieldValue = '';
        } else {
          const selectedItem = this.items.find(obj => obj.value === this.vModelSelectedValue) || {};
          this.inputFieldValue = selectedItem.name;
        }
      },
      onClick() {
        if (this.disabled) {
          return;
        }

        if (this.multiple) {
          this.inputFieldValue = '';
        }

        this.listBoxItems = this.items.slice();

        if (!this.dropDownState &&
          this.$refs.dropdown &&
          this.$refs.dropdown.$refs.filterInputField) {
          this.$refs.dropdown.$refs.filterInputField.value = '';
        }

        this.dropDownState = !this.dropDownState;
      },
      onSelect(item, target, index) {
        this.selectItem(item);
        this.$emit('select', item, target, index);
      },
      onKeyUpInputField(e) {
        if (!this.readOnly) {
          if (!this.dropDownState) {
            this.dropDownState = true;
          }

          this.inputFieldValue = e.target.value;
          this.listBoxItems = this.getFilteredListBoxItems(this.inputFieldValue);
        }

        this.$emit('keyup', e);
      },
      onBlurInputField(e) {
        const text = e.target.value;
        const foundItem = this.items.find(o => o.name === text);

        if (foundItem) {
          this.setVModel(foundItem.value);
        } else {
          this.inputFieldValue = '';
          this.setVModel('');
        }

        this.$emit('blur', e);
      },
      onKeyUpDropDownInputField(e) {
        this.listBoxItems = this.getFilteredListBoxItems(e.target.value);
        this.$emit('keyup', e);
      },
      selectItem(item) {
        if (!item) {
          return;
        }

        const itemValue = item.value;
        let existValue = false;
        let selectedValue;

        if (this.multiple) {
          selectedValue = [];

          for (let ix = 0; ix < this.selectedValueList.length; ix++) {
            const value = this.selectedValueList[ix];

            if (value === itemValue) {
              existValue = true;
            } else {
              selectedValue.push(value);
            }
          }

          if (!existValue) {
            selectedValue.push(itemValue);
          }
        } else {
          selectedValue = itemValue;
        }

        this.setVModel(selectedValue);
      },
      removeTag(item, event) {
        if (event) {
          event.preventDefault();
          event.stopPropagation();
        }

        this.setVModel(this.selectedValueList.filter(v => v !== item.value));
      },
      hideDropdown() {
        this.dropDownState = false;
      },
      setVModel(value) {
        if (this.isUseVModel) {
          this.$emit('change-selected-value', value);
        } else {
          this.syncSelectedValue(value);
        }
      },
      syncSelectedValue(value) {
        const selectedValue = this.isUseVModel ? this.vModelSelectedValue : value;

        if (this.multiple) {
          this.selectedValueList = selectedValue;
        } else {
          this.selectedValueList = [selectedValue];

          const foundItem = this.findItemByValue(selectedValue);
          this.dropDownState = false;
          this.inputFieldValue = foundItem.name;
        }
      },
      findItemByValue(value) {
        let foundItem = {};

        if (value != null) {
          if (this.isGroup) {
            this.items.some((groupItem) => {
              foundItem = groupItem.items.find(item => item && item.value === value);
              return foundItem != null;
            });
          } else {
            foundItem = this.items.find(obj => obj && obj.value === value);
          }
        }

        return foundItem || {};
      },
      getFilteredListBoxItems(value) {
        let filteredItems;
        let listBoxItems = [];

        if (value && value.length) {
          if (this.isGroup) {
            this.items.reduce((preArr, groupItem) => {
              filteredItems = groupItem.items.filter(item => item && item.name.includes(value));

              if (filteredItems.length > 0) {
                preArr.push({
                  groupName: groupItem.groupName,
                  items: filteredItems,
                });
              }

              return preArr;
            }, listBoxItems);
          } else {
            listBoxItems = this.items.filter(obj => obj && obj.name.includes(value));
          }
        } else {
          listBoxItems = this.items;
        }

        if (listBoxItems.length) {
          listBoxItems = listBoxItems.slice();
        }

        return listBoxItems;
      },
    },
  };
</script>

<style lang="scss">
  @import '~@/styles/default';

  .ev-selectbox {
    display: inline-block;
    position: relative;
    border-radius: $border-radius-base;
    vertical-align: middle;
    line-height: normal;
    cursor: pointer;
    transition: border-color $animate-fast;

    @include evThemify() {
      color: evThemed('font-color-base');
      border: $border-solid evThemed('selectbox-border');
      background-color: evThemed('selectbox-bg');
    }

    &:focus {
      box-shadow: inset 0 1px 1px rgba($color-black, 0.075), 0 0 8px rgba($color-primary, 0.6);
    }

    &:hover {
      @include evThemify() {
        background-color: evThemed('selectbox-bg-hover');
      }
    }
  }

  .ev-selectbox-disabled {
    cursor: not-allowed;
  }

  .ev-selectbox-select-field {
    display: inline-block;
    width: 100%;
    height: 100%;
  }

  .ev-selectbox-input-text {
    width: 100%;
    height: 100%;
    padding: 6px 10px;
    border: 0;
    background: transparent;

    @include evThemify() {
      color: evThemed('font-color-base');
    }

    &:focus {
      outline: 0;
    }
  }

  .ev-selectbox-input-text-readonly {
    cursor: default;
  }

  .ev-selectbox-input-text-disabled {
    cursor: not-allowed;
  }

  .ev-selectbox-arrow-icon {
    position: absolute;
    top: 50%;
    width: 10px;
    height: 10px;
    line-height: 3px;
    font-weight: 900;
    font-family: Font Awesome\ 5 Free;
    font-style: normal;
    font-variant: normal;
    color: $color-dark-level7;
    transition: all $animate-fast;

    &:before {
      content: '\F0DD';
    }
  }

  .ev-selectbox-arrow-icon-disabled {
    cursor: not-allowed;
  }

  .ev-selectbox-arrow-icon-rotate-180 {
    transform: rotate(180deg);
  }

  .ev-selectbox-multiple-tag-view {
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
  }

  .ev-selectbox-select-tag {
    display: inline-flex;
    height: 100%;
    max-width: 100%;
    padding: 0 5px;
    border-radius: 3px;
    justify-content: center;
    align-items: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;

    @include evThemify() {
      background-color: evThemed('selectbox-select-bg');
    }

    &:hover {
      opacity: 0.85;
    }

    &.max-width {
      max-width: calc(100% - 40px);
    }
  }

  .ev-selectbox-text-wrap {
    display: inline-block;

    @include truncate(100%);
  }

  .ev-selectbox-tag-close {
    margin-left: 5px;
    border-radius: 50%;
    background-color: rgba($color-black, 0.4);
    opacity: 0.66;
    cursor: pointer;

    &:hover {
      opacity: 1;
    }
  }

  .ev-selectbox-tag-close-scale {
    color: $color-white;
  }

  .ev-select-search:focus {
    border-color: $color-primary;
    outline: 0;
    box-shadow: inset 0 1px 1px rgba($color-black, 0.075), 0 0 8px rgba($color-primary, 0.6);
  }

  .ev-selectbox-select-count-tag {
    display: inline-flex;
    width: 35px;
    height: 100%;
    padding: 0 2px;
    border-radius: 3px;
    justify-content: center;
    align-items: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    @include evThemify() {
      background-color: darken(evThemed('selectbox-select-bg'), 3%);
    }
  }

  /** size **/
  .ev-selectbox-size-small {
    width: 90px;
    height: 18px;
    font-size: 11px;

    .ev-selectbox-select-field {
      padding: 1px 12px 1px 2px;
    }

    .ev-selectbox-arrow-icon {
      right: 1px;
      margin-top: -3px;
    }

    .ev-selectbox-arrow-icon-rotate-180 {
      right: 4px;
      margin-top: -7px;
    }

    .ev-selectbox-tag-close {
      font-size: 10px;
      transform: scale(0.9);
    }

    .ev-selectbox-tag-close-scale {
      transform: scale(0.6);
    }
  }

  .ev-selectbox-size-medium {
    width: 140px;
    height: 25px;
    font-size: 12px;

    .ev-selectbox-select-field {
      padding: 2px 19px 2px 3px;
    }

    .ev-selectbox-arrow-icon {
      right: 4px;
      margin-top: -4px;
    }

    .ev-selectbox-arrow-icon-rotate-180 {
      right: 7px;
      margin-top: -6px;
    }

    .ev-selectbox-tag-close {
      transform: scale(0.8);
    }

    .ev-selectbox-tag-close-scale {
      transform: scale(0.5);
    }
  }

  .ev-selectbox-size-large {
    width: 180px;
    height: 30px;
    font-size: $font-size-medium;

    .ev-selectbox-select-field {
      padding: 2px 23px 2px 4px;
    }

    .ev-selectbox-arrow-icon {
      right: 7px;
      margin-top: -4px;
    }

    .ev-selectbox-arrow-icon-rotate-180 {
      right: 8px;
    }

    .ev-selectbox-tag-close {
      transform: scale(0.8);
    }

    .ev-selectbox-tag-close-scale {
      transform: scale(0.45);
    }
  }
</style>
