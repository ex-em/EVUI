import type { Meta, StoryObj } from '@storybook/vue3';
import { EvIcon } from 'evui';
import iconStyles from '../../../packages/evui/src/style/lib/icon.css?raw';

const iconNames = [...iconStyles.matchAll(/\.ev-icon-([\w-]+)::before/g)].map(
  (match) => match[1]
);

const meta: Meta<typeof EvIcon> = {
  component: EvIcon,
};

export default meta;
type Story = StoryObj<typeof EvIcon>;

// Story 에 render가 필요 없다면 삭제해주세요.
const StoryTemplate: Story = {
  render: (args) => ({
    components: { EvIcon },
    setup() {
      return { args };
    },
    template: `
    <div style="width: 500px; overflow-wrap: anywhere;">
    ${iconNames
      .map((i) => `<EvIcon icon="ev-icon-${i}" v-bind="args" ></EvIcon>`)
      .join('  ')}
    </div>
              `,
  }),
};

export const Default: Story = {
  ...StoryTemplate,
  args: {
    size: 'medium',
  },
};
