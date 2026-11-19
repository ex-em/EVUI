import type { StorybookConfig } from '@storybook/vue3-vite';

const config: StorybookConfig = {
  stories: [
    '../stories/**/*.mdx',
    '../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-a11y',
    {
      name: '@storybook/addon-docs',
      options: {
        csfPluginOptions: null,
        mdxPluginOptions: {},
      },
    },
  ],
  docs: {
    defaultName: 'EVUI',
  },
  framework: '@storybook/vue3-vite',
};
export default config;
