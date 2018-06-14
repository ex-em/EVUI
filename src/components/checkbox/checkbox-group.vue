<template>
  <div
    :class="wrapClasses"
  >
    <div v-if="list">
      <template
        v-for="item in computedList"
      >
        <CheckBox
          :label="item.label"
          :checked="item.checked"
          :key="item.id"
          :value="item.value"
          :disabled="item.disabled"
        />
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
  },
  watch: {
    value(v) {
      console.log('watch', v);
    },
  },
  mounted() {
    this.updateModel(true);
  },
  methods: {
    changeCheckValue: function change(data) {
      this.$emit('on-change', data);
    },
    updateModel: function updateModel(update) {
      const children = getMatchedComponentsDownward(this, 'CheckBox');
      if (children) {
        const model = this.value;
        children.forEach((v) => {
          const value = v;
          value.model = model;
          if (this.disabled) {
            value.setDisabled(this.disabled);
          }
          if (update) {
            console.log('update', update);
          }
        });
      }
      this.children = children;
    },
  },
};
</script>

<style scoped>
</style>
