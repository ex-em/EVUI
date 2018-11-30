<template>
  <div
    :class="{ disabled: disabled }"
    class="ev-checkbox-wrap"
  >
    <label
      :for="`${checkboxId}_${value}`"
      class="ev-checkbox-label"
    >
      <input
        :id="`${checkboxId}_${value}`"
        :value="value"
        :disabled="disabled"
        v-model="bindValue"
        type="checkbox"
        class="ev-checkbox-input"
        @change="onChange"
      >
      <slot/>
    </label>
  </div>
</template>

<script>
  export default {
    model: {
      prop: 'customValue',
    },
    props: {
      value: {
        type: String,
        default: '',
      },
      disabled: {
        type: Boolean,
        default: false,
      },
      customValue: {
        type: [Boolean, Array],
        default: null,
      },
    },
    data() {
      return {
        checkboxId: this._uid,
        isGroupWrap: false, // group태그가 존재하는 경우 true
        bindValue: this.customValue,
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
  .ev-checkbox-wrap {
    float: left;
    user-select: none;
    cursor: pointer;
  }
  .ev-checkbox-wrap.disabled {
    color: #C0C4CC;
    cursor: not-allowed;
  }
  .ev-checkbox-label {
    vertical-align: middle;
    cursor: inherit;
  }
  .ev-checkbox-input {
    vertical-align: middle;
    cursor: inherit;
  }
</style>
