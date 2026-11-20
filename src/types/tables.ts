import type { EvComponent } from './component.js';
import type { EvContextMenuItem } from './navigation.js';

export type EvPaginationOrder = 'left' | 'right' | 'center';
export type EvPaginationValue = number | string;

export interface EvPaginationProps {
  total?: number | string;
  visiblePage?: number | string;
  perPage?: number | string;
  modelValue?: EvPaginationValue;
  showPageInfo?: boolean;
  order?: EvPaginationOrder;
  pagePerJump?: number;
}

export type EvPaginationEvents = {
  'update:modelValue': (page: EvPaginationValue) => void;
  change: (page: EvPaginationValue) => void;
};

export interface EvPaginationMethods {
  changePage(page: EvPaginationValue, event?: MouseEvent): void;
}

export declare const EvPagination: EvComponent<
  EvPaginationProps,
  EvPaginationEvents,
  EvPaginationMethods
>;

export interface EvSchedulerProps {
  modelValue?: boolean[][];
  colLabels?: string[];
  rowLabels?: string[];
}

export type EvSchedulerEvents = {
  'update:modelValue': (selection: boolean[][]) => void;
  change: (selection: boolean[][]) => void;
};

export interface EvSchedulerMethods {
  selectColumn(columnIndex: number): void;
  selectRow(rowIndex: number): void;
}

export declare const EvScheduler: EvComponent<
  EvSchedulerProps,
  EvSchedulerEvents,
  EvSchedulerMethods
>;

export interface EvTreeNode<Value = unknown> {
  title: string;
  value?: Value;
  children?: EvTreeNode<Value>[];
  iconClass?: string;
  disabled?: boolean;
  expand?: boolean;
  checked?: boolean;
  indeterminate?: boolean;
  selected?: boolean;
  visible?: boolean;
  nodeKey?: number;
}

export interface EvTreeProps {
  data?: EvTreeNode[];
  useCheckbox?: boolean;
  emptyText?: string;
  expandIcon?: string;
  collapseIcon?: string;
  contextMenuItems?: EvContextMenuItem[];
  searchWord?: string;
  searchIncludeChildren?: boolean;
}

export interface EvTreeNodeClickEvent<Value = unknown> {
  title: string;
  value: Value;
}

export interface EvTreeCheckedNode extends EvTreeNode {
  checked: true;
  nodeKey: number;
  selected: boolean;
  visible: boolean;
}

export type EvTreeEvents = {
  check: (nodes: EvTreeCheckedNode[]) => void;
  'click-node': (node: EvTreeNodeClickEvent) => void;
  'dblclick-node': (node: EvTreeNodeClickEvent) => void;
};

export declare const EvTree: EvComponent<EvTreeProps, EvTreeEvents>;

export type EvGridRow = unknown[];
export type EvGridColumnType = 'string' | 'number' | 'stringNumber' | 'float' | 'boolean';
export type EvGridSortOrder = 'asc' | 'desc' | 'init';
export type EvGridSummaryType = 'sum' | 'average' | 'max' | 'min' | 'count';

export interface EvGridColumn {
  caption: string;
  field: string;
  type: EvGridColumnType;
  hide?: boolean;
  hiddenDisplay?: boolean;
  width?: number;
  searchable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  align?: EvPaginationOrder;
  decimal?: number;
  summaryType?: EvGridSummaryType;
  summaryDecimal?: number;
  summaryRenderer?: string;
  summaryData?: string[];
  customHeader?: boolean;
  fixed?: boolean;
  sortOption?: { sortType?: EvGridSortOrder };
  render?: { use?: boolean };
}

export interface EvTreeGridColumn extends EvGridColumn {
  expandColumn?: boolean;
  summaryOnlyTopParent?: boolean;
}

export type EvGridResolvedColumn<Column extends EvGridColumn = EvGridColumn> = Column & {
  index: number;
  hiddenDisplay: boolean;
  sortOption: { sortType: EvGridSortOrder };
  resized?: boolean;
};

export interface EvTreeGridRow {
  [field: string]: unknown;
  data?: Record<string, unknown>;
  children?: EvTreeGridRow[];
  checked?: boolean;
  selected?: boolean;
  show?: boolean;
  expand?: boolean;
  uncheckable?: boolean;
  indeterminate?: boolean;
  isFilter?: boolean;
  hasChild?: boolean;
  index?: number;
  level?: number;
  parent?: EvTreeGridRow;
}

