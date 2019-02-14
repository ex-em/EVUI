<template>
  <div
    v-click-outside="hideDropdown"
    :class="selectboxClass"
  >
    <div
      class="evui-selectbox-select-field"
      @click="onClick"
    >
      <div
        v-if="multiple"
        class="evui-selectbox-multiple-tag-view"
      >
        <div
          v-if="selectedItems.length"
          :class="`${prefixCls}-select-tag ${selectedItems.length > 1 ? 'max-width' : ''}`"
        >
          <div :class="`${prefixCls}-text-wrap`">
            <span :class="`${prefixCls}-text`">{{ selectedItems[0].name }}</span>
          </div>
          <div
            :class="`${prefixCls}-tag-close`"
            @click="removeTag(selectedItems[0], $event)"
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
        :class="inputTextClass"
        :value="inputText"
        type="text"
        @keyup="onKeyUpInputTxt"
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
        @keyup="onKeyUpInputTxt"
      />
    </transition>
  </div>
</template>

<script>
  import '@/styles/all.css';
  import '@/styles/evui.css';
  import Dropdown from '@/components/selectbox/dropdown';

  const prefixCls = 'evui-selectbox';

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
      prop: 'selectedValue',
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
      selectedValue: {
        type: [String, Number, Array],
        default: null,
      },
      initSelect: {
        type: [String, Number],
        default: null,
      },
      initSelectIdx: {
        type: Number,
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
        selectboxClass: this.getSelectboxClass(),
        inputTextClass: this.getInputTextClass(),
        dropDownState: false,
        inputText: '',
        listBoxItems: [],
        selectedItems: [],
      };
    },
    computed: {
      arrowIconClass() {
        return {
          'evui-selectbox-arrow-icon': true,
          'evui-selectbox-arrow-icon-rotate-180': this.dropDownState,
          'evui-selectbox-arrow-icon-disabled': this.disabled,
        };
      },
    },
    watch: {
      selectedItems(items) {
        let value;

        if (this.multiple) {
          value = [];
          items.map(obj => value.push(obj.value));
        } else {
          value = items[0].value;
        }

        this.$emit('change-selected-value', value);
      },
    },
    created() {
      let item;
      this.listBoxItems = this.items.slice();

      this.dropdownStyle.border = this.multiple ? 1 : 0;

      if (this.initSelect != null) {
        item = this.getItemBySelect(this.initSelect);
      } else if (this.initSelectIdx != null) {
        item = this.getItemByIndex(this.initSelectIdx);
      }

      if (item) {
        this.inputText = item.name;
        this.selectedItems.push(item);
      }
    },
    methods: {
      onClick() {
        if (this.disabled) {
          return;
        }

        if (this.multiple) {
          this.inputText = '';
        }

        if (!this.dropDownState &&
          this.$refs.dropdown &&
          this.$refs.dropdown.$refs.filterInputText) {
          this.$refs.dropdown.$refs.filterInputText.value = '';
        }

        this.listBoxItems = this.items.slice();

        this.dropDownState = !this.dropDownState;
      },
      onSelect(item, target, index) {
        this.selectByItem(item);
        this.$emit('select', item, target, index);
      },
      onKeyUpInputTxt(e) {
        let foundItem;
        const value = e.target.value;

        this.filterItems(value);

        if (!this.isGroup && !this.multiple) {
          this.inputText = value;
          this.selectedItems.length = 0;

          foundItem = this.items.find(obj => obj.name === value);

          if (foundItem) {
            this.selectedItems.push(foundItem);
          }
        }

        this.$emit('keyup', e);
      },
      select(value) {
        const item = this.getItemBySelect(value);

        if (item) {
          this.selectByItem(item);
        }
      },
      selectByIndex(idx) {
        const item = this.getItemByIndex(idx);

        if (item) {
          this.selectByItem(item);
        }
      },
      selectByItem(item) {
        if (!item) {
          return;
        }

        let foundItem;
        const itemName = item.name;

        if (this.multiple) {
          foundItem = this.selectedItems.find(obj => obj.name === itemName);

          if (foundItem) {
            this.selectedItems = this.selectedItems.filter(obj => obj.name !== itemName);
          } else {
            this.selectedItems.push(item);
          }
        } else {
          this.inputText = itemName;
          this.selectedItems.length = 0;
          this.selectedItems.push(item);
        }

        if (!this.multiple) {
          this.dropDownState = false;
        }
      },
      removeTag(item, event) {
        if (event) {
          event.preventDefault();
          event.stopPropagation();
        }

        this.selectedItems = this.selectedItems.filter(obj => obj.name !== item.name);
      },
      filterItems(value) {
        if (!value || value.length === 0) {
          this.listBoxItems = this.items.slice();
          return;
        }

        if (this.isGroup) {
          this.listBoxItems = this.items.reduce((preArr, groupObj) => {
            let groupItems = groupObj.items;

            groupItems = groupItems.filter(item => item && item.name.includes(value));

            if (groupItems.length > 0) {
              preArr.push({
                groupName: groupObj.groupName,
                items: groupItems,
              });
            }

            return preArr;
          }, []);
        } else {
          this.listBoxItems = this.items.filter(obj => obj && obj.name.includes(value));
        }
      },
      hideDropdown() {
        this.dropDownState = false;
      },
      getSelectboxClass() {
        return {
          [`${prefixCls}`]: true,
          [`${prefixCls}-size-${this.size}`]: true,
          [`${prefixCls}-disabled`]: this.disabled,
        };
      },
      getInputTextClass() {
        return {
          [`${prefixCls}-input-text`]: true,
          [`${prefixCls}-input-text-readonly`]: this.readOnly,
          [`${prefixCls}-input-text-disabled`]: this.disabled,
        };
      },
      getItemBySelect(value) {
        let groupObj;
        let groupItems;
        let foundItem;

        if (this.isGroup) {
          for (let ix = 0, ixLen = this.items.length; ix < ixLen; ix++) {
            groupObj = this.items[ix];
            groupItems = groupObj.items || [];
            foundItem = groupItems.find(item => item.value === value);

            if (foundItem) {
              break;
            }
          }
        } else {
          foundItem = this.items.find(item => item.value === value);
        }

        return foundItem;
      },
      getItemByIndex(idx) {
        let groupObj;
        let groupItems;
        let foundItem;
        let item;

        if (this.isGroup) {
          let itemRowIdx = 0;

          for (let ix = 0; ix < this.items.length; ix++) {
            groupObj = this.items[ix];
            groupItems = groupObj.items || [];

            for (let jx = 0; jx < groupItems.length; jx++) {
              item = groupItems[jx];

              if (item && itemRowIdx === idx) {
                foundItem = item;
                break;
              }

              itemRowIdx++;
            }

            if (foundItem || itemRowIdx > idx) {
              break;
            }
          }
        } else {
          foundItem = this.items[idx];
        }

        return foundItem;
      },
    },
  };
