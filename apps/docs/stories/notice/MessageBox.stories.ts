import type { Meta, StoryObj } from '@storybook/vue3';
import { EvButton, EvMessageBox } from 'evui';
import { getCurrentInstance } from 'vue';

const meta: Meta<typeof EvMessageBox> = {
  component: EvButton,
  argTypes: {
    type: {
      control: {
        type: 'select',
      },
      options: ['success', 'error', 'warning', 'info'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof EvMessageBox>;

const StoryTemplate: Story = {
  render: (args) => ({
    components: { EvMessageBox, EvButton },
    setup() {
      const app = getCurrentInstance()?.appContext.config.globalProperties;
      const onClick = () => {
        app!.$messageBox(args);
      };
      return { args, onClick };
    },
    template: `
              <EvButton @click="onClick">
                Open Message Box
              </EvButton>
              `,
  }),
};

export const Default: Story = {
  ...StoryTemplate,
  args: {
    message: 'success message',
    type: 'success',
  },
};
