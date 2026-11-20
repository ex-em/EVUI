import { h } from 'vue';
import {
  EvButtonGroup,
  EvCheckbox,
  EvCheckboxGroup,
  EvInputNumber,
  EvRadio,
  EvRadioGroup,
  EvSelect,
  EvSlider,
  EvTextField,
  type EvSelectItem,
  type EvSliderMark,
} from 'evui';

type Props<T extends abstract new () => { $props: object }> = InstanceType<T>['$props'];

const buttonGroup: Props<typeof EvButtonGroup> = { class: 'actions' };
const checkbox: Props<typeof EvCheckbox> = {
  modelValue: true,
  label: { id: 1 },
  'onUpdate:indeterminate': (value) => {
    const indeterminate: boolean = value;
    return indeterminate;
  },
  onChange: (value, event) => {
    if (typeof value === 'string') value.toUpperCase();
    event.preventDefault();
  },
};
const checkboxGroup: Props<typeof EvCheckboxGroup> = {
  modelValue: ['alpha', { id: 1 }],
  type: 'button',
  onChange: (values, event) => {
    values.forEach((value) => {
      if (typeof value === 'string') value.toUpperCase();
    });
    event.preventDefault();
  },
};

const symbol = Symbol('selected');
const radio: Props<typeof EvRadio> = { label: symbol, size: 's', modelValue: null };
const radioGroup: Props<typeof EvRadioGroup> = {
  modelValue: symbol,
  type: 'radio',
  onChange: (value, event) => {
    if (typeof value === 'symbol') value.toString();
    event.preventDefault();
  },
};

const selectValue = { id: 1 };
const selectItem: EvSelectItem<{ id: number }> = { name: 'One', value: selectValue };
const select: Props<typeof EvSelect> = {
  items: [selectItem],
  modelValue: [selectValue],
  multiple: true,
  highlight: { match: true, color: '#409eff' },
  tagMaxRows: 3,
  onChange: (value) => {
    if (typeof value === 'string') value.toUpperCase();
    // @ts-expect-error the selected value is not always a number
    const singleNumber: number = value;
    void singleNumber;
  },
};

const textField: Props<typeof EvTextField> = {
  type: 'textarea',
  maxUnit: 'byte',
  modelValue: 123,
  modelModifiers: { trim: true },
  onInput: (value, event) => {
    value.toUpperCase();
    event.preventDefault();
  },
  onFocus: (event) => {
    const focus: FocusEvent = event;
    void focus.relatedTarget;
  },
};
const inputNumber: Props<typeof EvInputNumber> = {
  modelValue: '1.5',
  clampOnStep: true,
  onChange: (value) => {
    if (typeof value === 'number') value.toFixed(2);
    // @ts-expect-error an input can be cleared and emit null
    const nonNullableValue: string | number = value;
    void nonNullableValue;
  },
};

const range = [10, 80];
const mark: EvSliderMark = {
  value: { 10: 'Low' },
  percent: { 50: 'Half' },
  style: { color: 'red' },
};
const slider: Props<typeof EvSlider> = {
  range: true,
  modelValue: range,
  color: ['#409eff', '#aaa'],
  mark,
  tooltipFormat: (value) => value?.toFixed(1) ?? '',
  onChange: (value) => {
    if (Array.isArray(value)) {
      const [start, end]: [number, number] = value;
      void [start, end];
    }
  },
};

h(EvButtonGroup, buttonGroup);
h(EvCheckbox, checkbox);
h(EvCheckboxGroup, checkboxGroup);
h(EvRadio, radio);
h(EvRadioGroup, radioGroup);
h(EvSelect, select);
h(EvTextField, textField);
h(EvInputNumber, inputNumber);
h(EvSlider, slider);

// @ts-expect-error ButtonGroup only wraps its slot contents
const invalidButtonGroup: Props<typeof EvButtonGroup> = { modelValue: 'one' };
// @ts-expect-error indeterminate is a boolean model
const invalidCheckbox: Props<typeof EvCheckbox> = { indeterminate: 'partial' };
// @ts-expect-error CheckboxGroup stores an array of selected labels
const invalidCheckboxGroup: Props<typeof EvCheckboxGroup> = { modelValue: false };
// @ts-expect-error Radio labels must be primitives
const invalidRadio: Props<typeof EvRadio> = { label: { id: 1 } };
// @ts-expect-error RadioGroup stores a single selected value
const invalidRadioGroup: Props<typeof EvRadioGroup> = { modelValue: ['one'] };
// @ts-expect-error select options require a display name
const invalidSelect: Props<typeof EvSelect> = { items: [{ value: 'one' }] };
// @ts-expect-error match requires a boolean
const invalidHighlight: Props<typeof EvSelect> = { highlight: { match: 'on' } };
// @ts-expect-error TextField change takes the model value before the event
const invalidTextField: Props<typeof EvTextField> = { onChange: (event: Event) => void event };
// @ts-expect-error InputNumber does not accept a boolean model
const invalidInputNumber: Props<typeof EvInputNumber> = { modelValue: true };
// @ts-expect-error range endpoints must be numeric
const invalidSlider: Props<typeof EvSlider> = { range: true, modelValue: ['10', '80'] };

declare const selectInstance: InstanceType<typeof EvSelect>;
selectInstance.$emit('change', null);
// @ts-expect-error change emits a model value, not a symbol
selectInstance.$emit('change', Symbol('invalid'));
