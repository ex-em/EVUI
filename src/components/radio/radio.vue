<template>
  <div
    :class="{ disabled: disabled }"
    class="ev-radio-wrap"
  >
    <input
      :id="`${radioId}_${value}`"
      :value="value"
      :name="groupName"
      :disabled="disabled"
      v-model="bindValue"
      type="radio"
      class="ev-radio-input"
      @change="onChange"
    >
    <label
      :for="`${radioId}_${value}`"
      class="ev-radio-label"
    >
      <slot/>
    </label>
  </div>
</template>

<script>
export default {
  model: {
    prop: 'customValue',
  },
  props: {
    value: {
      type: String,
      required: true,
    },
    customValue: {
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
      bindValue: this.customValue,
      radioId: this._uid,
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
  .ev-radio-wrap {
    float: left;
    user-select: none;
    cursor: pointer;
  }
  .ev-radio-wrap.disabled {
    cursor: not-allowed;
  }
  .ev-radio-label {
    cursor: pointer;
  }
  .disabled > .ev-radio-label {
    color: #C0C4CC;
    cursor: not-allowed;
  }
  .ev-radio-input {
    vertical-align: middle;
    cursor: pointer;
  }
  .disabled > .ev-radio-input {
    cursor: not-allowed;
  }
</style>
