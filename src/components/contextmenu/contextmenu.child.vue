<template>
  <div
    :class="prefixEvui"
  >
    <context-menu
      :depth="depth"
      :visibility="visibility"
      :row-index="rowIndex"
      :items="items"
      @click="onClick"
    />
  </div>
</template>

<script>
  export default {
    components: {
      ContextMenu: () => import('./contextmenu'),
    },
    props: {
      depth: {
        type: Number,
        default: 0,
      },
      rowKey: {
        type: String,
        default: '',
      },
      rowIndex: {
        type: Number,
        default: 0,
      },
      focusedRowKey: {
        type: String,
        default: '',
      },
      items: {
        type: Array,
        default() {
          return [];
        },
        validator(value) {
          return value != null && value.constructor === Array;
        },
      },
    },
    data() {
      return {
        prefixEvui: 'contextmenu-child',
        visibility: 'hidden',
      };
    },
    watch: {
      focusedRowKey(value) {
        if (value === this.rowKey) {
          this.visibility = 'visible';
        } else {
          this.visibility = 'hidden';
        }
      },
    },
    methods: {
      onClick(item) {
        if (!item.disabled) {
          this.$emit('click', item);
        }
      },
    },
  };
</script>

<style lang="scss">
  .contextmenu-child {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 850;
  }
</style>
