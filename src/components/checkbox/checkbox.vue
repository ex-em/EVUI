<template>
  <div>
    <label
      v-if="isGroupWrap"
      :for="`${id}_groupWrap`"
    >
      <input
        :id="`${id}_groupWrap`"
        :value="value"
        :checked="bindChecked"
        type="checkbox"
        @change="onChange"
      >
      <slot/>
    </label>
    <label
      v-else
      :for="`${id}_noWrap`"
    >
      <input
        :id="`${id}_noWrap`"
        :value="value"
        :checked="customVModel"
        type="checkbox"
        @change="onChange"
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
      id: {
        type: String,
        required: true,
      },
      value: {
        type: String,
        default: '',
      },
      customVModel: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        isGroupWrap: false, // group태그가 존재하는 경우 true
        bindChecked: false,
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
          this.bindChecked = e.target.checked;
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
  label {
    user-select: none;
  }
</style>
