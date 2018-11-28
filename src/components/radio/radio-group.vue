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
    value(v) {
      this.initValue(v);
    },
  },
  created() {
  },
  mounted() {
    this.initValue();
  },
  methods: {
    initValue(v) {
      this.childrens = this.$children;
      if (this.childrens) {
        this.childrens.forEach((c) => {
          const child = c;
          child.bindValue = v || this.value;
        });
      }
    },
  },
};
</script>

<style scoped>
</style>
