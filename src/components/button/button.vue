<template>
  <button
    :type="htmlType"
    :class="btnClass"
    :disabled="disabled"
    @click="onClick"
  >
    <span :class="`${prefixCls}-span`">
      <slot/>
    </span>
  </button>
</template>

<script>
  import '@/styles/evui.css';

  const prefixCls = 'evui-btn';

  export default {
    props: {
      htmlType: {
        type: String,
        default: 'button',
        validator(value) {
            const list = ['button', 'submit', 'reset'];
            return list.indexOf(value) > -1;
        },
      },
      type: {
        type: String,
        default: 'default',
        validator(value) {
          const list = [
            'default', 'primary', 'ghost', 'dashed',
            'text', 'info', 'success', 'warning', 'error',
          ];
          return list.indexOf(value) > -1;
        },
      },
      size: {
        type: String,
        default: 'medium',
        validator(value) {
          const list = ['small', 'medium', 'large'];
          return list.indexOf(value) > -1;
        },
      },
      shape: {
        type: String,
        default: 'square',
        validator(value) {
          const list = ['square', 'radius', 'circle'];
          return list.indexOf(value) > -1;
        },
      },
      disabled: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        prefixCls,
        btnClass: this._getBtnClass(),
      };
    },
    methods: {
      onClick(event) {
        this.$emit('click', event);
      },
      _getBtnClass() {
        return {
          [`${prefixCls}`]: true,
          [`${prefixCls}-${this.type}`]: this.type !== 'default',
          [`${prefixCls}-size-${this.size}`]: true,
          [`${prefixCls}-${this.shape}`]: true,
        };
      },
    },
  };
</script>

<style>
.evui-btn {
  display: inline-block;
  border: 1px solid transparent;
  border-radius: 4px;
  vertical-align: middle;
  line-height: 100%;
  font-size: 12px;
  cursor: pointer;
  user-select: none;
  transition: color .2s linear,background-color .2s linear,border .2s linear,box-shadow .2s linear;
}
.evui-btn:hover {
  opacity: 0.8;
}
.evui-btn.active,
.evui-btn:active {
  background-color:#fff;
  border-color:#2b85e4;
}
.evui-btn.disabled>*,
.evui-btn[disabled]>* {
  pointer-events: none;
}
.evui-btn.disabled,
.evui-btn.disabled:active,
.evui-btn.disabled:hover,
.evui-btn[disabled],
.evui-btn[disabled]:active,
.evui-btn[disabled]:hover {
  color:#bbbec4;
  background-color:#f7f7f7;
  border-color:#dddee1;
}

.evui-btn-span{
  display: flex;
  align-items: center;
  justify-content: center;
}

/** evui-btn > type(primary) **/

.evui-btn-primary {
  color:#fff;
  background-color:#2d8cf0;
  border-color:#2d8cf0;
}
.evui-btn-primary:hover {
  background-color:#50A5F0;
  border-color:#50A5F0;
}
.evui-btn-primary.active,
.evui-btn-primary:active {
  background-color:#2b85e4;
  border-color:#2b85e4;
}
.evui-btn-primary.disabled,
.evui-btn-primary.disabled:active,
.evui-btn-primary.disabled:hover,
.evui-btn-primary[disabled],
.evui-btn-primary[disabled]:active,
.evui-btn-primary[disabled]:hover {
  color:#bbbec4;
  background-color:#f7f7f7;
  border-color:#dddee1;
}

/** evui-btn > type(gost) **/

.evui-btn-ghost {
  color: #495060;
  background-color: transparent;
  border-color: #dddee1
}
.evui-btn-ghost:hover {
  color: #57a3f3;
  background-color: transparent;
  border-color: #57a3f3
}
.evui-btn-ghost.active,
.evui-btn-ghost:active {
  color: #2b85e4;
  background-color: transparent;
  border-color: #2b85e4
}
.evui-btn-ghost:focus {
  -webkit-box-shadow: 0 0 0 2px rgba(45, 140, 240, .2);
  box-shadow: 0 0 0 2px rgba(45, 140, 240, .2)
}
.evui-btn-ghost.disabled,
.evui-btn-ghost.disabled:active,
.evui-btn-ghost.disabled:focus,
.evui-btn-ghost.disabled:hover,
.evui-btn-ghost[disabled],
.evui-btn-ghost[disabled]:active,
.evui-btn-ghost[disabled]:focus,
.evui-btn-ghost[disabled]:hover{
  color: #bbbec4;
  background-color: #f7f7f7;
  border-color: #dddee1
}

