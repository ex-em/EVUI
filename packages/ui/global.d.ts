declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    EvTreeGrid: typeof import('@evui/ui')['EvTreeGrid'];
    EvToggle: typeof import('@evui/ui')['EvToggle'];
    EvTextField: typeof import('@evui/ui')['EvTextField'];
    EvTabs: typeof import('@evui/ui')['EvTabs'];
    EvTabPanel: typeof import('@evui/ui')['EvTabPanel'];
    EvSelect: typeof import('@evui/ui')['EvSelect'];
    EvRadioGroup: typeof import('@evui/ui')['EvRadioGroup'];
    EvRadio: typeof import('@evui/ui')['EvRadio'];
    EvProgress: typeof import('@evui/ui')['EvProgress'];
    EvPagination: typeof import('@evui/ui')['EvPagination'];
    EvNotification: typeof import('@evui/ui')['EvNotification'];
    EvMessageBox: typeof import('@evui/ui')['EvMessageBox'];
    EvMessage: typeof import('@evui/ui')['EvMessage'];
    EvLoading: typeof import('@evui/ui')['EvLoading'];
    EvInputNumber: typeof import('@evui/ui')['EvInputNumber'];
    EvIcon: typeof import('@evui/ui')['EvIcon'];
    EvGrid: typeof import('@evui/ui')['EvGrid'];
    EvCheckboxGroup: typeof import('@evui/ui')['EvCheckboxGroup'];
    EvCheckbox: typeof import('@evui/ui')['EvCheckbox'];
    EvButton: typeof import('@evui/ui')['EvButton'];
  }
  export interface ComponentCustomProperties {
    $message: typeof import('@evui/ui')['EvMessage'];
    $messageBox: typeof import('@evui/ui')['EvMessageBox'];
    $notification: typeof import('@evui/ui')['EvNotification'];
  }
}
export {}