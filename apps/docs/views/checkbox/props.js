import { parseComponent } from 'vue-template-compiler';
import mdText from 'raw-loader!./api/checkbox.md';
import Default from './example/Default';
import DefaultRaw from '!!raw-loader!./example/Default';
import CheckboxGroup from './example/CheckboxGroup';
import CheckboxGroupRaw from '!!raw-loader!./example/CheckboxGroup';

export default {
  mdText,
  components: {
    Default: {
      description: '여러 개의 선택 사항을 고르기 위한 단일 체크 박스의 기능입니다.',
      component: Default,
      parsedData: parseComponent(DefaultRaw),
    },
    CheckboxGroup: {
      description: '체크박스 그룹 기능입니다.',
      component: CheckboxGroup,
      parsedData: parseComponent(CheckboxGroupRaw),
    },
  },
};
