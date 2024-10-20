import { parse } from '@vue/compiler-sfc';
import mdText from './api/datePicker.md?raw';
import Default from './example/Default';
import DefaultRaw from './example/Default?raw';

export default {
  mdText,
  components: {
    Default: {
      description: 'Date를 선택할 수 있는 컴포넌트입니다.',
      component: Default,
      parsedData: parse(DefaultRaw).descriptor,
    },
  },
};
