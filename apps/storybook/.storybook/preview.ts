import { type Preview, setup } from '@storybook/vue3';
import { App } from 'vue';
import EVUI, { EvMessage } from '@evui/ui';
import '@evui/ui/style'

setup((app: App) => {
  app.use(EVUI);
  app.config.globalProperties.$message = EvMessage;
});

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
