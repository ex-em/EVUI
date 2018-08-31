<template>
  <div
    v-click-outside="hide"
    v-if="isShow"
    :style="ctxMenuStyle"
    :class="prefixEvui"
  >
    <div :class="`${prefixEvui}-separator`"/>
    <div
      v-for="(item, idx) in items"
      :key="item.text"
      :class="`${prefixEvui}-row`"
      @click="onClick($event, item, idx)"
    >
      {{ item.text }}
    </div>
  </div>
</template>

<script>
  import '@/styles/evui.css';

  const prefixEvui = 'ev-contextmenu';

  export default {
    name: 'ContextMenu',
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
      useCtxMenu: {
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
          return typeof value === 'object' || value !== null;
        },
      },
    },
    data() {
      return {
        prefixEvui,
        isShow: false,
        top: 0,
        left: 0,
      };
    },
    computed: {
      ctxMenuStyle() {
        return `top: ${this.top}px; left: ${this.left}px`;
      },
    },
    created() {
      this.setPosition(this.x, this.y);
    },
    mounted() {
    },
    methods: {
      onClick(e, item, idx) {
        if (item.fn) {
          item.fn(e, item.text, idx);
        }
      },
      setPosition(x, y) {
        this.top = `${this.removePixel(y)}`;
        this.left = `${this.removePixel(x)}`;
      },
      removePixel(input) {
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
      show() {
        if (this.useCtxMenu) {
          this.isShow = true;
        }
      },
      hide() {
        this.isShow = false;
      },
    },
  };
</script>

<style scoped>
  .ev-contextmenu{
    position: absolute;
    padding: 2px;
    background: #f0f0f0;
    border: 1px solid #d0d0d0;
    font-size: 12px;
    color: #222222;
    z-index: 9999;
  }
  .ev-contextmenu-separator {
    position: absolute;
    top: 0;
    left: 24px;
    width: 2px;
    height: calc(100% - 4px);
    margin: 2px 0 2px 0;
    background-color: white;
    border-left: solid 1px #e0e0e0;
    overflow: hidden;
  }
  .ev-contextmenu-row{
    position: relative;
    padding: 2px 12px 2px 34px;
    line-height: 22px;
    white-space: nowrap;
    overflow: hidden;
    cursor: pointer;
  }
  .ev-contextmenu-row:hover{
    padding: 1px 11px 1px 33px;
    background-color: #e6e6e6;
    border: 1px solid #9d9d9d;
    border-radius: 3px;
  }

</style>
