import type { CSSProperties, InputTypeHTMLAttribute } from 'vue';
import type { EvComponent } from './component.js';

export type EvButtonGroupProps = Record<never, never>;
export type EvButtonGroupEvents = Record<never, never>;

export declare const EvButtonGroup: EvComponent<EvButtonGroupProps, EvButtonGroupEvents>;

export type EvRadioValue = string | number | boolean | symbol | null;
export type EvCheckboxLabel = EvRadioValue | object;
export type EvCheckboxValue = EvRadioValue | unknown[];

export interface EvCheckboxProps {
  modelValue?: EvCheckboxValue;
  label?: EvCheckboxLabel;
  tooltipTitle?: string;
  disabled?: boolean;
  readonly?: boolean;
  indeterminate?: boolean;
}

export type EvCheckboxEvents = {
  'update:modelValue': (value: boolean | unknown[]) => void;
  'update:indeterminate': (value: boolean) => void;
  change: (value: EvCheckboxValue, event: Event) => void;
};

export declare const EvCheckbox: EvComponent<EvCheckboxProps, EvCheckboxEvents>;

export interface EvCheckboxGroupProps {
  modelValue?: unknown[];
  type?: 'checkbox' | 'button';
}

export type EvCheckboxGroupEvents = {
  'update:modelValue': (values: unknown[]) => void;
  change: (values: unknown[], event: Event) => void;
};

export declare const EvCheckboxGroup: EvComponent<EvCheckboxGroupProps, EvCheckboxGroupEvents>;

export interface EvRadioProps {
  modelValue?: EvRadioValue;
  label?: EvRadioValue;
  disabled?: boolean;
  size?: '' | 's' | 'm';
}

export type EvRadioEvents = {
  'update:modelValue': (value: EvRadioValue) => void;
  change: (value: EvRadioValue, event: Event) => void;
};

export declare const EvRadio: EvComponent<EvRadioProps, EvRadioEvents>;

export interface EvRadioGroupProps {
  modelValue?: EvRadioValue;
  type?: 'radio' | 'button';
}

export type EvRadioGroupEvents = {
  'update:modelValue': (value: EvRadioValue) => void;
  change: (value: EvRadioValue, event: Event) => void;
};

export declare const EvRadioGroup: EvComponent<EvRadioGroupProps, EvRadioGroupEvents>;

export type EvSelectOptionValue = boolean | string | number | object | null;
export type EvSelectValue = EvSelectOptionValue | EvSelectOptionValue[];

export interface EvSelectItem<Value extends EvSelectOptionValue = EvSelectOptionValue> {
  name: string;
  value: Value;
  disabled?: boolean;
  iconClass?: string;
}

export interface EvSelectHighlight {
  match?: boolean;
  color?: string;
}

export interface EvSelectProps {
  modelValue?: EvSelectValue;
  placeholder?: string;
  searchPlaceholder?: string;
  noMatchingText?: string;
  items?: readonly EvSelectItem[];
  disabled?: boolean;
  clearable?: boolean;
  multiple?: boolean;
  checkable?: boolean;
  collapseTags?: boolean;
  filterable?: boolean;
  filterText?: string;
  allCheckLabel?: string;
  teleport?: string;
  tagMaxRows?: number;
  highlight?: EvSelectHighlight | null;
}

export type EvSelectEvents = {
  'update:modelValue': (value: EvSelectValue) => void;
  change: (value: EvSelectValue) => void;
};

export declare const EvSelect: EvComponent<EvSelectProps, EvSelectEvents>;

export type EvTextFieldValue = string | number | null;
export type EvTextFieldType = InputTypeHTMLAttribute | 'textarea';

export interface EvTextFieldProps {
  modelValue?: EvTextFieldValue;
  type?: EvTextFieldType;
  placeholder?: string;
  clearable?: boolean;
  showPassword?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  maxLength?: number | null;
  maxUnit?: 'count' | 'byte';
  showMaxLength?: boolean;
  errorMsg?: string;
  autocomplete?: string;
  modelModifiers?: Record<string, boolean>;
}

export type EvTextFieldEvents = {
  'update:modelValue': (value: string | number) => void;
  focus: (event: FocusEvent) => void;
  blur: (event: FocusEvent) => void;
  input: (value: string, event: Event) => void;
  change: (value: EvTextFieldValue, event: Event) => void;
  search: (value: EvTextFieldValue) => void;
};

export declare const EvTextField: EvComponent<EvTextFieldProps, EvTextFieldEvents>;

export type EvInputNumberValue = string | number | null;

export interface EvInputNumberProps {
  modelValue?: EvInputNumberValue;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  max?: number;
  min?: number;
  step?: number;
  stepStrictly?: boolean;
  precision?: number;
  trimTrailingZero?: boolean;
  disableEmpty?: boolean;
  clampOnStep?: boolean;
}

export type EvInputNumberEvents = {
  'update:modelValue': (value: EvInputNumberValue) => void;
  focus: (event: FocusEvent) => void;
  blur: (event: FocusEvent) => void;
  /** Declared by the component but currently unused. */
  input: () => void;
  change: (value: EvInputNumberValue) => void;
};

export declare const EvInputNumber: EvComponent<EvInputNumberProps, EvInputNumberEvents>;

export type EvSliderRange = [min: number, max: number];
export type EvSliderValue = number | EvSliderRange;
export type EvSliderMarkLabels = Record<number, string | number>;

export interface EvSliderMarkOptions {
  value?: EvSliderMarkLabels;
  percent?: EvSliderMarkLabels;
  style?: CSSProperties;
}

export type EvSliderMark = EvSliderMarkLabels & EvSliderMarkOptions;

export interface EvSliderProps {
  modelValue?: number | number[] | null;
  readonly?: boolean;
  disabled?: boolean;
  range?: boolean;
  max?: number;
  min?: number;
  step?: number;
  mark?: EvSliderMark | null;
  showStep?: boolean;
  showTooltip?: boolean;
  showInput?: boolean;
  color?: string | readonly string[] | null;
  tooltipFormat?: ((value: number | null) => string | number | null | undefined) | null;
}

export type EvSliderEvents = {
  'update:modelValue': (value: EvSliderValue) => void;
  change: (value: EvSliderValue) => void;
};

export declare const EvSlider: EvComponent<EvSliderProps, EvSliderEvents>;
