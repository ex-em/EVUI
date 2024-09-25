import { parse } from '@vue/compiler-sfc';
import mdText from './api/tree.md?raw';
import Default from './example/Default';
import DefaultRaw from './example/Default?raw';

export default {
  mdText,
  components: {
    Default: {
      description: '트리 컴포넌트입니다.',
      component: Default,
      parsedData: parse(DefaultRaw).descriptor,
    },
  },
};
