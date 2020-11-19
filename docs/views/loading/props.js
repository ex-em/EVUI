import { parseComponent } from 'vue-template-compiler';
import mdText from 'raw-loader!./api/loading.md';
import Default from './example/Default';
import DefaultRaw from '!!raw-loader!./example/Default';

export default {
  mdText,
  components: {
    Default: {
      description: '데이터가 로드되는 동안 애니메이션을 보여줍니다.',
      component: Default,
      parsedData: parseComponent(DefaultRaw),
    },
  },
};
