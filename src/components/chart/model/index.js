import Store from './model.store';
import Series from './model.series';

export default { Store, Series };


  /**
   * @typedef {Object} ChartDOMSize
   * @property {number} width - 차트 DOM의 너비
   * @property {number} height - 차트 DOM의 높이
   */

  /**
   * @typedef {Object} ChartRect
   * @property {number} x1 - 차트 영역의 시작 X 좌표
   * @property {number} x2 - 차트 영역의 끝 X 좌표
   * @property {number} y1 - 차트 영역의 시작 Y 좌표
   * @property {number} y2 - 차트 영역의 끝 Y 좌표
   * @property {number} chartWidth - 실제 차트 그리기 영역의 너비
   * @property {number} chartHeight - 실제 차트 그리기 영역의 높이
   * @property {number} width - 전체 차트 컨테이너의 너비
   * @property {number} height - 전체 차트 컨테이너의 높이
   */


    /**
   * @typedef {Object} MouseLabelValue
   * @property {string|number} labelVal - 마우스 위치에 해당하는 라벨 값
   * @property {number} labelIdx - 라벨 인덱스 (없으면 -1)
   */


      /**
   * @typedef {Object} ChartSeriesDataPoint
   * @property {number|null} x - x축 값 또는 라벨
   * @property {number|null} y - y축 값 또는 데이터 값
   * @property {number|null} o - 원본 데이터 값
   * @property {number|null} b - 스택형 차트의 베이스 값
   * @property {number|null} xp - x좌표 위치(픽셀 등)
   * @property {number|null} yp - y좌표 위치(픽셀 등)
   * @property {number|null} w - 너비
   * @property {number|null} h - 높이
   * @property {string|null} dataColor - 데이터 색상
   * @property {string|null} dataTextColor - 텍스트 색상
   */


   /**
    * @typedef {'none' | 'linear' | 'zero'} InterpolationType
    */
