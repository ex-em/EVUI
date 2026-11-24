import { EvContextMenu, EvMenu, EvTabPanel, EvTabs } from 'evui';

const tabs: InstanceType<typeof EvTabs>['$props'] = {
  panels: [{ value: 'settings', text: 'Settings' }],
  modelValue: 'settings',
  'onUpdate:panels': (panels) => {
    const value: string | number = panels[0].value;
    void value;
  },
};
const badTabs: InstanceType<typeof EvTabs>['$props'] = {
  // @ts-expect-error panel values cannot be booleans
  panels: [{ value: true, text: 'Settings' }],
};
const panel: InstanceType<typeof EvTabPanel>['$props'] = { value: 'settings', lazy: true };
// @ts-expect-error every panel needs an identifier
const badPanel: InstanceType<typeof EvTabPanel>['$props'] = { lazy: true };
const menu: InstanceType<typeof EvMenu>['$props'] = {
  items: [{ value: 1, children: [{ value: 2, text: 'Nested' }] }],
  onChange: (selected, previous) => {
    const value: string | number = selected.value;
    const previousValue = Array.isArray(previous) ? previous[0]?.value : previous.value;
    void [value, previousValue];
  },
};
const context: InstanceType<typeof EvContextMenu>['$props'] = {
  items: [{ value: 'open', text: 'Open', click: (item) => item.text }],
};
const badContext: InstanceType<typeof EvContextMenu>['$props'] = {
  // @ts-expect-error click takes a callback
  items: [{ text: 'Open', click: true }],
};
void [tabs, badTabs, panel, badPanel, menu, context, badContext];
