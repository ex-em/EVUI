import { parse } from '@vue/compiler-sfc';
import mdText from './api/icon.md?raw';
import Default from './example/Default';
import DefaultRaw from './example/Default?raw';

export default {
  mdText,
  components: {
    Default: {
      description: 'EVUI에서 제공하는 아이콘입니다.',
      component: Default,
      parsedData: parse(DefaultRaw).descriptor,
    },
  },
};
