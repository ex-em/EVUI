declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    EvToggle: typeof import('@evui/ui')['EvToggle'];
    EvTextField: typeof import('@evui/ui')['EvTextField'];
    EvProgress: typeof import('@evui/ui')['EvProgress'];
    EvNotification: typeof import('@evui/ui')['EvNotification'];
    EvMessageBox: typeof import('@evui/ui')['EvMessageBox'];
    EvMessage: typeof import('@evui/ui')['EvMessage'];
    EvLoading: typeof import('@evui/ui')['EvLoading'];
    EvIcon: typeof import('@evui/ui')['EvIcon'];
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