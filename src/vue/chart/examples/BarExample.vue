<template>
    <bar></bar>
</template>

<script>
    import Bar from '../bar/barchart.vue'

    export default {
        // 컴포넌트의 renderChart를 가져다쓰려면 mixins이 최선일까..
        // Bar.extend 쓰려다가 js파일엔 extend가 되는데 vue파일엔 안됨..
        mixins: [ Bar ],

        components: {
            Bar
        },

        data () {
          return {
              chartData: {

              },

              options: {

              }
          }
        },

        mounted: function(){
            this.renderChart(this.chartData, this.options)
        }
    }
</script>

<style>

</style>
