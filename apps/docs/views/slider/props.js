import { parseComponent } from 'vue-template-compiler';
import mdText from 'raw-loader!./api/slider.md';
import Default from './example/Default';
import DefaultRaw from '!!raw-loader!./example/Default';
import Range from './example/Range';
import RangeRaw from '!!raw-loader!./example/Range';
import Input from './example/Input';
import InputRaw from '!!raw-loader!./example/Input';
import Mark from './example/Mark';
import MarkRaw from '!!raw-loader!./example/Mark';

export default {
  mdText,
  components: {
    Default: {
      description: 'Range Slider 컴포넌트입니다. 마우스 클릭 및 드래그로 값을 조절할 수 있으며, step 속성으로 이동 단위를 설정할 수 있습니다.',
      component: Default,
      parsedData: parseComponent(DefaultRaw),
    },
    Range: {
      description: 'range 속성을 통해 두 가지 핸들을 통해 범위 값을 설정할 수 있습니다.',
      component: Range,
      parsedData: parseComponent(RangeRaw),
    },
    Input: {
      description: 'InputNumber 컴포넌트와 함께 사용할 수 있습니다.',
      component: Input,
      parsedData: parseComponent(InputRaw),
    },
    Mark: {
      description: 'mark 속성을 통해 사용자 지정 라벨링을 할 수 있습니다.',
      component: Mark,
      parsedData: parseComponent(MarkRaw),
    },
  },
};
