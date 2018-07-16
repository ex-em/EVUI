<template>
  <div
    :style="btnStyle"
    class="evui-btn"
  >
    <button
      :type="htmlType"
      :name="name"
      :class="classes"
      :disabled="disabled"
      @click="onClick"
    >
      <i
        v-if="isLoading"
        class="evui-btn-loading"
      />
      {{ text }}
      <i
        v-if="isMenu"
        class="evui-menu-btn arrow-down"
      >
        <span/>
      </i>
    </button>
    <div
      v-if="isMenu"
      :class="menuAreaCls"
    >
      <ul
        v-for="menuInfo in menuList"
        :key="menuInfo.text"
        class="evui-btn-menu-area-ul"
      >
        <li
          class="evui-btn-menu-area-li"
          @click="itemClick"
        >
          {{ menuInfo.text }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
  import '@/styles/evui.css';

  const prefixEvui = 'evui-btn';

  export default {
    name: 'Button',
    props: {
      name: {
        type: String,
        default: '',
      },
      type: {
        type: String,
        default: 'default',
        // ['default', 'primary', 'ghost', 'dashed', 'text', 'info', 'success', 'warning', 'error']
      },
      htmlType: {
        type: String,
        default: 'button',
        validator(value) {
            const list = ['button', 'submit', 'reset'];
            return list.indexOf(value) > -1;
        },
      },
      btnStyle: {
        type: Object,
        default() {
          return {};
        },
      },
      size: {
        type: String,
        default: 'normal',
        // ['small', 'normal', 'large']
      },
      shape: {
        type: String,
        default: '',
        // ['circle']
      },
      text: {
        type: String,
        default: '',
      },
      disabled: {
        type: Boolean,
        default: false,
      },
      isLoading: {
        type: Boolean,
        default: false,
      },
      isHighPriority: {
        type: Boolean,
        default: false,
      },
      menuList: {
        type: Array,
        default() {
          return [];
        },
        validator(menuList) {
          let menuInfo;
          let isValid = true;
          const list = menuList || [];

          for (let ix = 0, ixLen = list.length; ix < ixLen; ix++) {
            menuInfo = list[ix];

            if (!menuInfo || menuInfo.constructor !== Object || !menuInfo.text) {
              isValid = false;
              break;
            }
          }

          return isValid;
        },
      },
    },
    data() {
      return {
        classes: [],
        menuAreaCls: [],
        isMenu: false,
      };
    },
    mounted() {
      this.classes = this._getClasses();
      this.menuAreaCls = this._getMenuAreaCls();
      this.isMenu = this.menuList && this.menuList.length > 0;
    },
    methods: {
      onClick(event) {
        const text = this.text;
        this._changeMenuAreaClasses();
        this.$emit('click', event, text);
      },
      itemClick(event) {
        const text = event.currentTarget.innerText;
        this.$emit('item-click', event, text);
      },
      _getClasses() {
        const btnBaseCls = `${prefixEvui}-default`;
        const classes = [];

        if (this.type) {
          classes.push(btnBaseCls);
          classes.push(`${prefixEvui}-${this.type}`);
        }

        if (this.size) {
          classes.push(`${prefixEvui}-size-${this.size}`);
        }

        if (this.shape) {
          classes.push(`${prefixEvui}-${this.shape}`);
        }

        if (this.isHighPriority) {
          classes.push(`${prefixEvui}-high-priority`);
        }

        return classes;
      },
      _getMenuAreaCls() {
        const prefixMenuAreaCls = `${prefixEvui}-menu-area`;
        const classes = [];

        classes.push(prefixMenuAreaCls);

        if (this.size) {
          classes.push(`${prefixEvui}-size-${this.size}`);
        }

        return classes;
      },
      _changeMenuAreaClasses() {
        if (!this.isMenu) {
          return;
        }

        const btnEl = event.currentTarget;
        const arrowIconEl = btnEl.lastElementChild;
        const arrowIconClsList = arrowIconEl.classList;
        const menuAreaEl = btnEl.nextElementSibling;
        const menuAreaClsList = menuAreaEl.classList;

        if (arrowIconClsList.contains('arrow-down')) {
          arrowIconClsList.remove('arrow-down');
          arrowIconClsList.add('arrow-up');
        } else {
          arrowIconClsList.add('arrow-down');
          arrowIconClsList.remove('arrow-up');
        }

        if (menuAreaClsList.contains('on')) {
          menuAreaClsList.remove('on');
        } else {
          menuAreaClsList.add('on');
        }
      },
    },
  };
</script>

<style>
/************************************************************************************
 Button Component
 type: ['primary', 'ghost', 'dashed', 'text', 'info', 'success', 'warning', 'error']
 size: ['small', 'normal', 'large']
 shape: ['circle']
************************************************************************************/

/** evui-btn **/

.evui-btn {
  display: inline-block;
}

/** evui-btn > evui-btn-default **/

.evui-btn-default {
  padding: 5px 10px;
  line-height: 100%;
  border: 1px solid transparent;
  border-radius: 4px;
  font-size: 12px;
  font-family: Roboto Condensed;
  cursor: pointer;
  user-select: none;
  transition: color .2s linear,background-color .2s linear,border .2s linear,box-shadow .2s linear;
}
.evui-btn-default:hover {
  opacity: 0.8;
}
.evui-btn-default.active,
.evui-btn-default:active {
  background-color:#fff;
  border-color:#2b85e4;
}
.evui-btn-default>.evui-icon{
  line-height: 100%;
}
.evui-btn-default>.evui-icon+span,
.evui-btn-default>span+.evui-icon {
  margin-left:4px;
}
.evui-btn-default.disabled>*,
.evui-btn-default[disabled]>* {
  pointer-events: none;
}
.evui-btn-default.disabled,
.evui-btn-default.disabled.active,
.evui-btn-default.disabled:active,
.evui-btn-default.disabled:hover,
.evui-btn-default[disabled],
.evui-btn-default[disabled].active,
.evui-btn-default[disabled]:active,
.evui-btn-default[disabled]:hover {
  color:#bbbec4;
  background-color:#f7f7f7;
  border-color:#dddee1;
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
.evui-btn-primary.disabled.active,
.evui-btn-primary.disabled:active,
.evui-btn-primary.disabled:hover,
.evui-btn-primary[disabled],
.evui-btn-primary[disabled].active,
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
.evui-btn-ghost.disabled.active,
.evui-btn-ghost.disabled:active,
.evui-btn-ghost.disabled:focus,
.evui-btn-ghost.disabled:hover,
.evui-btn-ghost[disabled],
.evui-btn-ghost[disabled].active,
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
.evui-btn-dashed.disabled.active,
.evui-btn-dashed.disabled:active,
.evui-btn-dashed.disabled:focus,
.evui-btn-dashed.disabled:hover,
.evui-btn-dashed[disabled],
.evui-btn-dashed[disabled].active,
.evui-btn-dashed[disabled]:active,
.evui-btn-dashed[disabled]:focus,
.evui-btn-dashed[disabled]:hover,
fieldset[disabled] .evui-btn-dashed,
fieldset[disabled] .evui-btn-dashed.active,
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
.evui-btn-dashed.active,
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
.evui-btn-text.active,
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
.evui-btn-text.active,
.evui-btn-text:active {
  color:#2b85e4;
  background-color:transparent;
  border-color:transparent
}
.evui-btn-text.disabled,
.evui-btn-text.disabled.active,
.evui-btn-text.disabled:active,
.evui-btn-text.disabled:hover,
.evui-btn-text[disabled],
.evui-btn-text[disabled].active,
.evui-btn-text[disabled]:active,
.evui-btn-text[disabled]:hover {
  color: #bbbec4;
  background-color: #f7f7f7;
  border-color: #dddee1
}

/** evui-btn > shape > circle **/

.evui-btn-circle {
  border-radius: 32px;
}
.evui-btn-circle.icon-only{
  width:32px;
  height:32px;
  padding:0;
  border-radius:50%;
  font-size:16px;
}

/** evui-btn > high-priority **/

.evui-btn-high-priority {
  color:#fff !important;
  background-color:#DB3A00 !important;
  border-color:#DB3A00 !important;
}
.evui-btn-high-priority:hover {
  background-color: #ED4C00 !important;
  border-color:#ED4C00 !important;
}
.evui-btn-high-priority.active,
.evui-btn-high-priority:active {
  background-color:#E14100 !important;
  border-color:#E14100 !important;
}
.evui-btn-high-priority.disabled,
.evui-btn-high-priority.disabled.active,
.evui-btn-high-priority.disabled:active,
.evui-btn-high-priority.disabled:hover,
.evui-btn-high-priority[disabled],
.evui-btn-high-priority[disabled].active,
.evui-btn-high-priority[disabled]:active,
.evui-btn-high-priority[disabled]:hover {
  color:#bbbec4 !important;
  background-color:#f7f7f7 !important;
  border-color:#dddee1 !important;
}

/** evui-btn > Menu Button **/

.evui-menu-btn {
  display: inline-block;
}
.evui-menu-btn.arrow-up {
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-bottom: 7px solid #FFFFFF;
}
.evui-menu-btn.arrow-down {
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 7px solid #FFFFFF;
}

/** evui-btn > Menu List Area **/
/** evui-btn > Menu List Area **/

.evui-btn-menu-area {
  visibility: hidden;
  position: absolute;
  padding: 1px;
  border-radius: 4px;
  text-align: center;
  background: #FFFFFF;
  box-shadow: 1px 1px 5px rgba(0,0,0,0.5);
}
.evui-btn-menu-area.on {
  visibility: visible;
  height: auto;
}
.evui-btn-menu-area-ul {
  display: block;
  list-style: none;
}
.evui-btn-menu-area-li {
  padding: 3px 14px 3px 14px;
  font-size: 12px;
  font-family: Roboto Condensed;
  color: #000000;
  transition: all .1s;
  cursor: pointer;
}
.evui-btn-menu-area-li:hover {
  background: #2d8cf0;
  color: #FFFFFF;
}

/** evui-btn > loading **/

.evui-btn-loading {
  display: inline-block;
  width: 15px;
  height: 15px;
  margin-right: 2px;
  border-width: 2px;
  border-radius: 50%;
  border-style: solid;
  border-color: #FFFFFF;
  border-top-color: #dddddd;
  vertical-align: middle;
  animation: spin 1s ease-in-out infinite;
  -webkit-animation: spin 1s ease-in-out infinite;
}

.evui-btn-primary .evui-btn-loading {
  border-color: #FFFFFF;
  border-top-color: #2d8cf0;
}

/** size **/

.evui-btn-size-small {
  height: 24px;
  font-size: 12px;
}
.evui-btn-size-normal {
  height: 30px;
  font-size: 12px;
}
.evui-btn-size-large {
  height: 36px;
  font-size: 14px;
}

/** evui-btn > large > evui-btn-default **/
.evui-btn-size-large.evui-btn-default {
  padding-bottom: 7px;
}
/** evui-btn > evui-btn-size > evui-btn-menu-area-li **/
.evui-btn-size-small .evui-btn-menu-area-li {
  padding: 3px 13px 3px 12px;
}
.evui-btn-size-normal .evui-btn-menu-area-li {
  padding: 3px 13px 3px 12px;
}
.evui-btn-size-large .evui-btn-menu-area-li {
  padding: 3px 16px 3px 15px;
}
/** evui-btn > evui-btn-size > evui-btn-loading **/
.evui-btn-size-small .evui-btn-loading {
  width: 9px;
  height: 9px;
}
.evui-btn-size-normal .evui-btn-loading {
  margin-top: -1px;
  width: 10px;
  height: 10px;
}
.evui-btn-size-large .evui-btn-loading {
  width: 13px;
  height: 13px;
}

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
