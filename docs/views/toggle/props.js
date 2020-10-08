import { parseComponent } from 'vue-template-compiler';
import mdText from 'raw-loader!./api/toggle.md';
import Default from './example/Default';
import DefaultRaw from '!!raw-loader!./example/Default';

export default {
  mdText,
  components: {
    Default: {
      description: 'ON/OFF flag 값이 존재하는 일반적인 토글입니다.',
      component: Default,
      parsedData: parseComponent(DefaultRaw),
    },
  },
};
