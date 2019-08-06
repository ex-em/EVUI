<template>
  <div
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
  import '@/styles/evui.css';
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
        isVisible: 'hidden',
      };
    },
    computed: {
      ctxMenuStyle() {
        return `
          visibility: ${this.isVisible};
          top: ${this.top}px;
          left: ${this.left}px;
          `;
      },
    },
    mounted() {
      this.parentAddListener();
      this.moveElToBody();
    },
    beforeDestroy() {
      if (this.$el) {
        this.$el.remove();
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
        this.setPosition(e, e.clientX, e.clientY);
        this.show();
        e.preventDefault();
      },
      onClick(item) {
        this.$emit('click', item);
      },
      setPosition(e, x, y) {
        const width = this.$el.clientWidth;
        const height = this.$el.clientHeight;
        let posX = (getQuantity(x) || { value: 0 }).value;
        let posY = (getQuantity(y) || { value: 0 }).value;
        const extraWidth = window.innerWidth - posX;
        const extraHeight = window.innerHeight - posY;

        if (width > extraWidth && (posX - width) >= 0) {
          posX -= (width - extraWidth);
        }

        if (extraHeight < height && (posY - height) >= 0) {
          posY -= (height - extraHeight);
        }

        this.top = posY + document.scrollingElement.scrollTop;
        this.left = posX + document.scrollingElement.scrollLeft;
      },
      show() {
        if (this.isUse) {
          this.isVisible = 'visible';
        }
      },
      hide() {
        const ctxChildren = this.$refs.ctxChildren;

        if (ctxChildren && ctxChildren.clearSubMenuKey) {
          ctxChildren.clearSubMenuKey(this.$children);
        }

        this.isVisible = 'hidden';
      },
    },
  };
</script>

<style>
  .ev-contextmenu{
    position: absolute;
    z-index: 9999;
  }
</style>
