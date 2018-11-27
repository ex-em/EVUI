<template>
  <div>
    <slot/>
  </div>
</template>

<script>
  export default {
    components: {
    },
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
        if (e.currentTarget.checked) {
          if (bindValue.indexOf(e.target.id) <= -1) {
            bindValue.push(e.target.id);
          }
          this.$parent.$emit('input', bindValue);
        } else {
          if (bindValue.indexOf(e.target.id) > -1) {
            bindValue.splice(bindValue.indexOf(e.target.id), 1);
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
              if (child.id === v) {
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
