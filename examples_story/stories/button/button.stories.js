import { action } from '@storybook/addon-actions';
import { withKnobs, select, text, boolean } from '@storybook/addon-knobs';
import EvButton from '@/components/button/button';

export default {
  title: 'Button',
  component: EvButton,
  decorators: [withKnobs],
};

export const appearance = () => ({
  components: { EvButton },
  template: `
    <div>
      <ev-button :type="'default'">Default</ev-button>
      <ev-button :type="'primary'">Primary</ev-button>
      <ev-button :type="'ghost'">Ghost</ev-button>
      <ev-button :type="'dashed'">Dashed</ev-button>
      <ev-button :type="'text'">Text</ev-button>
      <ev-button :type="'info'">Info</ev-button>
      <ev-button :type="'success'">Success</ev-button>
      <ev-button :type="'warning'">Warning</ev-button>
      <ev-button :type="'error'">Error</ev-button>    
    </div>
  `,
});


export const size = () => ({
  components: { EvButton },
  template: `
    <div>
      <ev-button :size="'small'">Small</ev-button>
      <ev-button :size="'medium'">Medium</ev-button>
      <ev-button :size="'large'">Large</ev-button>
    </div>
  `,
});

export const shape = () => ({
  components: { EvButton },
  template: `
    <div>
      <ev-button :shape="'square'">Square</ev-button>
      <ev-button :shape="'radius'">Radius</ev-button>
      <ev-button :shape="'circle'">Circle</ev-button>
    </div>
  `,
});

export const actions = () => ({
  components: { EvButton },
  template: `
      <ev-button
        @click="onClick"
      >
        Click Me!!
      </ev-button>
    `,
  methods: {
    onClick: action('click'),
  },
});

export const custom = () => ({
  props: {
    label: {
      type: String,
      default: text('Text', 'Button Label'),
    },
    htmlType: {
      type: String,
      default: select('Html Type', {
        button: 'button',
        submit: 'submit',
        reset: 'reset',
      }, 'button'),
    },
    type: {
      type: String,
      default: select('Appearance', {
        default: 'default',
        primary: 'primary',
        ghost: 'ghost',
        dashed: 'dashed',
        text: 'text',
        info: 'info',
        success: 'success',
        warning: 'warning',
        error: 'error',
      }, 'default'),
    },
    size: {
      type: String,
      default: select('Size', {
        small: 'small',
        medium: 'medium',
        large: 'large',
      }, 'small'),
    },
    shape: {
      type: String,
      default: select('Shape', {
        square: 'square',
        radius: 'radius',
        circle: 'circle',
      }, 'square'),
    },
    disabled: {
      type: Boolean,
      default: boolean('disabled', false),
    },
  },
  components: { EvButton },
  template: `
      <ev-button
        :type="type"
        :html-type="htmlType"
        :size="size"
        :shape="shape"
        :disabled="disabled"
      >
        {{ label }}
      </ev-button>
    `,
});
