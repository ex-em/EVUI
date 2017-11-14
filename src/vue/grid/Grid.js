import cell from './GridCell.vue';
import headerCell from './GridHeaderCell.vue';

export default {
    components: {
        cell,
        headerCell
    },
    props : {
        gridInfo : Object,
        columns : Array,
        data: Array
    },
    data: function () {
        return {
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
            scroll: {
                bufferSize      : 100,
                rowHeight       : null,
                prevScrollTop   : 0,
                page            : 0,
                offset          : 0,
                top             : 0,
                bottom          : 0,
                timeOut         : null
            }
        };
    },
    computed: {

        gridOptions() {
            return Object.assign({
                title     : null,
                titleAlign: 'center',
                width     : '100%',
                height    : '100%'
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

        gridTotalWidth() {
            let totalWidth = this.gridWidth;
            this.columns.forEach(function(column) {
                totalWidth += column.width;
            });

            return totalWidth;
        },

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
                    console.log("##@##@", this.filterList)
                    if (sortKey) {
                        sortedData = this.filterList.slice().sort(function (a, b) {
                            a = a[sortKey];
                            b = b[sortKey];
                            return (a === b ? 0 : a > b ? 1 : -1) * order;
                        });
                    }
                    this.filterList = sortedData;
                }

                //filter event
                if(filterData.type ==='filter') {
                    //입력 필터 컬럼 비교
                    if (this.beforeFilterCol !== filterData.colIndex) {
                        this.beforeFilterCol = filterData.colIndex;
                        let result = this.sortedList.slice();

                        for (let col in this.filterCol) {
                            if (this.filterCol[col] !== undefined && col !== filterData.colIndex) {

                                result = result.filter((data) => {
                                    return data[col].toString().indexOf(this.filterCol[col]) >= 0
                                })
                            }
                        }
                        this.beforeFilterList = result;
                    }
                    this.filterList = this.beforeFilterList.filter((data) => {
                        return data[filterData.colIndex].toString().indexOf(filterData.value) >= 0
                    });
                }
            }
        }
    },

    watch: {
        sortclick(){
            console.log("타냥ㄴ럼나ㅣㅇ;런미아ㅗ런ㅁㅇ;ㅣㅗㄹㄴㅁ아ㅣ;ㅗㅁㄴ;ㅐ")
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
        }
    },

    methods: {
        onHeaderCellClick(header, dataIndex) {
            console.log("@@@@@")
            this.sortBy(dataIndex);
        },
        onAllCheckChange(dataIndex, value) {
            console.log('onAllCheckChange', arguments)

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
        onCheckChange(dataIndex, value) {
            console.log('onCheckChange', arguments)

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
        cellClick: function(columnData, colIdx, rowData, rowIdx, e) {

            // alert('Col Info -> '+ columnData + '\nCol Idx -> ' + colIdx + '\nRow Info -> '+ rowData + '\nRow Idx -> ' + rowIdx);
        },

        checkBoxClick: function() {
            const selected = this.selected;

            console.log('checkboxClick ==> ', arguments);
        },

        bufferHeightCalc: function () {

            if (this.$refs.evuiGridItem.firstElementChild) {
                if (!this.scroll.rowHeight) {
                    this.scroll.rowHeight = this.$refs.evuiGridItem.firstElementChild.offsetHeight;
                }
            } else {
                return;
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
                let n = Math.ceil(th / ph);
                let vp = this.gridOptions.height;
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
            console.log("12312", this.sortclick)
            this.sortclick = !this.sortclick;
            this.filteredData = {type:'sort'}
        },

        cls(type) {
            switch (type) {
                case 'number':
                case 'integer':
                case 'numeric':
                case 'float':
                    return 'text-align-right';
                case 'date':
                case 'datetime':
                    return '';
                case 'checkbox' :
                    return '';
                default:
                    return '';
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
        },

        /**
         * 드래그앤드랩 컬럼 이벤트 세팅
         */
        setDragColumnEvent() {
            var columns = this.$el.querySelectorAll('.grid-column-sort');
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
            function handleDragStart(e) {
                this.style.opacity = '0.4';
                this.classList.add('dragItem')

                vm.dragTargetPos = this.parentElement.getBoundingClientRect();
                vm.dragTarget = this;
            }

            //드래그가 타겟 엔터시
            function handleDragEnter(e) {


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
                e.dataTransfer.dropEffect= "move"

                return false;
            }

            //드랍시
            function handleDragDrop(e) {
                if (e.stopPropagation) {
                    e.stopPropagation(); // stops the browser from redirecting.
                }
                let dragIdx = vm.dragTarget.parentElement.cellIndex;
                let dropIdx = this.parentElement.cellIndex;


                let targetCol = vm.columnOptions[dragIdx]

                let data ={
                    type: 'drag',
                    dropIdx :dropIdx,
                    dragIdx :dragIdx,
                    targetCol : targetCol
                };

                vm.columnOptions = data

                return false;

            }

            //드래그 드랍 이벤트 끝날때
            function handleDragEnd(e) {
                vm.dragTarget.classList.remove('dragItem');
                vm.dragTarget.style.opacity = null;
                vm.$refs.dragLine.style.display = 'none';
                vm.dragTarget = null;
                vm.dragTargetPos = null;
            }

            //드래그 타겟 떠날시
            //차후 삭제 예정
            function handleDragLeave(e) {
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

        clickFilter(e){
            let thEle = e.target.parentElement;
            let popover = thEle.getElementsByClassName('filter-popover')[0]

            if(popover.style.display===''|| popover.style.display==='none') {
                popover.style.display = 'block'
            }else{
                popover.style.display = 'none'
            }

            popover.style.left = e.target.offsetLeft+'px';

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


    }
};
