import {
  ref, reactive, computed, watch,
  nextTick, getCurrentInstance,
} from 'vue';

const dateReg = new RegExp(/[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])/);
const dateTimeReg = new RegExp(/[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]/);

export const useModel = () => {
  const { props, emit } = getCurrentInstance();

  // Select 컴포넌트의 v-model 값
  const mv = computed({
    get: () => {
      if (!props.modelValue) {
        return (props.mode === 'date' || props.mode === 'dateTime') ? '' : [];
      }
      return props.modelValue;
    },
    set: value => emit('update:modelValue', value),
  });

  // mode: 'date' or 'dateTime'시 input box의 입력된 텍스트값
  const currentValue = ref(props.modelValue);

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

export const useDropdown = (param) => {
  const { props } = getCurrentInstance();
  const { currentValue } = param;

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

  watch(
    () => props.modelValue,
    (curr) => {
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
  const { mv } = param;

  /**
   * shortcuts default 값 세팅
   * date, dateTime인 경우 'yesterday', 'today'만 가능
   * dateRange, dateTimeRange인 경우 'lastMonth', 'lastWeek', 'yesterday', 'today' 가능
   */
  let defaultShortcuts = ['lastMonth', 'lastWeek', 'yesterday', 'today'];
  if (['date', 'dateTime'].includes(props.mode)) {
    defaultShortcuts = ['yesterday', 'today'];
  } else if (props.mode === 'dateMulti') {
    defaultShortcuts = [];
  }

  const usedShortcuts = reactive([]);
  props.shortcuts?.forEach((shortcut) => {
    if (defaultShortcuts.includes(shortcut)) {
      usedShortcuts.push({
        key: shortcut,
        label: shortcut,
        isActive: false,
      });
    }
  });

  /**
   * active 되어있는 shortcut 제거
   */
  const clearShortcuts = () => {
    const activeShortcut = usedShortcuts.find(shortcut => shortcut.isActive);
    if (activeShortcut) {
      activeShortcut.isActive = false;
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
   * 시, 분, 초를 원하는 값으로 변환
   * @param hour
   * @param min
   * @param sec
   * @returns {Date}
   */
  const getChangedDateTime = (hour, min, sec) => {
    const dateTimeValue = new Date();
    dateTimeValue.setHours(hour);
    dateTimeValue.setMinutes(min);
    dateTimeValue.setSeconds(sec);
    return dateTimeValue;
  };

  /**
   * 초기 shortcut 세팅
   * 해당하는 날짜면 active
   */
  const initActiveShortcut = () => {
    clearShortcuts();

    const isRange = ['dateRange', 'dateTimeRange'].includes(props.mode);

    if (!usedShortcuts.length
       || props.mode === 'dateMulti'
       || (isRange && !mv.value.length)
       || (!isRange && !mv.value)
    ) {
      return;
    }
    const today = formatDate();
    const yesterday = formatDate(new Date().setDate(new Date().getDate() - 1));
    const lastWeek = formatDate(new Date().setDate(new Date().getDate() - 6));
    const lastMonth = formatDate(new Date().setDate(new Date().getDate() - 30));
    let targetKey;

    if (isRange) {
      const [fromDate, toDate] = mv.value;
      const from = formatDate(fromDate);
      const to = formatDate(toDate);

      if (to !== today) {
        return;
      }

      if (from === lastMonth) {
        targetKey = 'lastMonth';
      } else if (from === lastWeek) {
        targetKey = 'lastWeek';
      } else if (from === yesterday) {
        targetKey = 'yesterday';
      } else if (from === today) {
        targetKey = 'today';
      }
    } else {
      const date = formatDate(mv.value);

      if (date === yesterday) {
        targetKey = 'yesterday';
      } else if (date === today) {
        targetKey = 'today';
      }
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
    const currentDate = new Date();
    const isRange = ['dateRange', 'dateTimeRange'].includes(props.mode);

    const getChangedValue = (targetDate) => {
      let subtractDate = 0;

      switch (targetKey) {
        case 'lastMonth':
          subtractDate = 30;
          break;
        case 'lastWeek':
          subtractDate = 6;
          break;
        case 'yesterday':
          subtractDate = 1;
          break;
        case 'today':
        default:
          break;
      }

      return new Date(targetDate).setDate(currentDate.getDate() - subtractDate);
    };

    if (isRange) {
      if (props.mode === 'dateTimeRange') {
        const fromDate = mv.value[0] ? new Date(mv.value[0]) : new Date();
        const toDate = mv.value[1] ? new Date(mv.value[1]) : new Date();
        const from = getChangedDateTime(
            fromDate.getHours(),
            fromDate.getMinutes(),
            fromDate.getSeconds(),
        );
        let to = getChangedDateTime(
            toDate.getHours(),
            toDate.getMinutes(),
            toDate.getSeconds(),
        );

        if (from > to) {
          to = getChangedDateTime(23, 59, 59);
        }

        mv.value = [formatDateTime(getChangedValue(from)), formatDateTime(to)];
      } else {
        mv.value = [formatDate(getChangedValue(new Date())), formatDate(new Date())];
      }
    } else if (props.mode === 'dateTime') {
     const currDate = mv.value ? new Date(mv.value) : new Date();
     const changedValue = getChangedDateTime(
        currDate.getHours(),
        currDate.getMinutes(),
        currDate.getSeconds(),
     );
     mv.value = formatDateTime(changedValue);
   } else {
     const changedValue = getChangedValue(new Date());
     mv.value = formatDate(changedValue);
   }

    clearShortcuts();
    activeShortcut(targetKey);
  };

  return {
    usedShortcuts,
    clickShortcut,
    initActiveShortcut,
  };
};
