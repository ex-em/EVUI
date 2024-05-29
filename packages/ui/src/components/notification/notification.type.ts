export interface Props {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  duration?: number;
  showClose?: boolean;
  iconClass?: string;
  onClose?: () => void;
  onClick?: () => void;
  useHTML?: boolean;
  unmount?: () => void;
}
