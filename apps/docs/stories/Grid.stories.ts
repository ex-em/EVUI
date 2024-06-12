import type { Meta, StoryObj } from '@storybook/vue3';
import { EvGrid } from '@evui/ui';

const meta: Meta<typeof EvGrid> = {
  component: EvGrid,
};

export default meta;
type Story = StoryObj<typeof EvGrid>;

// Story 에 render가 필요 없다면 삭제해주세요.
const StoryTemplate: Story = {
  render: (args) => ({
    components: { EvGrid },
    setup() {
      const getData = (count, startIndex) => {
        const temp = [];
        const roles = ['Common', 'Admin'];
        const booleans = [true, false];
        for (let ix = startIndex; ix < startIndex + count; ix++) {
          temp.push([
            `user_${ix + 1}`,
            roles[ix % 2],
            ix,
            booleans[ix % 2],
            '010-0000-0000',
            'kmn0827@ex-em.com',
            '2020.08.04 14:15',
          ]);
        }
        return temp;
      };

      return { args, data: getData(50, 0) };
    },
    template: `
              <EvGrid v-bind="args" :rows="data">
              </EvGrid>
              `,
  }),
};

export const Default: Story = {
  ...StoryTemplate,
  args: {
    columns: [
      { caption: 'Name', field: 'userName', type: 'string', width: 80 },
      {
        caption: 'Role',
        field: 'role',
        type: 'string',
        width: 80,
        hiddenDisplay: true,
      },
      { caption: 'number', field: 'number', type: 'number', width: 80 },
      { caption: 'boolean', field: 'boolean', type: 'boolean', width: 80 },
      { caption: 'Phone', field: 'phone', type: 'string', sortable: false },
      { caption: 'Email', field: 'email', type: 'string', width: 80 },
      { caption: 'Last Login', field: 'lastLogin', type: 'string' },
    ],
  },
};
