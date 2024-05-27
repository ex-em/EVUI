declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    EvMessage: typeof import('@evui/ui')['EvMessage'];
    EvLoading: typeof import('@evui/ui')['EvLoading'];
    EvButton: typeof import('@evui/ui')['EvButton'];
  }
  export interface ComponentCustomProperties {
    $Message: typeof import('@evui/ui')['EvMessage'];
  }
}
export {}