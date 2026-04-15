import { parse } from '@vue/compiler-sfc';
import mdText from './api/input.md?raw';
import Default from './example/Default';
import DefaultRaw from './example/Default?raw';
import Compound from './example/Compound';
import CompoundRaw from './example/Compound?raw';
import Trim from './example/Trim';
import TrimRaw from './example/Trim?raw';
import Accessibility from './example/Accessibility';
import AccessibilityRaw from './example/Accessibility?raw';
import CustomLayout from './example/CustomLayout';
import CustomLayoutRaw from './example/CustomLayout?raw';

export default {
  mdText,
  components: {
    Default: {
      description: '기본 input 사용 예시입니다.',
      component: Default,
      parsedData: parse(DefaultRaw).descriptor,
    },
    Compound: {
      description: 'Root, Label, Description, ErrorMessage를 조합한 예시입니다.',
      component: Compound,
      parsedData: parse(CompoundRaw).descriptor,
    },
    Trim: {
      description: 'v-model.trim modifier를 사용한 예시입니다.',
      component: Trim,
      parsedData: parse(TrimRaw).descriptor,
    },
    Accessibility: {
      description: '접근성(required, invalid, disabled, native attrs) 예시입니다.',
      component: Accessibility,
      parsedData: parse(AccessibilityRaw).descriptor,
    },
    CustomLayout: {
      description: 'Prefix/Suffix 아이콘, 텍스트 등 커스텀 레이아웃 예시입니다.',
      component: CustomLayout,
      parsedData: parse(CustomLayoutRaw).descriptor,
    },
  },
};
