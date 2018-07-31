<template>
  <div
    v-click-outside="hideDropdown"
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
          this.filterItems(itemName);
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

