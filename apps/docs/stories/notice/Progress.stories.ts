import type { Meta, StoryObj } from '@storybook/vue3';
import { EvProgress } from 'evui';

const meta: Meta<typeof EvProgress> = {
  component: EvProgress,
};

export default meta;
type Story = StoryObj<typeof EvProgress>;

// Story 에 render가 필요 없다면 삭제해주세요.
const StoryTemplate: Story = {
  render: (args) => ({
    components: { EvProgress },
    setup() {
      return { args };
    },
    template: `
              <EvProgress v-bind="args">
              </EvProgress>
              `,
  }),
};

export const Default: Story = {
  ...StoryTemplate,
  args: {
    color: '#1a90ff',
    modelValue: 50,
    innerText: '50%',
    strokeWidth: 20,
  },
};
