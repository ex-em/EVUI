<template>
  <div class="get-content">
    <div>
      <code-view
        :vue-instance="component"
        :code="code"
      >
        <checkbox />
      </code-view>
    </div>
  </div>
</template>

<script>
  import codeView from '@/components/codeview/code';
  import Code from '../../src/code/checkbox';
  import checkbox from '../../examples/routers/checkbox';

  export default {
    components: {
      codeView,
      checkbox,
    },
    data() {
      return {
        component: checkbox,
        code: Code,
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
</style>
