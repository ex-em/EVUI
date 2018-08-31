<template>
  <div
    :class="activeClass"
    @click="setActive"
    @dragend="onDragEnd"
  >
    {{ tabProp.title }}
    <span
      class="ev-btn-close"
      @click.stop="close"
    > &times;
    </span>
  </div>
</template>

<script>
  const prefixCls = 'ev-tab-title';

  export default {
    props: {
      tabProp: {
        type: Object,
        default() {
          return {};
        },
      },
      minWidth: {
        type: Number,
        default: 100,
      },
    },
    data() {
      return {
        isActive: this.tabProp.isActive,
      };
    },
    computed: {
      activeClass() {
       return [
          `${prefixCls}`,
          {
            active: this.tabProp.isActive,
          },
        ];
      },
      currentWidth() {
        return {
            width: `${this.width}px`,
        };
      },
    },
    methods: {
      computedTitle() {
        const result = this.tabProp.title.split('');
        let isShrink = false;
        const minWidth = this.tabProp.width || this.minWidth;

        while (result.length * 7 > (minWidth - 50)) {
          result.pop();
          isShrink = true;
        }
        if (isShrink) {
          result.push('...');
        }
        return result.join('');
      },
      close() {
        this.$emit('close', this.tabProp);
      },
      setActive() {
        this.$emit('set-active', this.tabProp);
      },
      onDragEnd(e) {
        this.$emit('drag-end', this.tabProp, e);
      },
    },
  };
</script>

<style scoped>
  .ev-tab-title {
    margin: 0;
    margin-right: 4px;
    height: 31px;
    padding: 5px 16px 4px;
    border: 1px solid #dddee1;
    border-bottom: 0;
    border-radius: 4px 4px 0 0;
    transition: all 0.3s ease-in-out;
    background: #f8f8f9;
    display: inline-block;
    user-select: none;
  }
  .ev-tab-title.active {
    height: 32px;
    padding-bottom: 5px;
    background: #fff;
    transform: translateZ(0);
    border-color: #dddee1;
    color: #2d8cf0;
  }
  .ev-tab-title:hover {
    color: #2589E9;
    font-weight: bold;
    cursor: pointer;
  }
  .ev-btn-close {
    position: relative;
    float: right;
    left: 8px;
    line-height: 4px;
    visibility: hidden;
  }
  .ev-tab-title:hover .ev-btn-close {
    visibility: visible;
  }

  .ev-tab-title:hover .ev-btn-close:hover {
    color: red;
    font-weight: bold;
    cursor: pointer;
  }
</style>
