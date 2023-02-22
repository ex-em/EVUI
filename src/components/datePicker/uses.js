import {
  ref, reactive, computed, watch,
  nextTick, getCurrentInstance,
} from 'vue';
import { getChangedValueByTimeFormat, getLastDateOfMonth } from '../calendar/uses';

const dateReg = new RegExp(/[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])/);
const dateTimeReg = new RegExp(/[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]/);

export const useModel = () => {
  const { props, emit } = getCurrentInstance();
  const timeFormat = props.options?.timeFormat;
  const isRangeMode = ['dateTimeRange', 'dateRange', 'dateMulti'].includes(props.mode);

  /**
   * time 이 포함된 mode 인 경우 timeFormat 에 따라 값 변경
   * @returns {string | string[]}
   */
  const getDateTimeValue = (currValue) => {
    let dateTimeValue;
    if (props.mode === 'dateTime') {
      dateTimeValue = getChangedValueByTimeFormat(timeFormat, currValue);
    } else if (props.modelValue.length) {
      const [fromTimeFormat, toTimeFormat] = timeFormat;
      dateTimeValue = [
        getChangedValueByTimeFormat(fromTimeFormat, currValue[0]),
        getChangedValueByTimeFormat(toTimeFormat, currValue[1]),
      ];
    }
    return dateTimeValue;
  };

  // Select 컴포넌트의 v-model 값
  const mv = computed({
    get: () => {
      if (!props.modelValue) {
        return (props.mode === 'date' || props.mode === 'dateTime') ? '' : [];
      }

      if (['dateTime', 'dateTimeRange'].includes(props.mode) && timeFormat) {
        return getDateTimeValue(props.modelValue);
      }

      return isRangeMode ? [...props.modelValue] : props.modelValue;
    },
    set: (value) => {
      if (['dateTime', 'dateTimeRange'].includes(props.mode) && timeFormat) {
         emit('update:modelValue', getDateTimeValue(value));
         return;
      }
      emit('update:modelValue', value);
    },
  });

  // mode: 'date' or 'dateTime'시 input box의 입력된 텍스트값
  let currentValue;
  if (['dateTimeRange', 'dateTime'].includes(props.mode) && timeFormat) {
    if (props.mode === 'dateTimeRange' && Array.isArray(props.modelValue) && props.modelValue.length === 2) {
      const [fromDate, toDate] = props.modelValue;
      const [fromTimeFormat, toTimeFormat] = timeFormat;

      props.modelValue = [
        getChangedValueByTimeFormat(fromTimeFormat, fromDate),
        getChangedValueByTimeFormat(toTimeFormat, toDate),
      ];
      currentValue = ref([...props.modelValue]);
    } else if (props.mode === 'dateTime' && props.modelValue) {
      currentValue = ref(getChangedValueByTimeFormat(timeFormat, props.modelValue));
    } else {
      currentValue = ref(props.modelValue);
    }
  } else {
    currentValue = ref(isRangeMode ? [...props.modelValue] : props.modelValue);
  }

  /**
   * Datepicker valid 체크
   * @param curr
   */
  const validateValue = (curr) => {
    const dateRule = targetDate => !!(targetDate.length === 10 && dateReg.exec(targetDate));
    const dateTimeRule = targetDate => !!(targetDate.length === 19 && dateTimeReg.exec(targetDate));
    const checkInvalidDateOfMonth = (targetDate) => {
      const dateValue = targetDate.split(' ')[0];
      const year = +dateValue.split('-')[0];
      const month = +dateValue.split('-')[1];
      const date = +dateValue.split('-')[2];
      const lastDateOfMonth = getLastDateOfMonth(year, month);
      return +date <= lastDateOfMonth;
    };

    let isValid = true;
    if (props.mode === 'date') {
      isValid = dateRule(curr) && checkInvalidDateOfMonth(curr);
    } else if (props.mode === 'dateTime') {
      isValid = dateTimeRule(curr) && checkInvalidDateOfMonth(curr);
    } else if (props.mode === 'dateRange') {
      isValid = curr.every(value => dateRule(value) && checkInvalidDateOfMonth(value));
    } else if (props.mode === 'dateTimeRange') {
      isValid = curr.every(value => dateTimeRule(value) && checkInvalidDateOfMonth(value));
    }

    if (isValid) {
      mv.value = isRangeMode ? [...curr] : curr;
    }

    currentValue.value = isRangeMode ? [...mv.value] : mv.value;
  };

  // clearable 모드일 때, 항목(mv) 전체 삭제 아이콘 존재여부
  const isClearableIcon = computed(() => {
    if (props.mode === 'date' || props.mode === 'dateTime') {
      return mv.value;
    }
    return mv.value.length;
  });

  /**
   * clearable모드일 때 [x] 아이콘 클릭 시 mv값을 초기화
   */
  const removeAllMv = () => {
    if (props.mode === 'date' || props.mode === 'dateTime') {
      mv.value = null;
    } else {
      mv.value.splice(0);
      mv.value = [...mv.value];
    }
  };

  /**
   * mode: dateMulti, type: date인 경우 선택된 value를 mv에서 삭제하는 로직
   * @param val - tagWrapper에서 [x]클릭된 목록의 value
   */
  const removeMv = (val) => {
    if (!props.disabled) {
      const idx = mv.value.indexOf(val);
      mv.value.splice(idx, 1);
      mv.value = [...mv.value];
    }
  };

  /**
   * 해당 컴포넌트의 v-model값이 변경(change)되는 이벤트
   * @param e
   */
  const changeMv = async (e) => {
    await nextTick();
    emit('change', mv.value, e);
  };

  return {
    mv,
    currentValue,
    isClearableIcon,
    validateValue,
    removeAllMv,
    changeMv,
    removeMv,
  };
};

