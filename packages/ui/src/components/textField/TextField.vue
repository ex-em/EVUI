<template>
  <div
    class="ev-text-field"
    :class="{
      disabled,
      clearable,
      readonly,
      error: !!errorMsg,
      'show-password': props.showPassword,
      'show-maxlength': props.showMaxLength,
      [`type-${props.type}`]: !!props.type,
      'ev-text-field-prefix': $slots['icon-prefix'],
      'ev-text-field-suffix': $slots['icon-suffix'],
      'ev-text-field-prefix-suffix':
        $slots['icon-prefix'] && $slots['icon-suffix'],
    }"
  >
    <div class="ev-text-field-wrapper">
      <template v-if="type === 'textarea'">
        <textarea
          v-model="mv"
          class="ev-textarea"
          :placeholder="props.placeholder"
          :disabled="props.disabled"
          :readonly="props.readonly"
          :maxlength="props.maxLength"
          @focus="focusInput"
          @blur="blurInput"
          @input="inputMv"
          @change="changeMv"
        />
      </template>
      <template v-else>
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
          :class="{ on: isPasswordVisible }"
          @click="changePasswordVisible"
        >
          <i
            :class="
              isPasswordVisible
                ? 'ev-icon-visibility'
                : 'ev-icon-visibility-off'
            "
          />
        </span>
        <span
          v-if="type === 'search'"
          class="ev-text-field-icon icon-search"
          @click="searchValue"
        >
          <i class="ev-icon-search" />
        </span>
        <span
          v-if="$slots['icon-suffix']"
          class="ev-text-field-icon icon-suffix"
        >
          <slot name="icon-suffix" />
        </span>
        <span
          v-if="$slots['icon-prefix']"
          class="ev-text-field-icon icon-prefix"
        >
          <slot name="icon-prefix" />
        </span>
      </template>
    </div>
    <div v-if="errorMsg" class="ev-text-field-error">
      {{ errorMsg }}
    </div>
    <div
      v-if="maxLength && showMaxLength"
      class="ev-text-field-maxlength"
      :class="{ max: mv?.length > maxLength }"
    >
      <span class="curr-length">{{ mv ? mv.length : 0 }}</span> /
      {{ maxLength }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';

defineOptions({
  name: 'EvTextField',
});

interface Props {
  modelValue: string;
  type?: 'text' | 'password' | 'search' | 'textarea';
  clearable?: boolean;
  showPassword?: boolean;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  maxLength?: number;
  showMaxLength?: boolean;
  errorMsg?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
});

interface Emits {
  (event: 'update:modelValue', val: string): void;
  (event: 'focus', e: FocusEvent): void;
  (event: 'blur', e: FocusEvent): void;
  (event: 'input', val: string, e: Event): void;
  (event: 'change', val: string, e: Event): void;
  (event: 'search', val: string): void;
}
const emit = defineEmits<Emits>();

const mv = computed<string>({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const isPasswordVisible = ref(false);
const changePasswordVisible = () => {
  if (props.type === 'password') {
    isPasswordVisible.value = !isPasswordVisible.value;
  }
};

const inputType = computed(() => {
  if (props.type === 'password') {
    return isPasswordVisible.value ? 'text' : 'password';
  }
  isPasswordVisible.value = false;
  return props.type === 'search' ? 'text' : props.type;
});

const clearValue = () => {
  mv.value = '';
};

const searchValue = () => {
  emit('search', mv.value);
};
const keyupInput = (e: KeyboardEvent) => {
  if (props.type === 'search' && (e.key === 'Enter' || e.keyCode === 13)) {
    searchValue();
  }
};

const focusInput = (e: FocusEvent) => {
  emit('focus', e);
};
const blurInput = (e: FocusEvent) => {
  emit('blur', e);
};
const inputMv = (e: Event) => {
  const inputValue = (e.target as HTMLInputElement).value;
  if (mv.value !== inputValue) {
    mv.value = inputValue;
  }
  nextTick(() => {
    emit('input', mv.value, e);
  });
};
const changeMv = (e: Event) => {
  emit('change', mv.value, e);
};
</script>

<style lang="scss">
@use 'sass:math';
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
    right: math.div($icon-width, 2);
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
@include state('ev-text-field-suffix') {
  .ev-input {
    padding: 0 #{$input-default-padding + $icon-width} 0 $input-default-padding;
  }
  .icon-suffix {
    font-size: 15px;
    cursor: default;
  }
}
@include state('ev-text-field-prefix') {
  .ev-input {
    padding: 0 $input-default-padding 0 #{$input-default-padding + $icon-width};
  }
  .icon-prefix {
    left: 7px;
    font-size: 15px;
    cursor: default;
  }
}
@include state('ev-text-field-prefix-suffix') {
  .ev-input {
    padding: 0 #{$input-default-padding + $icon-width};
  }
}
</style>
