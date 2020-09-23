import { ref, reactive, computed, watch, getCurrentInstance } from 'vue';

export const useModel = () => {
  const { props, emit } = getCurrentInstance();

  const mv = computed({
    get: () => (props.items.map(v => v.value).includes(props.modelValue)
      ? props.modelValue : null),
    set: value => emit('update:modelValue', value),
  });
  const mvName = computed(() => props.items.find(v => v.value === mv.value)?.name);
  const clickItem = (val) => { mv.value = val; };

  return {
    mv,
    mvName,
    clickItem,
  };
};

export const useDropdown = () => {
  const { props } = getCurrentInstance();

  const select = ref();
  const dropboxPosition = reactive({
    top: 0,
    left: 0,
    width: 0,
  });
  const isDropbox = ref(false);
  watch(
    () => select.value?.getBoundingClientRect().width,
    (width) => {
      dropboxPosition.width = width;
    },
  );

  const dropdownStyle = computed(() => ({
    top: `${dropboxPosition.top}px`,
    left: `${dropboxPosition.left}px`,
    width: `${dropboxPosition.width}px`,
  }));

  const clickSelectInput = (e) => {
    if (!props.items.length) {
      return;
    }
    isDropbox.value = true;
    const borderWidth = (select.value.offsetWidth - select.value.clientWidth) / 2;
    dropboxPosition.left = e.clientX - e.offsetX - borderWidth;
    dropboxPosition.top = e.clientY - e.offsetY + props.inputSize.height - borderWidth;
  };
  const clickDropbox = () => { isDropbox.value = true; };
  const clickOutsideDropbox = () => { isDropbox.value = false; };

  return {
    select,
    isDropbox,
    dropdownStyle,
    clickSelectInput,
    clickDropbox,
    clickOutsideDropbox,
  };
};
