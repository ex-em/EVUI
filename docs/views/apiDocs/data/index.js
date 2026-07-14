import lineChart from './lineChart.json';
import barChart from './barChart.json';
import scatterChart from './scatterChart.json';
import pieChart from './pieChart.json';
import heatMap from './heatMap.json';
import button from './button.json';

/**
 * API 문서 레지스트리 (SSOT: JSON)
 * key: 문서 식별자(pages.js의 key와 일치), value: 문서 스키마(JSON)
 * 새 컴포넌트 문서를 추가하려면 JSON 파일을 만들고 여기에 등록합니다.
 * 등록된 문서는 npm run docs:validate 게이트를 통과해야 합니다.
 */
export default {
  lineChart,
  barChart,
  scatterChart,
  pieChart,
  heatMap,
  button,
};
