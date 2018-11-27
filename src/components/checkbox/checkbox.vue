<template>
  <div>
    <input
      :id="id"
      :label="label"
      :name="groupName"
      :checked="bindChecked"
      type="checkbox"
      @change="onChange"
    >
    <label
      :for="id"
    >
      {{ label }}
    </label>
  </div>
</template>

<script>
  export default {
    props: {
      id: {
        type: String,
        required: true,
      },
      label: {
        type: String,
        default: '',
      },
      groupName: {
        type: String,
        default: '',
      },
      value: {
        type: Array,
        default() {
          return [];
        },
      },
      checked: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        bindChecked: this.checked,
      };
    },
    computed: {
    },
    watch: {
    },
    mounted() {
    },
    methods: {
      onChange(e) {
        if (this.$parent.$options.componentName === 'CheckboxGroup') {
          this.$parent.$emit('changeEvent', e);
        } else {
          this.$emit('changeEvent', e);
        }
      },
    },
  };
</script>
<style scoped>
  div{
    padding: 2px;
  }
</style>
