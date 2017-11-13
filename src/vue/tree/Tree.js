import TreeNode from './TreeNode.vue';
import TreeStore from './TreeStore.js';
import headerCell from '../grid/GridHeaderCell.vue';


export default {
    props : {
        treeInfo: Object,
        columns : Array,
        rows    : Array
    },
    data: function() {
        return {
            treeStyle : null,
            titleStyle: null,
            store     : null,
            treeColumn: this.treeInfo.treeColumnId
        };
    },
    computed: {
        // set default options
        treeOptions() {
            return Object.assign({
                title     : null,
                titleAlign: 'center',
                width     : '100%',
                height    : '100%'
            }, this.treeInfo);
        },

        columnOptions: {
            get() {
                let defColumns = [];
                for(let ix=0, ixLen=this.columns.length; ix<ixLen; ix++) {
                    defColumns[ix] = Object.assign({
                        dataIndex: 'def_dataIndex_' + ix,
                        name     : '',
                        width    : 50,
                        height   : 20,
                        visible  : false,
                        draggable: false,
                        type     : ''
                    }, this.columns[ix]);
                }
                return defColumns;
            },
            set(data) {
                //드래그 드랍 이벤트 값변경시 탑니다
                if(data.type === 'drag') {
                    this.columns.splice(data.dragIdx, 1);
                    this.columns.splice(data.dropIdx, 0, data.targetCol);
                }

                //컬럼 리사이즈 이벤트시 값을 변경합니다.
                if(data.type ==='resize'){
                    this.columns[data.cellIndex].width = data.width;
                }
            }
        },
        treeMap() {
            return this.store.treeMap;
        }
    },
    methods: {
        setExpandNode(node, expandMode) {
            this.store.handleExpandNode(node, expandMode);
        },

        /**
         * 리사이즈 컬럼 이벤트  세팅
         */
        setResizeColumnEvent() {
            const vm = this;
            const headerCols = Array.from(vm.$el.getElementsByClassName('grip'));
            let thElm = null;
            let startOffset = 0;
            headerCols.forEach(function(grip) {
                grip.addEventListener('mousedown', onMouseDown);
            });

            function onMouseDown(e) {
                if (e.preventDefault) {
                    e.preventDefault(); //
                }
                vm.$emit('test', 323232)
                console.log('마우스 다운 이벤트',e)
                thElm = e.target.parentNode;
                startOffset = thElm.offsetWidth - e.pageX;
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
                return false;
            }

            function onMouseMove(e) {
                const data = {
                    type : 'resize',
                    width: startOffset + e.pageX,
                    cellIndex : thElm.cellIndex
                }
                vm.columnOptions = data;
                /*if (vm.thElm) {
                    // const colName = vm.thElm.getAttribute('data-column-name');
                    const width = vm.startOffset + e.pageX;
                    vm.thElm.width = width;
                }*/

            }

            function onMouseUp(e) {

                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            }
        }
    },
    created() {
        // set tree default style
        this.titleStyle = {
            'text-align': this.treeOptions.titleAlign,
            'display'   : 'block'
        };

        this.treeStyle = {
            'width' : typeof this.treeOptions.width === 'number' ? this.treeOptions.width + 'px' : this.treeOptions.width,
            'height': typeof this.treeOptions.height === 'number' ? this.treeOptions.height + 'px' : this.treeOptions.height
        };

        this.store = new TreeStore({
            vm          : this,
            treeData    : this.rows,
            columns     : this.columns,
            treeColumnId: this.treeOptions.treeColumnId
        });

    },
    mounted() {
        if(this.treeOptions.useColumnResize) {
            this.setResizeColumnEvent();
        }

        this.$refs.dragLine.style.height = this.$refs.treeTable.clientHeight + 'px';

    },
    components: {
        TreeNode,
        headerCell
    }
};
