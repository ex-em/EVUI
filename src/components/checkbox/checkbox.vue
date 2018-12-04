<template>
  <label
    :for="`${checkboxId}_${value}`"
    :class="{ disabled: disabled }"
    class="ev-checkbox-label"
  >
    <input
      v-if="!isGroupWrap"
      :id="`${checkboxId}_${value}`"
      :value="value"
      :disabled="disabled"
      v-model="bindValue"
      type="checkbox"
      class="ev-checkbox-input noGroupWrap"
      @change="change"
    >
    <input
      v-else
      :id="`${checkboxId}_${value}`"
      :value="value"
      :disabled="disabled"
      v-model="groupBindValue"
      type="checkbox"
      class="ev-checkbox-input groupWrap"
      @change="change"
    >
    <slot/>
  </label>
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
        groupBindValue: [],
      };
    },
    computed: {
      bindValue: {
        get() {
          return this.customValue;
        },
        set(list) {
          this.groupBindValue = list;
        },
      },
    },
    created() {
      this.isGroupWrap = this.$parent.$options.componentName === 'CheckboxGroup';
    },
    methods: {
      change(e) {
        if (this.isGroupWrap) {
          this.$parent.$emit('change-event', e);
        } else {
          this.$emit('change-event', e);
          this.$emit('input', e.target.checked);
        }
      },
    },
  };
</script>

<style scoped>
  .ev-checkbox-label {
    vertical-align: middle;
    float: left;
    user-select: none;
    cursor: pointer;
  }
  .ev-checkbox-label.disabled {
    color: #C0C4CC;
    cursor: not-allowed;
  }
  .ev-checkbox-input {
    vertical-align: middle;
    cursor: inherit;
  }
</style>
