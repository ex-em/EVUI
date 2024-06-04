import type { CheckValue } from '../checkbox/checkbox.type';
import type { IconName } from '../icon/icon-list';

export type ItemType = {
  name: string;
  value: CheckValue;
  disabled?: boolean;
  iconClass?: `ev-icon-${IconName}`;
};

export interface Emit {
  (event: 'update:modelValue', value: CheckValue | CheckValue[]): void;
  (e: 'change', value: CheckValue | CheckValue[]): void;
}

export type Props =
  | {
      modelValue: CheckValue;
      items: ItemType[];
      multiple?: false;
      placeholder?: string;
      checkable?: boolean;
      filterText?: string;
      searchPlaceholder?: string;
      noMatchingText?: string;
      disabled?: boolean;
      clearable?: boolean;
      filterable?: boolean;
    }
  | {
      modelValue: CheckValue[];
      items: ItemType[];
      multiple: true;
      allCheckLabel?: string;
      placeholder?: string;
      checkable?: boolean;
      filterText?: string;
      searchPlaceholder?: string;
      noMatchingText?: string;
      disabled?: boolean;
      clearable?: boolean;
      collapseTags?: boolean;
      filterable?: boolean;
    };
