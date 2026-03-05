import { describe, it, expect } from 'vitest';
import { getUpdatedColumns } from './uses';

describe('treeGrid getUpdatedColumns', () => {
  it('originColumns만 있으면 그대로 반환한다', () => {
    const stores = {
      originColumns: [
        { index: 0, field: 'name', width: 100 },
        { index: 1, field: 'value', width: 80 },
      ],
      filteredColumns: [],
    };
    const result = getUpdatedColumns(stores);
    expect(result).toEqual([
      { index: 0, field: 'name', width: 100 },
      { index: 1, field: 'value', width: 80 },
    ]);
  });

  it('filteredColumns 정보가 병합된다', () => {
    const stores = {
      originColumns: [
        { index: 0, field: 'name', width: 100 },
        { index: 1, field: 'value', width: 80 },
      ],
      filteredColumns: [
        { index: 0, width: 150 },
      ],
    };
    const result = getUpdatedColumns(stores);
    expect(result[0]).toEqual({ index: 0, field: 'name', width: 150 });
    expect(result[1]).toEqual({ index: 1, field: 'value', width: 80 });
  });

  it('일치하는 filteredColumn이 없으면 원본 유지', () => {
    const stores = {
      originColumns: [{ index: 0, field: 'name' }],
      filteredColumns: [{ index: 5, hidden: true }],
    };
    const result = getUpdatedColumns(stores);
    expect(result[0]).toEqual({ index: 0, field: 'name' });
  });

  it('빈 stores를 처리한다', () => {
    const stores = { originColumns: [], filteredColumns: [] };
    expect(getUpdatedColumns(stores)).toEqual([]);
  });
});
