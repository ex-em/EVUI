import { parseComponent } from 'vue-template-compiler';
import mdText from '!!raw-loader!./api/calendar.md';
import Default from './example/Default';
import DefaultRaw from '!!raw-loader!./example/Default';

export default {
  mdText,
  components: {
    Default: {
      description: '달력 기능인 Calendar 컴포넌트입니다.',
      component: Default,
      parsedData: parseComponent(DefaultRaw),
    },
  },
};
