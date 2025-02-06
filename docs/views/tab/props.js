import { parse } from '@vue/compiler-sfc';
import mdText from './api/tabs.md?raw';
import Default from './example/Default';
import DefaultRaw from './example/Default?raw';

export default {
  mdText,
  components: {
    Default: {
      description: '탭을 활용하여 여러 콘텐츠를 한 영역에서 보여줄 수 있습니다',
      component: Default,
      parsedData: parse(DefaultRaw).descriptor,
    },
  },
};
