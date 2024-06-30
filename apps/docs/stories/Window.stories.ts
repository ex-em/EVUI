import type { Meta, StoryObj } from '@storybook/vue3';
import { EvWindow } from 'evui';
import { ref } from 'vue';

const meta: Meta<typeof EvWindow> = {
  component: EvWindow,
};

export default meta;
type Story = StoryObj<typeof EvWindow>;

// Story 에 render가 필요 없다면 삭제해주세요.
const StoryTemplate: Story = {
  render: (args) => ({
    components: { EvWindow },
    setup() {
      const isVisible1 = ref(false);
      const clickButton1 = () => {
        isVisible1.value = true;
      };
      return { args, isVisible1, clickButton1 };
    },
    template: `
    <ev-window
    v-bind="args"
      v-model:visible="isVisible1"
      title="WINDOW TITLE"
    >
      <div>visible prop을 통해 윈도우를 여닫을 수 있습니다.</div>
    </ev-window>
    <div class="description">
      <button
        class="btn"
        @click="clickButton1"
      >
        click to open window!
      </button>
    </div>
              `,
  }),
};

export const Default: Story = {
  ...StoryTemplate,
  args: {
    escClose: true,
  },
};
