import { parse } from '@vue/compiler-sfc';
import mdText from './api/toggle.md?raw';
import Default from './example/Default';
import DefaultRaw from './example/Default?raw';

export default {
  mdText,
  components: {
    Default: {
      description: 'ON/OFF flag 값이 존재하는 일반적인 토글입니다.',
      component: Default,
      parsedData: parse(DefaultRaw).descriptor,
    },
  },
};
