import type { Meta, StoryObj } from '@storybook/vue3';
import { EvRadio, EvRadioGroup } from '@evui/ui';
import { ref } from 'vue';

const meta: Meta<typeof EvRadioGroup> = {
  component: EvRadioGroup,
};

export default meta;
type Story = StoryObj<typeof EvRadioGroup>;

const StoryTemplate: Story = {
  render: (args) => ({
    components: { EvRadio, EvRadioGroup },
    setup() {
      const radioGroup1 = ref('Option A');
      return { args, radioGroup1 };
    },
    template: `
    <ev-radio-group
    v-model="radioGroup1"
  >
    <ev-radio label="Option A" />
    <ev-radio label="Option B" />
    <ev-radio label="Option C" />
  </ev-radio-group>
              `,
  }),
};

export const Default: Story = {
  ...StoryTemplate,
  args: {},
};
