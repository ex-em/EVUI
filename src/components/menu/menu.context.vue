<template>
  <div
    v-show="isShow"
    v-click-outside="hide"
    :style="ctxMenuStyle"
    :class="prefixEvui"
  >
    <ev-context-menu-children
      ref="ctxChildren"
      :depth="0"
      :items="items"
      @click="onClick"
    />
  </div>
</template>

<script>
  import { getQuantity } from '../../common/utils';

  const prefixEvui = 'ev-contextmenu';

  export default {
    directives: {
      'click-outside': {
        bind(el, binding) {
          const contextMenuEl = el;
          const bubble = binding.modifiers.bubble;
          const handler = (e) => {
            if (bubble || (contextMenuEl !== e.target && !contextMenuEl.contains(e.target))) {
              binding.value(e);
            }
          };
          contextMenuEl.vueClickOutside = handler;

          document.addEventListener('mousedown', handler);
        },
        unbind(el) {
          const contextMenuEl = el;
          document.removeEventListener('mousedown', contextMenuEl.vueClickOutside);
          contextMenuEl.vueClickOutside = null;
        },
      },
    },
    props: {
      isUse: {
        type: Boolean,
        default: true,
      },
      x: {
        type: Number,
        default: 0,
      },
      y: {
        type: Number,
        default: 0,
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
        prefixEvui,
        top: 0,
        left: 0,
        isShow: false,
      };
    },
    computed: {
      ctxMenuStyle() {
        return `top: ${this.top}px; left: ${this.left}px;`;
      },
    },
    created() {
      this.setPosition(this.x, this.y);
    },
    mounted() {
      this.parentAddListener();
      this.moveElToBody();
    },
    beforeDestroy() {
      if (this.$el) {
        this.$el.remove();
      }
      const parentEl = this.$el.parentElement;
      if (parentEl && this.onContextMenu) {
        parentEl.removeEventListener('contextmenu', this.onContextMenu);
      }
    },
    methods: {
      parentAddListener() {
        const parentEl = this.$el.parentElement;

        if (parentEl) {
          parentEl.addEventListener('contextmenu', this.onContextMenu);
        }
      },
      moveElToBody() {
        document.body.appendChild(this.$el);
      },
      onContextMenu(e) {
        this.setPosition(e.clientX, e.clientY);
        this.show();
        e.preventDefault();
      },
      onClick(item) {
        if (!item.items) {
          this.hide();
        }

        this.$emit('click', item);
      },
      setPosition(x, y) {
        const posX = getQuantity(x) || { value: 0 };
        const posY = getQuantity(y) || { value: 0 };
        this.top = posY.value;
        this.left = posX.value;
      },
      show() {
        if (this.isUse) {
          this.isShow = true;
        }
      },
      hide() {
        this.isShow = false;
        const ctxChildren = this.$refs.ctxChildren;

        if (ctxChildren && ctxChildren.clearSubMenuKey) {
          ctxChildren.clearSubMenuKey(this.$children);
        }
      },
    },
  };
</script>

<style lang="scss">
  @import '~@/styles/default';

  .ev-contextmenu {
    position: absolute;
    z-index: 100;
  }
</style>
