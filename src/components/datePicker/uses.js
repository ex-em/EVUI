import {
  ref, reactive, computed, watch,
  nextTick, getCurrentInstance,
} from 'vue';
import { getChangedValueByTimeFormat } from '../calendar/uses';

const dateReg = new RegExp(/[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])/);
const dateTimeReg = new RegExp(/[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]/);

export const useModel = () => {
  const { props, emit } = getCurrentInstance();
  const timeFormat = props.options?.timeFormat;

  // Select 컴포넌트의 v-model 값
  const mv = computed({
    get: () => {
      if (!props.modelValue) {
        return (props.mode === 'date' || props.mode === 'dateTime') ? '' : [];
      }
      if (['dateTime', 'dateTimeRange'].includes(props.mode) && timeFormat) {
          if (props.mode === 'dateTime') {
            return getChangedValueByTimeFormat(timeFormat, props.modelValue);
          } else if (props.modelValue.length) {
            const [fromTimeFormat, toTimeFormat] = timeFormat;
            return [
                getChangedValueByTimeFormat(fromTimeFormat, props.modelValue[0]),
                getChangedValueByTimeFormat(toTimeFormat, props.modelValue[1]),
            ];
          }
      }
      return props.modelValue;
    },
    set: value => emit('update:modelValue', value),
  });

  // mode: 'date' or 'dateTime'시 input box의 입력된 텍스트값
  let currentValue;
  if (['dateTimeRange', 'dateTime'].includes(props.mode) && timeFormat) {
    if (props.mode === 'dateTimeRange' && props.modelValue.length) {
      const [fromDate, toDate] = props.modelValue;
      const [fromTimeFormat, toTimeFormat] = timeFormat;

      props.modelValue = [
        getChangedValueByTimeFormat(fromTimeFormat, fromDate),
        getChangedValueByTimeFormat(toTimeFormat, toDate),
      ];
      currentValue = ref(props.modelValue);
    } else if (props.mode === 'dateTime' && props.modelValue) {
      currentValue = ref(getChangedValueByTimeFormat(timeFormat, props.modelValue));
    } else {
      currentValue = ref(props.modelValue);
    }
  } else {
    currentValue = ref(props.modelValue);
  }

  const validateValue = (curr) => {
    if (props.mode === 'date'
      && (curr.length !== 10 || !dateReg.exec(curr))
    ) {
      currentValue.value = mv.value;
    } else if (props.mode === 'dateTime'
      && (curr.length !== 19 || !dateTimeReg.exec(curr))
    ) {
      currentValue.value = mv.value;
    } else {
      mv.value = curr;
    }
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
    const datePickerRect = datePicker.value?.getBoundingClientRect();
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
      isDropbox.value = !isDropbox.value;
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
      const [fromDate, toDate] = mv.value;
      const targetShortcut = usedShortcuts.find(({ shortcutDate }) => {
        const [sFromDate, sToDate] = shortcutDate();
        const isCorrectFromDate = formatDate(sFromDate) === formatDate(fromDate);
        const isCorrectToDate = formatDate(sToDate) === formatDate(toDate);
        return isCorrectFromDate && isCorrectToDate;
      });
      targetKey = targetShortcut?.key;
    } else {
      const date = formatDate(mv.value);
      const targetShortcut = usedShortcuts.find(({ shortcutDate }) => {
        const sDate = formatDate(shortcutDate());
        return sDate === formatDate(date);
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
        } else if (props.mode === 'dateTime' || props.mode === 'dateTimeRange') {
          currentValue.value = curr;
          return;
        } else if (props.mode === 'date') {
          currentValue.value = curr;
        }
        clickOutsideDropbox();
      },
  );

  return {
    usedShortcuts,
    clickShortcut,
    setActiveShortcut,
  };
};
