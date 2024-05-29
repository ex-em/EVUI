export type MessageType = 'info' | 'success' | 'warning' | 'error';
export type IconClassType =
  | 'ev-icon-arrow-check'
  | 'ev-icon-warning2'
  | 'ev-icon-warning3'
  | 'ev-icon-info2';

export type CloseType = 'ok' | 'cancel' | 'modal';
export type FocusType = 'confirmBtn' | 'cancelBtn' | 'messageBox';

export interface Props {
  type?: MessageType;
  title?: string;
  message?: string | string[];
  iconClass?: IconClassType;
  showClose?: boolean;
  showConfirmBtn?: boolean;
  showCancelBtn?: boolean;
  confirmBtnText?: string;
  cancelBtnText?: string;
  closeOnClickModal?: boolean;
  useHTML?: boolean;
  focusable?: boolean;
  onClose?: (type: CloseType) => void;
  unmount?: () => void;
}
