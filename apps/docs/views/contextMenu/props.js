import { parseComponent } from 'vue-template-compiler';
import mdText from '!!raw-loader!./api/contextMenu.md';
import Default from './example/Default';
import DefaultRaw from '!!raw-loader!./example/Default';

export default {
  mdText,
  components: {
    Default: {
      description: '영역 내 우클릭하여 컨텍스트 메뉴를 열 수 있습니다.',
      component: Default,
      parsedData: parseComponent(DefaultRaw),
    },
  },
};
