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
        childrens: [],
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
        this.childrens = this.$children;
        const value = this.value;
        if (this.childrens) {
          this.childrens.forEach((c) => {
            const child = c;
            child.bindValue = array || value;
          });
        }
      },
    },
  };
</script>

<style scoped>
</style>
