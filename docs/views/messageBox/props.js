import { parse } from '@vue/compiler-sfc';
import mdText from './api/messageBox.md?raw';
import Default from './example/Default';
import DefaultRaw from './example/Default?raw';

export default {
  mdText,
  components: {
    Default: {
      description: '사용자 작업에 대한 확인 정보창을 표시할 수 있습니다. (버튼 클릭 시 메시지 창을 확인할 수 있습니다.)',
      component: Default,
      parsedData: parse(DefaultRaw).descriptor,
    },
  },
};
