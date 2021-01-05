import { parseComponent } from 'vue-template-compiler';
import mdText from '!!raw-loader!./api/tabs.md';
import Default from './example/Default';
import DefaultRaw from '!!raw-loader!./example/Default';

export default {
  mdText,
  components: {
    Default: {
      description: '탭을 활용하여 여러 콘텐츠를 한 영역에서 보여줄 수 있습니다',
      component: Default,
      parsedData: parseComponent(DefaultRaw),
    },
  },
};
