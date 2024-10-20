import { parse } from '@vue/compiler-sfc';
import mdText from './api/message.md?raw';
import Default from './example/Default';
import DefaultRaw from './example/Default?raw';

export default {
  mdText,
  components: {
    Default: {
      description: '사용자 동작에 대한 알림을 표시할 수 있습니다. (버튼 클릭 시 메시지 창을 확인할 수 있습니다.)',
      component: Default,
      parsedData: parse(DefaultRaw).descriptor,
    },
  },
};
