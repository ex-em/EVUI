<template>
  <div>
    <label
      :for="id"
    >
      <input
        :id="id"
        :value="value"
        :name="groupName"
        :checked="value === bindValue"
        :disabled="disabled"
        type="radio"
        class="ev-radio-input"
        @change="onChange"
      >
      <slot/>
    </label>
  </div>
</template>

<script>
export default {
  model: {
    prop: 'customVModel',
  },
  props: {
    id: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
    customVModel: {
      type: String,
      default: '',
    },
    groupName: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      bindValue: this.customVModel,
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
        this.$parent.$emit('input', e.target.value);
      }
//      else {
//        // 부모 컴포넌트가 Radio Group로 안감싼경우
//        this.$emit('input', e.target.value);
//      }
    },
  },
};
</script>

<style scoped>
  .ev-radio-label {
    display: block;
  }
  .ev-radio-input {
    vertical-align: middle;
  }
</style>
