<template>
  <div
    class="ev-text-field"
    :class="{
      disabled,
      clearable,
      readonly,
      error: !!errorMsg,
      'show-password': showPassword,
      'show-maxlength': showMaxLength,
      [`type-${type}`]: !!type,
    }"
  >
    <div
      class="ev-text-field-wrapper"
    >
      <template
        v-if="type === 'textarea'"
      >
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
      <template v-else >
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
          @keyup="keyupInput"
        />
        <span
          v-if="type === 'text' && clearable"
          class="ev-text-field-icon icon-clear"
          @click="clearValue"
        >
          <i class="ev-icon-error" />
        </span>
        <span
          v-if="type === 'password' && showPassword"
          class="ev-text-field-icon icon-password"
          :class="{ 'on': isPasswordVisible }"
          @click="changePasswordVisible"
        >
          <i class="ev-icon-radio-on"/>
        </span>
        <span
          v-if="type === 'search'"
          class="ev-text-field-icon icon-search"
          @click="searchValue"
        >
          <i class="ev-icon-search"/>
        </span>
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
    'search',
  ],
  setup(props, { emit }) {
    const mv = computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val),
    });

    // password visible on/off
    const isPasswordVisible = ref(false);
    const changePasswordVisible = () => {
      if (props.type === 'password') {
        isPasswordVisible.value = !isPasswordVisible.value;
      }
    };

    // input type setting
    const inputType = computed(() => {
      if (props.type === 'password') {
        return isPasswordVisible.value ? 'text' : 'password';
      }
      isPasswordVisible.value = false;
      return props.type === 'search' ? 'text' : props.type;
    });

    // clear input value
    const clearValue = () => { mv.value = ''; };

    // search input
    const searchValue = () => {
      if (mv.value && mv.value.trim()) {
        emit('search', mv.value);
      }
    };
    const keyupInput = (e) => {
      if (props.type === 'search'
        && (e.key === 'Enter' || e.keyCode === 13)
      ) {
        searchValue();
      }
    };

    // input event
    const focusInput = (e) => {
      emit('focus', e);
    };
    const blurInput = (e) => {
      emit('blur', e);
    };
    const inputMv = (e) => {
      const inputValue = e.target.value;
      if (mv.value !== inputValue) {
        mv.value = inputValue;
        emit('input', mv.value, e);
      }
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
      searchValue,
      keyupInput,
      focusInput,
      blurInput,
      inputMv,
      changeMv,
    };
  },
};
</script>

<style lang="scss">
$icon-width: 14px !default;

@import '../../style/index.scss';

.ev-text-field {
  position: relative;
  box-sizing: border-box;

  @include clearfix();

  @import '../../style/components/input.scss';
  &:hover {
    .ev-input,
    .ev-textarea {
      @include evThemify() {
        border: 1px solid evThemed('primary');
      }
    }
  }
  &-wrapper {
    position: relative;
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

    @include evThemify() {
      color: evThemed('border-base');
    }
  }
}

@include state('clearable') {
  .ev-input {
    padding: 0 #{$input-default-padding + $icon-width} 0 $input-default-padding;
  }
  .ev-text-field-icon {
    font-size: 15px;
    &:hover {
      @include evThemify() {
        color: evThemed('primary');
      }
    }
  }
}
@include state('show-password') {
  .ev-input {
    padding: 0 #{$input-default-padding + $icon-width} 0 $input-default-padding;
  }
  .ev-text-field-icon {
    font-size: 15px;
    &:hover,
    &.on {
      @include evThemify() {
        color: evThemed('primary');
      }
    }
  }
}
@include state('type-search') {
  .ev-input {
    padding: 0 #{$input-default-padding + $icon-width} 0 $input-default-padding;
  }
  .ev-text-field-icon {
    font-size: 15px;
    &:hover {
      @include evThemify() {
        color: evThemed('primary');
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
      color: evThemed('border-base');
    }
    .curr-length {
      @include evThemify() {
        color: darken(evThemed('border-base'), 10%);
      }
    }
    &.max,
    &.max * {
      @include evThemify() {
        color: evThemed('error') !important;
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
      color: evThemed('error');
    }
  }
}
</style>
