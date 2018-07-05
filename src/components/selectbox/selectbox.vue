<template>
  <div
    :style="selectboxStyle"
    class="evui-selectbox"
  >
    <div
      class="selectbox-field"
      @click="onClick"
    >
      <div
        v-if="multiple"
        class="multiple-tag-view"
      >
        <div
          v-for="item in selectedItems"
          :key="item.name"
          class="evui-select-tag checked"
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
      <dropdown
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
  import dropdown from '@/components/selectbox/dropdown';

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
      dropdown,
    },
    props: {
      name: {
        type: String,
        default: null,
      },
      selectboxStyle: {
        type: Object,
        default() {
          return {};
        },
      },
      size: {
        type: String,
        default: 'normal',
      },
      dropdownStyle: {
        type: Object,
        default() {
          return {};
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
      listboxStyle: {
        type: Object,
        default() {
          return {};
        },
      },
      multiple: {
        type: Boolean,
        default: false,
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
        dropDownState: false,
        inputText: '',
        listboxItems: [],
        selectedItems: [],
      };
    },
    computed: {
      selectBoxIconCls() {
        const classList = ['arrow-icon'];

        if (this.dropDownState) {
          classList.push('rotate-180');
        }

        return classList;
      },
    },
    mounted() {
      this.listboxItems = this.items.slice();

      if (this.selectboxStyle.height) {
        this.dropdownStyle.height = this.selectboxStyle.height;
      }
      if (!this.multiple) {
        this.dropdownStyle.border = 0;
      }
    },
    methods: {
      onClick() {
        if (this.disabled) {
          return;
        }

        this.dropDownState = !this.dropDownState;
      },
      onSelect(item, target, index) {
        let findedItem;
        const itemName = item.name;

        if (this.multiple) {
          findedItem = this.selectedItems.find(obj => obj.name === itemName);

          if (findedItem) {
            this.selectedItems = this.selectedItems.filter(obj => obj.name !== itemName);
          } else {
            this.selectedItems.push(item);
          }
        } else {
          this.inputText = itemName;
          this.selectedItems.length = 0;
          this.selectedItems.push(item);
          this.filterItems(itemName);
        }

        // if (!this.multiple) {
        this.dropDownState = false;
        // }

        this.$emit('select', item, target, index);
      },
      onKeyUpInputTxt(e) {
        let findedItem;
        const value = e.target.value;

        this.filterItems(value);

        if (!this.isGroup && !this.multiple) {
          this.inputText = value;
          this.selectedItems.length = 0;

          findedItem = this.items.find(obj => obj.name === value);

          if (findedItem) {
            this.selectedItems.push(findedItem);
          }
        }

        this.$emit('keyup', e);
      },
      removeTag(item, event) {
        if (event) {
          event.preventDefault();
          event.stopPropagation();
        }

        this.selectedItems = this.selectedItems.filter(obj => obj.name !== item.name);
      },
      filterItems(value) {
        let ix;
        let ixLen;
        let jx;
        let jxLen;
        let groupObj;
        let itemList;
        let item;

        if (value && value.length > 0) {
          if (this.isGroup) {
            this.listboxItems = [];

            for (ix = 0, ixLen = this.items.length; ix < ixLen; ix++) {
              groupObj = this.items[ix];
              itemList = groupObj.items;

              for (jx = 0, jxLen = itemList.length; jx < jxLen; jx++) {
                item = itemList[jx];

                if (item.name.indexOf(value) === 0) {
                  this.listboxItems.push(groupObj);
                  break;
                }
              }
            }
          } else {
            this.listboxItems = this.items.filter(obj => obj && obj.name.indexOf(value) === 0);
          }
        } else {
          this.listboxItems = this.items.slice();
        }
      },
    },
  };
</script>

