import {
  ref, reactive, computed, watch,
  onMounted, onBeforeUnmount,
  nextTick, getCurrentInstance,
} from 'vue';

const dateReg = new RegExp(/[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])/);
const dateTimeReg = new RegExp(/[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]/);

const useModel = () => {
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

  // 드랍박스 존재 여부
  const isDropbox = ref(false);

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
      isDropbox.value = false;
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
    isDropbox,
    isClearableIcon,
    validateValue,
    removeAllMv,
    changeMv,
    removeMv,
  };
};

const useDropdown = (param) => {
  const { props } = getCurrentInstance();
  const { isDropbox, currentValue } = param;

  /**
   * 인풋박스 클릭 이벤트
   * props로 받는 항목이 없는 경우 return처리
   * 인풋박스 위 클릭된 이벤트위치로 드롭박스의 사이즈, 위치를 계산
   */
  const clickSelectInput = () => {
    if (!props.disabled) {
      isDropbox.value = !isDropbox.value;
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
      } else if (props.mode === 'dateTime') {
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
    clickSelectInput,
    clickOutsideDropbox,
  };
};

const usePosition = (param) => {
  const { isDropbox } = param;

  const datePicker = ref(null);
  const itemWrapper = ref(null);
  const dropboxPosition = reactive({
    top: 0,
    left: 0,
  });

  /**
   * dropdown box가 나타날 때의 position style
   */
  const dropdownStyle = computed(() => ({
    top: `${dropboxPosition.top}px`,
    left: `${dropboxPosition.left}px`,
  }));

  /**
   * 해당 컴포넌트 setup() 초기에 modal을 body에 append함.
   * dropdown의 teleport to=":id"의 DOM을 미리 구성하기 위함.
   */
  const createDropdownEl = () => {
    const DROPDOWN_CLS = 'ev-date-picker-dropdown-modal';
    const targetEl = document.getElementById(DROPDOWN_CLS);
    if (!document.body.contains(targetEl)) {
      const dropdownEl = document.createElement('div');
      dropdownEl.setAttribute('id', DROPDOWN_CLS);
      document.body.appendChild(dropdownEl);
    }
  };

  /**
   * dropdown box 위치 변경하는 메소드
   */
  const changeDropboxPosition = () => {
    if (isDropbox.value) {
      const targetRect = datePicker.value.getBoundingClientRect();
      dropboxPosition.top = window.pageYOffset + targetRect.top + targetRect.height;
      dropboxPosition.left = window.pageXOffset + targetRect.left;
    }
  };

  /**
   * dropdown box의 위치를 감지하는 메소드
   * 마운트, 비포마운트 훅에서 resize이벤트로 드랍다운박스의 포지션을 변경함
   */
  const observeDropbox = () => {
    onMounted(() => {
      window.addEventListener('resize', changeDropboxPosition);
    });
    onBeforeUnmount(() => {
      window.removeEventListener('resize', changeDropboxPosition);
    });
  };

  watch(
    () => isDropbox.value,
    (cur) => {
      if (cur) {
        changeDropboxPosition();
      }
    },
  );

  return {
    datePicker,
    itemWrapper,
    dropdownStyle,
    createDropdownEl,
    observeDropbox,
  };
};

export {
  useModel,
  useDropdown,
  usePosition,
};
