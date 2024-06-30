import { parseComponent } from 'vue-template-compiler';
import mdText from 'raw-loader!./api/scheduler.md';
import Default from './example/Default';
import DefaultRaw from '!!raw-loader!./example/Default';

export default {
  mdText,
  components: {
    Default: {
      description: '스케쥴러는 정해진 날짜 내 시간 스케쥴을 선택하는 컴포넌트입니다.',
      component: Default,
      parsedData: parseComponent(DefaultRaw),
    },
  },
};
