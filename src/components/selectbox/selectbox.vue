<template>
  <div
    v-click-outside="hideDropdown"
    :class="prefixCls"
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
          v-for="item in selectedItems"
          :key="item.name"
          :class="`${prefixCls}-select-tag checked`"
        >
          <div :class="`${prefixCls}-text-bg-area`">
            <span :class="`${prefixCls}-text`">
              {{ item.name }}
            </span>
            <i
              :class="`${prefixCls}-tag-close`"
              @click="removeTag(item, $event)"
            />
          </div>
        </div>
      </div>
      <input
        v-else
        :disabled="disabled"
        :value="inputText"
        :class="`${prefixCls}-input-text`"
        type="text"
        @keyup="onKeyUpInputTxt"
      >
      <i :class="selectBoxIconCls"/>
    </div>
    <transition name="fade">
      <Dropdown
        v-show="dropDownState"
        :style="dropdownStyle"
        :is-group="isGroup"
        :disabled="disabled"
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
        default: 'normal',
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
        dropDownState: false,
        inputText: '',
        listBoxItems: [],
        selectedItems: [],
      };
    },
    computed: {
      selectBoxIconCls() {
        const classList = [];

        classList.push('evui-selectbox-arrow-icon');

        if (this.dropDownState) {
          classList.push('rotate-180');
        }

        return classList;
      },
    },
    created() {
      let item;
      this.listBoxItems = this.items.slice();

      if (!this.multiple) {
        this.dropdownStyle.border = 0;
      }

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

          for (let ix = 0, ixLen = this.items.length; ix < ixLen; ix++) {
            groupObj = this.items[ix];
            groupItems = groupObj.items || [];

            for (let jx = 0, jxLen = groupItems.length; jx < jxLen; jx++) {
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
    font-size: 14px;
    line-height: normal;
  }
  .evui-selectbox:hover{
    background-color: #eeeeee;
    border-color: #bbb;
    cursor: pointer;
  }
  .evui-selectbox-select-field {
    display: inline-block;
    width: 100%;
    height: 100%;
  }
  .evui-selectbox-multiple-tag-view{
    width: calc(100% - 25px);
    height: 100%;
    padding-right: 2px;
    white-space: nowrap;
    overflow-x: hidden;
    overflow-y: auto;
  }
  .evui-selectbox-input-text{
    width: 100%;
    height: 100%;
    padding: 6px 10px;
    border: 0;
    border-radius: 3px;
    transition: border-color ease-in-out .15s,box-shadow ease-in-out .15s;
  }
  .evui-selectbox-input-text:focus{
    border-color: #66afe8;
    outline: 0;
    box-shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(102,175,233,.6);
  }
  .evui-selectbox-arrow-icon{
    position: absolute;
    top: 50%;
    right: 8px;
    width: 10px;
    height: 10px;
    margin-top: -4px;
    line-height: 3px;
    font-size: 16px;
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
  .evui-selectbox-arrow-icon.rotate-180{
    transform: rotate(180deg);
  }
  .evui-selectbox-select-tag {
    display: block;
    margin: 2px 2px 0 0;
    padding: 1px 10px 1px 5px;
    cursor: pointer;
  }
  .evui-selectbox-select-tag:hover{
    opacity:.85;
  }
  .evui-selectbox-text-bg-area {
    display: inline-block;
    padding: 3px 10px;
    background: #f7f7f7;
    border: 1px solid #e9eaec;
    border-radius: 3px;
    font-size: 12px;
  }
  .evui-selectbox-text {
    position: relative;
    top: -1px;
    color:#495060;
  }
  .evui-selectbox-tag-close {
    display: inline-block;
    margin-left: 3px;
    color: #666;
    opacity: .66;
    cursor: pointer;
    transform: scale(1.42857143) rotate(0);
  }
  .evui-selectbox-tag-close:before{
    position: relative;
    top: -1px;
    font-style: normal;
    font-size: 10px;
    font-family: Arial, sans-serif;
    content: 'x';
  }
  .evui-selectbox-tag-close:hover{
    opacity: 1
  }
  .evui-selectbox-select-tag:not(.evui-selectbox-select-tag.checked) {
    background:0 0;
    border:0;
    color:#495060 !important;
  }
  .evui-selectbox-select-tag:not(.evui-selectbox-select-tag.checked) .evui-selectbox-tag-close{
    color:#495060 !important;
  }
  .evui-select-search:focus{
    border-color: #66afe8;
    outline: 0;
    box-shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(102,175,233,.6);
  }
</style>
