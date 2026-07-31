import { isEqual } from 'lodash-es';
import Line from '../element/element.line';
import Scatter from '../element/element.scatter';
import Bar from '../element/element.bar';
import TimeBar from '../element/element.bar.time';
import Pie from '../element/element.pie';
import HeatMap from '../element/element.heatmap';

const modules = {
  /**
   * Takes series information to create series list.
   * @param {object}  series          chart series info
   * @param {string}  defaultType     default series type in options
   * @param {boolean} isHorizontal    determines if a horizontal option's value
   * @param {object}  groups          group info
   *
   * @returns {undefined}
   */
  createSeriesSet(series, defaultType, isHorizontal, groups) {
    let seriesKeys = Object.keys(series);

    if (this.options.overlapping.use) {
      seriesKeys = this.getOverlappingSeriesKeys(series, defaultType, groups);
    }

    seriesKeys.forEach((key, index) => {
      const type = series[key].type || defaultType;
      this.seriesList[key] = this.addSeries({
        type,
        id: key,
        opt: series[key],
        index,
        isHorizontal,
      });
    });
  },

  /**
   * updateSeries 시 series 인스턴스를 통째로 재생성하지 않고, 변경된 것만 add/recreate 하고
   * 그대로인 것은 재사용한다(인스턴스의 .data 점객체 풀 + geometry 메모이즈 보존).
   * 실시간 대시보드는 pod 생성/소멸로 series 집합만 매 갱신 바뀌는데(필드 불변), 기존 full-recreate는
   * 공통 series 까지 전부 버려 풀/메모이즈를 매번 깨뜨려 5.5× 느렸다.
   *
   * 보장:
   * - resolved 순서(overlapping 정렬 포함)대로 새 seriesList/{seriesInfo.charts} 를 처음부터 만든다
   *   (기존 객체 mutate 금지 — Object.keys 순서에 의존하는 draw/hit/legend/worker 경로 보호).
   * - 재사용 판정 = constructor key(type/isHorizontal/timeMode/realTime/heatMapColor/gradient) 동일
   *   + opt deep-equal. index 는 제외한다(아래 주석).
   * - 재사용 인스턴스는 show 를 fresh 값으로, group/stack 메타를 기본값으로 reset 한다.
   *
   * index 제외 이유: index 는 color/name 미지정 series 의 기본 팔레트색/이름을 인스턴스 생성 시 1회만
   * 정하고 인스턴스에 박힌다. churn 프레임에서 생존 series index 가 대량으로 밀리므로(실측 82%),
   * index 를 판정에 넣으면 정작 비싼 프레임에서 거의 다 recreate 되어 최적화가 무력화된다. 제외 시
   * 색 미지정 series 의 팔레트색이 이웃 churn 에도 고정될 뿐(오히려 안정적), 색을 명시한 series 는
   * 영향 0.
   *
   * @param {object}  series          chart series info
   * @param {string}  defaultType     default series type in options
   * @param {boolean} isHorizontal    horizontal option
   * @param {object}  groups          group info
   * @param {object}  prevSeriesList  직전 seriesList (재사용 후보)
   * @returns {undefined}
   */
  reconcileSeriesSet(series, defaultType, isHorizontal, groups, prevSeriesList) {
    let seriesKeys = Object.keys(series);

    if (this.options.overlapping.use) {
      seriesKeys = this.getOverlappingSeriesKeys(series, defaultType, groups);
    }

    const prev = prevSeriesList || {};
    const newSeriesList = {};

    // 만료 제거(expire)된 realTimeScatter series 부활 일원화(재추가 방지 가드의 단일 해제 지점):
    //  - 신규 점이 들어온 pruned 키는 가드에서 빼고 일반 경로로 재생성한다(부활).
    //  - 신규 점이 없는 pruned 키는 data.series 에 키가 남아 있어도 재생성 대상에서 제외한다.
    // (createRealTimeScatterDataSet 의 키 필터는 skip 만 하고 Set 에서 빼지 않으므로 해제는 여기서만.)
    const prunedSet = this.prunedRealTimeScatterSeries;
    if (prunedSet?.size) {
      for (let i = 0; i < seriesKeys.length; i++) {
        const key = seriesKeys[i];
        if (prunedSet.has(key) && this.data?.data?.[key]?.length) {
          prunedSet.delete(key);
        }
      }
      seriesKeys = seriesKeys.filter((key) => !prunedSet.has(key));
    }

    for (let i = 0; i < seriesKeys.length; i++) {
      const key = seriesKeys[i];
      const opt = series[key];
      const type = opt.type || defaultType;
      const prevInst = prev[key];

      if (prevInst && this.canReuseSeries(prevInst, type, opt, isHorizontal)) {
        // 재사용: seriesInfo.charts 인덱스에 resolved 순서대로 push (addSeries 가 하던 일).
        this.seriesInfo.charts[type].push(key);
        // show: full-recreate 와 동일하게 생성 당시 fresh 값으로 리셋(범례 토글 상태 폐기 — 현 동작 유지).
        prevInst.show = prevInst._freshShow;
        // group/stack 메타 stale 방지: addGroupInfo 재적용 전 기본값으로 리셋(그룹에서 빠진 경우 대비).
        this.resetSeriesGroupMeta(prevInst);
        newSeriesList[key] = prevInst;
      } else {
        newSeriesList[key] = this.addSeries({ type, id: key, opt, index: i, isHorizontal });
      }
    }

    this.seriesList = newSeriesList;
  },

  /**
   * 인스턴스 생성 시 입력(opt 제외)을 캡처한 키. 재조정 때 이 키가 다르면 생성자 산물(class 분기,
   * 기본색 family, colorState 등)이 달라지므로 재사용 불가 → recreate.
   * @returns {object}
   */
  computeReconcileKey(type, opt, isHorizontal) {
    return {
      type,
      isHorizontal,
      timeMode: type === 'bar' && !!opt.timeMode,
      realTime: type === 'scatter' && !!this.options.realTimeScatter?.use,
      heatMapColor: type === 'heatMap' ? this.options.heatMapColor : null,
      isGradient: type === 'heatMap' && this.options.legend?.type === 'gradient',
    };
  },

  /**
   * 재사용 가능 여부: constructor key 동일 + opt deep-equal. index 는 제외(reconcileSeriesSet 주석 참고).
   * @returns {boolean}
   */
  canReuseSeries(prevInst, type, opt, isHorizontal) {
    const k = prevInst._reconcileKey;
    if (!k || prevInst._optSnapshot === undefined) {
      return false;
    }

    const cur = this.computeReconcileKey(type, opt, isHorizontal);
    if (
      k.type !== cur.type ||
      k.isHorizontal !== cur.isHorizontal ||
      k.timeMode !== cur.timeMode ||
      k.realTime !== cur.realTime ||
      k.heatMapColor !== cur.heatMapColor ||
      k.isGradient !== cur.isGradient
    ) {
      return false;
    }

    return isEqual(prevInst._optSnapshot, opt);
  },

  /**
   * 재사용 인스턴스의 group/stack 메타를 기본값으로 리셋. addGroupInfo 가 그룹 소속 series 에만
   * 값을 쓰므로, 그룹에서 빠졌거나 groups 가 비면 이전 값이 stale 로 남아 createDataSet 의 stack
   * 분기(addSeriesStackDS)가 잘못 갈린다. 신규 인스턴스의 생성자 기본값과 동치.
   * @returns {undefined}
   */
  resetSeriesGroupMeta(inst) {
    inst.isExistGrp = false;
    inst.stackIndex = 0;
    inst.groupIndex = null;
    inst.bsId = null;
    inst.bsIds = [];
    inst.isOverlapping = false;
  },

  getOverlappingSeriesKeys(series, defaultType, groups) {
    const barSeries = [];
    const otherSeries = [];
    const allGroups = groups.flat();

    Object.keys(series).forEach((key) => {
      const type = series[key].type || defaultType;
      const isOverlappingBar = type === 'bar' && allGroups.length;

      if (isOverlappingBar) {
        const overlappingIdx = allGroups.findIndex((group) => group === key);
        barSeries.push({ key, overlappingIdx });
      } else {
        otherSeries.push({ key });
      }
    });

    // 큰 값을 가지는 series가 먼저 그려지도록 groups에서 지정한 순서의 역순으로 정렬
    barSeries.sort((a, b) => b.overlappingIdx - a.overlappingIdx);

    return [...barSeries, ...otherSeries].map(({ key }) => key);
  },

  /**
   * Takes series information to create series list.
   * @param {object} param   series info
   *
   * @returns {object} object for proper series type
   */
  addSeries(param) {
    const { type, id, opt, index, isHorizontal } = param;

    let instance = false;
    if (type === 'line') {
      this.seriesInfo.charts.line.push(id);
      instance = new Line(id, opt, index);
    } else if (type === 'scatter') {
      this.seriesInfo.charts.scatter.push(id);
      instance = new Scatter(id, opt, index, this.options.realTimeScatter?.use);
    } else if (type === 'bar') {
      this.seriesInfo.charts.bar.push(id);

      if (opt.timeMode) {
        instance = new TimeBar(id, opt, index, isHorizontal);
      } else {
        instance = new Bar(id, opt, index, isHorizontal);
      }
    } else if (type === 'pie') {
      this.seriesInfo.charts.pie.push(id);
      instance = new Pie(id, opt, index);
    } else if (type === 'heatMap') {
      this.seriesInfo.charts.heatMap.push(id);
      const { heatMapColor, legend } = this.options;
      const isGradient = legend.type === 'gradient';
      instance = new HeatMap(id, opt, heatMapColor, isHorizontal, isGradient);
    }

    if (instance) {
      // reconcileSeriesSet 재사용 판정용 메타. _freshShow 는 생성자가 resolve 한 show(범례 토글 전)로,
      // 재사용 시 이 값으로 되돌려 full-recreate 와 show 동작을 일치시킨다.
      instance._reconcileKey = this.computeReconcileKey(type, opt, isHorizontal);
      instance._optSnapshot = opt;
      instance._freshShow = instance.show;
    }

    return instance;
  },

  /**
   * Set series group to create stack chart
   * @param {object} groups   group info
   *
   * @returns {undefined}
   */
  addGroupInfo(groups) {
    groups.forEach((group, gIdx) => {
      let interpolation = 0;
      group.reduce((prev, curr, sIdx) => {
        const series = this.seriesList[curr];

        series.stackIndex = sIdx + interpolation;
        series.groupIndex = gIdx;
        series.isExistGrp = true;
        series.bsId = prev;
        series.bsIds = group.filter((item, idx) => item !== curr && sIdx > idx);
        series.isOverlapping = this.options.overlapping.use;

        if (!series.show) {
          interpolation--;
        }

        return !series.show ? prev : curr;
      }, group[0]);
    });
  },
};

export default modules;
