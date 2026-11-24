import type { CSSProperties } from 'vue';
import type { EvComponent, Installable } from './component.js';

type WindowDimension = string | number;

export interface EvWindowProps {
  style?: CSSProperties;
  visible?: boolean;
  title?: string | number | null;
  windowClass?: string;
  iconClass?: string;
  width?: WindowDimension;
  height?: WindowDimension;
  minWidth?: WindowDimension;
  minHeight?: WindowDimension;
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

export interface EvWindowPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface EvWindowMouseDown extends EvWindowPosition {
  state: 'mousedown';
  pressedSpot: '' | 'header' | 'border';
  clientX: number;
  clientY: number;
  ref: HTMLDivElement;
}

export type EvWindowEvents = {
  'update:visible': (visible: boolean) => void;
  mousedown: (info: EvWindowMouseDown) => void;
  'mousedown-mouseup': (event: MouseEvent) => void;
  'mousedown-mousemove': (event: MouseEvent) => void;
  resize: (event: MouseEvent, position: EvWindowPosition) => void;
  expand: (position: EvWindowPosition) => void;
};

export type EvMessageType = 'info' | 'success' | 'warning' | 'error';

interface MessageAppearance {
  iconClass?: string;
  showClose?: boolean;
  useHTML?: boolean;
}

export interface EvMessageOptions extends MessageAppearance {
  message?: string;
  type?: EvMessageType;
  duration?: number;
  onClose?: (() => void) | null;
}

export interface EvMessageHandle {
  hide(): void;
}

export type EvMessageBoxAction = 'ok' | 'cancel';

export interface EvMessageBoxOptions extends MessageAppearance {
  message?: string | readonly string[];
  title?: string;
  type?: '' | EvMessageType;
  showConfirmBtn?: boolean;
  showCancelBtn?: boolean;
  confirmBtnText?: string;
  cancelBtnText?: string;
  closeOnClickModal?: boolean;
  focusable?: boolean;
  onClose?: ((action: EvMessageBoxAction | undefined) => void) | null;
}

export type EvNotificationPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface EvNotificationOptions extends EvMessageOptions {
  title?: string;
  position?: EvNotificationPosition;
  onClick?: (() => void) | null;
}

type Service<Options, Result = void> = ((options?: Options | string) => Result) & Installable;

export declare const EvWindow: EvComponent<EvWindowProps, EvWindowEvents>;
export declare const EvMessage: Service<EvMessageOptions, EvMessageHandle>;
export declare const EvMessageBox: Service<EvMessageBoxOptions>;
export declare const EvNotification: Service<EvNotificationOptions>;
