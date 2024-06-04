import type { IconName } from '@/components/icon/icon-list';
import type { CSSProperties } from 'vue';

export interface Props {
  style: Record<string, any>;
  width: string | number;
  height: string | number;
  minWidth: string | number;
  minHeight: string | number;
  visible?: boolean;
  title?: string | number | null;
  windowClass?: string;
  iconClass?: IconName;
  fullscreen?: boolean;
  isModal?: boolean;
  closeOnClickModal?: boolean;
  hideScroll?: boolean;
  draggable?: boolean;
  resizable?: boolean;
  maximizable?: boolean;
  escClose?: boolean;
  focusable?: boolean;
}

export interface ExpandPosInfo {
  top?: CSSProperties['top'];
  left?: CSSProperties['left'];
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
}
export interface ClickedInfo {
  state: string;
  pressedSpot: 'border' | 'header' | '';
  top: number;
  left: number;
  width: number;
  height: number;
  clientX: number;
  clientY: number;
}
export interface DragStyleInfo {
  top: number | string;
  left: number | string;
  width: number | string;
  height: number | string;
  minWidth: number | string;
  minHeight: number | string;
}
export interface WindowType {
  sequence?: number;
  closeWin: (from?: 'layer' | MouseEvent) => void;
  elem?: HTMLElement;
  escClose: boolean;
}

export interface Emit {
  (e: 'update:visible', v: boolean): void;
  (e: 'mousedown', v: ClickedInfo): void;
  (e: 'mousedown-mouseup', event: MouseEvent): void;
  (e: 'mousedown-mousemove', event: MouseEvent): void;
  (e: 'resize', event: MouseEvent, v: ExpandPosInfo): void;
  (e: 'expand', v: ExpandPosInfo): void;
}