export interface EvTreeGridResolvedRow extends EvTreeGridRow {
  data: Record<string, unknown>;
  children?: EvTreeGridResolvedRow[];
  parent?: EvTreeGridResolvedRow;
  checked: boolean;
  selected: boolean;
  show: boolean;
  expand: boolean;
  uncheckable: boolean;
  indeterminate: boolean;
  isFilter: boolean;
  index: number;
  level: number;
}

export interface EvGridPageOptions {
  use?: boolean;
  isInfinite?: boolean;
  useClient?: boolean;
  total?: number;
  perPage?: number;
  currentPage?: number;
  visiblePage?: number;
  order?: EvPaginationOrder;
  showPageInfo?: boolean;
}

export interface EvGridCheckboxOptions<Mode extends string = 'multi' | 'single'> {
  use?: boolean;
  mode?: Mode;
  headerCheck?: boolean;
}

export interface EvGridSelectionOptions {
  use?: boolean;
  multiple?: boolean;
}

export interface EvGridStyleOptions {
  stripe?: boolean;
  border?: '' | 'none' | 'rows';
  highlight?: number;
}

export interface EvGridSettingOptions {
  use?: boolean;
  customContextMenu?: EvContextMenuItem[];
  useDefaultColumnSetting?: boolean;
  columnMenuText?: string;
  searchText?: string;
  emptyText?: string;
  okBtnText?: string;
}

export interface EvGridContextMenuItem<Row = EvGridRow> extends Omit<
  EvContextMenuItem,
  'children' | 'click'
> {
  itemId?: string | number;
  selectedRow?: Row[];
  contextmenuInfo?: Row[];
  children?: EvGridContextMenuItem<Row>[];
  click?: (item: EvGridContextMenuItem<Row>) => void;
  validate?: (itemId: string | number | undefined, selectedRows: Row[]) => boolean;
}

export type EvGridSearchValue = string | number | null;
export type EvGridColumnMenuAction = 'ascending' | 'descending' | 'filter' | 'hide';

type EvGridCompare = {
  compare(first: unknown, second: unknown): number;
}['compare'];

interface EvGridBaseOptions<Row, Mode extends string> {
  adjust?: boolean;
  showHeader?: boolean;
  rowHeight?: number;
  rowMinHeight?: number | null;
  columnWidth?: number;
  scrollWidth?: number;
  customAscFunction?: Record<string, EvGridCompare>;
  useCheckbox?: EvGridCheckboxOptions<Mode>;
  style?: EvGridStyleOptions;
  customContextMenuClass?: string;
  customContextMenu?: EvGridContextMenuItem<Row>[];
  hiddenColumnMenuItem?: Partial<Record<EvGridColumnMenuAction, boolean>>;
  columnMenuText?: Partial<Record<EvGridColumnMenuAction, string>>;
  page?: EvGridPageOptions;
  useSummary?: boolean;
  useGridSetting?: EvGridSettingOptions;
  emptyText?: string;
  searchValue?: EvGridSearchValue | { value: NonNullable<EvGridSearchValue> };
}

export interface EvGridOptions extends EvGridBaseOptions<EvGridRow, 'multi' | 'single'> {
  useSelection?: EvGridSelectionOptions;
  useFilter?: boolean;
  rowDetail?: { use?: boolean; detailRowHeight?: number };
}

export interface EvTreeGridOptions extends EvGridBaseOptions<
  EvTreeGridRow,
  'multi' | 'single' | 'each'
> {
  useSelection?: EvGridSelectionOptions & { limitCount?: number };
  useSort?: boolean;
  expandIcon?: string;
  collapseIcon?: string;
  parentIcon?: string;
  childIcon?: string;
}

export interface EvGridProps {
  columns?: EvGridColumn[];
  rows?: EvGridRow[];
  width?: number | string;
  height?: number | string;
  selected?: EvGridRow[];
  checked?: EvGridRow[];
  uncheckable?: EvGridRow[];
  expanded?: EvGridRow[];
  disabledRows?: EvGridRow[];
  option?: EvGridOptions;
}

export interface EvTreeGridProps {
  columns?: EvTreeGridColumn[];
  rows?: EvTreeGridRow[] | null;
  width?: number | string;
  height?: number | string;
  selected?: EvTreeGridRow[];
  checked?: EvTreeGridRow[];
  option?: EvTreeGridOptions;
  expandIcon?: string;
  collapseIcon?: string;
}

export interface EvGridClickRowEvent<Row = EvGridRow> {
  event: MouseEvent;
  rowData: Row;
  rowIndex: number;
  cellName: string | undefined;
  cellIndex: string | undefined;
}

