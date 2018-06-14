<template>
  <div
    :class="wrappedClasses"
  >
    <input
      :id="createId"
      :class="wrappedInnerClasses"
      :disabled="disabled"
      v-model="model"
      type="radio"
      @click="clickDefaultEvent"
    >
    <label
      :for="createId"
      :class="labelClasses"
    >
      {{ label }}
    </label>
  </div>
</template>

<script>
const prefixCls = 'evui-radio';

export default {
  name: 'Radio',
  model: {
  },
  props: {
    cls: {
      type: String,
      default: null,
    },
    label: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      model: [],
    };
  },
  computed: {
    wrappedClasses() {
      return [
        `${prefixCls}`,
        {
          'evui-disabled': this.wrapperedDisabled,
        },
      ];
    },
    labelClasses() {
      return [
        `${prefixCls}-label`,
      ];
    },
    createId() {
      return this._uid;
    },
    wrappedInnerClasses() {
      return this.wrapperedInnerClass;
    },
  },
  methods: {
    clickDefaultEvent: function clickDefaultEvent() {
      console.log('test');
    },
  },
};
</script>
<style scoped>
</style>
