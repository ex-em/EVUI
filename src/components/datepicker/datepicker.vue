<template>
  <div
    v-click-outside="hideDatepicker"
  >
    <div
      :class="wrapClasses"
      :style="{width: `235px`}"
    >
      <input
        ref="datepickerText"
        :style="{width: `235px`}"
        :class="inputClasses"
        type="text"
        placeholder=" yyyy-mm-dd "
      >
    </div>
    <calendar
      ref="calendarRef"
      :data-obj="calObj"
    />
  </div>
</template>

<script>
  import calendar from '@/components/datepicker/calendar';

  const prefixCls = 'evui-input-text';

  export default {
    components: {
      calendar,
    },
    directives: {
      // 해당 element 외의 클릭 시
      'click-outside': {
        bind(el, binding) {
          const element = el;
          const bind = binding;
          // Define Handler and cache it on the element
          const bubble = bind.modifiers.bubble;
          const handler = (e) => {
            if (bubble || (!element.contains(e.target) && element !== e.target)) {
              bind.value(e);
            }
          };
          element.__vueClickOutside__ = handler;
          // add Event Listeners
          document.addEventListener('click', handler);
        },
        unbind(el) {
          const element = el;
          // Remove Event Listeners
          document.removeEventListener('click', element.__vueClickOutside__);
          element.__vueClickOutside__ = null;
        },
      },
    },
    props: {
      calObj: {
        type: Object,
        default() {
          return {
            width: this.width,
            height: this.height,
          };
        },
      },
    },
    data() {
      return {
        width: 235,
        height: 200,
      };
    },
    computed: {
      wrapClasses() {
        return [
          `${prefixCls}`,
          {
            [`${prefixCls}-disabled`]: this.disabled,
          },
        ];
      },
      inputClasses() {
        return `${prefixCls}-input`;
      },
    },
    created() {
    },
    mounted() {
    },
    beforeDestroy() {
    },
    methods: {
      hideDatepicker() {
//        console.log('hideDatepicker');
      },
    },
  };
</script>

<style scoped>
</style>
