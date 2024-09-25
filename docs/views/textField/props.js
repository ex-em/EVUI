import { parse } from '@vue/compiler-sfc';
import mdText from './api/textField.md?raw';
import Default from './example/Default';
import DefaultRaw from './example/Default?raw';
import Password from './example/Password';
import PasswordRaw from './example/Password?raw';
import Search from './example/Search';
import SearchRaw from './example/Search?raw';
import Textarea from './example/Textarea';
import TextareaRaw from './example/Textarea?raw';
import Icon from './example/Icon';
import IconRaw from './example/Icon?raw';

export default {
  mdText,
  components: {
    Default: {
      description: 'Text 입력 가능한 input 컴포넌트입니다.',
      component: Default,
      parsedData: parse(DefaultRaw).descriptor,
    },
    Password: {
      description: 'Password를 입력할 수 있는 input 컴포넌트입니다.',
      component: Password,
      parsedData: parse(PasswordRaw).descriptor,
    },
    Search: {
      description: '검색 용도로 사용할 수 있는 input 컴포넌트입니다.',
      component: Search,
      parsedData: parse(SearchRaw).descriptor,
    },
    Icon: {
      description: 'TextField 내에 Prefix, Suffix 아이콘 설정이 가능한 input 컴포넌트입니다.',
      component: Icon,
      parsedData: parse(IconRaw).descriptor,
    },
    Textarea: {
      description: '여러 줄의 문장을 입력할 수 있는 input 컴포넌트입니다.',
      component: Textarea,
      parsedData: parse(TextareaRaw).descriptor,
    },
  },
};
