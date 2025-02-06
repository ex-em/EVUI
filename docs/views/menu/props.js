import { parse } from '@vue/compiler-sfc';
import mdText from './api/menu.md?raw';
import Default from './example/Default';
import DefaultRaw from './example/Default?raw';

export default {
  mdText,
  components: {
    Default: {
      description: '어플리케이션 탐색을 위한 목록을 구성할 수 있습니다',
      component: Default,
      parsedData: parse(DefaultRaw).descriptor,
    },
  },
};
