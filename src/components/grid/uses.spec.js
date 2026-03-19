import { describe, it, expect } from 'vitest';
import { getUpdatedColumns } from './uses';

describe('getUpdatedColumns', () => {
  it('originColumns만 있으면 그대로 반환한다', () => {
    const stores = {
      originColumns: [
        { index: 0, field: 'name', width: 100 },
        { index: 1, field: 'age', width: 80 },
      ],
      filteredColumns: [],
    };
    const result = getUpdatedColumns(stores);
    expect(result).toEqual([
      { index: 0, field: 'name', width: 100 },
      { index: 1, field: 'age', width: 80 },
    ]);
  });

  it('filteredColumns 정보가 병합된다', () => {
    const stores = {
      originColumns: [
        { index: 0, field: 'name', width: 100 },
        { index: 1, field: 'age', width: 80 },
      ],
      filteredColumns: [{ index: 1, width: 120, hidden: true }],
    };
    const result = getUpdatedColumns(stores);
    expect(result[0]).toEqual({ index: 0, field: 'name', width: 100 });
    expect(result[1]).toEqual({ index: 1, field: 'age', width: 120, hidden: true });
  });

  it('movedColumns가 있으면 originColumns 대신 사용한다', () => {
    const stores = {
      originColumns: [
        { index: 0, field: 'name' },
        { index: 1, field: 'age' },
      ],
      movedColumns: [
        { index: 1, field: 'age' },
        { index: 0, field: 'name' },
      ],
      filteredColumns: [],
    };
    const result = getUpdatedColumns(stores);
    expect(result[0].field).toBe('age');
    expect(result[1].field).toBe('name');
  });

  it('빈 stores를 처리한다', () => {
    const stores = {
      originColumns: [],
      filteredColumns: [],
    };
    expect(getUpdatedColumns(stores)).toEqual([]);
  });
});
