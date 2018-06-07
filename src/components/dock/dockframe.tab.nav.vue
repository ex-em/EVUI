<template>
  <li
    @dblclick="removeTab($event)">
    <a
      :href="_tabNavId"
      class="link-tag"
      @mousedown="tabNavDown($event)"
    >{{ tabTitle }}</a>
  </li>
</template>

<script>
  export default {

    name: 'TabNav',
    props: {
      /**
       * tabNav id 입니다.
       */
      id: {
        type: String,
        default() {
          return 'evui-contact';
        },
      },
      /**
       * tabNav title를 적용합니다.
       */
      title: {
        type: String,
        default: '',
      },
      /**
       * tabNav title를 적용합니다.
       */
      tabIndex: {
        type: Number,
        default: 0,
      },
      /**
       * tabNav tabLen를 적용합니다.
       */
      tabLen: {
        type: Number,
        default: 0,
      },
    },

    data() {
      return {
        tabTitle: this.title,
        tabNavId: this.id,
        index: this.tabIndex,
      };
    },

    computed: {
        _tabNavId() {
            return `#${this.tabNavId}${this.index}`;
        },
    },
    mounted() {
        if (this.tabLen === 2) {
          if (this.index !== 0) {
            this.$el.classList.add('active');
          }
        } else {
          this.$el.classList.add('active');
        }
    },
    created() {

    },
    methods: {
      tabNavDown(event) {
        this.$emit('tabNavClick', event, this);
        event.stopPropagation();
      },
      removeTab(event) {
        this.$emit('removeTab', event, this);
      },
    },
  };
</script>

