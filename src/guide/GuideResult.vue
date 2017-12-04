<template>
    <div id="result" class="result">
        <div class="resultTop">
            <p>Result</p>
        </div>
        <div class="resultCenter">
            <component ref="cmpContent" :is="contentName"></component>
        </div>
    </div>
</template>

<script>
    import GridColumnOrder from './components/GridColumnOrder.vue';
    import GridColumnVisible from './components/GridColumnVisible.vue';
    import GridColumnResize from './components/GridColumnResize.vue';
    import GridColumnMove from './components/GridColumnMove.vue';
    import GridColumnFilter from './components/GridColumnFilter.vue';

    import TreeColumnVisible from './components/TreeColumnVisible.vue';
    import TreeColumnResize from './components/TreeColumnResize.vue';
    import TreeColumnMove from './components/TreeColumnMove.vue';
//    import TreeColumnFilter from './components/TreeColumnFilter.vue';
    export default {
        props: {
            fileList: Object,
            contentName: {
                type: String,
                default: ''
            }
        },
        components: {
            GridColumnOrder,
            GridColumnVisible,
            GridColumnResize,
            GridColumnMove,
            GridColumnFilter,

            TreeColumnVisible,
            TreeColumnResize,
            TreeColumnMove
//            TreeColumnFilter
        },
        data() {
            return {
                htmlTxt: '<p class="red">It\'s magic!</p>',
                jsTxt: 'console.log("hi");',
                cssTxt: 'p {font-family: Helvetica, Arial; }'
            };
        },
        methods: {},
        mounted() {
        }
    }
</script>


<style scoped>
    .result {
        position: absolute;
        left: 50%;
        top: 0px;
        bottom: 0px;
        right: 0px;
        border: 1px solid #e5e5e5;
    }

    .result .resultTop {
        position: absolute;
        height: 50px;
        width: 100%;
        border-bottom: 1px solid #e5e5e5;
    }

    .result .resultTop > p {
        font-size: 20px;
        font-weight: bold;
        padding: 0 0 0 20px;
    }

    .result .resultCenter {
        position: absolute;
        top: 51px;
        padding: 20px 20px 20px 20px;
    }
</style>
