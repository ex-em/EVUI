import { parse } from '@vue/compiler-sfc';
import mdText from './api/select.md?raw';
import Default from './example/Default';
import DefaultRaw from './example/Default?raw';
import Multiple from './example/Multiple';
import MultipleRaw from './example/Multiple?raw';
import InWindow from './example/InWindow';
import InWindowRaw from './example/InWindow?raw';

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
    InWindow: {
      description: 'ev-window 안에서 사용하는 경우의 예시입니다.',
      component: InWindow,
      parsedData: parse(InWindowRaw).descriptor,
    },
  },
};
