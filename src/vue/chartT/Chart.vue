<template>
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
<style>
    .chart {
        float: left;
    }

    .bar {
        fill: none;
        stroke-width: 10px;
        cursor: pointer;
    }

    .line {
        fill: none;
        stroke-width: 4px;
    }

    .point {
        stroke-width: 10px;
        stroke-linecap: round;
        cursor: pointer;
    }

    .series-listener {
        opacity: 0;
    }

    .label {
        fill: rgba(0, 0, 0, 1);
        color: rgba(0, 0, 0, 1);
        font-size: 0.75rem;
        line-height: 1;
    }

    .chart .label {
        vertical-align: middle;
        text-align: center;
        display: block;
    }

    .chart .pie-label {
        fill: rgba(255, 255, 255, 1);
        color: rgba(255, 255, 255, 1);
        font-size: 1.5rem;
        dominant-baseline: central;
    }

    .grid-line {
        stroke: rgba(0, 0, 0, 0.2);
        stroke-width: 1px;
        stroke-dasharray: 2px;
    }

    .legend {
        position: relative;
        z-index: 10;
        list-style: none;
        text-align: center;
    }

    .legend li {
        height: 15px;
        position: relative;
        padding-left: 23px;
        /*margin-right: 10px;*/
        /*margin-bottom: 3px;*/
        cursor: pointer;
        display: inline-block;
    }

    .legend-box {
        position: absolute;
        width: 14px;
        height: 14px;
        top: 4px;
    }

    .legend-name {
        width: 100%;
        padding-right: 25px;
        padding-left: 25px;
        box-sizing: border-box;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
    }

    .legend-value {
        position: absolute;
        right: 0px;
        top: 0px;
    }

    .inactive .legend-box {
        background: transparent !important;
    }

    .legend.right {
        float: none;
        overflow: hidden;
    }

    .legend.right li{
        margin: 0;
    }

    .bar.lowlight,
    .line.lowlight,
    .point.lowlight {
        stroke-opacity: 0.5;
    }

    .tooltip {
        position: absolute;
        display: inline-block;
        opacity: 0;
        min-width: 5em;
        padding: .5em;
        background: #eeeeee;
        color: #453D3F;
        font-family: Oxygen,Helvetica,Arial,sans-serif;
        text-align: center;
        pointer-events: none;
        z-index: 99;
        -webkit-transition: opacity .2s linear;
        -moz-transition: opacity .2s linear;
        -o-transition: opacity .2s linear;
        transition: opacity .2s linear;
    }

    .tooltip:before {
        content: "";
        position: absolute;
        top: 100%;
        left: 50%;
        width: 0;
        height: 0;
        margin-left: -15px;
        border: 15px solid transparent;
        border-top-color: #eeeeee;
    }

    .tooltip.tooltip-show {
        opacity: 1;
    }

    .tooltip-meta {
        font-size:13px;
        margin-bottom: 6px;
        padding-bottom: 2px;
        border-bottom: 1px solid #D2D2D2;
    }

    .tooltip-series {
        font-size:12px;
        position: relative;
        text-indent: 12px;
        height: 14px;
        display: block;
    }

    .tooltip-series-color {
        position:absolute;
        left:0px;
        top:2px;
        display: inline-block;
        width: 7px;
        height: 9px;
    }

    .tooltip-series-text {
        float:right;
        margin-left:8px;
    }

    .tooltip-value {
        font-size:12px;
        position: relative;
        text-indent: 12px;
        height: 14px;
        display: block;
        float: right;
    }

</style>