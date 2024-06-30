import { parseComponent } from 'vue-template-compiler';
import mdText from '!!raw-loader!./api/notification.md';
import Default from './example/Default';
import DefaultRaw from '!!raw-loader!./example/Default';

export default {
  mdText,
  components: {
    Default: {
      description: '어플리케이션의 공지 알람을 표시할 수 있습니다. (버튼 클릭 시 메시지 창을 확인할 수 있습니다.)',
      component: Default,
      parsedData: parseComponent(DefaultRaw),
    },
  },
};
