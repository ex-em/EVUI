<script>
    /**
     * 다양한 옵션과 설정으로 데이터를 Pie 차트형태로 보여줍니다.
     */
    export default {
        name:'evui-chart-pie',
        props:{
            /**
             * Pie 차트이 시작각도를 설정합니다.
             */
            startAngle: {
                type: Number,
                default: 0
            },
            /**
             * 파이차트에 값을 보여줄지를 설정합니다.
             */
            showValue:{
                type:Boolean,
                default: true
            },
            /**
             * 파이차트 값의 포맷을 설정합니다.
             */
            valueFormat:{
                type:Function,
                default: function(n){return n;}
            }

        }
    }
</script>
