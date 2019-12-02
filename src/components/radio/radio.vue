<template>
  <div
    :class="[{ disabled: disabled }, dataSize, type]"
    :style="{ width: buttonSize }"
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
      :class="[dataSize, type]"
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
    buttonSize: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      bindValue: this.customValue,
      radioId: this._uid,
      dataSize: this.size,
      type: this.$parent.type,
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
        this.$parent.$emit('on-change', e);
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
    /*height: 19px;*/
    float: left;
    user-select: none;
  }
  .ev-radio-wrap.small{
    height: 16px;
  }
  .ev-radio-wrap.disabled {
    color: #C0C4CC;
  }
  .ev-radio-wrap.button {
    font-size: 12px;
    height: 100%;
  }
  .ev-radio-label:not(.button) {
    position: relative;
    display: inline-block;
    padding-left: 25px;
    line-height: 19px;
    cursor: pointer;
    margin-right: 10px;
  }
  .ev-radio-label.button {
    display: flex;
    flex-direction: row;
    color: #495060;
    background-color: transparent;
    border: solid 1px #dddee1;
    border-radius: 4px;
    justify-content: center;
    cursor: pointer;
    line-height: 19px;
    padding: 5px;
    margin-right: 10px;
  }
  .ev-radio-label.button:hover {
    color: #57a3f3;
    background-color: transparent;
    border-color: #57a3f3
  }
  .ev-radio-label.small {
    padding-left: 20px;
    line-height: 16px;
  }
  .ev-radio-label:not(.button):before {
    position: absolute;
    top: 50%;
    left: 2px;
    width: 16px;
    height: 16px;
    background: transparent;
    border: 1px solid #B0B3B7;
    border-radius: 100%;
    text-align: center;
    transform: translateY(-50%);
    content: '';
  }
  .ev-radio-label:not(.button).small:before {
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
  .ev-radio-input:checked + .ev-radio-label:not(.button):before {
    border: 1px solid #41B7FD;
  }
  .ev-radio-wrap.disabled .ev-radio-input:checked + .ev-radio-label:before {
    border: 1px solid #B01012;
  }
  .ev-radio-input:checked + .ev-radio-label:not(.button):after {
     position: absolute;
     top: 50%;
     left: 7px;
     width: 8px;
     height: 8px;
     border-radius: 100%;
     transform: translateY(-50%);
     content: '';
   }
  .ev-radio-input:checked + .ev-radio-label.button {
    color:#fff;
    background-color:#2d8cf0;
    border-color:#2d8cf0;
  }
  .ev-radio-input:checked + .ev-radio-label.small:after {
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