export interface EvGridPageChangeEvent {
  eventName: Partial<Record<'onSort' | 'onSearch' | 'onScrollEnd' | 'onChangePage', true>>;
  pageInfo: {
    currentPage: number;
    prevPage: number;
    startIndex: number;
    total: number | undefined;
    perPage: number;
  };
  sortInfo: {
    field: string;
    order: EvGridSortOrder | '';
  };
  searchInfo: {
    searchWord: EvGridSearchValue;
    searchColumns: string[];
  };
}

export interface EvGridColumnStatusEvent<Column extends EvGridColumn = EvGridColumn> {
  columns: EvGridResolvedColumn<Column>[];
}

export interface EvGridColumnEvent<
  Column extends EvGridColumn = EvGridColumn,
> extends EvGridColumnStatusEvent<Column> {
  column: EvGridResolvedColumn<Column>;
}

export interface EvGridSortColumnEvent<
  Column extends EvGridColumn = EvGridColumn,
> extends EvGridColumnEvent<Column> {
  field: string;
  order: EvGridSortOrder;
}

export interface EvGridColumnInfoEvent<
  Column extends EvGridColumn = EvGridColumn,
  ChangeType extends string = 'resize' | 'order' | 'display' | 'sort',
> extends EvGridColumnStatusEvent<Column> {
  type: ChangeType;
}

export interface EvTreeGridToggleRowEvent {
  row: EvTreeGridResolvedRow;
  isExpand: boolean;
}

type EvGridBaseEvents<Row, Column extends EvGridColumn, ChangeType extends string> = {
  'check-row': (checked: boolean, index: number, row: Row) => void;
  'click-row': (payload: EvGridClickRowEvent<Row>) => void;
  'dblclick-row': (payload: EvGridClickRowEvent<Row>) => void;
  'page-change': (payload: EvGridPageChangeEvent) => void;
  'sort-column': (payload: EvGridSortColumnEvent<Column>) => void;
  'resize-column': (payload: EvGridColumnEvent<Column>) => void;
  'change-column-status': (payload: EvGridColumnStatusEvent<Column>) => void;
  'change-column-info': (payload: EvGridColumnInfoEvent<Column, ChangeType>) => void;
};

export type EvGridEvents = EvGridBaseEvents<
  EvGridRow,
  EvGridColumn,
  EvGridColumnInfoEvent['type']
> & {
  'update:selected': (rows: EvGridRow[]) => void;
  'update:checked': (rows: EvGridRow[]) => void;
  'update:expanded': (rows: EvGridRow[]) => void;
  'check-all': (checked: boolean, rows: EvGridRow[]) => void;
  'expand-row': (event: MouseEvent, row: EvGridRow, isExpand: boolean, index: number) => void;
  'change-column-order': (payload: EvGridColumnEvent) => void;
};

export type EvTreeGridEvents = EvGridBaseEvents<
  EvTreeGridResolvedRow,
  EvTreeGridColumn,
  Exclude<EvGridColumnInfoEvent['type'], 'order'>
> & {
  'update:selected': (rows: EvTreeGridRow[]) => void;
  'update:checked': (rows: EvTreeGridRow[]) => void;
  'check-all': (checked: boolean, rows: EvTreeGridRow[]) => void;
  'toggle-row': (payload: EvTreeGridToggleRowEvent) => void;
};

export interface EvGridFilterCondition {
  comparison:
    | '='
    | '!='
    | '<'
    | '>'
    | '<='
    | '>='
    | 's%'
    | '%s'
    | '%s%'
    | 'notLike'
    | 'isEmpty'
    | 'isNotEmpty';
  operator: 'and' | 'or';
  value: string;
  caption?: string;
}

interface EvGridBaseMethods {
  onSearch(searchWord: EvGridSearchValue): void;
  onResize(): void;
  onApplyColumn(fields: string[]): void;
}

export interface EvGridMethods extends EvGridBaseMethods {
  onApplyFilter(field: string, conditions?: EvGridFilterCondition[]): Promise<void>;
  removeAllFiltering(): void;
}

export interface EvTreeGridMethods extends EvGridBaseMethods {
  handleExpand(row: EvTreeGridResolvedRow & { children: EvTreeGridResolvedRow[] }): void;
}

export declare const EvGrid: EvComponent<EvGridProps, EvGridEvents, EvGridMethods>;
export declare const EvTreeGrid: EvComponent<EvTreeGridProps, EvTreeGridEvents, EvTreeGridMethods>;
