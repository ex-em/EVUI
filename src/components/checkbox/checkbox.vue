<template>
  <div
    :class="wrapClasses"
    class="evui-checkbox"
  >
    <input
      :id="id"
      :name="name"
      :class="cls"
      :checked="checked"
      :disabled="disabled"
      :value="value"
      type="checkbox"
      @change="onChange"
    >
    <label
      :for="id"
    >
      {{ label }}
    </label>
  </div>
</template>

<script>
  import utils from '@/common/utils';

  export default {
    model: {
      prop: 'checked',
      event: 'onChange',
    },
    props: {
      id: {
        type: String,
        default() {
          return utils.getId();
        },
      },
      name: {
        type: String,
        default: null,
      },
      cls: {
        type: String,
        default: null,
      },
      label: {
        type: String,
        default: null,
      },
      checked: {
        type: Boolean,
        default: false,
      },
      disabled: {
        type: Boolean,
        default: false,
      },
      value: {
        type: [String, Number, Boolean],
        default: null,
      },
    },
    data() {
      return {
      };
    },
    computed: {
      wrapClasses() {
        return [
          {
            'evui-disabled': this.disabled,
          },
        ];
      },
    },
    methods: {
      onChange(event) {
        this.$emit('change', event.target.checked);
      },
    },
  };
</script>
