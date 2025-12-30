import { parse } from '@vue/compiler-sfc';
import mdText from './api/benchmark.md?raw';
import Benchmark from './example/Benchmark';
import BenchmarkRaw from './example/Benchmark?raw';

export default {
  mdText,
  components: {
    Benchmark: {
      description:
        'Chart 컴포넌트의 성능을 측정합니다. 데이터 크기와 차트 타입을 선택하여 렌더링 시간, FPS, 메모리 사용량을 확인할 수 있습니다.',
      component: Benchmark,
      parsedData: parse(BenchmarkRaw).descriptor,
    },
  },
};
