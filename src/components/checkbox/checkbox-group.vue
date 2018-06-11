<template>
  <div :class="wrapClasses">
    <div>
      <CheckBox
        v-if="useAllCheck"
        :label="'Check All'"
        :value="'all'"
        :click-event="changeAll"
      />
    </div>
    <div v-if="list">
      <template
        v-for="item in computedList"
      >
        <CheckBox
          :label="item.label"
          :checked.sync="item.checked"
          :key="item.id"
          :value="item.value"
        />
      </template>
    </div>
    <slot/>
  </div>
</template>
<script>
import CheckBox from './checkbox';
import { getMatchedComponentsDownward } from '../../common/utils';

const prefixCls = 'evui-checkbox-group';

export default {
  name: 'CheckboxGroup',
  components: {
    CheckBox,
  },
  props: {
    value: {
      type: Array,
      default() {
        return [];
      },
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    useAllCheck: {
      type: Boolean,
      default: true,
    },
    list: {
      type: [String, Number, Object, Array, Boolean],
      default: null,
    },
  },
  data() {
    return {
      currentValue: this.value,
      childrenList: {},
      chkAll: false,
    };
  },
  computed: {
    wrapClasses: function wrapClasses() {
      return [
        `${prefixCls}`,
        {
          [`${prefixCls}-disabled`]: this.disabled,
        },
      ];
    },
    computedList: function computedList() {
      if (this.list) {
        this.list.forEach((v) => {
          const value = v; if (v && !v.clickEvent) { value.clickEvent = this.change; }
        });
      }
      return this.list;
    },
    chkAllProp: {
      get: function get() {
        return this.chkAll;
      },
      set: function set(value) {
        this.chkAll = value;
      },
    },
  },
  methods: {
    change: function change() {
    },
    changeAll: function changeAll(e) {
      const children = getMatchedComponentsDownward(this, 'CheckBox');
      const isChecked = e.target.checked;
      children.unshift();
      if (children) {
        children.forEach((v) => {
          const value = v;
          value.updateValue(isChecked);
        });
      }

      return {};
    },
  },
};
</script>

<style scoped>
</style>
