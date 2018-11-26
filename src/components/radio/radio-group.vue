<template>
  <div
    @changeEvent="onChangeEvent"
    @changeTarget="onChangeTarget"
    @changeValue="onChangeValue"
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
    onChangeEvent(e) {
      // return Event
      this.$emit('changeEvent', e);
    },
    onChangeTarget(t) {
      // return DOM
      this.$emit('changeTarget', t);
    },
    onChangeValue(v) {
      // return value
      this.$emit('changeValue', v);
      this.$emit('input', v);
    },
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
