<template>
    <th v-if="visible">
        <div :draggable="draggable"
             :style="{width : width + 'px' }">
             {{ text }}
        </div>
        <div v-if="useFilter"
             class="filter-icon">
          <icon name="filter"></icon>
        </div>
        <div v-if="useFilter"
             class='filter-popover'>
            <input type='text' class='filter-input' @input="filterGrid(col,$event)">
        </div>
        <div v-if="useResize"
             class="grip">
        </div>
    </th>
</template>

<script>
    export default {
        name: 'evui-tree-header-cell',
        props: {
            /**
             * Column의 넓이를 지정합니다.
             */
            width: {
                type: Number,
                default: null
            },
            /**
             * Column의 높이를 지정합니다.
             * @ignore
             */
            height: {
                type: Number,
                default: null
            },
            /**
             * Column을 구분하는 키 값이며, 필수사항 입니다.
             */
            dataIndex: {
                type: String,
                require: true,
                default: null,
            },
            /**
             * Column에 들어갈 문자열 입니다.
             */
            text: {
                type: String,
                default: null,
            },
            /**
             * Column의 show/hide 기능 사용 여부 입니다.
             */
            visible: {
                type: Boolean,
                default: true
            },
            /**
             * Column의 Move 기능 사용 여부 입니다.
             */
            draggable: {
                type: Boolean,
                default: true,
            },
            /**
             * Column의 Filter 기능 사용 여부입니다.
             */
            useFilter: {
                type: Boolean,
                default : false
            }
        }
    };

</script>
<style scoped>
    .grip {
        width: 5px;
        right:0;
        top: 0;
        bottom:0;
        cursor: col-resize;
        position: absolute;
    }

    .filter-icon {
        background-image: url("/src/images/filter-black.png");
        width: 16px;
        height: 16px;
        position: absolute;
        right: 5px;
        top: 50%;
        transform: translate(0%,-50%);
    }

    .filter-popover {
        position: absolute;
        background: #fff;
        min-width: 150px;
        border-radius: 4px;
        border: 1px solid #e6ebf5;
        padding: 12px;
        z-index: 2000;
        color: #5a5e66;
        line-height: 1.4;
        text-align: justify;
        word-break: break-all;
        font-size: 14px;
        box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
    }

    .filter-input {
        -webkit-appearance: none;
        background-color: #fff;
        background-image: none;
        border-radius: 4px;
        border: 1px solid #d8dce5;
        box-sizing: border-box;
        color: #5a5e66;
        display: inline-block;
        font-size: 12px;
        height: 20px;
        line-height: 1;
        outline: none;
        padding: 0 10px;
        transition: border-color .2s cubic-bezier(.645,.045,.355,1);
        width: 100%;
    }
</style>
