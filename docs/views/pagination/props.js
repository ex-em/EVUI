import { parseComponent } from 'vue-template-compiler';
import mdText from 'raw-loader!./api/pagination.md';
import Default from './example/Default';
import DefaultRaw from '!!raw-loader!./example/Default';

export default {
  mdText,
  components: {
    Default: {
      description: '데이터를 분할하여 별도의 페이지에 표시하기 위해 사용합니다.',
      component: Default,
      parsedData: parseComponent(DefaultRaw),
    },
  },
};
