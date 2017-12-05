<script>
    /**
     * 다양한 옵션과 설정으로 데이터를 Bar 차트형태로 보여줍니다.
     */
    export default {
        name:'evui-chart-Bar',
        props:{
            /**
             * Stacked Bar 형태로 보여줄지 설정합니다.
             */
            isStacked:{
                type: Boolean,
                default: false
            },
            /**
             * 횡으로 Bar를 보여줄지 설정합니다.
             */
            isHorizontal:{
                type: Boolean,
                default : false
            }
        }
    }
</script>
