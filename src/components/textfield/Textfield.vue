<template>
  <div
    class="ev-textfield"
    :class="[
      `type-${type}`,
      { 'is-disabled': disabled },
      { 'is-clearable': clearable },
      { 'is-readonly': readonly },
      { 'is-error': errorMsg },
      { 'show-password': showPassword },
    ]"
    :style="{ width: style.width }"
  >
    <div
      class="ev-textfield-wrapper"
      :style="style"
    >
      <template
        v-if="type === 'text' || type === 'password'"
      >
        <input
          v-model="mv"
          class="ev-textfield-input"
          :type="inputType"
          :placeholder="placeholder"
          :disabled="disabled"
          :readonly="readonly"
          :maxlength="maxLength"
          @keyup.enter="onEnter"
          @keyup="onKeyUp"
          @keydown="onKeyDown"
          @focus="onFocus"
          @blur="onBlur"
          @input="onInput"
          @change="onChange"
          @click="onClick"
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
        class="ev-textfield-textarea"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :maxlength="maxLength"
        @keyup.enter="onEnter"
        @keyup="onKeyUp"
        @keydown="onKeyDown"
        @focus="onFocus"
        @blur="onBlur"
        @input="onInput"
        @change="onChange"
        @click="onClick"
      />
    </template>
    </div>
    <div
      class="ev-textfield-sub-text"
      :style="{ width: style.width }"
    >
      <div
        v-if="errorMsg"
        class="ev-textfield-error"
      >
        {{ errorMsg }}
      </div>
      <div
        v-if="maxLength && showMaxLength"
        class="ev-textfield-maxlength"
        :class="{ max: mv && mv.length >= maxLength }"
      >
        <span class="curr-length">{{ mv ? mv.length : 0 }}</span> / {{ maxLength }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, reactive, nextTick } from 'vue';
import { getQuantity, getSize } from '@/common/utils';

export default {
  name: 'EvTextfield',
  props: {
    modelValue: {
      type: [String, Number, Symbol, Boolean],
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
    width: {
      type: [String, Number],
      default: '100%',
    },
    height: {
      type: [String, Number],
      default: '100%',
    },
    errorMsg: {
      type: String,
      default: null,
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
    const style = reactive({
      width: getSize(getQuantity(props.width)),
      height: getSize(getQuantity(props.height)),
    });

    const isPasswordVisible = ref(false);
    const inputType = computed(() => {
      if (props.type === 'password') {
        return isPasswordVisible.value ? 'text' : 'password';
      }
      isPasswordVisible.value = false;
      return props.type;
    });

    const clearValue = () => {
      mv.value = '';
    };
    const changePasswordVisible = () => {
      if (props.type !== 'password') {
        return;
      }
      isPasswordVisible.value = !isPasswordVisible.value;
    };

    const onEnter = async (e) => {
      await nextTick();
      emit('enter', e);
    };
    const onKeyUp = async (e) => {
      await nextTick();
      emit('key-up', e);
    };
    const onKeyDown = async (e) => {
      await nextTick();
      emit('key-down', e);
    };
    const onFocus = async (e) => {
      await nextTick();
      emit('focus', e);
    };
    const onBlur = async (e) => {
      await nextTick();
      emit('blur', e);
    };
    const onInput = async (e) => {
      await nextTick();
      emit('input', mv.value, e);
    };
    const onChange = async (e) => {
      await nextTick();
      emit('change', mv.value, e);
    };
    const onClick = async (e) => {
      await nextTick();
      emit('click', e);
    };

    return {
      mv,
      inputType,
      style,
      isPasswordVisible,
      clearValue,
      changePasswordVisible,
      onEnter,
      onKeyUp,
      onKeyDown,
      onFocus,
      onBlur,
      onInput,
      onChange,
      onClick,
    };
  },
};
</script>

<style lang="scss">
@import '../../style/index.scss';

.ev-textfield {
  position: relative;
  box-sizing: border-box;
  &-wrapper {
    position: relative;
    border-radius: 4px;

    @include evThemify() {
      border: 1px solid evThemed('color-line-base');
    }
  }
  &-input {
    width: 100%;
    height: 100%;
    padding: 0 5px;
    border: 0;
    outline: 0;
    background-color: transparent;
  }
  &-textarea {
    width: 100%;
    height: 100%;
    padding: 5px;
    border: 0;
    outline: 0;
    background-color: transparent;
    resize: none;
  }
  &.is-readonly {
    .ev-textfield-wrapper {
      @include evThemify() {
        background-color: lighten(evThemed('color-disabled'), 25%);
      }
    }
    .ev-textfield-input,
    .ev-textfield-textarea {
      @include evThemify() {
        color: evThemed('color-disabled');
      }
    }
  }
  &.is-disabled {
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
    .ev-textfield-input,
    .ev-textfield-textarea {
      @include evThemify() {
        color: evThemed('color-disabled');
      }
    }
  }
  &.is-clearable,
  &.show-password {
    .ev-textfield-input {
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

      @include evThemify() {
        color: evThemed('color-line-base');
      }
    }
  }
  &.is-clearable {
    .icon-clear {
      font-size: 10px;
      border-radius: 8px;

      @include evThemify() {
        border: 1px solid evThemed('color-line-base');
      }
    }
  }
  &.show-password {
    .icon-password {
      font-size: 15px;
      &:hover,
      &.on {
        @include evThemify() {
          color: evThemed('color-primary');
        }
      }
    }
  }
  &-sub-text {
    display: flex;
    width: 100%;
    flex-wrap: wrap;
    justify-content: space-between;
  }
  &-maxlength {
    flex: 1;
    max-width: 100%;
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
  &.is-error {
    flex: 1;

    @include evThemify() {
      color: evThemed('color-error');
    }
    .ev-textfield-wrapper {
      @include evThemify() {
        border: 1px solid evThemed('color-error');
      }
    }
    .ev-textfield-error {
      padding: 5px 0 3px;
      font-size: 12px;
      word-break: break-all;
    }
  }
}
</style>
