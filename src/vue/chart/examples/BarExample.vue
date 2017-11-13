<template>
    <bar-chart :title="title" :width="width" :height="height" :rows="rows" :columns="columns" :data="data" :stacked="stacked"></bar-chart>
</template>

<script>
    import BarChart from '../bar/barChart.vue'

    export default {
        // 컴포넌트의 renderChart를 가져다쓰려면 mixins이 최선일까..
        // Bar.extend 쓰려다가 js파일엔 extend가 되는데 vue파일엔 안됨..
        //mixins: [ Bar ],

        components: {
            BarChart
        },

        data () {
          return {
                title: 'bar chart example',
                rows: ['Neo', 'Trinity', 'Morpheus'],
                columns: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
                width: 640,
                height: 480,
                data: [[1,2,3,4,5], [6,7,8,9,10], [4,5,6,7,8]],
                stacked: false
          }
        },

        mounted: function(){
            //this.renderChart(this.chartData, this.options)
        }
    }
</script>

<style>

</style>