export const useDropdown = () => {
  const { props } = getCurrentInstance();

  const isDropbox = ref(false);
  const datePicker = ref(null);
  const datePickerWrapper = ref(null);
  const dropbox = ref(null);
  const itemWrapper = ref(null);
  const dropboxPosition = reactive({
    top: null,
    right: null,
    left: null,
  });

  /**
   * dropdown box 위치 변경하는 메소드
   */
  const changeDropboxPosition = async () => {
    await nextTick();
    const datePickerRect = datePickerWrapper.value?.getBoundingClientRect();
    const dropboxRect = dropbox.value?.getBoundingClientRect();
    const datePickerHeight = datePickerRect.height;
    const datePickerY = datePickerRect.y;
    const datePickerX = datePickerRect.x;
    const dropboxHeight = dropboxRect.height;
    const dropboxWidth = dropboxRect.width;
    const docHeight = document.documentElement.clientHeight;
    const docWidth = document.documentElement.clientWidth;
    if (docHeight < datePickerY + datePickerHeight + dropboxHeight) {
      // dropTop
      dropboxPosition.top = `-${dropboxHeight}px`;
      if (docWidth < datePickerX + dropboxWidth) {
        dropboxPosition.left = 'auto';
        dropboxPosition.right = '0px';
      } else {
        dropboxPosition.left = '0px';
        dropboxPosition.right = 'auto';
      }
    } else {
      // dropDown
      dropboxPosition.top = `${datePickerHeight}px`;
      if (docWidth < datePickerX + dropboxWidth) {
        dropboxPosition.left = 'auto';
        dropboxPosition.right = '0px';
      } else {
        dropboxPosition.left = '0px';
        dropboxPosition.right = 'auto';
      }
    }
  };

  /**
   * 인풋박스 클릭 이벤트
   * props로 받는 항목이 없는 경우 return처리
   * 인풋박스 위 클릭된 이벤트위치로 드롭박스의 사이즈, 위치를 계산
   */
  const clickSelectInput = async () => {
    if (!props.disabled) {
      isDropbox.value = props.enableTextInput ? true : !isDropbox.value;
      if (isDropbox.value) {
        await changeDropboxPosition();
      }
    }
  };

  /**
   * 드롭박스 외부 클릭 이벤트
   * filterable 모드인 경우는 필터링텍스트를 비운다.
   */
  const clickOutsideDropbox = () => {
    isDropbox.value = false;
  };

  return {
    isDropbox,
    datePicker,
    datePickerWrapper,
    dropbox,
    itemWrapper,
    dropboxPosition,
    clickSelectInput,
    clickOutsideDropbox,
    changeDropboxPosition,
  };
};

