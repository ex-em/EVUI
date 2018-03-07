<template>
  <div
    class="evui-checkbox"
    :class="wrapClasses"
  >
    <input
      type="checkbox"
      :id="id"
      :name="name"
      :class="cls"
      :checked="checked"
      :disabled="disabled"
      :value="value"
      @change="onChange"
    >
    <label
      :for="id"
    >
      {{ labelData }}
    </label>
  </div>
</template>

<script>
  import utils from '@/common/utils.js';

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
        labelData: this.label,
      };
    },
    computed: {
      wrapClasses() {
        return [
          {
            'evui-diabled': this.disabled,
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
