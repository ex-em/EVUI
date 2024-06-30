import type { Meta, StoryObj } from '@storybook/vue3';
import { EvToggle } from 'evui';

const meta: Meta<typeof EvToggle> = {
  component: EvToggle,
  argTypes: {
    modelValue: {
      control: {
        type: 'boolean',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof EvToggle>;

const StoryTemplate: Story = {
  render: (args) => ({
    components: { EvToggle },
    setup() {
      return { args };
    },
    template: `
              <EvToggle v-bind="args">
              </EvToggle>
              `,
  }),
};

export const Default: Story = {
  ...StoryTemplate,
  args: {
    modelValue: false,
  },
};
