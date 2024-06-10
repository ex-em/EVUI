import type { Meta, StoryObj } from '@storybook/vue3';
import { EvButton } from '@evui/ui';

const meta: Meta<typeof EvButton> = {
  component: EvButton,
};

export default meta;
type Story = StoryObj<typeof EvButton>;

const StoryTemplate: Story = {
  render: (args) => ({
    components: { EvButton },
    setup() {
      return { args };
    },
    template: `
              <EvButton v-bind="args">
              hihihihih
              </EvButton>
              `,
  }),
};

export const Default: Story = {
  ...StoryTemplate,
  args: {
    type: 'warning',
    size: 'medium',
    shape: 'circle',
    htmlType: 'button',
    disabled: false,
    autoFocus: false,
  },
};
