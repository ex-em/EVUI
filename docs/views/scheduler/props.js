import { parse } from '@vue/compiler-sfc';
import mdText from './api/scheduler.md?raw';
import Default from './example/Default';
import DefaultRaw from './example/Default?raw';

export default {
  mdText,
  components: {
    Default: {
      description: '스케쥴러는 정해진 날짜 내 시간 스케쥴을 선택하는 컴포넌트입니다.',
      component: Default,
      parsedData: parse(DefaultRaw).descriptor,
    },
  },
};
