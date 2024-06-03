export type ItemType = any;

export interface Emit {
  (event: 'update:modelValue', value: ItemType): void;
  (e: 'change', value: ItemType): void;
}

export interface Props {
  modelValue: ItemType;
  placeholder: string;
  searchPlaceholder: string;
  noMatchingText: string;
  items: any[];
  disabled: boolean;
  clearable: boolean;
  multiple: boolean;
  checkable: boolean;
  collapseTags: boolean;
  filterable: boolean;
  filterText: string;
  allCheckLabel: string;
}
