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
    },
    mounted() {
      this.initValue();
      const bindValue = this.value;
      this.$on('changeEvent', (e) => {
        const targetValue = e.target.value;
        if (e.currentTarget.checked) {
          if (bindValue.indexOf(targetValue) === -1) {
            bindValue.push(targetValue);
          }
          this.$parent.$emit('input', bindValue);
        } else {
          if (bindValue.indexOf(targetValue) > -1) {
            bindValue.splice(bindValue.indexOf(targetValue), 1);
          }
          this.$parent.$emit('input', bindValue);
        }
      });
    },
    methods: {
      initValue() {
        this.childrens = this.$children;
        const value = this.bindValue;
        if (this.childrens) {
          this.childrens.forEach((c) => {
            let checkFlag = false;
            const child = c;
            value.forEach((v) => {
              if (child.value === v) {
                checkFlag = true;
              }
            });
            if (checkFlag) {
              child.bindChecked = true;
            } else {
              child.bindChecked = false;
            }
          });
        }
      },
    },
  };
</script>

<style scoped>
</style>
