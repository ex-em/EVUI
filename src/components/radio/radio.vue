<template>
  <div>
    <input
      :id="id"
      :value="value"
      :name="groupName"
      :disabled="disabled"
      v-model="bindValue"
      type="radio"
      class="ev-radio-input"
      @change="onChange"
    >
    <label
      :for="id"
      class="ev-radio-label"
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
    user-select: none;
    vertical-align: middle;
  }
  .ev-radio-input {
    vertical-align: middle;
  }
</style>
