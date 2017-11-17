<template>
    <div></div>
</template>
<script>
    import BarChart from "./charts/BarChart.js"
    import PieChart from "./charts/PieChart"
    import LineChart from "./charts/LineChart.js"

    export default {
        props: {
            data: Object,
            options: Object
        },
        data() {
            return {
                chart: null
            }
        },
        computed: {

        },
        methods: {

        },
        mounted: function() {
            if (this.options.type === 'Bar') {
                this.chart = new BarChart(this.$el, this.$props.data, this.$props.options);
            }
            else if (this.options.type === 'Pie') {
                this.chart = new PieChart(this.$el, this.$props.data, this.$props.options);
            }
            else {
                this.chart = new LineChart(this.$el, this.$props.data, this.$props.options);
            }

            this.chart.createChart();
        }
    }
</script>
<style src="./Chart.css" />