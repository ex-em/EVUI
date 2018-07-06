<template>
  <div class="evui-btn">
    <button
      :type="htmlType"
      :name="name"
      :disabled="disabled"
      :class="classes"
      @click="onClick"
    >
      <i
        v-if="isLoading"
        class="loading"
      />
      {{ text }}
      <i
        v-if="menuListCnt"
        class="menu-btn arrow-down"
      >
        <span/>
      </i>
    </button>
    <div
      v-if="menuListCnt"
      class="menu-area"
    >
      <ul
        v-for="menuInfo in menuList"
        :key="menuInfo.text"
      >
        <li @click="itemClick">
          {{ menuInfo.text }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
  import '@/styles/evui.css';

  export default {
    name: 'Button',
    props: {
      htmlType: {
        type: String,
        default: 'button',
        validator(value) {
            const list = ['button', 'submit', 'reset'];
            return list.indexOf(value) > -1;
        },
      },
      name: {
        type: String,
        default: null,
      },
      clsType: {
        type: String,
        default: 'primary',
        validator(value) {
          const list = ['primary', 'ghost', 'dashed', 'text', 'info', 'success', 'warning', 'error', 'default'];
          return list.indexOf(value) > -1;
        },
      },
      customCls: {
        type: String,
        default: null,
      },
      shape: {
        type: String,
        default: null,
        validator(value) {
          const list = ['circle'];
          return list.indexOf(value) > -1;
        },
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
      };
    },
    computed: {
      classes() {
        const classList = [];

        if (typeof this.customCls === 'string') {
          return this.customCls;
        }

        classList.push(this.clsType);

        if (this.shape) {
          classList.push(this.shape);
        }

        return classList;
      },
      menuListCnt() {
        let cnt = 0;

        if (this.menuList && this.menuList.constructor === Array) {
          cnt = this.menuList.length;
        }
        return cnt;
      },
    },
    methods: {
      onClick(event) {
        const text = this.text;
        this._changeMenuListClasses();
        this.$emit('click', event, text);
      },
      itemClick(event) {
        const text = event.currentTarget.innerText;
        this.$emit('item-click', event, text);
      },
      _changeMenuListClasses() {
        if (!this.menuListCnt) {
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
