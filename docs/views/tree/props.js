import { parseComponent } from 'vue-template-compiler';
import mdText from 'raw-loader!./api/tree.md';
import Default from './example/Default';
import DefaultRaw from '!!raw-loader!./example/Default';

export default {
  mdText,
  components: {
    Default: {
      description: '트리 컴포넌트입니다.',
      component: Default,
      parsedData: parseComponent(DefaultRaw),
    },
  },
};
