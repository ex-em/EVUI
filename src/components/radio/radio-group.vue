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
          <Radio
            :label = "item.label"
            :disabled="computedDisabled"
            type="radio"
          />
        </div>
      </template>
    </div>
    <div
      v-else
      :class="computedInnerDiv"
    >
      <slot/>
    </div>
  </div>
</template>
<script>
import Radio from './radio';
import { getMatchedComponentsDownward } from '../../common/utils';

const prefixCls = 'evui-radio-group';

export default {
  name: 'RadioGroup',
  components: {
    Radio,
  },
  props: {
    value: {
      type: [String, Number, Boolean],
      default: '',
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
    computedInnerDiv: function computedInnerDiv() {
      const classArr = [];
      if (this.groupAlign === 'hbox') {
        classArr.push(`${prefixCls}-inner`);
      }
      return classArr;
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
  },
  watch: {
    value() {
      this.currentValue = this.value;
      this.updateModel();
    },
  },
  methods: {
    updateModel() {
      this.children = getMatchedComponentsDownward(this, 'Radio');
      if (this.children) {
        this.children.forEach((v) => {
            const item = v;
            item.currentValue = this.value === item.label;
            item.group = true;
        });
      }
    },
    change(data) {
      this.currentValue = data.value;
      this.updateModel();
      this.$emit('input', data.value);
      this.$emit('on-change', data.value);
    },
  },
};
</script>

<style scoped>
</style>
