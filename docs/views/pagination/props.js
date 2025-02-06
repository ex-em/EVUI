import { parse } from '@vue/compiler-sfc';
import mdText from './api/pagination.md?raw';
import Default from './example/Default';
import DefaultRaw from './example/Default?raw';

export default {
  mdText,
  components: {
    Default: {
      description: '데이터를 분할하여 별도의 페이지에 표시하기 위해 사용합니다.',
      component: Default,
      parsedData: parse(DefaultRaw).descriptor,
    },
  },
};