</script>

<style>
  /************************************************************************************
   Selectbox
  ************************************************************************************/

  /** evui-selectbox **/

  .evui-selectbox {
    display: inline-block;
    position: relative;
    border: 1px solid #dddeee;
    border-radius: 4px;
    vertical-align: middle;
    line-height: normal;
    cursor: pointer;
    transition: border-color ease-in-out .15s;
  }
  .evui-selectbox-disabled{
    cursor: not-allowed;
  }
  .evui-selectbox:focus{
    box-shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(102,175,233,.6);
  }
  .evui-selectbox-select-field {
    display: inline-block;
    width: 100%;
    height: 100%;
  }
  .evui-selectbox-select-field:hover{
    background-color: #eeeeee;
    border-color: #bbb;
  }
  .evui-selectbox-input-text{
    width: 100%;
    height: 100%;
    padding: 6px 10px;
    border: 0;
    background: transparent;
  }
  .evui-selectbox-input-text:focus{
    outline: 0;
  }
  .evui-selectbox-input-text-readonly{
    cursor: default;
  }
  .evui-selectbox-input-text-disabled{
    cursor: not-allowed;
  }
  .evui-selectbox-arrow-icon{
    position: absolute;
    top: 50%;
    width: 10px;
    height: 10px;
    line-height: 3px;
    font-weight: 900;
    font-family: Font Awesome\ 5 Free;
    font-style: normal;
    font-variant: normal;
    color: #888888;
    transition: all .2s ease-in-out;
  }
  .evui-selectbox-arrow-icon:before {
    content: "\F0DD"
  }
  .evui-selectbox-arrow-icon-disabled{
    cursor: not-allowed;
  }
  .evui-selectbox-arrow-icon-rotate-180{
    transform: rotate(180deg);
  }
  .evui-selectbox-multiple-tag-view{
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
  }
  .evui-selectbox-select-tag {
    display: inline-flex;
    height: 100%;
    max-width: 100%;
    padding: 0 5px;
    border: 1px solid #e9eaec;
    border-radius: 3px;
    background: #f0f2f5;
    justify-content: center;
    align-items: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
  }
  .evui-selectbox-select-tag:hover {
    opacity:.85;
  }
  .evui-selectbox-select-tag.max-width {
    max-width: calc(100% - 40px);
  }
  .evui-selectbox-text-wrap{
    display: inline-block;
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .evui-selectbox-text {
    color: #495060;
  }
  .evui-selectbox-tag-close {
    margin-left: 5px;
    border-radius: 50%;
    background-color: rgba(0,0,0,0.4);
    opacity: .66;
    cursor: pointer;
  }
  .evui-selectbox-tag-close:hover{
    opacity: 1
  }
  .evui-selectbox-tag-close-scale {
    color: #fff;
  }
  .evui-select-search:focus{
    border-color: #66afe8;
    outline: 0;
    box-shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(102,175,233,.6);
  }
  .evui-selectbox-select-count-tag {
    display: inline-flex;
    width: 35px;
    height: 100%;
    padding: 0 2px;
    border: 1px solid #e9eaec;
    border-radius: 3px;
    background: #f0f2f5;
    justify-content: center;
    align-items: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /** size **/
  .evui-selectbox-size-small {
    width: 90px;
    height: 18px;
    font-size: 11px;
  }
  .evui-selectbox-size-medium {
    width: 140px;
    height: 25px;
    font-size: 12px;
  }
  .evui-selectbox-size-large {
    width: 180px;
    height: 30px;
    font-size: 14px;
  }

  .evui-selectbox-size-small .evui-selectbox-select-field { padding: 1px 12px 1px 2px; }
  .evui-selectbox-size-medium .evui-selectbox-select-field { padding: 2px 19px 2px 3px; }
  .evui-selectbox-size-large .evui-selectbox-select-field { padding: 2px 23px 2px 4px; }

  .evui-selectbox-size-small .evui-selectbox-arrow-icon{
    right: 1px;
    margin-top: -3px;
  }
  .evui-selectbox-size-medium .evui-selectbox-arrow-icon{
    right: 4px;
    margin-top: -4px;
  }
  .evui-selectbox-size-large .evui-selectbox-arrow-icon{
    right: 7px;
    margin-top: -4px;
  }

  .evui-selectbox-size-small .evui-selectbox-arrow-icon-rotate-180{
    right: 4px;
    margin-top: -7px;
  }
  .evui-selectbox-size-medium .evui-selectbox-arrow-icon-rotate-180{
    right: 7px;
    margin-top: -6px;
  }
  .evui-selectbox-size-large .evui-selectbox-arrow-icon-rotate-180{
    right: 8px;
  }

  .evui-selectbox-size-small .evui-selectbox-tag-close{
    font-size: 10px;
    transform: scale(0.9);
  }
  .evui-selectbox-size-medium .evui-selectbox-tag-close{
    transform: scale(0.8);
  }
  .evui-selectbox-size-large .evui-selectbox-tag-close{
    transform: scale(0.8);
  }

  .evui-selectbox-size-small .evui-selectbox-tag-close-scale{
     transform: scale(0.6);
   }
  .evui-selectbox-size-medium .evui-selectbox-tag-close-scale{
    transform: scale(0.5);
  }
  .evui-selectbox-size-large .evui-selectbox-tag-close-scale{
    transform: scale(0.45);
  }
</style>
