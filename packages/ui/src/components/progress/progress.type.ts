export type NonEmptyArray<T> = [T, ...T[]];


/**
 * NOTE: Vue에서 CssProperties를 사용하면 빌드 후에 문제가 생깁니다.
 */
export type Color = string;

export interface ColorRange {
  color: Color;
  value: number;
}

export interface Props {
  modelValue?: number; // 0-100
  color?: Color | NonEmptyArray<ColorRange>;
  strokeWidth?: number;
  innerText?: string;
}
