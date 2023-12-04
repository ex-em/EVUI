<template>
  <div>
    <slot />
  </div>
</template>

<script>
  export default {
    props: {
      value: {
        type: Array,
        default() {
          return [];
        },
      },
      size: {
        type: String,
        default() {
          return '';
        },
      },
      type: {
        type: String,
        default() {
          return '';
        },
      },
    },
    componentName: 'CheckboxGroup',
    computed: {
      bindValue() {
        return this.value;
      },
    },
    watch: {
      value(array) {
        this.initValue(array);
      },
    },
    mounted() {
      this.initValue();
      this.$on('on-change', this.onChange);
    },
    beforeDestroy() {
      this.$off('on-change', this.onChange);
    },
    methods: {
      initValue(array) {
        if (this.$children && this.$children instanceof Array) {
          const self = this;
          this.$children.forEach((c) => {
            const child = c;
            child.bindValue = array || self.value;
            child.bindSize = self.size;
            child.bindType = self.type;
          });
        }
      },
      onChange(e) {
        const bindValue = this.bindValue;
        const targetValue = e.target.value;
        this.$nextTick(() => {
          if (e.currentTarget.checked && bindValue.indexOf(targetValue) === -1) {
            bindValue.push(targetValue);
          } else if (!e.currentTarget.checked && bindValue.indexOf(targetValue) > -1) {
            bindValue.splice(bindValue.indexOf(targetValue), 1);
          }
          this.$parent.$emit('input', bindValue);
        });
      },
    },
  };
</script>

<style scoped>
</style>
