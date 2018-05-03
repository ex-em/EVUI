<template>
  <div
    :class="wrapClasses"
    :style="style"
    class="evui-selectbox"
  >
    <div
      v-if="!multiple"
      class="evui-selectbox-display arrow-down"
      @click.stop="onClick"
    >
      {{ output }}<icon :class="selectIconClasses"/>
    </div>
    <div
      v-else
      class="evui-selectbox-display"
      @click.stop="onClick"
    >
      <span
        v-for="item in selectedMultiple"
        :key="item.name"
      >
        <span class="evui-selectbox-tag">{{ item.name }}</span>
      </span>
    </div>
    <transition name="fade">
      <listbox
        v-show="dropToggle"
        :style="listStyle"
        :items="options"
        class="evui-select-dropdown"
        @select="onItemClick"
        @change="onChange"
      >
        <div style="padding:6px 6px;">
          <input
            ref="search"
            :style="searchStyle"
            :disabled="disabled"
            class="evui-select-search"
            type="text"
          >
        </div>
      </listbox>
    </transition>
    <input
      :name="name"
      :value="value"
      type="hidden"
    >
  </div>
</template>
<script>
  import '@/styles/evui.css';
  import icon from '@/components/icon/icon';
  import listbox from '@/components/selectbox/listbox';

  const boxSize = {
    small: {
      height: 22,
      fontSize: 12,
    },
    normal: {
      height: 30,
      fontSize: 14,
    },
    large: {
      height: 34,
      fontSize: 16,
    },
  };

  export default {
    components: {
      icon,
      listbox,
    },
    props: {
      name: {
        type: String,
        default: null,
      },
      width: {
        type: Number,
        default: 200,
      },
      size: {
        type: String,
        default: 'normal',
      },
      value: {
        type: [String, Number, Array],
        default: '',
      },
      multiple: {
        type: Boolean,
        default: false,
      },
      disabled: {
        type: Boolean,
        default: false,
      },
      placeholder: {
        type: String,
        default: '',
      },
      options: {
        type: Array,
        default() {
          return [];
        },
      },
    },
    data() {
      return {
        dropVisible: false,
        selectedItem: {},
        selectedSingle: null,
        selectedMultiple: [],
        style: {
          width: `${this.width}px`,
          height: `${boxSize[this.size].height}px`,
        },
        listStyle: {
          top: `${boxSize[this.size].height + 2}px`,
        },
        searchStyle: {
          width: '100%',
          height: `${boxSize[this.size].height}px`,
        },
      };
    },
    computed: {
      dropToggle() {
        return this.dropVisible;
      },
      wrapClasses() {
        return [
          `evui-box-${this.size}`,
          {
            'evui-diabled': this.disabled,
          },
        ];
      },
      selectIconClasses() {
        return [
          'fa-sort-down',
          'evui-select-arrow',
          {
            'select-down': this.dropVisible,
          },
        ];
      },
      output() {
        return this.selectedItem.name;
      },
    },
    mounted() {
    },
    methods: {
      onClick() {
        if (this.disabled) {
          return;
        }

        this.dropVisible = !this.dropVisible;

        if (this.dropVisible) {
          this.$nextTick(() => {
            this.$refs.search.focus();
          });
        }
      },
      onItemClick(data) {
        this.selectedItem = data;
        this.dropVisible = !this.dropVisible;
      },
      onChange() {

      },
    },
  };
</script>

