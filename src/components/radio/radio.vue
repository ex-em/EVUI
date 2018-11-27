<template>
  <div>
    <input
      :id="id"
      :name="groupName"
      :label="label"
      :checked="bindValue === id"
      :disabled="disabled"
      type="radio"
      @change="onChange"
    >
    <label
      :for="id"
    >
      {{ label }}
    </label>
  </div>
</template>

<script>
export default {
  props: {
    id: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    groupName: {
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
  created() {
  },
  mounted() {
  },
  methods: {
    onChange(e) {
      if (this.$parent.$options.componentName === 'RadioGroup') {
        // 부모 컴포넌트가 Radio Group인 경우
        this.$parent.$emit('changeEvent', e);
        this.$parent.$emit('input', e.target.id);
      } else {
        // 부모 컴포넌트가 Radio Group로 안감싼경우
        this.$emit('input', e.target.id);
      }
    },
  },
};
</script>

<style scoped>
</style>
