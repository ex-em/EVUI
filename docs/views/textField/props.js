import { parseComponent } from 'vue-template-compiler';
import mdText from '!!raw-loader!./api/textfield.md';
import Default from './example/Default';
import DefaultRaw from '!!raw-loader!./example/Default';
import Password from './example/Password';
import PasswordRaw from '!!raw-loader!./example/Password';
import Textarea from './example/Textarea';
import TextareaRaw from '!!raw-loader!./example/Textarea';

export default {
  mdText,
  components: {
    Default: {
      description: 'Text 입력 가능한 input 컴포넌트입니다.',
      component: Default,
      parsedData: parseComponent(DefaultRaw),
    },
    Password: {
      description: 'Password를 입력할 수 있는 input 컴포넌트입니다.',
      component: Password,
      parsedData: parseComponent(PasswordRaw),
    },
    Textarea: {
      description: '여러 줄의 문장을 입력할 수 있는 input 컴포넌트입니다.',
      component: Textarea,
      parsedData: parseComponent(TextareaRaw),
    },
  },
};
