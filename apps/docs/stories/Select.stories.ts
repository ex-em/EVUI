import type { Meta, StoryObj } from '@storybook/vue3';
import { EvSelect } from 'evui';
import { ref } from 'vue';

const meta: Meta<typeof EvSelect> = {
  component: EvSelect,
};

export default meta;
type Story = StoryObj<typeof EvSelect>;

// Story 에 render가 필요 없다면 삭제해주세요.
const StoryTemplate: Story = {
  render: (args) => ({
    components: { EvSelect },
    setup() {
      const mv = ref('value1');
      return { args, mv };
    },
    template: `
              <EvSelect v-bind="args" v-model="mv">
              </EvSelect>
              `,
  }),
};

export const Default: Story = {
  ...StoryTemplate,
  args: {
    items: [
      { name: 'name1', value: 'value1' },
      { name: 'name2', value: 'value2' },
      { name: 'name3', value: 'value3', disabled: true },
    ],
    placeholder: 'placeholder',
  },
};
