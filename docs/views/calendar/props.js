import { parse } from '@vue/compiler-sfc';
import mdText from './api/calendar.md?raw';
import Default from './example/Default';
import DateTimeRange from './example/DateTimeRange';
import DefaultRaw from './example/Default?raw';
import DateTimeRangeRaw from './example/DateTimeRange?raw';

export default {
  mdText,
  components: {
    Default: {
      description: '달력 기능인 Calendar 컴포넌트입니다.',
      component: Default,
      parsedData: parse(DefaultRaw).descriptor,
    },
    DateTimeRange: {
      description: 'dateRange mode에서 time이 추가된 calendar입니다.',
      component: DateTimeRange,
      parsedData: parse(DateTimeRangeRaw).descriptor,
      verticalMode: true,
    },
  },
};
