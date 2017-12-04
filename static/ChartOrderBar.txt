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
                    categories: ['Jan', 'Feb'],
                    series: rslt.slice(0, 4)
                },
                option : {
                    type: 'Bar',
                    width: '500px',
                    height: '400px',
                    isHorizontalBar: true,
                    seriesBarDistance: 10,
                    axisX: {
                        showGrid: true,
                        labelAlign: 'between',
                    },
                    axisY: {
                        divisor: 5,
                        showGrid: true,
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
