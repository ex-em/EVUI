import { type Preview, setup } from '@storybook/vue3';
import { App } from 'vue';
import EVUI, { EvMessage, EvMessageBox, EvNotification } from '@evui/ui';
import '@evui/ui/style';

setup((app: App) => {
  app.use(EVUI);
  app.config.globalProperties.$message = EvMessage;
  app.config.globalProperties.$messageBox = EvMessageBox;
  app.config.globalProperties.$notification = EvNotification;
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
  tags: ['autodocs'],
};

export default preview;
