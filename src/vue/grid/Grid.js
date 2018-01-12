import cell from './GridCell.vue';
import headerCell from './GridHeaderCell.vue';

/**
 *  The Evui Grid.
 */
export default {
    name: 'evui-grid',
    components: {
        cell,
        headerCell
    },
    props : {
        /**
         * Grid 타이틀을 지정합니다.
         */
        title: {
            type: String,
            default: null
        },
        /**
         * Grid 전체의 넓이를 설정합니다.
         */
        width: {
            type: Number,
            default: null
        },
        /**
         * Grid 전체의 높이를 설정합니다.
         */
        height: {
            type: Number,
            default: null
        },
        /**
         * Grid Buffer Data Size 를 결정합니다.
         */
        bufferSize: {
            type: Number,
            default: 100
        },
        /**
         * Column Resize 사용 여부를 결정합니다.
         */
        useColumnResize: {
            type: Boolean,
            default: true
        },
        /**
         * @ignore
         */
        columns : Array,
        /**
         * @ignore
         */
        data: Array,

        /*
         * Cell Click Event를 넘겨받습니다.
         * @type {func}
         */
        // cellClick: {
        //     type: Function,
        //     default: null
        // },
        /*
         * Cell Double Click Event를 넘겨받습니다.
         * @type {func}
         */
        // cellDblClick: {
        //     type: Function,
        //     default: null
        // },
        /*
         * Row Click Event를 넘겨받습니다.
         * @type {func}
         */
        // rowClick: {
        //     type: Function,
        //     default: null
        // },
        /*
         * Row Double Click Event를 넘겨받습니다.
         * @type {func}
         */
        // rowDblClick: {
        //     type: Function,
        //     default: null
        // },
        /*
         * Sort Change Event를 넘겨받습니다.
         * @type {func}
         */
        // sortChange: {
        //     type: Function,
        //     default: null
        // }
    },
    data: function () {
        return {
            gridInfo : {},
            gridStyle           : null,
            titleStyle          : null,
            sortKey             : '',
            sortOrders          : null,
            columnType          : null,
            gridWidth           : 0,
            isAllChecked        : false,
            selected            : [],
            dragTargetPos       :null,
            dragTarget          : null,
            filterCol           : {},
            beforeFilterCol     : null,
            beforeFilterList    :null,
            filterList          : this.data,
            sortedList          : this.data,
            sortclick           : false,
            popoverCol          : null,
            scroll: {
                bufferSize      : this.bufferSize,
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
        };
    },
    computed: {

        gridOptions() {
            return Object.assign({
                title     : this.title,
                titleAlign: 'center',
                width     : this.width,
                height    : this.height,
                useColumnResize: this.useColumnResize
            }, this.gridInfo);
        },

        /**
         * 넘어오는 데이터 샘플
         * {dataIndex: 'col1', name: 'column1', width: 300, visible: true, type: 'string', draggable: true}
         */
        columnOptions:{
            get() {
                let defColumns = [];
                for (let ix = 0, ixLen = this.columns.length; ix < ixLen; ix++) {
                    defColumns[ix] = Object.assign({
                        dataIndex: 'def_dataIndex_' + ix,
                        name: '',
                        width: 50,
                        height: 20,
                        visible: false,
                        draggable: false,
                        type: ''
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

        /**
         * 버퍼스크롤을 위한 데이터
         * @returns {Blob|ArrayBuffer|Array.<T>|string|*}
         */
        bufferedData: function () {
            return this.filteredData.slice(this.scroll.top, Math.max(this.scroll.bottom, this.scroll.bufferSize));
        },

        filteredData: {
            get() {
                return this.filterList;
            },
            set(filterData) {

                if (filterData.type ==='sort') {

                    let sortKey = this.sortKey;

                    let order = this.sortOrders[sortKey] || 1;
                    let sortedData;
                    if (sortKey) {
                        sortedData = this.filterList.slice().sort(function (a, b) {
                            a = a[sortKey];
                            b = b[sortKey];
                            return (a === b ? 0 : a > b ? 1 : -1) * order;
                        });
                    }
                    this.filterList = sortedData;


                    //sort change Event 발생
                    /**
                     * sort 변경시 발생 하는 이벤트 (param : this, sortKey, order)
                     * @event sortChange
                     * @type {function}
                     */
                    this.$emit('sortChange', this,this.sortKey, order == -1 ? 'DESC' : 'ASC');
                    // if(this.sortChange){
                    //     this.sortChange(this, this.sortKey, order == -1 ? 'DESC' : 'ASC');
                    // }
                }

                //filter event
                if(filterData.type ==='filter') {
                    //입력 필터 컬럼 비교
                    //필터가 처음탈때 beforeFilterList에 값을 넣어준다 멀티 필터 대응
                    if (this.beforeFilterCol !== filterData.colIndex) {
                        this.beforeFilterCol = filterData.colIndex;
                        let result = this.sortedList.slice();

                        //filter 입력 값이 있는 컬럼수 만큼 돌아라
                        for (let col in this.filterCol) {
                            //현재 필터 컬럼이랑 필터 값이 없는 놈은 제외 한다.
                            //왜냐면 현재 필터까지 해버리면 다른 컬럼으로가서 검색값을 지웠을경우 알수가 없음
                            if (this.filterCol[col] !== undefined && col !== filterData.colIndex) {
                                result = result.filter((data) => {
                                    return data[col].toString().indexOf(this.filterCol[col]) >= 0;
                                });
                            }
                        }
                        //필터 현재컬럼의 값은 필터링 안했으니 이전 필터리스트에 저장
                        this.beforeFilterList = result;
                    }

                    //이전 필터리스트에서 이제 현재컬럼 필터 값을 필터링해보자
                    this.filterList = this.beforeFilterList.filter((data) => {
                        return data[filterData.colIndex].toString().indexOf(filterData.value) >= 0;
                    });
                }
            }
        }
    },

    watch: {
        sortclick(){
            let sortKey = this.sortKey;

            let order = this.sortOrders[sortKey] || 1;
            let sortedData = this.data;

            if (sortKey) {
                sortedData = sortedData.slice().sort(function (a, b) {
                    a = a[sortKey];
                    b = b[sortKey];
                    return (a === b ? 0 : a > b ? 1 : -1) * order;
                });
            }
            this.sortedList = sortedData;
        },

        //props넘어온 데이터가 변경됐을때 타는 함수임
        data(){
            this.dataChangeFlag =true;
            //자 데이터 바꼇으니 너도 바껴라
            this.filterList = this.data;
        }
    },

    methods: {
        onHeaderCellClick(header, dataIndex) {
            this.sortBy(dataIndex);
        },
        onAllCheckChange(dataIndex, value) {

            this.isAllChecked = value;

            for(let ix = 0, ixLen = this.data.length; ix < ixLen; ix++){
                this.data[ix][dataIndex] = this.isAllChecked;
            }

            if(this.isAllChecked){
                this.checkedCount = this.data.length;
            }else{
                this.checkedCount = 0;
            }
        },
        onCheckChange(record, dataIndex, value) {

            record[dataIndex] = value;

            if(value){
                this.checkedCount++;
            }else{
                this.checkedCount--;
            }

            if(this.data.length == this.checkedCount){
                this.isAllChecked = true;
            }else{
                this.isAllChecked = false;
            }
        },
        cellChange: function(){

        },
        onCellClick: function(value, event) {
            // console.log('cell click event', arguments);

            /**
             * cell 클릭시 발생 하는 이벤트 (param : value, event)
             * @event cellClick
             * @type {function}
             */
            this.$emit('cellClick',value,event);

            /**
             * row 클릭시 발생 하는 이벤트 (param : value, event)
             * @event rowClick
             * @type {function}
             */
            this.$emit('rowClick',value,event);

        },
        onCellDblClick: function(value, event) {
            // console.log('cell double click event', arguments);

            /**
             * cell 더블 클릭시 발생 하는 이벤트 (param : value, event)
             * @event cellDblClick
             * @type {function}
             */
            this.$emit('cellDblClick',value,event);

            /**
             * row 더블 클릭시 발생 하는 이벤트 (param : value, event)
             * @event rowDblClick
             * @type {function}
             */
            this.$emit('rowDblClick',value,event);
        },

        bufferHeightCalc: function () {

            if (this.$refs.evuiGridItem.firstElementChild) {
                if (!this.scroll.rowHeight) {
                    this.scroll.rowHeight = this.$refs.evuiGridItem.firstElementChild.offsetHeight;
                }
            }

            let rowTopEl = this.$refs.evuiGridItemContainer;
            let rowBottomEl = this.$refs.evuiGridItem;
            let dataLength = this.filteredData.length;
            let rowHeight = this.scroll.rowHeight;
            let vh = dataLength * rowHeight;
            let top = 0;

            if (vh > this.scroll.top * rowHeight) {
                top = this.scroll.top * rowHeight - this.scroll.offset;
                rowTopEl.style.height = vh + 'px';
                rowBottomEl.style.top = top + 'px';
            }
        },

        gridBodyScroll: function (e) {
            this.$refs.evuiGridThead.style.left = (-e.target.scrollLeft) + 'px';

            clearTimeout(this.scroll.timeOut);
            this.scroll.timeOut = setTimeout(function() {
                let bufferSize = this.scroll.bufferSize;
                let dataLength = this.filteredData.length;
                let rowHeight = this.scroll.rowHeight;
                let th = rowHeight * dataLength; // virtual height
                let ph = bufferSize * rowHeight; // page height
                let h = ph * 100;
                // let n = Math.ceil(th / ph);
                let vp = this.gridOptions.height;
                // let cj = (th - h) / (n - 1);
                let viewport = e.target;
                let scrollTop = viewport.scrollTop;

                if (this.scroll.prevScrollTop == scrollTop) {
                    return;
                }

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
                let y = viewport.scrollTop + this.scroll.offset,
                    buffer = ph > vp ? ph - vp : vp,
                    top = Math.floor((y - buffer/2) / rowHeight),
                    bottom = Math.ceil((y + vp + buffer/2) / rowHeight);

                top = Math.max(0, top);
                bottom = Math.min(th / rowHeight, bottom);


                this.scroll.top = top;
                this.scroll.bottom = bottom;
                this.bufferHeightCalc();
            }.bind(this), 40);
        },

        toggleSelect: function() {
            let select = this.selectAll;
            this.data.forEach(function(d) {
                d.checked = !select;
            });
            this.selectAll = !select;
        },

        sortBy: function(key) {
            this.sortKey = key;
            this.sortOrders[key] = this.sortOrders[key] * -1;
            this.sortclick = !this.sortclick;
            this.filteredData = {type:'sort'};
        },

        cls(type) {
            switch (type) {
            case 'number':
            case 'integer':
            case 'numeric':
            case 'float':
                return 'cell-align-right';
            case 'checkbox' :
                return 'cell-align-center';
            case 'date':
            case 'datetime':
            default:
                return 'cell-align-left';
            }
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
                /*if (vm.thElm) {
                    // const colName = vm.thElm.getAttribute('data-column-name');
                    const width = vm.startOffset + e.pageX;
                    vm.thElm.width = width;
                }*/

            }

            function onMouseUp() {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            }
        },

        /**
         * 드래그앤드랩 컬럼 이벤트 세팅
         */
        setDragColumnEvent() {
            let columns = this.$el.querySelectorAll('.grid-column-sort');
            const vm = this;

            for(let ix=0, ixLen=columns.length; ix<ixLen; ix++){

                columns[ix].addEventListener('dragstart', handleDragStart, false);

                columns[ix].addEventListener('dragenter', handleDragEnter, false);
                columns[ix].addEventListener('dragover', handleDragOver, false);
                columns[ix].addEventListener('drop', handleDragDrop, false);
                columns[ix].addEventListener('dragend', handleDragEnd, false);
                // columns[ix].addEventListener('dragleave', handleDragLeave, false);

            }


            //드래그 시작시
            function handleDragStart() {
                this.style.opacity = '0.4';
                this.classList.add('dragItem');

                vm.dragTargetPos = this.parentElement.getBoundingClientRect();
                vm.dragTarget = this;
            }

            //드래그가 타겟 엔터시
            function handleDragEnter() {


                if(this.classList.contains('grid-column-sort') && !this.classList.contains('dragItem')){
                    let targetPos = this.parentElement.getBoundingClientRect();
                    let dragX = (targetPos.left) + 'px';
                    let dragY = (targetPos.top) + 'px';

                    //드래그 타겟보다 오른쪽컬럼들
                    if(vm.dragTargetPos.left < targetPos.left){
                        dragX = (targetPos.right) + 'px';
                    }

                    vm.$refs.dragLine.style.top = dragY;
                    vm.$refs.dragLine.style.left =  dragX;

                    vm.$refs.dragLine.style.display = 'block';



                }
            }

            //드래그후 오버시
            function handleDragOver(e) {
                if (e.preventDefault) {
                    e.preventDefault(); // Necessary. Allows us to drop.
                }
                e.dataTransfer.dropEffect= 'move';

                return false;
            }

            //드랍시
            function handleDragDrop(e) {
                if (e.stopPropagation) {
                    e.stopPropagation(); // stops the browser from redirecting.
                }
                let dragIdx = vm.dragTarget.parentElement.cellIndex;
                let dropIdx = this.parentElement.cellIndex;


                let targetCol = vm.columnOptions[dragIdx];

                let data ={
                    type: 'drag',
                    dropIdx :dropIdx,
                    dragIdx :dragIdx,
                    targetCol : targetCol
                };

                vm.columnOptions = data;

                return false;

            }

            //드래그 드랍 이벤트 끝날때
            function handleDragEnd() {
                vm.dragTarget.classList.remove('dragItem');
                vm.dragTarget.style.opacity = null;
                vm.$refs.dragLine.style.display = 'none';
                vm.dragTarget = null;
                vm.dragTargetPos = null;
            }

        },

        /**
         * 필터 input 이벤트
         * @param data : col (컬럼 정보)
         * @param e (input 이벤트)
         */
        filterGrid(data,e) {
            let colIndex = data;
            let value = e.target.value;

            if(value ===''){
                this.filterCol[colIndex] = undefined;
            }else{
                this.filterCol[colIndex] = value;
            }

            this.filteredData = {
                type: 'filter',
                colIndex: colIndex,
                value : value
            };
        },

        /**
         * filter icon 클릭시 이벤트 popover 이벤트 처리
         * @param e : 아이콘 클리 이벤트 (span)
         */
        clickFilter(e){
            let target = e.currentTarget;
            let thEle = target.parentElement;
            let popover = thEle.getElementsByClassName('filter-popover')[0];

            // debugger;
            //filter-icon 다른거 클릭시
            if(this.popoverCol !== target) {

                //filter 아이콘을 제외한  아무대나 눌러도 꺼진다
                document.addEventListener('click',function (){
                    //켜져있는 popover 빠이
                    let popeverlist = this.querySelectorAll('.filter-popover.active');
                    for(let i=0,iLen=popeverlist.length;i<iLen;i++){
                        popeverlist[i].style.display = 'none';
                        popeverlist[i].classList.remove('active');
                    }

                },false);

                if(this.popoverCol === null){
                    //filter 버트 처음 눌렀을때 popover 켜져라
                    popover.style.display = 'block';
                    popover.classList.add('active');
                    popover.style.left = target.getBoundingClientRect().x +'px';
                    popover.getElementsByClassName('filter-input')[0].focus();



                }else{
                    let exThEle = this.popoverCol.parentElement;
                    let exPopover = exThEle.getElementsByClassName('filter-popover')[0];

                    //이전 popover 사라져라
                    exPopover.style.display = 'none';
                    exPopover.classList.remove('active');


                    //현재 popover 보여라
                    popover.style.display = 'block';
                    popover.classList.add('active');
                    popover.style.left = target.getBoundingClientRect().x +'px';
                    popover.getElementsByClassName('filter-input')[0].focus();

                }
                //현재 타겟을 가지고 있어라 비교할때 쓰게
                this.popoverCol = target;


            }else{
                popover.style.display = 'none';
                this.popoverCol = null;
            }
        },
        initScrollWidth () {
            this.$refs.evuiGridItemContainer.style.width = this.$refs.evuiGridThead.firstChild.offsetWidth + 'px';
            this.$refs.evuiGridItemContainer.style.height = '1px';
        }
    },

    mounted() {

        //Resize Column Event setting
        if(this.gridOptions.useColumnResize) {
            this.setResizeColumnEvent();
        }

        //Drag Column Event setting
        this.$refs.dragLine.style.height = this.$refs.gridTable.clientHeight + 'px';
        this.setDragColumnEvent();

        //tbody horizen scroll init calc
        this.initScrollWidth();

        //buffer scroll calculate
        this.bufferHeightCalc();
    },

    created() {
        // set grid default style
        this.gridStyle = {
            'width' : typeof this.gridOptions.width === 'number' ? this.gridOptions.width + 'px' : this.gridOptions.width,
            'height': typeof this.gridOptions.height === 'number' ? this.gridOptions.height + 'px' : this.gridOptions.height
        };

        this.titleStyle = {
            'text-align' : this.gridOptions.titleAlign,
            'display'    : 'block'
        };

        let sortOrders = {};
        this.columnOptions.forEach(function (key) {
            sortOrders[key.dataIndex] = 1;
        });
        this.sortOrders = sortOrders;

        //filter 컬럼 객체 생성(추후 조건문 추가)
        for(let ix=0, ixLen=this.columns.length; ix<ixLen ;ix++){
            this.filterCol[this.columns[ix].dataIndex] = undefined;
        }


    },

    beforeUpdate() {
        this.beforeUpdateTime = performance.now();
    },

    updated() {
        this.updatedTime = performance.now();


    }
};
