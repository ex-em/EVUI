import { parse } from '@vue/compiler-sfc';
import mdText from './api/loading.md?raw';
import Default from './example/Default';
import DefaultRaw from './example/Default?raw';

export default {
  mdText,
  components: {
    Default: {
      description: '데이터가 로드되는 동안 애니메이션을 보여줍니다.',
      component: Default,
      parsedData: parse(DefaultRaw).descriptor,
    },
  },
};
