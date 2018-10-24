<template>
  <div
    v-click-outside="hide"
    v-show="isShow"
    :style="ctxMenuStyle"
    :class="prefixEvui"
  >
    <Context-children
      ref="ctxChildren"
      :depth="0"
      :items="items"
      @click="onClick"
    />
  </div>
</template>

<script>
  import '@/styles/evui.css';
  import ContextChildren from '@/components/menu/context.children';

  const prefixEvui = 'ev-contextmenu';

  export default {
    components: {
      ContextChildren,
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
    methods: {
      onClick(item) {
        this.$emit('click', item);
      },
      setPosition(x, y) {
        this.top = `${this.extractNumber(y)}`;
        this.left = `${this.extractNumber(x)}`;
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
      extractNumber(input) {
        let result;

        if (typeof input === 'string' && input) {
          const match = (/^(normal|(\d+(?:\.\d+)?)(px|%)?)$/).exec(input);
          if (match[2]) {
            result = +match[2];
          }
        } else {
          result = input;
        }

        return result || 0;
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
