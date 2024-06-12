import type { Meta, StoryObj } from '@storybook/vue3';
import { EvContextMenu } from '@evui/ui';
import { ref } from 'vue';

const meta: Meta<typeof EvContextMenu> = {
  component: EvContextMenu,
};

export default meta;
type Story = StoryObj<typeof EvContextMenu>;

// Story 에 render가 필요 없다면 삭제해주세요.
const StoryTemplate: Story = {
  render: () => ({
    components: { EvContextMenu },
    setup() {
      const menu = ref(null);
      const menuItems = ref([
        {
          text: 11111,
          iconClass: 'ev-icon-s-panel-out',
          click: () => console.log('CLICK text1'),
        },
        {
          text: 'TEXT22222222222222',
          iconClass: 'ev-icon-s-pause',
          children: [
            {
              text: 'TEXT2-111111111111111',
              iconClass: 'ev-icon-server2',
              click: () => console.log('CLICK TEXT2-111111111111111'),
            },
            {
              text: 'TEXT2-2',
              value: 'value22',
              iconClass: 'ev-icon-server',
            },
            {
              text: 'TEXT2-3',
              iconClass: 'ev-icon-compress',
              children: [
                {
                  text: 'TEXT2-3-1',
                  iconClass: 'ev-icon-bell-warning',
                  click: () => console.log('CLICK TEXT2-3-1'),
                },
                {
                  text: 'TEXT2-3-2',
                  iconClass: 'ev-icon-expand2',
                },
              ],
            },
          ],
        },
        {
          text: 'TEXT3',
          click: () => console.log('CLICK TEXT3'),
        },
        {
          text: 'TEXT4',
          click: () => console.log('CLICK TEXT4'),
        },
        {
          text: 'TEXT5',
          children: [
            {
              text: 'TEXT5-1',
              click: () => console.log('CLICK TEXT5-1'),
            },
            {
              text: 'TEXT5-2',
              iconClass: 'ev-icon-expand',
            },
          ],
        },
      ]);
      const openContextMenu = (e) => {
        // @ts-expect-error TODO
        menu.value?.show(e);
      };

      return {
        menu,
        menuItems,
        openContextMenu,
      };
    },
    template: `
    <div class="case">
    <div
      class="sample-context"
      @contextmenu.prevent="openContextMenu"
    >
      컨텍스트 메뉴 우클릭 영역
      <ev-context-menu
        ref="menu"
        :items="menuItems"
      />
    </div>

  </div>
  </div>
              `,
  }),
};

export const Default: Story = {
  ...StoryTemplate,
  args: {},
};
