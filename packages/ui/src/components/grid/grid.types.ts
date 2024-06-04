export type GridColumnType =
  | 'string'
  | 'number'
  | 'float'
  | 'boolean'
  | 'stringNumber';

export interface GridColumn<Field = string> {
  caption: string;
  field: Field;
  type?: GridColumnType;
  width?: number;
  searchable?: boolean;
  sortable?: boolean;
  hide?: boolean;
  decimal?: number;
  summaryType?: 'sum' | 'average' | 'max' | 'min' | 'count';
  summaryRenderer?: string;
  summaryData?: string[];
  expandColumn?: boolean;
  align?: string;
  hiddenDisplay?: boolean;
}
export interface GridContextMenuParams {
  click?: (param: any) => void;
  contextmenuInfo?: any[];
  selectedRow?: any[];
  text: any;
}

export interface MenuItem {
  text?: string | number;
  iconClass?: string;
  disabled?: boolean;
  children?: MenuItem[];
  click?: (param: GridContextMenuParams) => void;
}

type ColumnMenuKeys = 'ascending' | 'descending' | 'filter' | 'hide';
interface ColumnMenuHidden extends Partial<Record<ColumnMenuKeys, boolean>> {}
interface ColumnMenuText extends Partial<Record<ColumnMenuKeys, string>> {}

export interface GridOption {
  adjust?: boolean;
  showHeader?: boolean;
  rowHeight?: number;
  rowMinHeight?: number;
  columnWidth?: number;
  scrollWidth?: number;
  useFilter?: boolean;
  useGridSetting?: {
    use?: boolean;
    customContextMenu?: MenuItem[];
    columnMenuText?: string;
    searchText?: string;
    emptyText?: string;
    okBtnText?: string;
  };
  maintainScrollOnUpdateRows?: boolean;
  customAscFunction?: Record<string, (a: any, b: any) => number>;
  useCheckbox?: {
    use?: boolean;
    mode?: 'multi' | 'single';
    headerCheck?: boolean;
  };
  useSelection?: {
    use?: boolean;
    multiple?: boolean;
    limitCount?: number;
  };
  style?: {
    stripe?: boolean;
    border?: 'none' | 'rows';
    highlight?: number;
  };
  customContextMenu?: MenuItem[];
  hiddenColumnMenuItem?: ColumnMenuHidden;
  columnMenuText?: ColumnMenuText;
  count?: boolean;
  searchValue?: string;
  useSummary?: boolean;
  page?: {
    use: boolean;
    useClient?: boolean;
    perPage?: number;
    currentPage?: number;
    total?: number;
    isInfinite?: boolean;
    showPageInfo?: boolean;
  };
  rowDetail?: {
    use?: boolean;
  };
  emptyText?: string;
}

export interface GridSearchBarOption {
  use: boolean;
  mode?: 'full' | 'right' | 'left';
  placeholder?: string;
  useClientFilter?: boolean;
}

export interface BasePaginationProps {
  current?: number;
  total: number;
  visiblePage?: number;
  align?: 'left' | 'center' | 'right';
  showSetting?: boolean;
  showPageInfo?: boolean;
  perData?: 20 | 30 | 40 | 50;
}
export interface PaginationInfo extends BasePaginationProps {
  use?: boolean;
  useClient?: boolean;
}

export interface Props {
  columns: GridColumn;
  rows: any[];
  type?: 'page' | 'widget';
  disabledRows?: any[];
  selectedRows?: any[];
  uncheckable?: any[];
  checkedRows?: any[];
  searchWord?: string;
  option?: GridOption;
  searchBarOption?: GridSearchBarOption;
  tooltipOption?: 'list' | 'chip';
  shownChipCount?: 1;
  pagination?: PaginationInfo;
  expanded?: any[];
}
