import type { EvComponent } from './component.js';

export type EvCalendarMode = 'date' | 'dateTime' | 'dateMulti' | 'dateRange' | 'dateTimeRange';
export type EvCalendarValue = string | string[];
export type EvDatePickerValue = EvCalendarValue | null;
export type EvDisabledDate = (date: Date) => boolean | void;

export interface EvCalendarOptions {
  multiType?: 'weekday' | 'week' | 'date';
  multiDayLimit?: number;
  disabledDate?: EvDisabledDate | readonly (EvDisabledDate | null | undefined)[];
  timeFormat?: string | readonly (string | null | undefined)[];
  limit?: number;
}

interface CalendarPresentationProps {
  mode?: EvCalendarMode;
  monthNotation?: 'fullName' | 'abbrName' | 'numberName' | 'korName';
  dayOfTheWeekNotation?: 'abbrUpperName' | 'abbrLowerName' | 'abbrPascalName' | 'abbrKorName';
}

export interface EvCalendarProps extends CalendarPresentationProps {
  modelValue?: EvCalendarValue | null;
  options?: EvCalendarOptions;
}

export type EvCalendarEvents = {
  'update:modelValue': (value: EvCalendarValue) => void;
};

export interface EvDatePickerShortcut {
  label: string;
  value: string | number;
  shortcutDate: () => Date | readonly Date[];
}

export interface EvDatePickerOptions extends EvCalendarOptions {
  tagShorten?: boolean;
  type?: EvCalendarOptions['multiType'];
}

export interface EvDatePickerProps extends CalendarPresentationProps {
  modelValue?: EvDatePickerValue;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  enableTextInput?: boolean;
  options?: EvDatePickerOptions;
  shortcuts?: readonly EvDatePickerShortcut[];
}

export type EvDatePickerEvents = {
  'update:modelValue': (value: EvDatePickerValue | undefined) => void;
  // Native change events fall through. changeMv can also emit the current value.
  change: (value: EvDatePickerValue | Event, event?: Event) => void;
};

export interface EvDatePickerMethods {
  changeMv(event?: Event): Promise<void>;
}

export type EvTimePickerValue = string | string[];

export interface EvTimePickerProps {
  modelValue?: EvTimePickerValue;
  type?: 'range' | 'single';
  clearable?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  placeholder?: string | readonly string[];
}

export type EvTimePickerEvents = {
  'update:modelValue': (value: EvTimePickerValue) => void;
  focus: (event: FocusEvent) => void;
  blur: (event: FocusEvent) => void;
  change: (event: Event, value: EvTimePickerValue) => void;
};

export declare const EvCalendar: EvComponent<EvCalendarProps, EvCalendarEvents>;
export declare const EvDatePicker: EvComponent<
  EvDatePickerProps,
  EvDatePickerEvents,
  EvDatePickerMethods
>;
export declare const EvTimePicker: EvComponent<EvTimePickerProps, EvTimePickerEvents>;
