import type { InjectionKey, Ref } from 'vue';

export type CheckValue = string | number | boolean | symbol;

export const EvCheckboxGroupMvKey = Symbol() as InjectionKey<
  Ref<CheckValue | CheckValue[]>
>;

export const EvCheckboxGroupChangeKey = Symbol() as InjectionKey<
  (e: Event) => Promise<void>
>;
