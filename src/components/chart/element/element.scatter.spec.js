import { describe, it, expect, vi, beforeEach } from 'vitest';
import Scatter from './element.scatter';
import Canvas from '../helpers/helpers.canvas';

/**
 * Scatter draw 메서드를 격리해서 테스트하기 위해 chartRect/axesSteps 등을 모두 입력하는
 * 대신, calcItem 을 항등 매핑으로 바꿔 item.x/y 가 그대로 xp/yp 로 들어가게 한다.
 * drawPoint 호출 횟수로 실제 그려진 점 수를 검증한다.
 */
const createDrawParam = () => ({
  ctx: {},
  axesSteps: { x: [{ graphMin: 0, graphMax: 1000 }], y: [{ graphMin: 0, graphMax: 1000 }] },
  duple: new Map(),
  legendHitInfo: null,
  coordinateDedupe: true,
  selectInfo: null,
  unSelectedOpacity: 0.3,
});

const createScatter = ({ realTimeScatter = false } = {}) => {
  const scatter = new Scatter('s1', { color: '#000000', pointFill: '#000000' }, 0, realTimeScatter);
  scatter.show = true;
  scatter.calcItem = (item) => {
    item.xp = item.x;
    item.yp = item.y;
  };
  return scatter;
};

describe('Scatter Element', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('defaultScatterDraw 시리즈 내부 (x,y) dedupe', () => {
    it('같은 (x,y) 데이터가 N개 있어도 한 번만 그린다', () => {
      const scatter = createScatter();
      scatter.data = [
        { x: 10, y: 20 },
        { x: 10, y: 20 },
        { x: 10, y: 20 },
        { x: 30, y: 40 },
      ];
      const param = createDrawParam();
      // dedupe 가 켜져 있으면 chart.core.js 가 duple 을 채워서 넘기므로 모킹한다.
      param.duple.set('10|20', 's1');
      param.duple.set('30|40', 's1');

      const spy = vi.spyOn(Canvas, 'drawPoint').mockImplementation(() => {});
      scatter.draw(param);

      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('coordinateDedupe=false 일 때는 모든 중복 좌표를 그대로 그린다 (#2011 opt-out 보존)', () => {
      const scatter = createScatter();
      scatter.data = [
        { x: 10, y: 20 },
        { x: 10, y: 20 },
        { x: 10, y: 20 },
      ];
      const param = createDrawParam();
      param.coordinateDedupe = false;

      const spy = vi.spyOn(Canvas, 'drawPoint').mockImplementation(() => {});
      scatter.draw(param);

      expect(spy).toHaveBeenCalledTimes(3);
    });

    it('다른 좌표는 정상적으로 모두 그린다', () => {
      const scatter = createScatter();
      scatter.data = [
        { x: 1, y: 1 },
        { x: 2, y: 2 },
        { x: 3, y: 3 },
      ];
      const param = createDrawParam();
      param.duple.set('1|1', 's1');
      param.duple.set('2|2', 's1');
      param.duple.set('3|3', 's1');

      const spy = vi.spyOn(Canvas, 'drawPoint').mockImplementation(() => {});
      scatter.draw(param);

      expect(spy).toHaveBeenCalledTimes(3);
    });

    it('duple 이 다른 시리즈를 owner 로 지정한 좌표는 그리지 않는다 (시리즈 간 dedupe)', () => {
      const scatter = createScatter();
      scatter.data = [
        { x: 10, y: 20 },
        { x: 30, y: 40 },
      ];
      const param = createDrawParam();
      param.duple.set('10|20', 'otherSeries');
      param.duple.set('30|40', 's1');

      const spy = vi.spyOn(Canvas, 'drawPoint').mockImplementation(() => {});
      scatter.draw(param);

      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('realTimeScatterDraw', () => {
    it('dataGroup 의 모든 점을 그리며 totalCount 에 전수를 기록한다', () => {
      const scatter = createScatter({ realTimeScatter: true });
      scatter.data = {
        s1: {
          dataGroup: [
            {
              data: [
                { x: 1, y: 1 },
                { x: 1, y: 2 },
              ],
            },
            { data: [{ x: 2, y: 1 }] },
          ],
        },
      };
      const param = createDrawParam();
      param.duple.set('1|1', 's1');
      param.duple.set('1|2', 's1');
      param.duple.set('2|1', 's1');

      const spy = vi.spyOn(Canvas, 'drawPoint').mockImplementation(() => {});
      scatter.draw(param);

      expect(spy).toHaveBeenCalledTimes(3);
      expect(scatter._rtTotalCount).toBe(3);
    });

    it('coordinateDedupe=false 일 때 모든 점을 그린다', () => {
      const scatter = createScatter({ realTimeScatter: true });
      scatter.data = {
        s1: {
          dataGroup: [
            {
              data: [
                { x: 1, y: 1 },
                { x: 2, y: 2 },
              ],
            },
          ],
        },
      };
      const param = createDrawParam();
      param.coordinateDedupe = false;

      const spy = vi.spyOn(Canvas, 'drawPoint').mockImplementation(() => {});
      scatter.draw(param);

      expect(spy).toHaveBeenCalledTimes(2);
    });
  });

  describe('displayOverflow — 값 축(Y) 초과 처리 (기본값 false 회귀 방지)', () => {
    // displayOverflow 가 DEFAULT_OPTIONS 에 추가되면서 기본값이 true 로 들어가면,
    // 옵션을 지정하지 않은 기존 scatter 의 range 초과 포인트가 숨김 → 경계 표시로 뒤집힌다.
    // 기본값은 false(=숨김) 여야 하고, calcItem 은 그 동작을 그대로 반영해야 한다.
    const calcParam = ({ displayOverflow }) => ({
      chartRect: { x1: 0, x2: 100, y1: 0, y2: 100, chartWidth: 100, chartHeight: 100 },
      labelOffset: { left: 0, right: 0, top: 0, bottom: 0 },
      axesSteps: { x: [{ graphMin: 0, graphMax: 100 }], y: [{ graphMin: 0, graphMax: 100 }] },
      displayOverflow,
    });

    // 실제 calcItem 구현을 써야 displayOverflow clamp 를 검증할 수 있다(항등 매핑 모킹 X).
    const realScatter = () => {
      const scatter = new Scatter('s1', { color: '#000000', pointFill: '#000000' }, 0, false);
      scatter.show = true;
      return scatter;
    };

    it('displayOverflow=false(기본)면 Y>graphMax 데이터는 yp=null 로 숨겨진다', () => {
      const scatter = realScatter();
      const item = { x: 50, y: 500 }; // graphMax(100) 초과
      scatter.calcItem(item, calcParam({ displayOverflow: false }));
      expect(item.yp).toBe(null);
    });

    it('displayOverflow=true 면 Y>graphMax 데이터가 경계로 clamp 되어 yp 가 non-null', () => {
      const scatter = realScatter();
      const item = { x: 50, y: 500 };
      scatter.calcItem(item, calcParam({ displayOverflow: true }));
      expect(item.yp).not.toBe(null);
    });

    it('range 안 데이터는 displayOverflow 와 무관하게 항상 그려진다', () => {
      const scatter = realScatter();
      const item = { x: 50, y: 50 };
      scatter.calcItem(item, calcParam({ displayOverflow: false }));
      expect(item.yp).not.toBe(null);
    });
  });
});
