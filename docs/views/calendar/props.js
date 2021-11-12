import { parseComponent } from 'vue-template-compiler';
import mdText from '!!raw-loader!./api/calendar.md';
import Default from './example/Default';
import DateTimeRange from './example/DateTimeRange';
import DefaultRaw from '!!raw-loader!./example/Default';
import DateTimeRangeRaw from '!!raw-loader!./example/DateTimeRange';

export default {
  mdText,
  components: {
    Default: {
      description: '달력 기능인 Calendar 컴포넌트입니다.',
      component: Default,
      parsedData: parseComponent(DefaultRaw),
    },
    DateTimeRange: {
      description: 'dateRange mode에서 time이 추가된 calendar입니다.',
      component: DateTimeRange,
      parsedData: parseComponent(DateTimeRangeRaw),
      verticalMode: true,
    },
  },
};
