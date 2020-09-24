<template>
  <div
    class="ev-textfield"
    :class="[
      `type-${type}`,
      { 'disabled': disabled },
      { 'clearable': clearable },
      { 'readonly': readonly },
      { 'error': errorMsg },
      { 'show-password': showPassword },
      { 'show-maxlength': showMaxLength },
    ]"
  >
    <div
      class="ev-textfield-wrapper"
    >
      <template
        v-if="type === 'text' || type === 'password'"
      >
        <input
          v-model="mv"
          class="ev-input"
          :type="inputType"
          :placeholder="placeholder"
          :disabled="disabled"
          :readonly="readonly"
          :maxlength="maxLength"
          @focus="focusInput"
          @blur="blurInput"
          @input="inputMv"
          @change="changeMv"
        />
        <span
          v-if="type === 'text' && clearable"
          class="ev-textfield-icon icon-clear"
          @click="clearValue"
        >
          <i class="ev-icon-close" />
        </span>
        <span
          v-if="type === 'password' && showPassword"
          class="ev-textfield-icon icon-password"
          :class="{ 'on': isPasswordVisible }"
          @click="changePasswordVisible"
        >
          <i class="ev-icon-radio-on"/>
        </span>
      </template>
      <template v-else>
        <textarea
          v-model="mv"
          class="ev-textarea"
          :placeholder="placeholder"
          :disabled="disabled"
          :readonly="readonly"
          :maxlength="maxLength"
          @focus="focusInput"
          @blur="blurInput"
          @input="inputMv"
          @change="changeMv"
        />
      </template>
    </div>
    <div
      v-if="errorMsg"
      class="ev-textfield-error"
    >
      {{ errorMsg }}
    </div>
    <div
      v-if="maxLength && showMaxLength"
      class="ev-textfield-maxlength"
      :class="{ max: mv?.length > maxLength }"
    >
      <span class="curr-length">{{ mv ? mv.length : 0 }}</span> / {{ maxLength }}
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';

export default {
  name: 'EvTextfield',
  props: {
    modelValue: {
      type: [String, Number],
      default: null,
    },
    type: {
      type: String,
      default: 'text',
    },
    placeholder: {
      type: String,
      default: '',
    },
    clearable: {
      type: Boolean,
      default: false,
    },
    showPassword: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    maxLength: {
      type: Number,
      default: null,
    },
    showMaxLength: {
      type: Boolean,
      default: false,
    },
    errorMsg: {
      type: String,
      default: '',
    },
  },
  emits: [
    'update:modelValue',
    'enter',
    'key-up',
    'key-down',
    'focus',
    'blur',
    'input',
    'change',
    'click',
  ],
  setup(props, { emit }) {
    const mv = computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val),
    });

    const isPasswordVisible = ref(false);
    const inputType = computed(() => {
      if (props.type === 'password') {
        return isPasswordVisible.value ? 'text' : 'password';
      }
      isPasswordVisible.value = false;
      return props.type;
    });
    const changePasswordVisible = () => {
      if (props.type !== 'password') {
        return;
      }
      isPasswordVisible.value = !isPasswordVisible.value;
    };

    const clearValue = () => { mv.value = ''; };

    const checkMvValue = (inputValue) => {
      if (mv.value !== inputValue) {
        mv.value = inputValue;
      }
    };

    const focusInput = (e) => {
      emit('focus', e);
    };
    const blurInput = (e) => {
      emit('blur', e);
    };
    const inputMv = (e) => {
      checkMvValue(e.target.value);
      emit('input', mv.value, e);
    };
    const changeMv = (e) => {
      emit('change', mv.value, e);
    };

    return {
      mv,
      inputType,
      isPasswordVisible,
      clearValue,
      changePasswordVisible,
      focusInput,
      blurInput,
      inputMv,
      changeMv,
    };
  },
};
</script>

<style lang="scss">
@import '../../style/index.scss';

.ev-textfield {
  position: relative;
  box-sizing: border-box;

  @include clearfix();
  &-wrapper {
    position: relative;
    border-radius: 4px;

    @include evThemify() {
      border: 1px solid evThemed('color-line-base');
    }
  }
  .ev-input {
    width: 100%;
    height: $input-default-height;
    padding: 0 5px;
    border: 0;
    outline: 0;
    background-color: transparent;
  }
  .ev-textarea {
    width: 100%;
    height: $textarea-default-height;
    padding: 5px;
    border: 0;
    outline: 0;
    background-color: transparent;
    resize: none;
  }
}

@include state('readonly') {
  .ev-textfield-wrapper {
    @include evThemify() {
      background-color: lighten(evThemed('color-disabled'), 25%);
    }
  }
}
@include state('disabled') {
  &, * {
    cursor: not-allowed !important;
  }
  .ev-textfield-wrapper {
    @include evThemify() {
      border: 1px solid evThemed('color-disabled');
      background-color: lighten(evThemed('color-disabled'), 25%);
      color: evThemed('color-disabled');
    }
  }
  .ev-input,
  .ev-textarea {
    @include evThemify() {
      color: evThemed('color-disabled');
    }
  }
}
@include state('clearable') {
  .ev-input {
    padding: 0 23px 0 5px;
  }
  .ev-textfield-icon {
    display: flex;
    position: absolute;
    top: 50%;
    right: 3px;
    width: 14px;
    height: 14px;
    cursor: pointer;
    justify-content: center;
    align-items: center;
    z-index: 5;
    transform: translateY(-50%);
    box-sizing: border-box;
    font-size: 10px;
    border-radius: 8px;

    @include evThemify() {
      border: 1px solid evThemed('color-line-base');
      color: evThemed('color-line-base');
    }
  }
}
@include state('show-password') {
  .ev-input {
    padding: 0 23px 0 5px;
  }
  .ev-textfield-icon {
    display: flex;
    position: absolute;
    top: 50%;
    right: 3px;
    width: 14px;
    height: 14px;
    cursor: pointer;
    justify-content: center;
    align-items: center;
    z-index: 5;
    transform: translateY(-50%);
    box-sizing: border-box;
    font-size: 15px;

    @include evThemify() {
      color: evThemed('color-line-base');
    }
    &:hover,
    &.on {
      @include evThemify() {
        color: evThemed('color-primary');
      }
    }
  }
}
@include state('show-maxlength') {
  .ev-textfield-maxlength {
    float: right;
    padding: 5px 0 3px;
    text-align: right;
    font-size: 12px;

    @include evThemify() {
      color: evThemed('color-line-base');
    }
    .curr-length {
      @include evThemify() {
        color: darken(evThemed('color-line-base'), 10%);
      }
    }
    &.max,
    &.max * {
      @include evThemify() {
        color: evThemed('color-error') !important;
      }
    }
  }
}
@include state('error') {
  .ev-textfield-wrapper {
    @include evThemify() {
      border: 1px solid evThemed('color-error');
    }
  }
  .ev-textfield-error {
    float: left;
    padding: 5px 0 3px;
    font-size: 12px;
    word-break: break-all;

    @include evThemify() {
      color: evThemed('color-error');
    }
  }
}
</style>
