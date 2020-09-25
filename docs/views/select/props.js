import { parseComponent } from 'vue-template-compiler';
import mdText from '!!raw-loader!./api/select.md';
import Default from './example/Default';
import DefaultRaw from '!!raw-loader!./example/Default';

export default {
  mdText,
  components: {
    Default: {
      description: '여러 개의 선택 사항을 고르기 위한 단일 체크 박스의 기능입니다.',
      component: Default,
      parsedData: parseComponent(DefaultRaw),
    },
  },
};
