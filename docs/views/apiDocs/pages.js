import tabPage from 'docs/views/tab/props';
import windowPage from 'docs/views/window/props';
import menuPage from 'docs/views/menu/props';
import contextMenuPage from 'docs/views/contextMenu/props';
import buttonPage from 'docs/views/button/props';
import iconPage from 'docs/views/icon/props';
import checkboxPage from 'docs/views/checkbox/props';
import radioPage from 'docs/views/radio/props';
import selectPage from 'docs/views/select/props';
import togglePage from 'docs/views/toggle/props';
import textFieldPage from 'docs/views/textField/props';
import inputNumberPage from 'docs/views/inputNumber/props';
import sliderPage from 'docs/views/slider/props';
import calendarPage from 'docs/views/calendar/props';
import datePickerPage from 'docs/views/datePicker/props';
import schedulerPage from 'docs/views/scheduler/props';
import timePickerPage from 'docs/views/timePicker/props';
import paginationPage from 'docs/views/pagination/props';
import gridPage from 'docs/views/grid/props';
import treePage from 'docs/views/tree/props';
import treeGridPage from 'docs/views/treeGrid/props';
import barChartPage from 'docs/views/barChart/props';
import lineChartPage from 'docs/views/lineChart/props';
import scatterChartPage from 'docs/views/scatterChart/props';
import pieChartPage from 'docs/views/pieChart/props';
import comboChartPage from 'docs/views/comboChart/props';
import heatMapPage from 'docs/views/heatMap/props';
import zoomChartPage from 'docs/views/zoomChart/props';
import brushChartPage from 'docs/views/brushChart/props';
import messagePage from 'docs/views/message/props';
import messageBoxPage from 'docs/views/messageBox/props';
import notificationPage from 'docs/views/notification/props';
import loadingPage from 'docs/views/loading/props';
import progressPage from 'docs/views/progress/props';

/**
 * 컴포넌트 페이지 레지스트리 (api-docs의 카탈로그 SSOT)
 *
 * 각 항목의 page는 기존 docs/views/<component>/props.js 모듈로,
 * { mdText, components(예제) }를 담고 있다.
 * - 피커(카테고리 트리), md 폴백 뷰, Examples 탭, Try It 플레이그라운드가
 *   모두 이 레지스트리에서 데이터를 해석한다.
 * - 라우터에 의존하지 않으므로 기존 페이지 라우트를 제거/리다이렉트해도
 *   api-docs는 영향을 받지 않는다.
 */
