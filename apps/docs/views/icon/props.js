import { parseComponent } from 'vue-template-compiler';
import mdText from '!!raw-loader!./api/icon.md';
import Default from './example/Default';
import DefaultRaw from '!!raw-loader!./example/Default';

export default {
  mdText,
  components: {
    Default: {
      description: 'EVUI에서 제공하는 아이콘입니다.',
      component: Default,
      parsedData: parseComponent(DefaultRaw),
    },
  },
};
