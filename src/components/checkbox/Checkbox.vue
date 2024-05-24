<template>
  <label
    class="ev-checkbox"
    :class="[
      { disabled, },
      { checked, },
    ]"
  >
    <input
      ref="checkbox"
      v-model="mv"
      type="checkbox"
      class="ev-checkbox-input"
      :disabled="disabled"
      :value="label"
      :readonly="readonly"
      @change="changeMv"
    />
    <span
      ref="checkboxLabel"
      class="ev-checkbox-label"
    >
      <template v-if="$slots.default">
        <slot />
      </template>
      <template v-else>
        {{ label }}
      </template>
    </span>
  </label>
</template>

<script>
import { ref, computed, watch, nextTick, inject, onMounted } from 'vue';

export default {
  name: 'EvCheckbox',
  props: {
    modelValue: {
      type: [String, Number, Boolean, Symbol, Array],
      default: false,
    },
    label: {
      type: [String, Number, Boolean, Symbol, Object],
      default: null,
    },
    tooltipTitle: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    indeterminate: {
      type: Boolean,
      default: false,
    },
  },
  emits: {
    'update:modelValue': null,
    'update:indeterminate': [Boolean],
    change: null,
  },
  setup(props, { emit }) {
    /**
     * checkbox label Ref
     */
    const checkboxLabel = ref();

    /**
     * checkbox label의 title(마우스 호버 시 보이는 내용)사용 되는
     * tooltipTitle props의 값이 있을 시 태그에 title 속성 추가
     */
    onMounted(() => {
      if (checkboxLabel.value && props.tooltipTitle) {
        checkboxLabel.value.title = props.tooltipTitle;
      }
    });
    /**
     * checkbox Ref
     */
    const checkbox = ref(null);

    /**
     * checkbox의 modelView 값
     * checkbox group 컴포넌트를 사용하는 경우 Provide('EvCheckboxGroupMv')가 실행
     * checkbox group 컴포넌트가 없는 경우 2nd argument 실행
     *   - checkbox html5 indeterminate attribute 여부에 따라 v-model:indeterminate값을 update
     *   - Vue3의 v-model:attr 방식은 Vue2의 :attr.sync와 동일 (사용방식이 변경)
     */
    const mv = inject(
      'EvCheckboxGroupMv',
      computed({
        get: () => props.modelValue,
        set: (val) => {
          if (val && !checkbox.value.indeterminate) {
            emit('update:indeterminate', false);
          }
          emit('update:modelValue', val);
        },
      }),
    );

    /**
     * mv에 해당 값이 포함 또는 동일한지에 따라 check여부가 결정
     * return {Boolean}
     */
    const refLabel = computed(() => props.label);
    const checked = computed(() => {
      if (Array.isArray(mv.value)) {
        return mv.value.includes(refLabel.value);
      }
      return mv.value;
    });

    /**
     * 해당 컴포넌트를 '직접' 클릭하여 변경했을 때 실행되는 메소드
     * checkbox group을 사용하는 경우 Provide('EvCheckboxGroupChange')가 실행
     * checkbox group을 사용하지 않는 경우 2nd argument 실행
     */
    const changeMv = inject(
      'EvCheckboxGroupChange',
      async (e) => {
        await nextTick();
        emit('change', mv.value, e);
      },
    );

    /**
     * props의 indeterminate 값을 감시하여
     * checkbox element의 indeterminate attribute에 값 적용
     */
    watch(
      () => props.indeterminate,
      async (val) => {
        await nextTick(() => {
          if (!checkbox.value) {
            return;
          }
          checkbox.value.indeterminate = val;
        });
      }, { immediate: true },
    );

    return {
      mv,
      checkboxLabel,
      checkbox,
      checked,
      changeMv,
    };
  },
};
</script>

<style lang="scss">
@import '../../style/index.scss';

.ev-checkbox {
  margin-right: 30px;
  cursor: pointer;
  user-select: none;
  &-label {
    padding-left: 5px;
  }
  &-input {
    cursor: pointer;
  }
}

@include state('disabled') {
  .ev-checkbox-label {
    @include evThemify() {
      color: evThemed('disabled');
    }
  }
  .ev-checkbox-input,
  .ev-checkbox-label {
    cursor: not-allowed !important;
  }
}
@include state('type-button') {
  .ev-checkbox {
    display: inline-block;
    padding: 0;
    margin: 0;
    text-align: center;

    @include evThemify() {
      border: 1px solid evThemed('border-base');
      border-left: 0;
    }
    &:first-child {
      border-radius: $default-radius 0 0 $default-radius;

      @include evThemify() {
        border-left: 1px solid evThemed('border-base');
      }
    }
    &:last-child {
      border-radius: 0 $default-radius $default-radius 0;
    }
    &.checked {
      color: $color-white;

      @include evThemify() {
        background-color: evThemed('primary');
      }
    }
    &.disabled.checked {
      @include evThemify() {
        background-color: rgba(evThemed('border-base'), 0.5);
      }
    }
  }
  .ev-checkbox-input {
    @include visible-hide();
  }
  .ev-checkbox-label {
    display: inline-block;
    padding: 7px 12px;
  }
}
</style>
