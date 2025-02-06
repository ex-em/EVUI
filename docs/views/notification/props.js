import { parse } from '@vue/compiler-sfc';
import mdText from './api/notification.md?raw';
import Default from './example/Default';
import DefaultRaw from './example/Default?raw';

export default {
  mdText,
  components: {
    Default: {
      description: '어플리케이션의 공지 알람을 표시할 수 있습니다. (버튼 클릭 시 메시지 창을 확인할 수 있습니다.)',
      component: Default,
      parsedData: parse(DefaultRaw).descriptor,
    },
  },
};
