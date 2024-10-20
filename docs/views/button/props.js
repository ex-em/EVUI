import { parse } from '@vue/compiler-sfc';
import mdText from './api/button.md?raw';
import Default from './example/Default';
import DefaultRaw from './example/Default?raw';
import Group from './example/ButtonGroup';
import GroupRaw from './example/ButtonGroup?raw';

export default {
  mdText,
  components: {
    Default: {
      description: '옵션 설정을 통해 다양한 종류의 버튼을 사용할 수 있습니다.',
      component: Default,
      parsedData: parse(DefaultRaw).descriptor,
    },
    'Button Group': {
      description: '버튼을 그룹지어서 사용할 수 있습니다.',
      component: Group,
      parsedData: parse(GroupRaw).descriptor,
    },
  },
};
