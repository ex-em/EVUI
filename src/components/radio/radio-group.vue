<template>
  <div
    :class="wrapClasses"
  >
    <div v-if="list">
      <template
        v-for="item in computedList"
      >
        <Radio
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
import Radio from './radio';

const prefixCls = 'evui-radio-group';

export default {
  name: 'RadioGroup',
  components: {
    Radio,
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
  },
  mounted() {
  },
  methods: {
  },
};
</script>

<style scoped>
</style>
