import { h } from 'vue';
import { EvGrid, EvPagination, EvScheduler, EvTree, EvTreeGrid } from 'evui';

const gridProps: InstanceType<typeof EvGrid>['$props'] = {
  rows: [[1, { label: 'Production', points: [1, 2, 3] }]],
  columns: [
    { caption: 'ID', field: 'id', type: 'number', sortOption: { sortType: 'asc' } },
    { caption: 'History', field: 'history', type: 'string', render: { use: true } },
  ],
  option: {
    useCheckbox: { use: true, mode: 'single' },
    page: { use: true, perPage: 10 },
    customAscFunction: { id: (first: number, second: number) => first - second },
  },
  onCheckRow: (checked, index, row) => {
    const selected: boolean = checked;
    const position: number = index;
    const data: unknown[] = row;
    void [selected, position, data];
  },
  onPageChange: ({ pageInfo, searchInfo }) => {
    const page: number = pageInfo.currentPage;
    const fields: string[] = searchInfo.searchColumns;
    void [page, fields];
  },
  'onChange-column-info': ({ type, columns }) => {
    const change: 'resize' | 'order' | 'display' | 'sort' = type;
    const index: number = columns[0].index;
    void [change, index];
  },
};
h(EvGrid, gridProps);

// @ts-expect-error the columns prop is an array of column definitions
const invalidGridColumns: InstanceType<typeof EvGrid>['$props'] = { columns: { id: 'ID' } };
const invalidGridCheckbox: InstanceType<typeof EvGrid>['$props'] = {
  // @ts-expect-error checkbox modes are restricted to supported values
  option: { useCheckbox: { mode: 'all' } },
};

const treeGridProps: InstanceType<typeof EvTreeGrid>['$props'] = {
  rows: [{ id: 1, name: 'Parent', children: [{ id: 2, name: 'Child' }] }],
  columns: [{ caption: 'Name', field: 'name', type: 'string', expandColumn: true }],
  option: { useCheckbox: { mode: 'each' }, useSort: true },
  onToggleRow: ({ row, isExpand }) => {
    const expanded: boolean = isExpand;
    const index: number = row.index;
    const name: unknown = row.name;
    void [expanded, index, name];
  },
};
h(EvTreeGrid, treeGridProps);
// @ts-expect-error tree grid row children must be an array of rows
const invalidTreeGridRow: InstanceType<typeof EvTreeGrid>['$props'] = { rows: [{ children: 1 }] };
// @ts-expect-error tree grid takes an array of root rows
const invalidTreeGridRoot: InstanceType<typeof EvTreeGrid>['$props'] = { rows: { id: 1 } };

const treeProps: InstanceType<typeof EvTree>['$props'] = {
  data: [{ title: 'Parent', children: [{ title: 'Child', value: 1 }] }],
  onClickNode: (node) => {
    const title: string = node.title;
    // @ts-expect-error click only emits the title and value
    void node.children;
    void title;
  },
};
h(EvTree, treeProps);
// @ts-expect-error tree node titles must be strings
const invalidTreeNode: InstanceType<typeof EvTree>['$props'] = { data: [{ title: 1 }] };

const schedulerProps: InstanceType<typeof EvScheduler>['$props'] = {
  modelValue: [[false, true]],
  rowLabels: ['09:00'],
  colLabels: ['MON', 'TUE'],
  'onUpdate:modelValue': (selection) => {
    const checked: boolean = selection[0][0];
    void checked;
  },
};
h(EvScheduler, schedulerProps);
// @ts-expect-error a scheduler model is a two-dimensional boolean matrix
const invalidSchedulerModel: InstanceType<typeof EvScheduler>['$props'] = { modelValue: [true] };

const paginationProps: InstanceType<typeof EvPagination>['$props'] = {
  modelValue: 1,
  total: '100',
  perPage: 20,
  pagePerJump: 5,
  order: 'right',
  onChange: (page) => {
    const nextPage: number | string = page;
    void nextPage;
  },
};
h(EvPagination, paginationProps);
// @ts-expect-error unsupported pagination alignment
const invalidPaginationOrder: InstanceType<typeof EvPagination>['$props'] = { order: 'top' };

declare const grid: InstanceType<typeof EvGrid>;
declare const scheduler: InstanceType<typeof EvScheduler>;
declare const pagination: InstanceType<typeof EvPagination>;

grid.$emit('check-row', true, 0, [1]);
// @ts-expect-error the checkbox event begins with the checked state
grid.$emit('check-row', new Event('change'), 0, [1]);
grid.onApplyFilter('id', [{ comparison: '>=', operator: 'and', value: '1' }]);
scheduler.selectColumn(0);
pagination.changePage(2);

void [
  invalidGridColumns,
  invalidGridCheckbox,
  invalidTreeGridRow,
  invalidTreeGridRoot,
  invalidTreeNode,
  invalidSchedulerModel,
  invalidPaginationOrder,
];