/** evui-btn > type(dashed) **/

.evui-btn-dashed {
  color: #495060;
  background-color: transparent;
  border-color: #dddee1;
  border-style: dashed
}
.evui-btn-dashed:hover {
  color: #6d7380;
  background-color: rgba(255, 255, 255, .2);
  border-color: #e4e5e7
}
.evui-btn-dashed.active,
.evui-btn-dashed:active {
  color: #454c5b;
  background-color: rgba(0, 0, 0, .05);
  border-color: rgba(0, 0, 0, .05)
}
.evui-btn-dashed.disabled,
.evui-btn-dashed.disabled:active,
.evui-btn-dashed.disabled:focus,
.evui-btn-dashed.disabled:hover,
.evui-btn-dashed[disabled],
.evui-btn-dashed[disabled]:active,
.evui-btn-dashed[disabled]:focus,
.evui-btn-dashed[disabled]:hover,
fieldset[disabled] .evui-btn-dashed,
fieldset[disabled] .evui-btn-dashed:active,
fieldset[disabled] .evui-btn-dashed:focus,
fieldset[disabled] .evui-btn-dashed:hover {
  color: #bbbec4;
  background-color: #f7f7f7;
  border-color: #dddee1
}
.evui-btn-dashed:hover {
  color: #57a3f3;
  background-color: transparent;
  border-color: #57a3f3
}
.evui-btn-dashed:active {
  color: #2b85e4;
  background-color: transparent;
  border-color: #2b85e4
}
.evui-btn-dashed:focus {
  -webkit-box-shadow: 0 0 0 2px rgba(45, 140, 240, .2);
  box-shadow: 0 0 0 2px rgba(45, 140, 240, .2)
}

/** evui-btn > type(text) **/

.evui-btn-text {
  color: #000000;
  background-color: transparent;
  border-color: transparent;
}
.evui-btn-text:hover {
  color: #6d7380;
  background-color: rgba(255,255,255,.2);
  border-color: rgba(255,255,255,.2)
}
.evui-btn-text:active {
  color: #454c5b;
  background-color: rgba(0,0,0,.05);
  border-color: rgba(0,0,0,.05)
}
.evui-btn-text:hover {
  color: #57a3f3;
  background-color: transparent;
  border-color: transparent;
}
.evui-btn-text:active {
  color:#2b85e4;
  background-color:transparent;
  border-color:transparent
}
.evui-btn-text.disabled,
.evui-btn-text.disabled:active,
.evui-btn-text.disabled:hover,
.evui-btn-text[disabled],
.evui-btn-text[disabled]:active,
.evui-btn-text[disabled]:hover {
  color: #bbbec4;
  background-color: #f7f7f7;
  border-color: #dddee1
}

/** evui-btn > shape > circle **/

.evui-btn-radius {
  border-radius: 32px;
}
.evui-btn-circle {
  padding: 9px;
  border-radius: 50%;
}

/** size **/

.evui-btn-size-small {
  padding: 7px 10px;
  font-size: 12px;
}
.evui-btn-size-medium {
  padding: 8px 12px;
  font-size: 14px;
}
.evui-btn-size-large {
  padding: 10px 14px;
  font-size: 16px;
}

.evui-btn-size-small i { font-size: 12px !important; }
.evui-btn-size-medium i { font-size: 14px !important; }
.evui-btn-size-large i { font-size: 16px !important; }

@keyframes spin {
  to { -webkit-transform: rotate(360deg); }
}
@-webkit-keyframes spin {
  to { -webkit-transform: rotate(360deg); }
}
@-webkit-keyframes grdAiguille{
  0%{-webkit-transform:rotate(0deg);}
  100%{-webkit-transform:rotate(360deg);}
}
@keyframes grdAiguille{
  0%{transform:rotate(0deg);}
  100%{transform:rotate(360deg);}
}

</style>
