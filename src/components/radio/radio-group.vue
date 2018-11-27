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
      type: String,
      default: '',
    },
  },
  data() {
    return {
      childrens: [],
    };
  },
  componentName: 'RadioGroup',
  computed: {
  },
  watch: {
  },
  created() {
  },
  mounted() {
    this.initValue();
  },
  methods: {
    initValue() {
      this.childrens = this.$children;
      if (this.childrens) {
        this.childrens.forEach((c) => {
          const child = c;
          child.bindValue = this.value;
        });
      }
    },
  },
};
</script>

<style scoped>
</style>
