declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    EvProgress: typeof import('@evui/ui')['EvProgress'];
    EvMessageBox: typeof import('@evui/ui')['EvMessageBox'];
    EvMessage: typeof import('@evui/ui')['EvMessage'];
    EvLoading: typeof import('@evui/ui')['EvLoading'];
    EvButton: typeof import('@evui/ui')['EvButton'];
  }
  export interface ComponentCustomProperties {
    $message: typeof import('@evui/ui')['EvMessage'];
    $messageBox: typeof import('@evui/ui')['EvMessageBox'];
  }
}
export {}