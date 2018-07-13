<template>
  <div
    ref="datepickerRef"
  />
</template>

<script>
  import Calendar from '@/components/datepicker/calendar';

  export default {
    components: {
      Calendar,
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
    },
    data() {
      return {
        calendar: null,
      };
    },
    computed: {
    },
    created() {
    },
    mounted() {
      this.calendar = new Calendar(this.$refs.datepickerRef, null);
    },
    beforeDestroy() {
    },
    methods: {
    },
  };
</script>

<style scoped>
</style>
