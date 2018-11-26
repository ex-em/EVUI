<template>
  <div>
    <input
      :id="radioId"
      :value="radioValue"
      :name="radioName"
      :checked="bindValue === radioValue"
      :disabled="disabled"
      type="radio"
      @change="onChange"
    >
    <label
      :for="radioId"
    >
      {{ radioValue }}
    </label>
  </div>
</template>

<script>
export default {
  props: {
    radioId: {
      type: String,
      required: true,
    },
    radioValue: {
      type: String,
      required: true,
    },
    radioName: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    value: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      bindValue: this.value,
    };
  },
  computed: {
  },
  watch: {
  },
  mounted() {
  },
  methods: {
    onChange(e) {
      if (this.$parent.$options.componentName === 'RadioGroup') {
        // 부모 컴포넌트가 Radio Group인 경우
        this.$parent.$emit('changeEvent', e);
        this.$parent.$emit('changeTarget', e.target);
        this.$parent.$emit('changeValue', e.target.value);
        this.$parent.$emit('input', e.target.value);
      } else {
        // 부모 컴포넌트가 Radio Group로 안감싼경우
        this.$emit('input', e.target.value);
      }
    },
  },
};
</script>

<style scoped>
</style>
