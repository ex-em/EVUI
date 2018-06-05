<template>
  <div class="wrapClasses">
    <slot/>
  </div>
</template>
<script>
  const prefixCls = 'evui-checkbox-group';

  export default {
    name: 'CheckboxGroup',
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
          {
            [`${prefixCls}-disabled`]: this.disabled,
          },
        ];
      },
    },
    mounted() {
      this.updateModel(true);
    },
    methods: {
      updateModel() {

      },

    },
  };
</script>

<style scoped>

</style>
