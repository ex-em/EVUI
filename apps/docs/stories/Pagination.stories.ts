import type { Meta, StoryObj } from '@storybook/vue3';
import { EvPagination } from 'evui';
import { ref } from 'vue';
const meta: Meta<typeof EvPagination> = {
  component: EvPagination,
};

export default meta;
type Story = StoryObj<typeof EvPagination>;

// Story 에 render가 필요 없다면 삭제해주세요.
const StoryTemplate: Story = {
  render: (args) => ({
    components: { EvPagination },
    setup() {
      const modelValue = ref(1);
      return { args, modelValue };
    },
    template: `
              <EvPagination v-bind="args" v-model="modelValue">
              </EvPagination>
              `,
  }),
};

export const Default: Story = {
  ...StoryTemplate,
  args: {
    total: 100,
    modelValue: 1,
    perPage: 10,
    order: 'center',
  },
};
