import type { Meta, StoryObj } from '@storybook/vue3';
import { EvTreeGrid } from 'evui';
import { ref } from 'vue';
const meta: Meta<typeof EvTreeGrid> = {
  component: EvTreeGrid,
};

export default meta;
type Story = StoryObj<typeof EvTreeGrid>;

const StoryTemplate: Story = {
  render: (args) => ({
    components: { EvTreeGrid },
    setup() {
      const tableData = ref([
        {
          id: 'Exem 0',
          date: '2016-05-01',
          name: '1111',
          expand: true,
        },
        {
          id: 'Exem 1',
          date: '2016-05-01',
          name: '2222',
          value: 123,
          expand: true,
          children: [
            {
              id: 'Exem 2',
              date: '2016-05-02',
              name: '2',
              value: 222,
              expand: false,
              children: [
                {
                  id: 'Exem 3',
                  date: '2016-05-02',
                  name: '3',
                  value: 3333,
                  uncheckable: true,
                },
                {
                  id: 'Exem 4',
                  date: '2016-05-02',
                  name: '4',
                  expand: false,
                  uncheckable: true,
                  children: [
                    {
                      id: 'Exem 5',
                      date: '2016-05-02',
                      name: '5',
                      children: [
                        {
                          id: 'Exem 51',
                          date: '2016-05-02',
                          name: '1251',
                          children: [
                            {
                              id: 'Exem 52',
                              date: '2016-05-02',
                              name: '20000',
                            },
                          ],
                        },
                      ],
                    },
                    {
                      id: 'Exem 6',
                      date: '2016-05-02',
                      name: '6',
                    },
                  ],
                },
              ],
            },
            {
              id: 'Exem 7',
              date: '2016-05-03',
              name: '7',
              children: [
                {
                  id: 'Exem 8',
                  date: '2016-05-03',
                  name: '8',
                  value: 333,
                },
                {
                  id: 'Exem 9',
                  date: '2016-05-03',
                  name: '9',
                },
                {
                  id: 'Exem 10',
                  date: '2016-05-03',
                  name: '10',
                },
              ],
            },
            {
              id: 'Exem 11',
              date: '2016-05-04',
              name: '11',
            },
          ],
        },
      ]);

      const columns = [
        { caption: 'ID', field: 'id', type: 'number' },
        { caption: 'Date', field: 'date', type: 'string' },
        {
          caption: 'Name',
          field: 'name',
          type: 'float',
          summaryType: 'sum',
          summaryOnlyTopParent: true,
          summaryRenderer: 'Sum: {0} 최상위 부모만 summary',
          decimal: 1,
        },
        {
          caption: 'Value',
          field: 'value',
          type: 'number',
          summaryType: 'sum',
          summaryRenderer: 'Sum: {0} 모든 row summary',
          decimal: 1,
        },
      ];

      return { args, tableData, columns };
    },
    template: `
              <EvTreeGrid v-bind="args" :rows="tableData" :columns="columns"
              :width="'100%'"
              :height="300"
              :option="{
                adjust: true,
                showHeader: showHeaderMV,
                rowHeight: rowHeightMV,
                columnWidth: columnWidthMV,
                useGridSetting: {
                  use: useGridSettingMV,
                  customContextMenu: gridSettingMenuItems,
                },
                useCheckbox: {
                  use: useCheckboxMV,
                  mode: checkboxModeMV,
                  headerCheck: headerCheckMV,
                },
                useSelection: useSelection,
                customContextMenu: menuItems,
                style: {
                  stripe: stripeMV,
                  border: borderMV,
                  highlight: highlightMV,
                },
                expandIcon: expandIconMV,
                collapseIcon: collapseIconMV,
                parentIcon: parentIconMV,
                childIcon: childIconMV,
                page: pageInfo,
                useSummary: true,
              }"
              />
              `,
  }),
};

export const Default: Story = {
  ...StoryTemplate,
  args: {},
};
