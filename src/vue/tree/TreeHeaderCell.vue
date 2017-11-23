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
        props: {
            width    : Number,
            height   : Number,
            dataIndex: String,
            text     : String,
            useResize: Boolean,
            visible  : Boolean,
            draggable: Boolean,
            useFilter: Boolean
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
