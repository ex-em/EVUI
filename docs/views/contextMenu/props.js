import { parse } from '@vue/compiler-sfc';
import mdText from './api/contextMenu.md?raw';
import Default from './example/Default';
import DefaultRaw from './example/Default?raw';

export default {
  mdText,
  components: {
    Default: {
      description: '영역 내 우클릭하여 컨텍스트 메뉴를 열 수 있습니다.',
      component: Default,
      parsedData: parse(DefaultRaw).descriptor,
    },
  },
};
