<template>
  <div
    v-click-outside="hide"
    :style="ctxMenuStyle"
    :class="prefixEvui"
  >
    <context-menu
      ref="ctxMenu"
      :depth="0"
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
        prefixEvui: 'ev-contextmenu',
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        visibility: 'hidden',
      };
    },
    computed: {
      ctxMenuStyle() {
        return `
          visibility: ${this.visibility};
          top: ${this.top}px;
          left: ${this.left}px;
          `;
      },
    },
    mounted() {
      this.parentAddListener();
      this.moveElToBody();

      if (this.$el && this.$el.firstElementChild) {
        const clientRect = this.$el.firstElementChild.getClientRects()[0] || {};

        this.top = clientRect.top || 0;
        this.left = clientRect.left || 0;
        this.width = clientRect.width || 0;
        this.height = clientRect.height || 0;
      } else {
        this.top = 0;
        this.left = 0;
        this.width = 0;
        this.height = 0;
      }
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
        e.preventDefault();
        this.setPosition(e, e.clientX, e.clientY);
        this.show();
        this.$emit('on-context-menu');
      },
      onClick(item) {
        this.$emit('click', item);
      },
      setPosition(e, x, y) {
        const scrollEl = document.scrollingElement || document.documentElement || document.body;
        const scrollbarSize = window.innerWidth - scrollEl.clientWidth;
        const clientX = x || 0;
        const clientY = y || 0;
        const remainingWidth = (window.innerWidth - clientX)
          - scrollbarSize;
        const remainingHeight = (window.innerHeight - clientY)
          - scrollbarSize;
        let clientWidth = this.width;
        let clientHeight = this.height;

        const clientRects = this.$el.firstElementChild.getClientRects();
        if (clientRects.length) {
          const clientRect = clientRects[0];
          clientWidth = clientRect.width;
          clientHeight = clientRect.height;
        }

        let left = clientX + scrollEl.scrollLeft;
        let top = clientY + scrollEl.scrollTop;

        if (clientWidth > remainingWidth) {
          left -= (clientWidth - remainingWidth);
        }

        if (clientHeight > remainingHeight) {
          top -= (clientHeight - remainingHeight);
        }

        this.left = left;
        this.top = top;
      },
      show() {
        if (this.isUse) {
          this.visibility = 'visible';
        }
      },
      hide() {
        const ctxMenu = this.$refs.ctxMenu;

        if (ctxMenu && ctxMenu.hide) {
          ctxMenu.hide(this.$children);
        }

        this.visibility = 'hidden';
      },
    },
  };
</script>

<style lang="scss">
  @import '~@/styles/default';

  .ev-contextmenu {
    position: absolute;
    z-index: 850;
  }
</style>
