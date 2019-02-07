<template>
  <div>
    <slot/>
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
    },
    data() {
      return {
        bindValue: this.value,
        test: this.size,
      };
    },
    componentName: 'CheckboxGroup',
    computed: {
    },
    watch: {
      value(array) {
        this.initValue(array);
      },
    },
    mounted() {
      this.initValue();
      const bindValue = this.bindValue;
      this.$on('change-event', (e) => {
        const targetValue = e.target.value;
        if (e.currentTarget.checked && bindValue.indexOf(targetValue) === -1) {
          bindValue.push(targetValue);
        } else if (!e.currentTarget.checked && bindValue.indexOf(targetValue) > -1) {
          bindValue.splice(bindValue.indexOf(targetValue), 1);
        }
        this.$parent.$emit('input', bindValue);
      });
    },
    methods: {
      initValue(array) {
        if (this.$children && this.$children instanceof Array) {
          const self = this;
          this.$children.forEach((c) => {
            const child = c;
            child.bindValue = array || self.value;
            child.bindSize = self.size;
          });
        }
      },
    },
  };
</script>

<style scoped>
</style>
