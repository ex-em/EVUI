<template>
  <div
    v-click-outside="hideDropdown"
    :style="selectboxStyle"
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
          <span class="text">
            {{ item.name }}
          </span>
          <i
            class="close"
            @click="removeTag(item, $event)"
          />
        </div>
      </div>
      <input
        v-else
        :disabled="disabled"
        :value="inputText"
        type="text"
        class="input-text"
        @keyup="onKeyUpInputTxt"
      >
      <i :class="selectBoxIconCls"/>
    </div>
    <transition name="fade">
      <Dropdown
        v-show="dropDownState"
        :dropdown-style="dropdownStyle"
        :is-group="isGroup"
        :disabled="disabled"
        :listbox-style="listboxStyle"
        :multiple="multiple"
        :items="listboxItems"
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

  // const boxSize = {
  //   small: {
  //     height: 22,
  //     fontSize: 12,
  //   },
  //   normal: {
  //     height: 30,
  //     fontSize: 14,
  //   },
  //   large: {
  //     height: 34,
  //     fontSize: 16,
  //   },
  // };

  export default {
    components: {
      Dropdown,
    },
    directives: {
      'click-outside': {
        bind(el, binding) {
          const selectboxEl = el;
          const bubble = binding.modifiers.bubble;
          const handler = (evnet) => {
            if (bubble || (selectboxEl !== evnet.target && !selectboxEl.contains(evnet.target))) {
              binding.value(evnet);
            }
          };
          selectboxEl.vueClickOutside = handler;

          document.addEventListener('click', handler);
        },
        unbind(el) {
          const selectboxEl = el;
          document.removeEventListener('click', selectboxEl.__vueClickOutside__);
          selectboxEl.vueClickOutside = null;
        },
      },
    },
    props: {
      name: {
        type: String,
        default: '',
      },
      selectboxStyle: {
        type: Object,
        default() {
          return {};
        },
      },
      dropdownStyle: {
        type: Object,
        default() {
          return {};
        },
      },
      listboxStyle: {
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
        listboxItems: [],
        selectedItems: [],
      };
    },
    computed: {
      selectBoxIconCls() {
        const classList = [];

        classList.push('arrow-icon');

        if (this.dropDownState) {
          classList.push('rotate-180');
        }

        return classList;
      },
    },
    created() {
      this.listboxItems = this.items.slice();

      if (!this.multiple) {
        this.dropdownStyle.border = 0;
      }

      if (this.initSelect != null) {
        this.select(this.initSelect);
      } else if (this.initSelectIdx != null) {
        this.selectIdx(this.initSelectIdx);
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

        this.listboxItems = this.items.slice();

        this.dropDownState = !this.dropDownState;
      },
      onSelect(item, target, index) {
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
        let item;
        let groupObj;
        let isSelected = false;

        if (this.isGroup) {
          for (let ix = 0, ixLen = this.items.length; ix < ixLen; ix++) {
            groupObj = this.items[ix];

            for (let jx = 0, jxLen = groupObj.items.length; jx < jxLen; jx++) {
              item = groupObj.items[jx];

              if (item.value === value) {
                this.inputText = item.name;
                this.selectedItems.push(item);
                isSelected = true;
                break;
              }
            }

            if (isSelected) {
              break;
            }
          }
        } else {
          for (let ix = 0, ixLen = this.items.length; ix < ixLen; ix++) {
            item = this.items[ix];

            if (item.value === value) {
              this.inputText = item.name;
              this.selectedItems.push(item);
              break;
            }
          }
        }
      },
      selectIdx(idx) {
        let item;
        let groupObj;
        let isSelected;

        if (this.isGroup) {
          let rowIdx = 0;

          for (let ix = 0, ixLen = this.items.length; ix < ixLen; ix++) {
            groupObj = this.items[ix];

            for (let jx = 0, jxLen = groupObj.items.length; jx < jxLen; jx++) {
              item = groupObj.items[jx];

              if (item && rowIdx === idx) {
                this.inputText = item.name;
                this.selectedItems.push(item);
                isSelected = true;
                break;
              }

              rowIdx++;
            }

            if (isSelected || rowIdx > idx) {
              break;
            }
          }
        } else {
          item = this.items[idx];

          if (item) {
            this.inputText = item.name;
            this.selectedItems.push(item);
          }
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
          this.listboxItems = this.items.slice();
          return;
        }

        if (this.isGroup) {
          this.listboxItems = this.items.reduce((preArr, groupObj) => {
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
          this.listboxItems = this.items.filter(obj => obj && obj.name.includes(value));
        }
      },
      hideDropdown() {
        this.dropDownState = false;
      },
    },
  };
</script>

<style scoped>
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

  /**  evui-selectbox > evui-selectbox-select-field  **/
  /**  evui-selectbox > evui-selectbox-select-field > evui-selectbox-multiple-tag-view  **/
  /**  evui-selectbox > evui-selectbox-select-field > input-text  **/
  /**  evui-selectbox > evui-selectbox-select-field > arrow-icon  **/

  .evui-selectbox-select-field {
    display: inline-block;
    width: 100%;
    height: 100%;
  }
  .evui-selectbox-multiple-tag-view{
    width: calc(100% - 25px);
    height: 100%;
    padding: 0 4px;
    white-space: nowrap;
    overflow: hidden;
  }
  .evui-selectbox-select-field .input-text{
    width: 100%;
    height: 100%;
    padding: 6px 10px;
    border: 0;
    border-radius: 3px;
    transition: border-color ease-in-out .15s,box-shadow ease-in-out .15s;
  }
  .evui-selectbox-select-field .input-text:focus{
    border-color: #66afe8;
    outline: 0;
    box-shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(102,175,233,.6);
  }
  .evui-selectbox-select-field .arrow-icon{
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
  .evui-selectbox-select-field .arrow-icon:before {
    content: "\F0DD"
  }
  .evui-selectbox-select-field .arrow-icon.rotate-180{
    transform: rotate(180deg);
  }

  /**  evui-selectbox > evui-selectbox-select-tag **/

  .evui-selectbox-select-tag{
    display: inline-block;
    margin: 5px 4px 0 0;
    padding: 1px 10px;
    border: 1px solid #e9eaec;
    border-radius: 3px;
    background: #f7f7f7;
    font-size: 12px;
    cursor: pointer
  }
  .evui-selectbox-select-tag:hover{
    opacity:.85;
  }
  .evui-selectbox-select-tag .text{
    position: relative;
    top: -1px;
    color:#495060;
  }
  .evui-selectbox-select-tag .close{
    display: inline-block;
    margin-left: 3px;
    color: #666;
    opacity: .66;
    cursor: pointer;
    -webkit-transform: scale(1.42857143) rotate(0);
    -ms-transform: scale(1.42857143) rotate(0);
    transform: scale(1.42857143) rotate(0);
  }
  .evui-selectbox-select-tag .close:before{
    position: relative;
    top: -2px;
    font-style: normal;
    font-size: 10px;
    font-family: Arial, sans-serif;
    content: 'x';
  }
  .evui-selectbox-select-tag .close:hover{
    opacity: 1
  }
  .evui-selectbox-select-tag:not(.evui-selectbox-select-tag.checked) {
    background:0 0;
    border:0;
    color:#495060
  }
  .evui-selectbox-select-tag:not(.evui-selectbox-select-tag.checked) .close{
    color:#495060!important
  }
  .evui-selectbox-select-tag.color-red{
    color:#ed3f14!important;
    border-color:#ed3f14
  }
  .evui-selectbox-select-tag.color-green{
    color:#19be6b!important;
    border-color:#19be6b
  }
  .evui-selectbox-select-tag.color-blue{
    color:#2d8cf0!important;
    border-color:#2d8cf0
  }
  .evui-selectbox-select-tag.color-yellow{
    color:#f90!important;
    border-color:#f90
  }
  .evui-selectbox-select-tag.color-white{
    color:#fff!important
  }

  .evui-select-search:focus{
    border-color: #66afe8;
    outline: 0;
    box-shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(102,175,233,.6);
  }
</style>
