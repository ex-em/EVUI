<template>
  <div
    :class="wrapClasses"
  >
    <div v-if="list">
      <template
        v-for="item in computedList"
      >
        <div
          :key="item.id"
          :class="computedInnerDiv"
        >
          <CheckBox
            :label = "item.label"
            :disabled="computedDisabled"
            type="checkbox"
          />
        </div>
        {{ item.checked }}
      </template>
    </div>
    <slot v-if="!list"/>
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
    list: {
      type: [String, Number, Object, Array, Boolean],
      default: null,
    },
    groupAlign: {
      type: String,
      default: 'hbox',
      validator(value) {
        let result = '';
        if (value === 'hbox' || value === 'vbox') {
          result = value;
        } else {
          result = '';
        }

        return result;
      },
    },
    changeFn: {
      type: Function,
      default: null,
    },
  },
  data() {
    return {
      currentValue: this.value,
      children: [],
    };
  },
  computed: {
    wrapClasses: function wrapClasses() {
      return [
        `${prefixCls}`,
      ];
    },
    computedList: function computedList() {
      if (this.list) {
        this.list.forEach((v) => {
          const value = v;
          if (v && !v.clickEvent) {
            value.clickEvent = this.change;
          }
          if (v && !v.disabled) {
            value.disabled = this.disabled;
          }
        });
      }
      return this.list;
    },
    computedInnerDiv: function computedInnerDiv() {
      const classArr = [];
      if (this.groupAlign === 'hbox') {
        classArr.push(`${prefixCls}-inner`);
      }
      return classArr;
    },
    computedDisabled: function computedDisabled() {
      return this.disabled;
    },
  },
  watch: {
    value() {
      this.updateModel(true);
    },
  },
  mounted() {
    this.updateModel(true);
  },
  methods: {
    change: function change(data) {
      this.currentValue = data;
      this.$emit('input', data);
      this.$emit('on-change', data);
    },
    updateModel: function updateModel(update) {
      this.children = getMatchedComponentsDownward(this, 'CheckBox');
      if (this.children) {
        const { value } = this;
        this.children.forEach((v) => {
          const child = v;
          child.model = value;
          if (update) {
            child.currentValue = value.indexOf(child.label) >= 0;
            child.group = true;
          }
        });
      }
    },
  },
};
</script>

<style scoped>
  .evui-checkbox-group-inner {
    display: inline-block;
  }
</style>
