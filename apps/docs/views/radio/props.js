import { parseComponent } from 'vue-template-compiler';
import mdText from '!!raw-loader!./api/radio.md';
import Default from './example/Default';
import DefaultRaw from '!!raw-loader!./example/Default';
import RadioGroup from './example/RadioGroup';
import RadioGroupRaw from '!!raw-loader!./example/RadioGroup';

export default {
  mdText,
  components: {
    Default: {
      description: '여러 선택지 중 하나를 고르는 컴포넌트입니다. 라디오 버튼 특성상 하나의 요소만 사용할 수 없으며, <ev-radio-group>을 활용하는 것을 권장합니다.',
      component: Default,
      parsedData: parseComponent(DefaultRaw),
    },
    'Radio Group': {
      description: '<ev-radio>를 그룹지어 사용할 수 있습니다.',
      component: RadioGroup,
      parsedData: parseComponent(RadioGroupRaw),
    },
  },
};
