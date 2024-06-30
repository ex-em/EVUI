import type { Meta, StoryObj } from '@storybook/vue3';
import { EvTextField } from 'evui';

const meta: Meta<typeof EvTextField> = {
  component: EvTextField,
  argTypes: {
    type: {
      control: {
        type: 'select',
      },
      options: ['text', 'password', 'number', 'email'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof EvTextField>;

const StoryTemplate: Story = {
  render: (args) => ({
    components: { EvTextField },
    setup() {
      return { args };
    },
    template: `
    <div style="width: 300px">

              <EvTextField v-bind="args">
              </EvTextField>
    </div>
              `,
  }),
};

export const Default: Story = {
  ...StoryTemplate,
  args: {
    modelValue: '',
    type: 'text',
  },
};
