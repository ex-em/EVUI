import type { Meta, StoryObj } from '@storybook/vue3';
import { EvButton, EvMessage } from '@evui/ui';
import { getCurrentInstance } from 'vue';

const meta: Meta<typeof EvMessage> = {
  component: EvButton,
  argTypes: {
    message: {
      control: 'text',
    },
    type: {
      control: {
        type: 'select',
      },
      options: ['success', 'error', 'warning', 'info'],
    },
    duration: {
      control: 'number',
    },
    showClose: {
      control: 'boolean',
    },
    iconClass: {
      control: 'text',
    },
    onClose: {
      action: 'close',
    },
  }
}

export default meta;
type Story = StoryObj<typeof EvMessage>;

// Story 에 render가 필요 없다면 삭제해주세요.
const StoryTemplate: Story = {
  render: (args) => ({
    components: { EvMessage, EvButton },
    setup() {
      const app = getCurrentInstance()?.appContext.config.globalProperties;
      const onClick = () => {
        app!.$message(args);
      }
      return { args, onClick };
    },
    template: `
              <EvButton @click="onClick">
                Open Message
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
