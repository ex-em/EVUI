import { parse } from '@vue/compiler-sfc';
import mdText from './api/checkbox.md?raw';
import Default from './example/Default';
import DefaultRaw from './example/Default?raw';
import CheckboxGroup from './example/CheckboxGroup';
import CheckboxGroupRaw from './example/CheckboxGroup?raw';

export default {
  mdText,
  components: {
    Default: {
      description: '여러 개의 선택 사항을 고르기 위한 단일 체크 박스의 기능입니다.',
      component: Default,
      parsedData: parse(DefaultRaw).descriptor,
    },
    CheckboxGroup: {
      description: '체크박스 그룹 기능입니다.',
      component: CheckboxGroup,
      parsedData: parse(CheckboxGroupRaw).descriptor,
    },
  },
};
