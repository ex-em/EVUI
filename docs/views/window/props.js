import { parse } from '@vue/compiler-sfc';
import mdText from './api/window.md?raw';
import Default from './example/Default';
import DefaultRaw from './example/Default?raw';

export default {
  mdText,
  components: {
    Default: {
      description: '트리거 시 나타나는 윈도우 모달창 기능입니다.',
      component: Default,
      parsedData: parse(DefaultRaw).descriptor,
    },
  },
};
