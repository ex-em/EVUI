import { parseComponent } from 'vue-template-compiler';
import mdText from 'raw-loader!./api/window.md';
import Default from './example/Default';
import DefaultRaw from '!!raw-loader!./example/Default';

export default {
  mdText,
  components: {
    Default: {
      description: '트리거 시 나타나는 윈도우 모달창 기능입니다.',
      component: Default,
      parsedData: parseComponent(DefaultRaw),
    },
  },
};
