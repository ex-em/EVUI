<template>
  <div
    :id="_tabPanelId"
    class="tab-pane">
    <component
      :is="_evuiContent"/>
    {{ tabIndex }}
  </div>
</template>

<script>
  export default {

    name: 'TabPanel',
    props: {
      /**
       * TabPanel id 입니다.
       */
      id: {
        type: String,
        default() {
          return 'evui-contact';
        },
      },
      /**
       * TabPanel title를 적용합니다.
       */
      evuiComponent: {
        type: Object,
        default: null,
      },
      /**
       * TabPanel title를 적용합니다.
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
        tabPanelId: this.id,
        evuiContent: this.evuiComponent,
        index: this.tabIndex,
      };
    },

    computed: {
      _evuiContent() {
        return this.evuiContent;
      },
      _tabPanelId() {
        return `${this.tabPanelId}${this.index}`;
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
    },
  };
</script>

