/**
 * EvChart selectSeries 선택 라인 최상위 보정 모듈.
 * chart.core.js 의 EvChart.prototype 에 Object.assign 으로 합쳐진다(메서드는 this 로 인스턴스에 접근).
 *
 * 배경: selectSeries 강조는 선택 시리즈를 정상 opacity 로, 비선택을 unSelectedOpacity 로 그린다.
 * 그런데 full redraw 는 선택 시리즈를 z-order 제자리에 그려, 뒤(higher-z) dimmed 시리즈에 묻힐 수 있다.
 * 이 모듈은 full redraw(drawChart) 직후 선택 line 만 한 번 더 덧그려 항상 최상위로 통일한다.
 */
const selection = {
  /**
   * 선택 시리즈가 전부 '맨 위로 덧그리기' 가능한 타입(line, non-fill, non-isExistGrp)인지.
   * selectSeries 강조를 실제로 소비하는 element 는 line 뿐이고, scatter/heatMap 은 미지원이며
   * scatter 는 drawSelectedSeriesOnly 경로(duple 미전달)에서 크래시하므로 line 만 허용한다.
   * 빈 선택은 제약이 없어 true 를 반환한다(호출부 shouldDrawSelectedOnTop 가 빈 선택을 먼저 걸러낸다).
   * @returns {boolean}
   */
  selectedSeriesAllLineSafe() {
    const selectedIds = this.defaultSelectInfo?.seriesId ?? [];
    for (let i = 0; i < selectedIds.length; i++) {
      const s = this.seriesList[selectedIds[i]];
      if (!s || s.type !== 'line' || s.fill || s.isExistGrp) {
        return false;
      }
    }
    return true;
  },

  /**
   * full redraw(drawChart) 직후 선택 line 을 dimmed 시리즈 위에 한 번 더 그려 최상위로 올릴지 판정한다.
   * full redraw 는 선택 시리즈를 z-order 제자리에 그려 뒤(higher-z) dimmed 시리즈에 묻히는데, 이 패스로
   * '선택 = 최상위' 로 통일한다(무회귀: false 면 미적용).
   *
   * 라스터 스타일이 실제로 달라지는 legend hit/hover 만 막는다(selectItem/selectLabel 은 line.draw 의
   * selectSeries 분기가 우선이라 덧그리기가 제자리 그림과 idempotent). worker 는 별도 z-order(snapshot)라 제외.
   * @param {any} hitInfo   drawChart 의 hitInfo
   * @returns {boolean}
   */
  shouldDrawSelectedOnTop(hitInfo) {
    const opt = this.options;
    if (!opt.selectSeries?.use || opt.brush || opt.realTimeScatter?.use || opt.workerRender) {
      return false;
    }
    if (hitInfo?.legend || this.legendHover) {
      return false;
    }
    if (!this.defaultSelectInfo?.seriesId?.length) {
      return false;
    }
    return this.selectedSeriesAllLineSafe();
  },

  /**
   * 선택된 시리즈만 정상 opacity(highlight)로 bufferCtx 에 덧그린다(dimmed 시리즈 위 → z-order 최상위).
   * @returns {undefined}
   */
  drawSelectedSeriesOnly() {
    const {
      maxTip,
      selectLabel,
      selectItem,
      selectSeries,
      brush,
      displayOverflow,
      unSelectedOpacity,
    } = this.options;

    const opt = {
      ctx: this.bufferCtx,
      chartRect: this.chartRect,
      labelOffset: this.labelOffset,
      axesSteps: this.axesSteps,
      maxTipOpt: { background: maxTip.background, color: maxTip.color },
      selectLabel: { option: selectLabel, selected: this.defaultSelectInfo },
      selectSeries: { option: selectSeries, selected: this.defaultSelectInfo },
      selectItem: { option: selectItem, selected: this.defaultSelectItemInfo },
      isBrush: !!brush,
      displayOverflow,
      unSelectedOpacity,
      isHorizontal: this.options.horizontal,
      dataEpoch: this._dataEpoch,
      scaleVersion: this._scaleVersion,
    };

    const selectedIds = this.defaultSelectInfo?.seriesId ?? [];
    for (let i = 0; i < selectedIds.length; i++) {
      const series = this.seriesList[selectedIds[i]];
      if (series && series.show) {
        series.draw({ ...opt });
      }
    }
  },
};

export default selection;
