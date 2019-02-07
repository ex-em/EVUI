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
    size: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
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
      if (this.$children && this.$children instanceof Array) {
        this.$children.forEach((c) => {
          const child = c;
          child.bindValue = v || this.value;
          child.size = this.size;
        });
      }
    },
  },
};
</script>

<style scoped>
</style>