export const PAGES = [
  // Layout
  { key: 'tab', label: 'Tab', category: 'Layout', route: '/tab', page: tabPage },
  { key: 'window', label: 'Window', category: 'Layout', route: '/window', page: windowPage },
  { key: 'menu', label: 'Menu', category: 'Layout', route: '/menu', page: menuPage },
  {
    key: 'contextMenu',
    label: 'ContextMenu',
    category: 'Layout',
    route: '/contextMenu',
    page: contextMenuPage,
  },
  { key: 'button', label: 'Button', category: 'Layout', route: '/button', page: buttonPage },
  { key: 'icon', label: 'Icon', category: 'Layout', route: '/icon', page: iconPage },
  // Form
  { key: 'checkbox', label: 'Checkbox', category: 'Form', route: '/checkbox', page: checkboxPage },
  { key: 'radio', label: 'Radio', category: 'Form', route: '/radio', page: radioPage },
  { key: 'select', label: 'Select', category: 'Form', route: '/select', page: selectPage },
  { key: 'toggle', label: 'Toggle', category: 'Form', route: '/toggle', page: togglePage },
  {
    key: 'textField',
    label: 'TextField',
    category: 'Form',
    route: '/textField',
    page: textFieldPage,
  },
  {
    key: 'inputNumber',
    label: 'InputNumber',
    category: 'Form',
    route: '/inputNumber',
    page: inputNumberPage,
  },
  { key: 'slider', label: 'Slider', category: 'Form', route: '/slider', page: sliderPage },
  { key: 'calendar', label: 'Calendar', category: 'Form', route: '/calendar', page: calendarPage },
  {
    key: 'datePicker',
    label: 'DatePicker',
    category: 'Form',
    route: '/datePicker',
    page: datePickerPage,
  },
  {
    key: 'scheduler',
    label: 'Scheduler',
    category: 'Form',
    route: '/scheduler',
    page: schedulerPage,
  },
  {
    key: 'timePicker',
    label: 'TimePicker',
    category: 'Form',
    route: '/timePicker',
    page: timePickerPage,
  },
  {
    key: 'pagination',
    label: 'Pagination',
    category: 'Form',
    route: '/pagination',
    page: paginationPage,
  },
  // Table
  { key: 'grid', label: 'Grid', category: 'Table', route: '/grid', page: gridPage },
  { key: 'tree', label: 'Tree', category: 'Table', route: '/tree', page: treePage },
  { key: 'treeGrid', label: 'TreeGrid', category: 'Table', route: '/treeGrid', page: treeGridPage },
  // Chart
  {
    key: 'barChart',
    label: 'BarChart',
    category: 'Chart',
    route: '/barChart',
    page: barChartPage,
  },
  {
    key: 'lineChart',
    label: 'LineChart',
    category: 'Chart',
    route: '/lineChart',
    page: lineChartPage,
  },
  {
    key: 'scatterChart',
    label: 'ScatterChart',
    category: 'Chart',
    route: '/scatterChart',
    page: scatterChartPage,
  },
  {
    key: 'pieChart',
    label: 'PieChart',
    category: 'Chart',
    route: '/pieChart',
    page: pieChartPage,
  },
  {
    key: 'comboChart',
    label: 'ComboChart',
    category: 'Chart',
    route: '/comboChart',
    page: comboChartPage,
  },
  { key: 'heatMap', label: 'HeatMap', category: 'Chart', route: '/heatMap', page: heatMapPage },
  {
    key: 'zoomChart',
    label: 'ZoomChart',
    category: 'Chart',
    route: '/zoomChart',
    page: zoomChartPage,
  },
  {
    key: 'brushChart',
    label: 'BrushChart',
    category: 'Chart',
    route: '/brushChart',
    page: brushChartPage,
  },
  // Notice
  { key: 'message', label: 'Message', category: 'Notice', route: '/message', page: messagePage },
  {
    key: 'messageBox',
    label: 'MessageBox',
    category: 'Notice',
    route: '/messageBox',
    page: messageBoxPage,
  },
  {
    key: 'notification',
    label: 'Notification',
    category: 'Notice',
    route: '/notification',
    page: notificationPage,
  },
  { key: 'loading', label: 'Loading', category: 'Notice', route: '/loading', page: loadingPage },
  {
    key: 'progress',
    label: 'Progress',
    category: 'Notice',
    route: '/progress',
    page: progressPage,
  },
];

/** 피커에 표시되는 카테고리 순서 */
const CATEGORY_ORDER = ['Chart', 'Form', 'Table', 'Layout', 'Notice'];
PAGES.sort(
  (a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category),
);

export const pageByKey = Object.fromEntries(PAGES.map((entry) => [entry.key, entry]));
export const pageByRoute = Object.fromEntries(PAGES.map((entry) => [entry.route, entry]));

/**
 * 문서 실행 모드(개발자용 여부).
 * - `npm run dev_docs`(--mode internal) = 빌드 시점부터 개발자용
 * - `npm run docs` / `build:docs`(대외용) 이더라도 URL에 `?internal`이 있으면
 *   런타임에 개발자용으로 전환 → 배포 환경에서도 dev 예제 확인 가능
 * 모듈 로드 시 1회 평가되며, 세션 동안 유지된다(끄려면 파라미터 없이 재진입).
 */
const hasInternalQuery = () => {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).has('internal');
};
export const IS_INTERNAL_DOCS = import.meta.env.MODE === 'internal' || hasInternalQuery();

/** 현재 모드에서 노출 가능한 예제인지 */
export const isExampleVisible = (def) => IS_INTERNAL_DOCS || !def?.devOnly;
