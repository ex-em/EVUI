import { parse } from '@vue/compiler-sfc';
import mdText from './api/pieChart.md?raw';
import Default from './example/Default';
import DefaultRaw from './example/Default?raw';
import Doughnut from './example/Doughnut';
import DoughnutRaw from './example/Doughnut?raw';
import Sunburst from './example/Sunburst';
import SunburstRaw from './example/Sunburst?raw';
import Event from './example/Event';
import EventRaw from './example/Event?raw';
import ShowValue from './example/ShowValue';
import ShowValueRaw from './example/ShowValue?raw';
import Legend from './example/Legend';
import LegendRaw from './example/Legend?raw';

export default {
  mdText,
  components: {
    Default: {
      description: 'Pie Chart는 데이터의 전체 데이터를 기준으로 한 계열의 상대적 크기를 표시합니다.',
      component: Default,
      parsedData: parse(DefaultRaw).descriptor,
    },
    Doughnut: {
      description: 'Doughnut Chart는 Pie Chart의 중심을 비워 내부 공간을 만듭니다.',
      component: Doughnut,
      parsedData: parse(DoughnutRaw).descriptor,
    },
    Sunburst: {
      description: 'Sunburst Chart는 Doughnut을 계층적으로 데이터를 시각화 합니다.',
      component: Sunburst,
      parsedData: parse(SunburstRaw).descriptor,
    },
    ShowValue: {
      description: 'ShowValue 옵션 설정으로 value 값을 표시합니다.',
      component: ShowValue,
      parsedData: parse(ShowValueRaw).descriptor,
    },
    Event: {
      description: 'Click, Double Click 등 이벤트 등록이 가능합니다.',
      component: Event,
      parsedData: parse(EventRaw).descriptor,
    },
    Legend: {
      description: 'Legend 영역에 Series Color, Name, Value 등을 표시할 수 있습니다.',
      component: Legend,
      parsedData: parse(LegendRaw).descriptor,
    },
  },
};
