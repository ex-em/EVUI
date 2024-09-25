import { parse } from '@vue/compiler-sfc';
import mdText from './api/progress.md?raw';
import Default from './example/Default';
import DefaultRaw from './example/Default?raw';

export default {
  mdText,
  components: {
    Default: {
      description: '현재 작업의 진행상황을 표기하고 사용자에게 현재 상태를 알리는데 사용됩니다.',
      component: Default,
      parsedData: parse(DefaultRaw).descriptor,
    },
  },
};
