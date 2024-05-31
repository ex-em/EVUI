import type { InjectionKey, Ref } from 'vue';

export const evTabKey = Symbol() as InjectionKey<Ref<string | number>>;
