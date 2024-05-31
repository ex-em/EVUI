import type { Meta, StoryObj } from '@storybook/vue3';
import { EvCheckbox } from '@evui/ui';

const meta: Meta<typeof EvCheckbox> = {
  component: EvCheckbox,
};

export default meta;
type Story = StoryObj<typeof EvCheckbox>;

// Story 에 render가 필요 없다면 삭제해주세요.
const StoryTemplate: Story = {
  render: (args) => ({
    components: { EvCheckbox },
    setup() {
      return { args };
    },
    template: `
    <ev-checkbox
      label="Option A"
      tooltip-title="1번 옵션"
    >
      A
    </ev-checkbox>
    <ev-checkbox
      label="Option B"
      tooltip-title="2번 옵션"
    />
    <div>
      <ev-checkbox
        label="Option C"
        tooltip-title="3번 옵션"
      />
    </div>
    <div>
      <ev-checkbox
        label="Option D"
        tooltip-title="4번 옵션"
      />
    </div>
              </EvCheckboxGroup>
              `,
  }),
};

export const Default: Story = {
  ...StoryTemplate,
  args: {
    label: 'Checkbox',
  },
};
