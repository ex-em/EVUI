import { EvCalendar, EvDatePicker, EvTimePicker } from 'evui';

const calendar: InstanceType<typeof EvCalendar>['$props'] = {
  mode: 'dateRange',
  modelValue: ['2026-11-20', '2026-11-21'],
  options: { disabledDate: [null, (date: Date) => date.getDay() === 0] },
};
const badCalendar: InstanceType<typeof EvCalendar>['$props'] = {
  // @ts-expect-error weeks are selected through dateMulti options
  mode: 'week',
};
const picker: InstanceType<typeof EvDatePicker>['$props'] = {
  modelValue: null,
  clearable: true,
  shortcuts: [{ label: 'Today', value: 'today', shortcutDate: () => new Date() }],
};
const badPicker: InstanceType<typeof EvDatePicker>['$props'] = {
  // @ts-expect-error shortcuts return Date objects
  shortcuts: [{ label: 'Today', value: 'today', shortcutDate: () => '2026-11-20' }],
};
const times: InstanceType<typeof EvTimePicker>['$props'] = {
  type: 'range',
  modelValue: ['08:00', '18:00'],
  onChange: (event, value) => {
    event.preventDefault();
    const first = typeof value === 'string' ? value : value[0];
    void first;
  },
};
const badTime: InstanceType<typeof EvTimePicker>['$props'] = {
  // @ts-expect-error time values are strings
  modelValue: [8, 18],
};
void [calendar, badCalendar, picker, badPicker, times, badTime];
