import { parseComponent } from 'vue-template-compiler';
import mdText from '!!raw-loader!./api/menu.md';
import Default from './example/Default';
import DefaultRaw from '!!raw-loader!./example/Default';

export default {
  mdText,
  components: {
    Default: {
      description: '어플리케이션 탐색을 위한 목록을 구성할 수 있습니다',
      component: Default,
      parsedData: parseComponent(DefaultRaw),
    },
  },
};
