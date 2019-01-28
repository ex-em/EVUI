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
    },
    data() {
      return {
        bindValue: this.value,
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
          this.$children.forEach((c) => {
            const child = c;
            child.bindValue = array || this.value;
          });
        }
      },
    },
  };
</script>

<style scoped>
</style>
