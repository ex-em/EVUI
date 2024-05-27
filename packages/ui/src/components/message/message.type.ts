export interface Props {
  type?: 'info' | 'success' | 'warning' | 'error';
  message?: string;
  duration?: number;
  showClose?: boolean;
  iconClass?: string;
  onClose?: () => void;
  useHTML?: boolean;
  unmount?: () => void;
}
