import type { Meta, StoryObj } from '@storybook/vue3';
import { EvTabs, EvTabPanel } from 'evui';

const meta: Meta<typeof EvTabs> = {
  component: EvTabs,
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof EvTabs>;

// Story 에 render가 필요 없다면 삭제해주세요.
const StoryTemplate: Story = {
  render: (args) => ({
    components: { EvTabs, EvTabPanel },
    setup() {
      return { args };
    },
    template: `
    <ev-tabs
      v-bind="args"
    >
      <ev-tab-panel
        v-for="(item, idx) in args.panels"
        :key="item.name"
        :text="item.text"
        :value="item.value"
      >
        <div v-html="item.content"/>
      </ev-tab-panel>
    </ev-tabs>
              `,
  }),
};

export const Default: Story = {
  ...StoryTemplate,
  args: {
    modelValue: 'tab1',
    panels: [
      {
        text: 'Tab 1',
        value: 'tab1',
        iconClass: 'ev-icon-PA',
      },
      {
        text: 'Tab 2',
        value: 'tab2',
      },
    ],
  },
};
