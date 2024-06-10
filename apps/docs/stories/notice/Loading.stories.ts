import type { Meta, StoryObj } from '@storybook/vue3';
import { EvLoading } from '@evui/ui';

const meta: Meta<typeof EvLoading> = {
  component: EvLoading,
  argTypes: {
    modelValue: {
      control: {
        type: 'boolean',
      },
    },
    clickOutside: {
      control: {
        type: 'boolean',
      },
    },
    fullscreen: {
      control: {
        type: 'boolean',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof EvLoading>;

const StoryTemplate: Story = {
  render: (args) => ({
    components: { EvLoading },
    setup() {
      return { args };
    },
    template: `
              <EvLoading v-bind="args">
              </EvLoading>
              `,
  }),
};

export const Default: Story = {
  ...StoryTemplate,
  args: {
    modelValue: true,
  },
};
