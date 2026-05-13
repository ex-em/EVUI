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
});
