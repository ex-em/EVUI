import type { InjectionKey, Ref } from 'vue';

export const EvRadioGroupKey = Symbol() as InjectionKey<
  Ref<string | number | symbol | boolean>
>;

export const EvRadioGroupChangeKey = Symbol() as InjectionKey<
  (e: Event) => void
>;
