<template>
  <div>
    <input
      :id="`${checkboxId}_${value}`"
      :value="value"
      v-model="bindValue"
      type="checkbox"
      class="ev-checkbox-input"
      @change="onChange"
    >
    <label
      :for="`${checkboxId}_${value}`"
      class="ev-checkbox-label"
    >
      <slot/>
    </label>
  </div>
</template>

<script>
  export default {
    model: {
      prop: 'customVModel',
    },
    props: {
      value: {
        type: String,
        default: '',
      },
      customVModel: {
        type: [Boolean, Array],
        default: null,
      },
    },
    data() {
      return {
        checkboxId: this._uid,
        isGroupWrap: false, // group태그가 존재하는 경우 true
        bindValue: this.customVModel,
      };
    },
    computed: {
    },
    watch: {
    },
    created() {
      this.isGroupWrap = this.$parent.$options.componentName === 'CheckboxGroup';
    },
    methods: {
      onChange(e) {
        if (this.isGroupWrap) {
          this.$parent.$emit('changeEvent', e);
        } else {
          this.$emit('changeEvent', e);
          this.$emit('input', e.target.checked);
        }
      },
    },
  };
</script>

<style scoped>
  .ev-checkbox-label {
    user-select: none;
    vertical-align: middle;
  }
  .ev-checkbox-input {
    vertical-align: middle;
  }
</style>
