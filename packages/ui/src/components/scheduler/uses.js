import { getCurrentInstance, computed, reactive } from 'vue';

const getMatrixArr = (row, col) =>
  Array.from(Array(row), () => Array(col).fill(false));

export const useModel = () => {
  const { props, emit } = getCurrentInstance();

  const mv = computed({
    get: () => {
      if (
        props.modelValue.length !== props.rowLabels.length ||
        !props.modelValue[0] ||
        props.modelValue[0].length !== props.colLabels.length
      ) {
        return getMatrixArr(props.rowLabels.length, props.colLabels.length);
      }
      return props.modelValue;
    },
    set: (val) => {
      emit('update:modelValue', val);
      emit('change', val);
    },
  });

  /**
   * 초기값 배열의 length와 options의 count가 안맞는 경우 valid체크하는 로직
   */
  const validateValue = () => {
    if (
      props.modelValue.length !== props.rowLabels.length ||
      !props.modelValue[0] ||
      props.modelValue[0].length !== props.colLabels.length
    ) {
      mv.value = [
        ...getMatrixArr(props.rowLabels.length, props.colLabels.length),
      ];
    }
  };

  return {
    mv,
    validateValue,
  };
};

export const useEvent = (param) => {
  const { mv } = param;
  const mousePos = reactive({
    startRow: null,
    startCol: null,
    dragRow: null,
    dragCol: null,
    endRow: null,
    endCol: null,
    dragEventName: null,
  });

  /**
   * 스케쥴 내 드래그 시 선택영역의 style 세팅
   * @param rows
   * @param cols
   */
  const selectionStyle = (rows, cols) => {
    if (mousePos.dragCol === null || mousePos.dragRow === null) {
      return {};
    }
    const minRow =
      mousePos.startRow < mousePos.dragRow
        ? mousePos.startRow
        : mousePos.dragRow;
    const maxRow =
      mousePos.startRow > mousePos.dragRow
        ? mousePos.startRow
        : mousePos.dragRow;
    const minCol =
      mousePos.startCol < mousePos.dragCol
        ? mousePos.startCol
        : mousePos.dragCol;
    const maxCol =
      mousePos.startCol > mousePos.dragCol
        ? mousePos.startCol
        : mousePos.dragCol;
    if (minRow > rows || maxRow < rows || minCol > cols || maxCol < cols) {
      return {};
    }
    const borderValue = '2px solid #5292F7';
    let result = {};
    if (rows === minRow) {
      result = { ...result, 'border-top': borderValue };
    }
    if (rows === maxRow) {
      result = { ...result, 'border-bottom': borderValue };
    }
    if (cols === minCol) {
      result = { ...result, 'border-left': borderValue };
    }
    if (cols === maxCol) {
      result = { ...result, 'border-right': borderValue };
    }
    return result;
  };

  /**
   * 마우스다운할 때 좌표값 세팅 및 드래그이벤트명을 mousemove로 변경함으로서 마우스이벤트 활성화
   * @param rows
   * @param cols
   */
  const mousedownBox = (rows, cols) => {
    mousePos.startRow = rows;
    mousePos.startCol = cols;
    mousePos.dragRow = rows;
    mousePos.dragCol = cols;
    mousePos.dragEventName = 'mousemove';
  };

  /**
   * 마우스업할 때 start~end의 행열 값을 가져오고 mv에 적용
   * @param rows
   * @param cols
   */
  const mouseupBox = (rows, cols) => {
    if (!mousePos.dragEventName) {
      return;
    }
    mousePos.endRow = rows;
    mousePos.endCol = cols;
    mousePos.dragEventName = null;
    const tempArr = [...mv.value];
    const minRow =
      mousePos.startRow < mousePos.endRow ? mousePos.startRow : mousePos.endRow;
    const maxRow =
      mousePos.startRow > mousePos.endRow ? mousePos.startRow : mousePos.endRow;
    const minCol =
      mousePos.startCol < mousePos.endCol ? mousePos.startCol : mousePos.endCol;
    const maxCol =
      mousePos.startCol > mousePos.endCol ? mousePos.startCol : mousePos.endCol;
    for (let i = minRow; i <= maxRow; i++) {
      for (let j = minCol; j <= maxCol; j++) {
        tempArr[i][j] = !tempArr[i][j];
      }
    }
    mv.value = [...tempArr];
    mousePos.dragRow = null;
    mousePos.dragCol = null;
  };

  /**
   * 마우스다운 후 이벤트명이 mousemove일 때 실행되는 이벤트
   * 즉, 드래그할 때의 박스들의 rows, cols값을 입력받음
   * @param rows
   * @param cols
   */
  const mousemoveBox = (rows, cols) => {
    mousePos.dragRow = rows;
    mousePos.dragCol = cols;
  };

  /**
   * tbody밖으로 마우스벗어나는 경우 마우스업하는 이벤트 실행
   */
  const mouseleaveBoxArea = () => {
    mouseupBox(mousePos.dragRow, mousePos.dragCol);
  };

  /**
   * 선택된 Column의 첫번째 row의 값의 반대로 전체 적용
   * @param wIdx
   */
  const selectColumn = (wIdx) => {
    const tempArr = [...mv.value];
    const firstValue = tempArr[0][wIdx];
    for (let i = 0; i < tempArr.length; i++) {
      tempArr[i][wIdx] = !firstValue;
    }
    mv.value = [...tempArr];
  };

  /**
   * 선택된 Row의 첫번째 column의 값의 반대로 전체 적용
   * @param hIdx
   */
  const selectRow = (hIdx) => {
    const tempArr = [...mv.value];
    const firstValue = tempArr[hIdx][0];
    for (let i = 0; i < tempArr[0].length; i++) {
      tempArr[hIdx][i] = !firstValue;
    }
    mv.value = [...tempArr];
  };

  return {
    mousePos,
    selectionStyle,
    mousedownBox,
    mouseupBox,
    mousemoveBox,
    mouseleaveBoxArea,
    selectColumn,
    selectRow,
  };
};
