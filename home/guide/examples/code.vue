<template>
  <div class="get-content">
    <div>
      <code-view
        :code-url="codeUrl"
      >
        <checkbox/>
      </code-view>
    </div>
  </div>
</template>

<script>
  import codeView from '@/components/codeview/code';
  import checkbox from '../../../examples/routers/checkbox';

  export default {
    components: {
      codeView,
      checkbox,
    },
    data() {
      return {
        component: checkbox,
        codeUrl: './guide/components/checkbox.vue',
        list: [
          {
            text: 'a',
          },
          {
            text: 'b',
          },
          {
            text: 'c',
          },
        ],
        obj: {
          b: false,
          c: true,
        },
        returnList: null,
      };
    },
    computed: {
      computedList: {
        get() {
          /*eslint-disable*/
          const list = this.list;
          list.map((v) => {
            const value = v;
            if (this.obj[v.text]) {
              let object = {};
              object.boolValue = this.obj[value.text];
              v = Object.assign( v,  object);
            }
            return v;
          });

          return list;
        },
        set(newValue) {
          this.list = newValue;
        },
      },
    },
    methods: {
      clickEvent: function() {
        this.computedList = this.computedList.filter((v) => {
          v.boolValue = !v.boolValue;
          return v;
        });
      }
    }
  };
</script>

<style scoped>
  h4 {
    color: mediumseagreen;
  }
  h5 {
    color: darkorange;
  }
</style>
