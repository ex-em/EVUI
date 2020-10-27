import { parseComponent } from 'vue-template-compiler';
import mdText from 'raw-loader!./api/button.md';
import Default from './example/Default';
import DefaultRaw from '!!raw-loader!./example/Default';
import Group from './example/ButtonGroup';
import GroupRaw from '!!raw-loader!./example/ButtonGroup';

export default {
  mdText,
  components: {
    Default: {
      description: '옵션 설정을 통해 다양한 종류의 버튼을 사용할 수 있습니다.',
      component: Default,
      parsedData: parseComponent(DefaultRaw),
    },
    'Button Group': {
      description: '버튼을 그룹지어서 사용할 수 있습니다.',
      component: Group,
      parsedData: parseComponent(GroupRaw),
    },
  },
};
