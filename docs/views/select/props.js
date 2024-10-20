import { parse } from '@vue/compiler-sfc';
import mdText from './api/select.md?raw';
import Default from './example/Default';
import DefaultRaw from './example/Default?raw';
import Multiple from './example/Multiple';
import MultipleRaw from './example/Multiple?raw';

export default {
  mdText,
  components: {
    Default: {
      description: '여러 개의 선택 사항을 고르기 위한 단일 체크 박스의 기능입니다.',
      component: Default,
      parsedData: parse(DefaultRaw).descriptor,
    },
    Multiple: {
      description: '다중 선택가능한 멀티 체크박스입니다.',
      component: Multiple,
      parsedData: parse(MultipleRaw).descriptor,
    },
  },
};
