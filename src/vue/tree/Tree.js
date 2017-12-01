import TreeNode from './TreeNode.vue';
import TreeStore from './TreeStore.js';
import headerCell from './TreeHeaderCell.vue';

/**
 * 다양한 옵션과 설정으로 데이터를 트리 테이블 형태로 보여줍니다.
 */
export default {
    name  : 'evui-tree',
    props : {


        /**
         * 타이틀을 정렬합니다.  left | center | right
         */
        titleAlign :{
            type: String,
            default:'center'
        },

        /**
         * 타이틀명을 설정합니다.
         */
        title :{
            type: String,
            default :null
        },


        /**
         * 트리로 만들 노드 컬럼명을 설정합니다.( data 객체의 첫번째에 위치해야 합니다 )
         */
        treeColumnId : {
            type: String,
            required: true
        },

        /**
         * 트리의 width를 설정합니다.(단위 px)
         */
        width : {
            type: [String,Number],
            default:'100%'
        },

        /**
         * 트리의 height를 설정합니다.(단위 px)
         */
        height : {
            type: [String,Number],
            default:'100%'
        },

        /**
         * 컬럼 리사이즈 기능을 추가합니다.
         */
        useColumnResize:{
            type: Boolean,
            default : false
        },

        /**
         * 컬럼 체크박스 기능을 추가합니다.
         */
        useCheckBox:{
            type:Boolean,
            default: false
        },

        /**
         * 컬럼 필터 기능을 추가합니다.
         */
        useFilter:{
            type:Boolean,
            default:false
        },

        /**
         * @ignore
         */
        columns    : Array,
        /**
         * @ignore
         */
        rows       : Array,




    },
    data: function() {
        return {
            isInit     : false,
            treeStyle  : null,
            titleStyle : null,
            store      : null,
            treeColumn : this.treeColumnId,
            scroll: {
                bufferSize      : 100,
                rowHeight       : null,
                prevScrollTop   : 0,
                page            : 0,
                offset          : 0,
                top             : 0,
                bottom          : 0,
                timeOut         : null
            },
            beforeUpdateTime: null,
            updatedTime: null,
            beforeTreeParseTime : null,
            updateTreeParseTime : null

        };
    },
    computed: {
        //binding unit px
        unitWidth(){
            return typeof this.width === 'number' ? this.width+'px' : this.width
        },
        unitHeight(){
            return typeof this.height === 'number' ? this.height+'px' : this.height
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
                if(data.type === 'drag') {
                    this.columns.splice(data.dragIdx, 1);
                    this.columns.splice(data.dropIdx, 0, data.targetCol);
                }

                if(data.type ==='resize'){
                    this.columns[data.cellIndex].width = data.width;
                }
            }
        },

        treeMap() {
            if(this.$refs.evuiTreeBody) {
                this.$refs.evuiTreeBody.scrollTop = 0;
                this.store = null;
            }
            this.beforeTreeParseTime = performance.now();
            this.store = new TreeStore({
                vm          : this,
                treeData    : this.rawData,
                columns     : this.columns,
                treeColumnId: this.treeColumnId,
                useCheckBox : this.useCheckBox
            });
            this.updateTreeParseTime = performance.now();
            return this.store.treeMap;
        },

        rawData() {
            return this.rows;
        },

        bufferedData: function () {
            return this.treeMap.slice(this.scroll.top, Math.max(this.scroll.bottom, this.scroll.bufferSize));
        }
    },
    methods: {
        setExpandNode(node, expandMode) {
            this.store.handleExpandNode(node, expandMode);
        },

        setCheckNode(node, checkValue) {
            this.store.handleCheckNode(node, checkValue);
        },

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
                    e.preventDefault();
                }
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
                };
                vm.columnOptions = data;
            }

            function onMouseUp(e) {

                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            }
        },

        bufferHeightCalc: function () {

            if (this.$refs.evuiTreeItem.firstElementChild) {
                if (!this.scroll.rowHeight) {
                    this.scroll.rowHeight = this.$refs.evuiTreeItem.firstElementChild.offsetHeight;
                }
            }

            let rowTopEl = this.$refs.evuiTreeItemContainer;
            let rowBottomEl = this.$refs.evuiTreeItem;
            let dataLength = this.treeMap.length;
            let rowHeight = this.scroll.rowHeight;
            let vh = dataLength * rowHeight;
            let top = 0;

            if (vh > this.scroll.top * rowHeight) {
                top = this.scroll.top * rowHeight - this.scroll.offset;
                rowTopEl.style.height = vh + 'px';
                rowBottomEl.style.top = top + 'px';
            }
        },

        treeBodyScroll: function (e) {
            this.$refs.evuiTreeThead.style.left = (-e.target.scrollLeft) + 'px';

            clearTimeout(this.scroll.timeOut);
            this.scroll.timeOut = setTimeout(function() {
                let bufferSize = this.scroll.bufferSize;
                let dataLength = this.treeMap.length;
                let rowHeight = this.scroll.rowHeight;
                let th = rowHeight * dataLength; // virtual height
                let ph = bufferSize * rowHeight; // page height
                let h = ph * 100;
                let n = Math.ceil(th / ph);
                let vp = this.height;
                let cj = (th - h) / (n - 1);
                let viewport = e.target;
                let scrollTop = viewport.scrollTop;

                if (Math.abs(scrollTop - this.scroll.prevScrollTop) > vp) {
                    // onJump
                    this.scroll.page = Math.floor(scrollTop * ((th - vp) / (h - vp)) * (1 / ph));
                } else {
                    // onNearScroll
                    // next page
                    if (scrollTop + this.scroll.offset > (this.scroll.page + 1) * ph) {
                        this.scroll.page++;
                    }
                    // prev page
                    else if (scrollTop + this.scroll.offset < this.scroll.page * ph) {
                        this.scroll.page--;
                    }
                }
                this.scroll.prevScrollTop = scrollTop;

                // calculate the viewport + buffer
                var y = viewport.scrollTop + this.scroll.offset,
                    buffer = ph > vp ? ph - vp : vp,
                    top = Math.floor((y - buffer/2) / rowHeight),
                    bottom = Math.ceil((y + vp + buffer/2) / rowHeight);

                top = Math.max(0, top);
                bottom = Math.min(th / rowHeight, bottom);

                console.log('TOP --> ', top, 'Bottom --> ', bottom);

                this.scroll.top = top;
                this.scroll.bottom = bottom;
                this.bufferHeightCalc();
            }.bind(this), 40);
        }
    },
    created() {
        // set tree default style
        this.titleStyle = {
            'text-align': this.titleAlign,
            'display'   : 'block'
        };

        this.treeStyle = {
            'width' : this.unitWidth,
            'height': this.unitHeight
        };

    },
    mounted() {
        if(this.useColumnResize) {
            this.setResizeColumnEvent();
        }

        this.$refs.dragLine.style.height = this.$refs.treeTable.clientHeight + 'px';
        this.bufferHeightCalc();

    },

    beforeUpdate() {
        this.beforeUpdateTime = performance.now();
    },

    updated() {
        this.updatedTime = performance.now();
    },

    components: {
        TreeNode,
        headerCell
    }
};
