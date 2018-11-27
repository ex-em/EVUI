<template>
  <div
    @ttttt="onChangeEvent"
  >
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
  },
  methods: {
    onChangeEvent(e) {
      console.log('checkboxgroup onChangeEvent');
      this.$emit('changeEvent', e);
    },
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
          }
        });
      }
    },
  },
};
</script>

<style scoped>
</style>
