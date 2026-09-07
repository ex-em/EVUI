import { describe, it, expect, vi } from 'vitest';
import EvChart from './chart.core';

/**
 * 재렌더가 비운 드래그 아티팩트 복원(`restoreDragArtifacts`).
 *
 * update() 는 clear() 로 overlay 를, updateTooltip 이면 tooltipDOM 까지 비운다. 드래그 중에는
 * 되살릴 mousemove 가 다음 커서 이동까지 오지 않으므로, 라이브 갱신 대시보드에서 매 틱
 * 툴팁·하이라이트·인디케이터가 사라졌다. 그 복원 순서와 종료된 드래그의 밴드 처리를 고정한다.
 */

const DRAG_INFO = { xcp: 100, isMove: true, xsp: 100, ysp: 10, width: 200, height: 260 };

const createChart = (state) => {
  const calls = [];
  const chart = Object.assign(Object.create(EvChart.prototype), {
    calls,
    drawHoverArtifacts: vi.fn((...args) => {
      calls.push(['drawHoverArtifacts', ...args]);
    }),
    drawSelectionArea: vi.fn((info) => {
      calls.push(['drawSelectionArea', info]);
    }),
    ...state,
  });

  return chart;
};

describe('EvChart.restoreDragArtifacts', () => {
  it('드래그 중이면 마지막 커서 위치의 hover 를 그린 뒤 밴드를 올린다', () => {
    const e = { id: 'lastMove' };
    const chart = createChart({ dragInfo: DRAG_INFO, lastDragHoverEvent: e });

    chart.restoreDragArtifacts(false);

    expect(chart.calls).toEqual([
      ['drawHoverArtifacts', e, true],
      ['drawSelectionArea', DRAG_INFO],
    ]);
  });

  it('커서가 캔버스 밖이면(이벤트 없음) 밴드만 그린다', () => {
    const chart = createChart({ dragInfo: DRAG_INFO, lastDragHoverEvent: null });

    chart.restoreDragArtifacts(false);

    expect(chart.drawHoverArtifacts).not.toHaveBeenCalled();
    expect(chart.calls).toEqual([['drawSelectionArea', DRAG_INFO]]);
  });

  it('종료된 드래그의 밴드는 부분 갱신에서만 유지한다', () => {
    const backup = { ...DRAG_INFO, isMove: false };

    const light = createChart({ dragInfo: null, dragInfoBackup: backup });
    light.restoreDragArtifacts(true);
    expect(light.calls).toEqual([['drawSelectionArea', backup]]);
    expect(light.dragInfoBackup).toBe(backup);

    const full = createChart({ dragInfo: null, dragInfoBackup: backup });
    full.restoreDragArtifacts(false);
    expect(full.calls).toEqual([]);
    expect(full.dragInfoBackup).toBeNull();
  });

  it('이벤트 함수가 아직 붙지 않은 인스턴스에서도 터지지 않는다', () => {
    const chart = createChart({
      dragInfo: DRAG_INFO,
      lastDragHoverEvent: { id: 'lastMove' },
      drawSelectionArea: undefined,
      drawHoverArtifacts: undefined,
    });

    expect(() => chart.restoreDragArtifacts(false)).not.toThrow();
  });
});
