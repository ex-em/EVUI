import type { EvComponent } from './component.js';

export type EvTabValue = string | number;

export interface EvTabPanelProps {
  value: EvTabValue;
  text?: string | number | null;
  disabled?: boolean;
  lazy?: boolean;
}

export interface EvTabsProps {
  modelValue?: EvTabValue | null;
  panels?: EvTabPanelProps[];
  closable?: boolean;
  stretch?: boolean;
  draggable?: boolean;
}

export type EvTabsEvents = {
  'update:modelValue': (value: EvTabValue) => void;
  'update:panels': (panels: EvTabPanelProps[]) => void;
  change: (value: EvTabValue) => void;
};

export interface EvMenuItem {
  value: string | number;
  text?: string;
  iconClass?: string;
  hidden?: boolean;
  expand?: boolean;
  disabled?: boolean;
  slotKey?: string;
  children?: EvMenuItem[];
}

export interface EvMenuProps {
  modelValue?: EvMenuItem['value'];
  items?: EvMenuItem[];
  expandable?: boolean;
  disabled?: boolean;
}

export type EvMenuEvents = {
  'update:modelValue': (value: EvMenuItem['value']) => void;
  // Before the first interaction the previous selection comes from a list filter.
  change: (selected: EvMenuItem, previous: EvMenuItem | EvMenuItem[]) => void;
};

export interface EvContextMenuItem {
  value?: string | number;
  text?: string;
  iconClass?: string;
  itemClass?: string;
  hidden?: boolean;
  disabled?: boolean;
  isShowMenu?: boolean;
  slotKey?: string;
  children?: EvContextMenuItem[];
  click?: (item: EvContextMenuItem) => void;
}

export interface EvContextMenuProps {
  items?: EvContextMenuItem[];
  customClass?: string;
  isShowMenuOnClick?: boolean;
}

export interface EvContextMenuMethods {
  show(event: Pick<MouseEvent, 'pageX' | 'pageY' | 'clientX' | 'clientY'>): Promise<void>;
  hide(): Promise<void>;
}

export declare const EvTabs: EvComponent<EvTabsProps, EvTabsEvents>;
export declare const EvTabPanel: EvComponent<EvTabPanelProps>;
export declare const EvMenu: EvComponent<EvMenuProps, EvMenuEvents>;
export declare const EvContextMenu: EvComponent<
  EvContextMenuProps,
  Record<never, never>,
  EvContextMenuMethods
>;
