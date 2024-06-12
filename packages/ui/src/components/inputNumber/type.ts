import type { Ref } from 'vue';

export type ModelValue = string | number | null;

export interface Props {
  modelValue: ModelValue;
  placeholder: string;
  disabled: boolean;
  readonly: boolean;
  max: number;
  min: number;
  step: number;
  stepStrictly: boolean;
  precision: number;
}

export interface Emits {
  (event: 'update:modelValue', val: ModelValue): void;
  (event: 'focus', e: FocusEvent): void;
  (event: 'blur', e: FocusEvent): void;
  (event: 'input', e: InputEvent): void;
  (event: 'change', e: ModelValue): void;
}

export type HandleType = 'up' | 'down';

export interface ValueParam {
  currentValue: Ref<ModelValue>;
  validateValue: (val: ModelValue) => void;
}
