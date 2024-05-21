import { type Preview, setup } from '@storybook/vue3';
import { App } from 'vue';
import EVUI from '@evui/ui';
import '@evui/ui/style'

setup((app: App) => {
  app.use(EVUI);
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
