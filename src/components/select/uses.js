import { ref, reactive, computed, getCurrentInstance, nextTick } from 'vue';

export const useModel = () => {
  const { props, emit } = getCurrentInstance();

  const mv = computed({
    get: () => (props.items.map(v => v.value).includes(props.modelValue)
      ? props.modelValue : null),
    set: value => emit('update:modelValue', value),
  });
  const mvName = computed(() => props.items.find(v => v.value === mv.value)?.name);

  const clickItem = (val) => { mv.value = val; };
  const changeMv = async (e) => {
    await nextTick();
    emit('change', mv.value, e);
  };

  return {
    mv,
    mvName,
    clickItem,
    changeMv,
  };
};

export const useDropdown = () => {
  const { props } = getCurrentInstance();

  const select = ref();
  const dropboxPosition = reactive({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });
  const isDropbox = ref(false);

  const dropdownStyle = computed(() => ({
    top: `${dropboxPosition.top}px`,
    left: `${dropboxPosition.left}px`,
    width: `${dropboxPosition.width}px`,
  }));

  const clickSelectInput = (e) => {
    if (!props.items.length) {
      return;
    }
    isDropbox.value = !isDropbox.value;
    const borderWidth = (select.value.offsetWidth - select.value.clientWidth) / 2;
    const selectRect = select.value?.getBoundingClientRect();

    dropboxPosition.left = e.pageX - e.offsetX - borderWidth;
    dropboxPosition.top = e.pageY - e.offsetY + selectRect?.height - borderWidth;
    dropboxPosition.width = selectRect?.width;
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
