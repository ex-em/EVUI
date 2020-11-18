import { parseComponent } from 'vue-template-compiler';
import mdText from 'raw-loader!./api/loading.md';
import Default from './example/Default';
import DefaultRaw from '!!raw-loader!./example/Default';

export default {
  mdText,
  components: {
    Default: {
      description: '로딩마스크가 바인딩 값에 의해서 결정됩니다.',
      component: Default,
      parsedData: parseComponent(DefaultRaw),
    },
  },
};
