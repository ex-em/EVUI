import type { App, ComponentOptionsMixin, DefineComponent } from 'vue';

export interface Installable {
  install(app: App): void;
}

type EventMap = Record<string, (...args: never[]) => unknown>;

type Camelize<Name extends string> = Name extends `${infer Head}-${infer Tail}`
  ? `${Head}${Capitalize<Camelize<Tail>>}`
  : Name;

type CamelListeners<Events> = {
  [
    Name in keyof Events & string as Name extends `${string}-${string}`
      ? `on${Capitalize<Camelize<Name>>}`
      : never
  ]?: Events[Name];
};

export type EvComponent<
  Props extends object,
  Events extends EventMap = Record<never, never>,
  PublicMethods extends object = Record<never, never>,
> = DefineComponent<
  Props & CamelListeners<Events>,
  PublicMethods,
  Record<never, never>,
  Record<never, never>,
  Record<never, never>,
  ComponentOptionsMixin,
  ComponentOptionsMixin,
  Events
> &
  Installable;
