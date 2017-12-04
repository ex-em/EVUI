<template>
    <chart
        :data="data"
        :options="option">
    </chart>
</template>
<script>
    import chart from '../../vue/chartT/Chart.vue';
    import mock0 from '../../mock/chart/0.json';

    let rslt = mock0.map(
        v => [v.n01, v.n02, v.n03, v.n04, v.n05, v.n06, v.n07, v.n08, v.n09, v.n10, v.n11, v.n12])

    export default {
        componentName: 'chart',
        data () {
            return {
                data: {
                    series: [
                        {
                            data: [
                                {x: new Date(143134652600), y: rslt[0][0]},
                                {x: new Date(143234652600), y: rslt[0][1]},
                                {x: new Date(143340052600), y: rslt[0][2]},
                                {x: new Date(143366652600), y: rslt[0][3]},
                                {x: new Date(143410652600), y: rslt[0][4]},
                                {x: new Date(143508652600), y: rslt[0][5]},
                                {x: new Date(143569652600), y: rslt[0][6]},
                                {x: new Date(143579652600), y: rslt[0][7]},
                            ],
                        },
                        {
                            data: [
                                {x: new Date(143134652600), y: rslt[1][0]},
                                {x: new Date(143234652600), y: rslt[1][1]},
                                {x: new Date(143334652600), y: rslt[1][2]},
                                {x: new Date(143384652600), y: rslt[1][3]},
                                {x: new Date(143568652600), y: rslt[1][4]},
                            ],
                        },
                    ],
                },
                option : {
                    type: 'Line',
                    width: '400px',
                    height: '400px',
                    axisX: {
                        divisor: 5,
                        showGrid: true,
                        labelAlign: 'line',
                        tickFormat: function (value) {
                            let date;

                            if (!value) {
                                date = new Date();
                            }
                            else {
                                date = new Date(value);
                            }

                            return (date.getHours() < 10 ? '0' : '') + date.getHours() + ':' +
                                (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
                        },
                    },
                    axisY: {
                        showGrid: true,
                        high: 100
                    },
                    tooltip: {
                        xFormat: function (value) {
                            let date = new Date(parseInt(value));

                            return (date.getHours() < 10 ? '0' : '') + date.getHours() + ':' +
                                (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() + ':' +
                                (date.getSeconds() < 10 ? '0' : '') + date.getSeconds();
                        },
                    },

                }
            }
        },
        components: {
            chart
        }
    }
</script>
<style></style>
