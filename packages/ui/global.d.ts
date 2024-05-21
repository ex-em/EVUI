declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    EvButton: typeof import('@evui/ui')['EvButton'];
  }
  export interface ComponentCustomProperties {
  }
}
export {}