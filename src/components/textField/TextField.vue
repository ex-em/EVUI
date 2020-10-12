<template>
  <div
    class="ev-text-field"
    :class="[
      `type-${type}`,
      {
        disabled,
        clearable,
        readonly,
        error: errorMsg,
        'show-password': showPassword,
        'show-maxlength': showMaxLength,
      },
    ]"
  >
    <div
      class="ev-text-field-wrapper"
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
          class="ev-text-field-icon icon-clear"
          @click="clearValue"
        >
          <i class="ev-icon-close" />
        </span>
        <span
          v-if="type === 'password' && showPassword"
          class="ev-text-field-icon icon-password"
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
      class="ev-text-field-error"
    >
      {{ errorMsg }}
    </div>
    <div
      v-if="maxLength && showMaxLength"
      class="ev-text-field-maxlength"
      :class="{ max: mv?.length > maxLength }"
    >
      <span class="curr-length">{{ mv ? mv.length : 0 }}</span> / {{ maxLength }}
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';

export default {
  name: 'EvTextField',
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
    'focus',
    'blur',
    'input',
    'change',
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
      if (props.type === 'password') {
        isPasswordVisible.value = !isPasswordVisible.value;
      }
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

.ev-text-field {
  position: relative;
  box-sizing: border-box;

  @include clearfix();

  @import '../../style/components/input.scss';
  &-wrapper {
    position: relative;
  }
}

@include state('clearable') {
  $icon-width: 14px;
  .ev-input {
    padding: 0 #{$input-default-padding + $icon-width} 0 $input-default-padding;
  }
  .ev-text-field-icon {
    display: flex;
    position: absolute;
    top: 50%;
    right: #{$icon-width / 2};
    width: $icon-width;
    height: $icon-width;
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
  $icon-width: 14px;
  .ev-input {
    padding: 0 #{$input-default-padding + $icon-width} 0 $input-default-padding;
  }
  .ev-text-field-icon {
    display: flex;
    position: absolute;
    top: 50%;
    right: #{$icon-width / 2};
    width: $icon-width;
    height: $icon-width;
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
  .ev-text-field-maxlength {
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
  .ev-text-field-error {
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
