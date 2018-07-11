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

        if (!this.multiple) {
          this.dropDownState = false;
        }

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

