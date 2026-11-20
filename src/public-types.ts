import type { Installable } from './types/component.js' with { 'resolution-mode': 'import' };
import type Button from './components/button/index.js' with { 'resolution-mode': 'import' };
import type Icon from './components/icon/index.js' with { 'resolution-mode': 'import' };
import type Loading from './components/loading/index.js' with { 'resolution-mode': 'import' };
import type Progress from './components/progress/index.js' with { 'resolution-mode': 'import' };
import type Toggle from './components/toggle/index.js' with { 'resolution-mode': 'import' };
import type * as Charts from './types/charts.js' with { 'resolution-mode': 'import' };
import type * as Tables from './types/tables.js' with { 'resolution-mode': 'import' };
import type * as Inputs from './types/inputs.js' with { 'resolution-mode': 'import' };
import type * as Navigation from './types/navigation.js' with { 'resolution-mode': 'import' };
import type * as Dates from './types/date-time.js' with { 'resolution-mode': 'import' };
import type * as Overlays from './types/overlays.js' with { 'resolution-mode': 'import' };

export type * from './types/charts.js' with { 'resolution-mode': 'import' };
export type * from './types/tables.js' with { 'resolution-mode': 'import' };
export type * from './types/inputs.js' with { 'resolution-mode': 'import' };
export type * from './types/navigation.js' with { 'resolution-mode': 'import' };
export type * from './types/date-time.js' with { 'resolution-mode': 'import' };
export type * from './types/overlays.js' with { 'resolution-mode': 'import' };

export declare const EvTabs: typeof Navigation.EvTabs;
export declare const EvTabPanel: typeof Navigation.EvTabPanel;
export declare const EvButton: typeof Button;
export declare const EvButtonGroup: typeof Inputs.EvButtonGroup;
export declare const EvCheckbox: typeof Inputs.EvCheckbox;
export declare const EvCheckboxGroup: typeof Inputs.EvCheckboxGroup;
export declare const EvRadio: typeof Inputs.EvRadio;
export declare const EvRadioGroup: typeof Inputs.EvRadioGroup;
export declare const EvSelect: typeof Inputs.EvSelect;
export declare const EvToggle: typeof Toggle;
export declare const EvTextField: typeof Inputs.EvTextField;
export declare const EvInputNumber: typeof Inputs.EvInputNumber;
export declare const EvSlider: typeof Inputs.EvSlider;
export declare const EvIcon: typeof Icon;
export declare const EvCalendar: typeof Dates.EvCalendar;
export declare const EvDatePicker: typeof Dates.EvDatePicker;
export declare const EvScheduler: typeof Tables.EvScheduler;
export declare const EvContextMenu: typeof Navigation.EvContextMenu;
export declare const EvWindow: typeof Overlays.EvWindow;
export declare const EvLoading: typeof Loading;
export declare const EvProgress: typeof Progress;
export declare const EvMenu: typeof Navigation.EvMenu;
export declare const EvTree: typeof Tables.EvTree;
export declare const EvTimePicker: typeof Dates.EvTimePicker;
export declare const EvGrid: typeof Tables.EvGrid;
export declare const EvChart: typeof Charts.EvChart;
export declare const EvChartGroup: typeof Charts.EvChartGroup;
export declare const EvChartBrush: typeof Charts.EvChartBrush;
export declare const EvMessage: typeof Overlays.EvMessage;
export declare const EvNotification: typeof Overlays.EvNotification;
export declare const EvMessageBox: typeof Overlays.EvMessageBox;
export declare const EvTreeGrid: typeof Tables.EvTreeGrid;
export declare const EvPagination: typeof Tables.EvPagination;

declare const EVUI: Installable & { version: string };
export default EVUI;

declare module 'vue' {
  interface GlobalComponents {
    EvTabs: typeof Navigation.EvTabs;
    EvTabPanel: typeof Navigation.EvTabPanel;
    EvButton: typeof Button;
    EvButtonGroup: typeof Inputs.EvButtonGroup;
    EvCheckbox: typeof Inputs.EvCheckbox;
    EvCheckboxGroup: typeof Inputs.EvCheckboxGroup;
    EvRadio: typeof Inputs.EvRadio;
    EvRadioGroup: typeof Inputs.EvRadioGroup;
    EvSelect: typeof Inputs.EvSelect;
    EvToggle: typeof Toggle;
    EvTextField: typeof Inputs.EvTextField;
    EvInputNumber: typeof Inputs.EvInputNumber;
    EvSlider: typeof Inputs.EvSlider;
    EvIcon: typeof Icon;
    EvCalendar: typeof Dates.EvCalendar;
    EvDatePicker: typeof Dates.EvDatePicker;
    EvScheduler: typeof Tables.EvScheduler;
    EvContextMenu: typeof Navigation.EvContextMenu;
    EvWindow: typeof Overlays.EvWindow;
    EvLoading: typeof Loading;
    EvProgress: typeof Progress;
    EvMenu: typeof Navigation.EvMenu;
    EvTree: typeof Tables.EvTree;
    EvTimePicker: typeof Dates.EvTimePicker;
    EvGrid: typeof Tables.EvGrid;
    EvChart: typeof Charts.EvChart;
    EvChartGroup: typeof Charts.EvChartGroup;
    EvChartBrush: typeof Charts.EvChartBrush;
    EvTreeGrid: typeof Tables.EvTreeGrid;
    EvPagination: typeof Tables.EvPagination;
  }

  interface ComponentCustomProperties {
    $message: typeof Overlays.EvMessage;
    $messagebox: typeof Overlays.EvMessageBox;
    $notify: typeof Overlays.EvNotification;
  }
}
