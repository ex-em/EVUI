declare module 'korean-regexp' {
  export function getRegExp(
    search: string,
    options?: {
      initialSearch?: boolean;
      startsWith?: boolean;
      endsWith?: boolean;
      fuzzy?: boolean;
      ignoreSpace?: boolean;
      ignoreCase?: boolean;
      global?: boolean;
    },
  ): RegExp;
  export function engToKor(input: string): string;
  export function korToEng(input: string): string;
}

declare module 'vue3-observe-visibility' {
  import type { Directive } from 'vue';

  export const ObserveVisibility: Directive;
}