export const useShortcuts = (param) => {
  const { props } = getCurrentInstance();
  const { mv, currentValue, clickOutsideDropbox } = param;

  const usedShortcuts = reactive([]);
  props.shortcuts?.forEach(({ value, label, shortcutDate }) => {
    usedShortcuts.push({
      key: value,
      label,
      shortcutDate,
      isActive: false,
    });
  });

  /**
   * active 되어있는 shortcut 제거
   */
  const clearShortcuts = () => {
    const targetShortcut = usedShortcuts.find(shortcut => shortcut.isActive);
    if (targetShortcut) {
      targetShortcut.isActive = false;
    }
  };

  /**
   * targetKey에 해당하는 shortcut을 active
   * @param targetKey
   */
  const activeShortcut = (targetKey) => {
    const targetShortcut = usedShortcuts.find(shortcut => shortcut.key === targetKey);
    if (targetShortcut) {
      targetShortcut.isActive = true;
    }
  };

  /**
   * 월, 일을 두자리 숫자로 보정
   * @param num
   * @returns {string|*}
   */
  const lpadToTwoDigits = (num) => {
    if (num === null) {
      return '00';
    } else if (+num < 10) {
      return `0${num}`;
    }
    return num;
  };

  /**
   * 'YYYY-MM-DD' 형식으로 format
   * @param targetDate
   * @returns string
   */
  const formatDate = (targetDate) => {
    const dateValue = targetDate ? new Date(targetDate) : new Date();
    const year = dateValue.getFullYear();
    const month = dateValue.getMonth() + 1;
    const day = dateValue.getDate();
    return `${year}-${lpadToTwoDigits(month)}-${lpadToTwoDigits(day)}`;
  };

  /**
   * 'YYYY-MM-DD HH:mm:ss' 형식으로 format
   * @param targetDateTime
   * @returns string
   */
  const formatDateTime = (targetDateTime) => {
    const dateTimeValue = targetDateTime ? new Date(targetDateTime) : new Date();
    const hour = dateTimeValue.getHours();
    const min = dateTimeValue.getMinutes();
    const sec = dateTimeValue.getSeconds();
    return `${formatDate(dateTimeValue)} ${lpadToTwoDigits(hour)}:${lpadToTwoDigits(min)}:${lpadToTwoDigits(sec)}`;
  };

  /**
   * 초기 shortcut 세팅
   * 해당하는 날짜면 active
   */
  const setActiveShortcut = () => {
    clearShortcuts();

    const isRange = ['dateRange', 'dateTimeRange'].includes(props.mode);

    if (!usedShortcuts.length
       || (props.mode === 'dateMulti' && props.options?.multiType !== 'date')
       || (isRange && !mv.value.length)
       || (!isRange && !mv.value)
    ) {
      return;
    }

    let targetKey;
    if (isRange) {
      const timeFormat = props.options?.timeFormat;
      const [fromDate, toDate] = mv.value;
      let targetShortcut;
      if (props.mode === 'dateTimeRange' && timeFormat?.length) {
        targetShortcut = usedShortcuts.find(({ shortcutDate }) => {
          const [sFromDate, sToDate] = shortcutDate();
          const [fromTimeFormat, toTimeFormat] = timeFormat;
          const formatFromDate = getChangedValueByTimeFormat(
            fromTimeFormat,
            formatDateTime(sFromDate),
          );
          const formatToDate = getChangedValueByTimeFormat(
            toTimeFormat,
            formatDateTime(sToDate),
          );
          const isCorrectFromDate = formatFromDate === formatDateTime(fromDate);
          const isCorrectToDate = formatToDate === formatDateTime(toDate);
          return isCorrectFromDate && isCorrectToDate;
        });
      } else {
        targetShortcut = usedShortcuts.find(({ shortcutDate }) => {
          const [sFromDate, sToDate] = shortcutDate();
          const formatFunc = props.mode === 'dateTimeRange' ? formatDateTime : formatDate;
          const isCorrectFromDate = formatFunc(sFromDate) === formatFunc(fromDate);
          const isCorrectToDate = formatFunc(sToDate) === formatFunc(toDate);
          return isCorrectFromDate && isCorrectToDate;
        });
      }
      targetKey = targetShortcut?.key;
    } else {
      const formatFunc = props.mode === 'dateTime' ? formatDateTime : formatDate;
      const date = formatFunc(mv.value);
      const targetShortcut = usedShortcuts.find(({ shortcutDate }) => {
        const sDate = formatFunc(shortcutDate());
        return sDate === date;
      });
      targetKey = targetShortcut?.key;
    }

    if (targetKey) {
      activeShortcut(targetKey);
    }
  };

  /**
   * shortcut을 클릭했을 때 이벤트
   * @param targetKey
   */
  const clickShortcut = (targetKey) => {
    const isRange = ['dateRange', 'dateTimeRange'].includes(props.mode);
    const targetShortcut = usedShortcuts.find(({ key }) => key === targetKey);

    if (!targetShortcut) {
      return;
    }

    const shortcutDate = targetShortcut.shortcutDate;
    const timeFormat = props.options?.timeFormat;

    if (isRange) {
      const [fromDate, toDate] = shortcutDate();
      if (props.mode === 'dateTimeRange') {
        if (timeFormat?.length) {
          const [fromTimeFormat, toTimeFormat] = timeFormat;

          mv.value = [
            getChangedValueByTimeFormat(fromTimeFormat, formatDateTime(fromDate)),
            getChangedValueByTimeFormat(toTimeFormat, formatDateTime(toDate)),
          ];
        } else {
          mv.value = [formatDateTime(fromDate), formatDateTime(toDate)];
        }
      } else {
        mv.value = [formatDate(fromDate), formatDate(toDate)];
      }
    } else {
      const sDate = shortcutDate();
      mv.value = props.mode === 'dateTime'
          ? getChangedValueByTimeFormat(
              timeFormat,
              formatDateTime(sDate))
          : formatDate(sDate);
    }

    clearShortcuts();
    activeShortcut(targetKey);
  };

  watch(
      () => props.modelValue,
      (curr) => {
        setActiveShortcut();
        if (props.mode === 'dateMulti'
            && props?.options?.multiType === 'date'
            && props?.options?.multiDayLimit > curr.length
        ) {
          return;
        } else if (
          props.mode === 'dateRange'
          || props.mode === 'dateTimeRange'
        ) {
          currentValue.value = [...curr];
          return;
        } else if (props.mode === 'dateTime') {
          currentValue.value = curr;
          return;
        }

        currentValue.value = curr;
        clickOutsideDropbox();
      },
  );

  return {
    usedShortcuts,
    clickShortcut,
    setActiveShortcut,
  };
};
