import type { Meta, StoryObj } from '@storybook/vue3';
import { EvInputNumber } from 'evui';

const meta: Meta<typeof EvInputNumber> = {
  component: EvInputNumber,
};

export default meta;
type Story = StoryObj<typeof EvInputNumber>;

// Story 에 render가 필요 없다면 삭제해주세요.
const StoryTemplate: Story = {
  render: (args) => ({
    components: { EvInputNumber },
    setup() {
      return { args };
    },
    template: `
    <div style="width: 300px">
              <EvInputNumber v-bind="args">
              </EvInputNumber>
              </div>
              `,
  }),
};

export const Default: Story = {
  ...StoryTemplate,
  args: {
    modelValue: 0,
    max: 10,
    min: 0,
    step: 1,
  },
};
