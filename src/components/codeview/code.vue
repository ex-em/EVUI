<template>
  <div class="test">
    <div>
      <slot/>
    </div>
    <div class="show-text">
      <pre>
        <code
          ref="code"
          :class="language"
        >
          {{ realm }}
        </code>
      </pre>
    </div>
  </div>
</template>

<script>
  /*eslint-disable*/
  import hljs from 'hljs';

  export default {
    props: {
      code: {
        type: Object,
        default: null,
      },
      vueInstance: {
        type: Object,
        default: null,
      },
    },
    data() {
      return {
        resource: {},
        realm: 'test',
      };
    },
    created() {
      this.$http.get(`../../examples/routers/checkbox.vue`)
        .then((result) => {
          console.log(result);
          //this.data = result.data;
          // if (this.data !== '') {
          //   const token = this.codeParser(this.data);
          //   this.form.html = `<script src="${this.form.vue}">${this.form.endScript}\n<script src="${this.form.evui}">${this.form.endScript}\n${token.template}`;
          //   this.form.js = token.script;
          //   this.form.css = token.style;
          // }
        }, () => {});
    },
    mounted() {
      this.codeEl = this.$refs.code.innerHTML.replace(/\n/, '');
      this.$refs.code.innerHTML = this.codeEl;
      hljs.highlightBlock(this.$refs.code);

      console.log(this.source);

      this.resource = this.parseVueCode(this.source);
    },
    computed: {
      language:function() {
        return `html`;
      }
    },
    methods: {
      onClickEvent: function onClcickEvent() {
        console.log(hljs);
        console.log(this.code);
      },

      parseVueCode: function parseVueCode(vueComponent) {
          console.log(vueComponent);
      },
    },
  };
</script>

<style scoped>

</style>
