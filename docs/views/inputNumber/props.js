import { parse } from '@vue/compiler-sfc';
import mdText from './api/inputNumber.md?raw';
import Default from './example/Default';
import DefaultRaw from './example/Default?raw';

export default {
  mdText,
  components: {
    Default: {
      description: 'Number 입력 가능한 input 컴포넌트입니다.',
      component: Default,
      parsedData: parse(DefaultRaw).descriptor,
    },
  },
};
