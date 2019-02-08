<template>
  <div
    :class="[{ disabled: disabled }, dataSize]"
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
      :class="dataSize"
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
    size: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      bindValue: this.customValue,
      radioId: this._uid,
      dataSize: this.size,
    };
  },
  computed: {
    bindSize: {
      get() {
        return this.size;
      },
      set(size) {
        this.dataSize = size;
      },
    },
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
    height: 19px;
    float: left;
    user-select: none;
  }
  .ev-radio-wrap.small{
    height: 15px;
  }
  .ev-radio-wrap.disabled {
    color: #C0C4CC;
  }
  .ev-radio-label {
    position: relative;
    display: inline-block;
    padding-left: 25px;
    line-height: 19px;
    cursor: pointer;
  }
  .ev-radio-label.small {
    padding-left: 20px;
    line-height: 16px;
  }
  .ev-radio-label:before {
    position: absolute;
    top: 1px;
    left: 2px;
    width: 15px;
    height: 15px;
    background: transparent;
    border: 1px solid #B0B3B7;
    border-radius: 100%;
    text-align: center;
    content: '';
  }
  .ev-radio-label.small:before {
    width: 12px;
    height: 12px;
  }
  .ev-radio-wrap.disabled .ev-radio-label {
    cursor: not-allowed;
  }
  .ev-radio-wrap.disabled .ev-radio-label:before {
    border: 1px solid #B01012;
  }
  .ev-radio-input {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    border: 0;
    vertical-align: middle;
    overflow: hidden;
    cursor: inherit;
    clip: rect(0, 0, 0, 0);
  }
  .ev-radio-input:checked + .ev-radio-label:before {
    border: 1px solid #41B7FD;
  }
  .ev-radio-wrap.disabled .ev-radio-input:checked + .ev-radio-label:before {
    border: 1px solid #B01012;
  }
  .ev-radio-input:checked + .ev-radio-label:after {
    position: absolute;
    top: 5px;
    left: 6px;
    width: 9px;
    height: 9px;
    border-radius: 100%;
    content: '';
  }
  .ev-radio-input:checked + .ev-radio-label.small:after {
    top: 5px;
    left: 6px;
    width: 6px;
    height: 6px;
  }
  .ev-radio-input:checked + .ev-radio-label:after {
    background: #41B7FD;
  }
  .ev-radio-wrap.disabled .ev-radio-input:checked + .ev-radio-label:after {
    background: #B01012;
  }
</style>
