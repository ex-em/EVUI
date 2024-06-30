declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    EvWindow: typeof import('evui')['EvWindow'];
    EvTreeGridToolbar: typeof import('evui')['EvTreeGridToolbar'];
    EvTreeGridNode: typeof import('evui')['EvTreeGridNode'];
    EvTreeGrid: typeof import('evui')['EvTreeGrid'];
    EvTreeNode: typeof import('evui')['EvTreeNode'];
    EvTree: typeof import('evui')['EvTree'];
    EvToggle: typeof import('evui')['EvToggle'];
    EvTimePicker: typeof import('evui')['EvTimePicker'];
    EvTextField: typeof import('evui')['EvTextField'];
    EvTabs: typeof import('evui')['EvTabs'];
    EvTabPanel: typeof import('evui')['EvTabPanel'];
    EvSlider: typeof import('evui')['EvSlider'];
    EvSelect: typeof import('evui')['EvSelect'];
    EvScheduler: typeof import('evui')['EvScheduler'];
    EvRadioGroup: typeof import('evui')['EvRadioGroup'];
    EvRadio: typeof import('evui')['EvRadio'];
    EvProgress: typeof import('evui')['EvProgress'];
    EvpageButton: typeof import('evui')['EvpageButton'];
    EvPagination: typeof import('evui')['EvPagination'];
    EvNotification: typeof import('evui')['EvNotification'];
    EvMessageBox: typeof import('evui')['EvMessageBox'];
    EvMessage: typeof import('evui')['EvMessage'];
    EvMenuItem: typeof import('evui')['EvMenuItem'];
    EvMenu: typeof import('evui')['EvMenu'];
    EvLoading: typeof import('evui')['EvLoading'];
    EvInputNumber: typeof import('evui')['EvInputNumber'];
    EvIcon: typeof import('evui')['EvIcon'];
    EvGridToolbar: typeof import('evui')['EvGridToolbar'];
    EvGridSummary: typeof import('evui')['EvGridSummary'];
    EvGridPagination: typeof import('evui')['EvGridPagination'];
    EvGridFilterSetting: typeof import('evui')['EvGridFilterSetting'];
    EvGridColumnSetting: typeof import('evui')['EvGridColumnSetting'];
    EvGrid: typeof import('evui')['EvGrid'];
    EvDatePicker: typeof import('evui')['EvDatePicker'];
    EvMenuList: typeof import('evui')['EvMenuList'];
    EvContextMenu: typeof import('evui')['EvContextMenu'];
    EvCheckboxGroup: typeof import('evui')['EvCheckboxGroup'];
    EvCheckbox: typeof import('evui')['EvCheckbox'];
    EvChartGroup: typeof import('evui')['EvChartGroup'];
    EvChartBrush: typeof import('evui')['EvChartBrush'];
    EvChartToolbar: typeof import('evui')['EvChartToolbar'];
    EvChart: typeof import('evui')['EvChart'];
    EvCalendar: typeof import('evui')['EvCalendar'];
    EvButtonGroup: typeof import('evui')['EvButtonGroup'];
    EvButton: typeof import('evui')['EvButton'];
  }
  export interface ComponentCustomProperties {
    $message: typeof import('evui')['EvMessage'];
    $messageBox: typeof import('evui')['EvMessageBox'];
    $notification: typeof import('evui')['EvNotification'];
  }
}
export {}