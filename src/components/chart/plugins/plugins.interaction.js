import { numberWithComma } from '@/common/utils';
import throttle from '@/common/utils.throttle';
import { cloneDeep, defaultsDeep, inRange } from 'lodash-es';
import dayjs from 'dayjs';

const modules = {
  /**
   * Hide legend components by manipulating css
   *
   * @returns {undefined}
   */
  createEventFunctions() {
    /**
     * To show tooltip and item highlighting, add event listener on mousemove
     *
     * @returns {undefined}
     */
    this.onMouseMove = (e) => {
      if (this.dragInfo?.isMove || this.isMobile) {
        return;
      }

      const args = { e };
      const { indicator, tooltip, type } = this.options;
      const offset = this.getMousePosition(e);
      const hitInfo = this.findHitItem(offset);

      if (tooltip?.showAllValueInRange && hitInfo?.items) {
        this.addNotHitInfo(hitInfo);
      }

      const ctx = this.overlayCtx;

      this.overlayClear();

      if (Object.keys(hitInfo.items).length) {
        if ((type !== 'scatter' && type !== 'heatMap') || tooltip.use) {
          this.drawItemsHighlight(hitInfo, ctx);
        }

        if (tooltip.use) {
          if (tooltip?.formatter?.html) {
            this.drawCustomTooltip(hitInfo?.items);
            this.setCustomTooltipLayoutPosition(hitInfo, e);
          } else {
            this.setTooltipLayoutPosition(hitInfo, e);
            if (type === 'scatter') {
              this.drawTooltipForScatter(hitInfo, this.tooltipCtx);
            } else if (type === 'heatMap') {
              this.drawToolTipForHeatMap(hitInfo, this.tooltipCtx);
            } else {
              this.drawTooltip(hitInfo, this.tooltipCtx);
            }
          }
        }
      } else if (tooltip.use) {
        this.hideTooltipDOM();
      }

      if (this.dragInfoBackup) {
        this.drawSelectionArea(this.dragInfoBackup);
      }

      if (indicator.use && type !== 'pie' && type !== 'scatter' && type !== 'heatMap') {
        this.drawIndicator(offset, indicator.color);
      }

      if (typeof this.listeners['mouse-move'] === 'function') {
        if (type !== 'pie') {
          args.curMouseTargetVal = this.getCurMouseTargetVal(offset, hitInfo);
        }

        this.listeners['mouse-move'](args);
      }
    };

    /**
     * To clear tooltip and item highlighting, add event listener on mouseleave
     *
     * @returns {undefined}
     */

    this.onMouseLeave = () => {
      const { tooltip, dragSelection } = this.options;

      if (tooltip.throttledMove) {
        this.onMouseMove.cancel();
      }

      if (!dragSelection.use || !dragSelection.keepDisplay) {
        this.overlayClear();
      }

      if (tooltip.use) {
        this.tooltipClear();
      }
    };

    /**
     * Dealing with graph item select and invoking user custom dblclick event
     *
     * @returns {undefined}
     */
    this.onDblClick = (e) => {
      const selectItem = this.options.selectItem;
      const args = { e };

      if (selectItem.use) {
        const offset = this.getMousePosition(e);
        const hitInfo = this.getItemByPosition(offset, selectItem.useApproximateValue);


        if (hitInfo.label !== null) {
          this.render(hitInfo);
        }

        ({ label: args.label, value: args.value, sId: args.seriesId, acc: args.acc } = hitInfo);
      }

      if (typeof this.listeners['dbl-click'] === 'function') {
        this.listeners['dbl-click'](args);
      }
    };

    /**
     * Dealing with graph item select and invoking user custom click event
     *
     * @returns {undefined}
     */
    this.onClick = (e) => {
      if (this.isMouseMove) {
        this.isMouseMove = false;
        return;
      }

      const args = { e };
      const offset = this.getMousePosition(e);

      const {
        type: chartType,
        selectItem: selectItemOpt,
        selectLabel: selectLabelOpt,
        selectSeries: selectSeriesOpt,
      } = this.options;

      const useSelectItem = selectItemOpt?.use && selectItemOpt?.useClick;
      const useSelectLabel = selectLabelOpt?.use && selectLabelOpt?.useClick;
      const useSelectSeries = selectSeriesOpt?.use && selectSeriesOpt?.useClick;

      const setSelectedItemInfo = () => {
        const hitInfo = this.getItemByPosition(offset, false);

        ({
          label: args.label,
          value: args.value,
          sId: args.seriesId,
          maxIndex: args.dataIndex,
          acc: args.acc,
        } = hitInfo);

        if (hitInfo?.sId) {
          args.selected = {
            eventTarget: 'item',
            seriesId: this.isDeselectItem(hitInfo) ? null : hitInfo.sId,
            dataIndex: this.isDeselectItem(hitInfo) ? null : hitInfo.maxIndex,
          };
        }
      };

      const setSelectedLabelInfo = (targetAxis) => {
        const {
          labelIndex: clickedLabelIndex,
        } = this.getLabelInfoByPosition(offset, targetAxis);

        const {
          dataIndex: dataIndexList,
        } = this.regulateSelectedLabelInfo(clickedLabelIndex, targetAxis);

        this.defaultSelectInfo = this.getSelectedLabelInfoWithLabelData(dataIndexList, targetAxis);

        if (targetAxis) {
          this.defaultSelectInfo.targetAxis = dataIndexList?.length ? targetAxis : null;
        }

        args.selected = {
          eventTarget: 'label',
          ...cloneDeep(this.defaultSelectInfo),
        };
      };

      const setSelectedSeriesInfo = () => {
        const hitInfo = this.getSeriesInfoByPosition(offset);
        if (hitInfo.sId !== null) {
          const allSelectedList = this.updateSelectedSeriesInfo(hitInfo.sId);
          this.defaultSelectInfo.seriesId = allSelectedList.seriesId;

          args.selected = {
            eventTarget: 'series',
            ...cloneDeep(this.defaultSelectInfo),
          };
        }
      };

      switch (chartType) {
        default:
        case 'bar': {
          if (useSelectItem) {
            setSelectedItemInfo();
          } else if (useSelectLabel) {
            setSelectedLabelInfo(this.options.horizontal ? 'yAxis' : 'xAxis');
          }
          break;
        }

        case 'line': {
          if (useSelectItem) {
            setSelectedItemInfo();
          } else if (useSelectLabel) {
            setSelectedLabelInfo();
          } else if (useSelectSeries) {
            setSelectedSeriesInfo();
          }
          break;
        }

        case 'heatMap': {
          const isHorizontal = !!this.options.horizontal;
          if (useSelectItem && useSelectLabel) {
            const { useBothAxis } = selectLabelOpt;

            const location = this.getCurMouseLocation(offset);

            if (location === 'chartBackground') {
              this.clearSelectedLabelInfo();
              args.deselected = { eventTarget: 'label' };
              setSelectedItemInfo();
            } else if (location === 'yAxis' || location === 'xAxis') {
              this.clearSelectedItemInfo();
              args.deselected = { eventTarget: 'item' };

              if (!useBothAxis) {
                const selectLabelAxis = isHorizontal ? 'yAxis' : 'xAxis';
                if (location !== selectLabelAxis) {
                  return;
                }
              }
              setSelectedLabelInfo(location);
            }
          } else if (useSelectItem) {
            setSelectedItemInfo();
          } else if (useSelectLabel) {
            const { useBothAxis } = selectLabelOpt;
            const location = this.getCurMouseLocation(offset);

            if ((location === 'yAxis' || location === 'xAxis') && !useBothAxis) {
              const selectLabelAxis = isHorizontal ? 'yAxis' : 'xAxis';
              if (location !== selectLabelAxis) {
                return;
              }
            }

            if (location !== 'canvas') {
              setSelectedLabelInfo(useBothAxis ? location : null);
            }
          }
          break;
        }

        case 'pie': {
          if (useSelectItem) {
            setSelectedItemInfo();
          }

          break;
        }

        case 'scatter': {
          if (useSelectItem) {
            setSelectedItemInfo();
          }

          // 모바일용 dragSelection
          if (this.options.dragSelection?.use && this.isMobile) {
            let touchInfo = this.setTouchInfo(e);
            this.overlayClear();

            if (this.options.dragSelection.keepDisplay
              && (e.layerX < touchInfo.range.x1
              || e.layerY < touchInfo.range.y1
              || e.layerX > touchInfo.range.x2
              || e.layerY > touchInfo.range.y2)) {
              this.isTouchOverlay = false;
            } else {
              touchInfo = this.setTouchBoxDimensions(touchInfo);
              this.isTouchOverlay = true;
              this.drawSelectionArea(touchInfo);
            }

            if (!this.options.dragSelection.keepDisplay) {
              setTimeout(() => {
                this.isTouchOverlay = false;
                this.overlayClear();
              }, 100);
            }

            args.e = e;
            args.touchInfo = touchInfo;
            args.data = this.findSelectedItems(touchInfo);
            args.range = this.getSelectionRange(touchInfo);

            if (typeof this.listeners['drag-select'] === 'function') {
              this.listeners['drag-select'](args);
            }
          }

          break;
        }
      }

      if (typeof this.listeners.click === 'function') {
        if (!this.dragInfoBackup) {
          this.listeners.click(args);
        }
      }
    };

    /**
     * Start drag-select when dragSelection use option is True and graph type is 'scatter'
     *
     * @returns {undefined}
     */
    this.onMouseDown = (e) => {
      const { dragSelection, type } = this.options;

      if (dragSelection.use && (type === 'scatter' || type === 'line' || type === 'heatMap')) {
        this.removeSelectionArea();
        this.dragStart(e, type);
      }
    };

    this.onWheel = (e) => {
      const isTooltipVisible = this.tooltipDOM.style.display === 'block';

      if (isTooltipVisible) {
        e.preventDefault();
        this.tooltipBodyDOM.scrollTop += e.deltaY;
      }
    };

    if (this.options?.tooltip?.useScrollbar) {
      this.overlayCanvas.addEventListener('wheel', this.onWheel, { passive: false });
    }
    if (this.options?.tooltip?.throttledMove) {
      this.onMouseMove = throttle(this.onMouseMove, 30);
    }

    this.overlayCanvas.addEventListener('mousemove', this.onMouseMove);
    this.overlayCanvas.addEventListener('mouseleave', this.onMouseLeave);
    this.overlayCanvas.addEventListener('dblclick', this.onDblClick);
    this.overlayCanvas.addEventListener('click', this.onClick);
    this.overlayCanvas.addEventListener('mousedown', this.onMouseDown);

    this.dragTouchSelectionEvent = e => this.dragTouchSelectionDestroy(e);
    window.addEventListener('click', this.dragTouchSelectionEvent);
  },

  /**
   * Start drag-move when the mouse pointer is in the graph
   *
   * @returns {undefined}
   */
  dragStart(evt, type) {
    let [offsetX, offsetY] = this.getMousePosition(evt);
    const chartRect = this.chartRect;
    const labelOffset = this.labelOffset;
    const range = {
      x1: chartRect.x1 + labelOffset.left,
      x2: chartRect.x2 - labelOffset.right,
      y1: chartRect.y1 + labelOffset.top,
      y2: chartRect.y2 - labelOffset.bottom,
    };

    if (offsetX < range.x1) {
      offsetX = range.x1;
    }

    if (offsetX > range.x2) {
      offsetX = range.x2;
    }

    if (offsetY < range.y1) {
      offsetY = range.y1;
    }

    if (offsetY > range.y2) {
      offsetY = range.y2;
    }

    this.dragInfo = {
      xcp: offsetX,
      ycp: offsetY,
      range,
    };

    /**
     * Calculate drag-section position and size, and drawing drag-section
     *
     * @returns {undefined}
     */
    const dragMove = (e) => {
      e.preventDefault();
      const [aOffsetX, aOffsetY] = this.getMousePosition(e);
      const dragInfo = this.dragInfo;
      const { xcp, ycp, range: aRange } = dragInfo;

      let xep;
      let yep;

      dragInfo.isMove = true;
      this.isMouseMove = true;

      if (aOffsetX < aRange.x1) {
        xep = aRange.x1;
      } else if (aOffsetX > aRange.x2) {
        xep = aRange.x2;
      } else {
        xep = aOffsetX;
      }

      if (aOffsetY < aRange.y1) {
        yep = range.y1;
      } else if (aOffsetY > aRange.y2) {
        yep = aRange.y2;
      } else {
        yep = aOffsetY;
      }

      if (type === 'heatMap') {
        const rangeInfo = { xcp, xep, ycp, yep, range: aRange };
        const { xsp, ysp, width, height } = this.getDragInfoForHeatMap(rangeInfo);
        dragInfo.xsp = xsp;
        dragInfo.ysp = ysp;
        dragInfo.width = width;
        dragInfo.height = height;
      } else {
        dragInfo.xsp = Math.min(xcp, xep);
        dragInfo.ysp = type === 'scatter' ? Math.min(ycp, yep) : aRange.y1;
        dragInfo.width = Math.ceil(Math.abs(xep - xcp));
        dragInfo.height = type === 'scatter'
          ? Math.ceil(Math.abs(yep - ycp))
          : aRange.y2 - aRange.y1;
      }

      this.overlayClear();
      this.drawSelectionArea(dragInfo);
    };

    /**
     * invoking user custom click event width items and range in drag-section
     *
     * @returns {undefined}
     */
    const dragEnd = (e) => {
      const dragInfo = this.dragInfo;

      if (dragInfo?.isMove && dragInfo?.width > 1 && dragInfo?.height > 1) {
        const args = {
          e,
          data: this.findSelectedItems(dragInfo),
          range: type === 'heatMap'
            ? this.getSelectionRangeForHeatMap(dragInfo)
            : this.getSelectionRange(dragInfo),
        };

        this.dragInfoBackup = defaultsDeep({}, dragInfo);

        if (typeof this.listeners['drag-select'] === 'function' && !this.options?.zoom?.use) {
          this.listeners['drag-select'](args);
        } else {
          const {
            xsp,
            range: chartRange,
            width: dragWidth,
          } = dragInfo;
          const dragXsp = xsp - chartRange.x1;

          args.range.dragSelectionInfo = {
            dragXsp,
            dragXep: dragXsp + dragWidth,
            exceptAxesYChartWidth: chartRange.x2 - chartRange.x1,
            exceptAxesXChartHeight: chartRange.y2 - chartRange.y1,
            chartRange,
            chartTitle: this.options.title.text,
          };

          this.options.zoom.getRangeInfo(args);
        }

        if (!this.options.dragSelection.keepDisplay) {
          this.removeSelectionArea();
        }
      }

      this.dragInfo = null;

      window.removeEventListener('mousemove', dragMove);
      window.removeEventListener('mouseup', dragEnd);
    };

    window.addEventListener('mousemove', dragMove);
    window.addEventListener('mouseup', dragEnd);
  },

/**
   * Draw selection-area
   *
   * @returns {undefined}
   */
  drawSelectionArea({ xsp, ysp, width, height }) {
    const ctx = this.overlayCtx;
    const { fillColor, opacity } = this.options.dragSelection;

    ctx.fillStyle = fillColor;
    ctx.globalAlpha = opacity;
    ctx.fillRect(xsp, ysp, width, height);
    ctx.globalAlpha = 1;
  },

  /** Remove drag selection area
   *
   */
  removeSelectionArea() {
    this.dragInfoBackup = null;
    this.overlayClear();
  },

  /**
   * Computing mouse position on canvas
   *
   * @returns {array} mouse pointer position
   */
  getMousePosition(evt) {
    const e = evt.originalEvent || evt;
    const rect = this.overlayCanvas.getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top, rect.width, rect.height];
  },

  /**
   * Get current mouse target value on canvas
   * @param {array} offset  return value from getMousePosition()
   * @param {object} hitInfo  return value from findHitItem()
   *
   * @returns {object} current mouse target value
   */
  getCurMouseTargetVal(offset, hitInfo) {
    const location = this.getCurMouseLocation(offset);

    const curMouseTargetVal = {
      location,
      labelIdx: -1,
      labelVal: '',
      dataIdx: -1,
      maxDataVal: '',
      originVal: '',
    };

    if (location === 'chartBackground') {
      const { maxHighlight, items } = hitInfo;
      if (maxHighlight?.length) {
        const [seriesName, value] = maxHighlight;

        if (items[seriesName]) {
          curMouseTargetVal.dataIdx = items[seriesName].index;
          curMouseTargetVal.maxDataVal = value;
          curMouseTargetVal.originVal = hitInfo;
        }
      }
    } else if (location === 'xAxis' || location === 'yAxis') {
      const { axesX, axesY } = this.options;

      const setCurMouseLabelVal = (axes, labelIdx, labelVal) => {
        curMouseTargetVal.labelIdx = labelIdx;
        curMouseTargetVal.labelVal = axes[0].type === 'time' ? dayjs(labelVal).format(axes[0].timeFormat) : labelVal;
        curMouseTargetVal.originVal = axes[0].type === 'time' ? dayjs(labelVal) : labelVal;
      };

      const setAxisLabelInfo = (targetAxis) => {
        const {
          labelIndex,
        } = this.getLabelInfoByPosition(offset, location);
        const { labelVal, labelIdx } = this.getCurMouseLabelVal(targetAxis, offset, labelIndex);
        const axesOpt = targetAxis === 'xAxis' ? axesX : axesY;

        setCurMouseLabelVal(axesOpt, labelIdx, labelVal);
      };

      setAxisLabelInfo(location);
    }

    return curMouseTargetVal;
  },

  /**
   * Processes touch event to determine touch position within the chart.
   *
   * @param {TouchEvent} event - the touch event to process
   * @returns {object} - the processed touch information
   */
  setTouchInfo(event) {
    let [offsetX, offsetY] = this.getMousePosition(event);
    const chartRect = this.chartRect;
    const labelOffset = this.labelOffset;
    const range = {
      x1: chartRect.x1 + labelOffset.left,
      x2: chartRect.x2 - labelOffset.right,
      y1: chartRect.y1 + labelOffset.top,
      y2: chartRect.y2 - labelOffset.bottom,
    };

    offsetX = Math.max(range.x1, Math.min(offsetX, range.x2));
    offsetY = Math.max(range.y1, Math.min(offsetY, range.y2));

    return {
      xcp: offsetX,
      ycp: offsetY,
      range,
    };
  },

  /**
   * Adjusts the touch box dimensions based on the provided touch information.
   *
   * @param {object} touchInfo - The touch information including touch position and plotting range
   * @returns {object} - The adjusted touch information
   */
  setTouchBoxDimensions(touchInfo) {
    const boxSize = this.options.dragSelection?.size || 50;
    const halfBoxSize = boxSize / 2;
    const { xcp, ycp, range } = touchInfo;
    let xsp = xcp - halfBoxSize;
    let ysp = ycp - halfBoxSize;
    let width = boxSize;
    let height = boxSize;

    this.boxOverflow = {
      x1: false,
      x2: false,
      y1: false,
      y2: false,
    };

    if (xcp < range.x1 + halfBoxSize) {
      xsp = range.x1;
      width = halfBoxSize - (range.x1 - xcp);
      this.boxOverflow.x1 = true;
    }
    if (xcp > range.x2 - halfBoxSize) {
      width = halfBoxSize - (xcp - range.x2);
      this.boxOverflow.x2 = true;
    }
    if (ycp < range.y1 + halfBoxSize) {
      ysp = range.y1;
      height = halfBoxSize - (range.y1 - ycp);
      this.boxOverflow.y1 = true;
    }
    if (ycp > range.y2 - halfBoxSize) {
      height = halfBoxSize - (ycp - range.y2);
      this.boxOverflow.y2 = true;
    }

    touchInfo.xsp = xsp;
    touchInfo.ysp = ysp;
    touchInfo.width = width;
    touchInfo.height = height;

    return touchInfo;
  },

  /**
   * Remove a touch selection.
   *
   * @param {TouchEvent} e - the touch event to process
   * @returns {undefined}
   */
  dragTouchSelectionDestroy(e) {
    if (
      this.options.dragSelection?.use
      && e.target !== this.overlayCanvas
      && this.isTouchOverlay
    ) {
      this.isTouchOverlay = false;
      this.overlayClear();
    }
  },

  /**
   * Find graph item on mouse position
   * @param {array} offset    return value from getMousePosition()
   *
   * @returns {object} hit item information
   */
  findHitItem(offset) {
    const sIds = Object.keys(this.seriesList);
    const items = {};
    const isHorizontal = !!this.options.horizontal;
    const ctx = this.tooltipCtx;

    let hitId = null;
    let maxs = '';
    let maxsw = 0;
    let maxv = '';
    let maxg = null;
    let maxSID = null;

    for (let ix = 0; ix < sIds.length; ix++) {
      const sId = sIds[ix];
      const series = this.seriesList[sId];

      if (series.findGraphData) {
        const item = series.findGraphData(offset, isHorizontal);

        if (item?.data) {
          let gdata;

          if (item.data.o === null) {
            if (!series.isExistGrp) {
              gdata = isHorizontal ? item.data.x : item.data.y;
            }
          } else if (!isNaN(item.data.o)) {
            gdata = item.data.o;
          }

          if (gdata !== null && gdata !== undefined) {
            const sName = series.name;
            const sw = ctx ? ctx.measureText(sName).width : 1;

            item.name = sName;
            item.axis = { x: series.xAxisIndex, y: series.yAxisIndex };
            items[sId] = item;

            const formattedTxt = this.getFormattedTooltipValue({
              seriesName: sName,
              value: gdata,
              itemData: item.data,
            });

            item.data.formatted = formattedTxt;

            if (maxsw < sw) {
              maxs = sName;
              maxsw = sw;
            }

            if (maxv.length <= `${formattedTxt}`.length) {
              maxv = `${formattedTxt}`;
            }

            if (maxg === null || maxg <= gdata) {
              maxg = gdata;
              maxSID = sId;
            }

            if (item.hit) {
              hitId = sId;
            }
          }
        }
      }
    }

    hitId = hitId === null ? Object.keys(items)[0] : hitId;
    const maxHighlight = maxg !== null ? [maxSID, maxg] : null;

    return { items, hitId, maxTip: [maxs, maxv], maxHighlight };
  },

  /**
   * get formatted value for tooltip
   * @param seriesName
   * @param value
   * @param itemData
   * @returns {string}
   */
  getFormattedTooltipValue({ seriesName, value, itemData }) {
    const opt = this.options;
    const isHorizontal = !!opt.horizontal;
    const tooltipOpt = opt.tooltip;
    const tooltipValueFormatter = typeof tooltipOpt?.formatter === 'function'
      ? tooltipOpt?.formatter
      : tooltipOpt?.formatter?.value;

    let formattedTxt = value;
    if (tooltipValueFormatter) {
      if (opt.type === 'pie') {
        formattedTxt = tooltipValueFormatter({
          value,
          name: seriesName,
          percentage: itemData?.percentage,
        });
      } else if (opt.type === 'heatMap') {
        formattedTxt = tooltipValueFormatter({
          x: itemData?.x,
          y: itemData?.y,
          value: value > -1 ? value : 'error',
        });
      } else {
        formattedTxt = tooltipValueFormatter({
          x: isHorizontal ? value : itemData?.x,
          y: isHorizontal ? itemData?.y : value,
          name: seriesName,
        });
      }
    }

    if (value && (!tooltipValueFormatter || typeof formattedTxt !== 'string')) {
      if (opt.type === 'heatMap') {
        formattedTxt = value < 0 ? 'error' : numberWithComma(value);
      } else {
        formattedTxt = numberWithComma(value);
      }
    }

    return formattedTxt;
  },

  /**
   * add not hit info
   * @param hitInfo
   */
  addNotHitInfo(hitInfo) {
    const ctx = this.tooltipCtx;
    const isHorizontal = !!this.options.horizontal;
    const hitItemId = Object.keys(hitInfo.items)[0];
    const hitItemData = isHorizontal
      ? hitInfo.items?.[hitItemId]?.data?.y : hitInfo.items?.[hitItemId]?.data?.x;
    let maxSeriesName = '';
    let maxValueTxt = '';

    const sIds = Object.keys(this.seriesList);
    for (let ix = 0; ix < sIds.length; ix++) {
      const sId = sIds[ix];
      const series = this.seriesList[sId];

      if (series?.show) {
        const hasData = series.data.find(data => (
            isHorizontal
              ? data?.y === hitItemData
              : data?.x === hitItemData
          ),
        );

        const formattedValue = this.getFormattedTooltipValue({
          seriesName: series.name,
          value: hasData?.o,
          itemData: hasData,
        });

        if (hasData && !hitInfo.items[sId]) {
          const item = {};
          item.color = series.color;
          item.hit = false;
          item.name = series.name;
          item.axis = { x: series.xAxisIndex, y: series.yAxisIndex };
          item.index = isHorizontal ? series.yAxisIndex : series.xAxisIndex;
          item.data = hasData;
          item.data.formatted = formattedValue;

          hitInfo.items[sId] = item;
        }

        const maxSeriesNameWidth = ctx ? ctx.measureText(maxSeriesName).width : 1;
        const seriesNameWidth = ctx ? ctx.measureText(series.name).width : 1;
        if (maxSeriesNameWidth < seriesNameWidth) {
          maxSeriesName = series.name;
        }

        const maxValueWidth = ctx ? ctx.measureText(maxValueTxt).width : 1;
        const valueWidth = ctx ? ctx.measureText(`${formattedValue}`).width : 1;
        if (maxValueWidth < valueWidth) {
          maxValueTxt = `${formattedValue}`;
        }
      }
    }

    hitInfo.maxTip = [maxSeriesName, maxValueTxt];
  },

  /**
   * Select Item
   * Set backup data that selected item information
   * render chart
   * @param targetInfo {object}  '{ dataIndex: number, seriesID: string }'
   * @param chartType {string}  'bar', 'line', 'pie', 'scatter', 'heatMap'
   *
   */
  selectItemByData(targetInfo, chartType) {
    this.defaultSelectItemInfo = targetInfo;

    let foundInfo;
    if (chartType === 'pie') {
      foundInfo = {
        type: 'pie',
        sId: targetInfo.seriesID,
      };
    } else {
      foundInfo = isNaN(targetInfo?.dataIndex) ? null : this.getItem(targetInfo, false);
    }

    this.render(foundInfo);
  },

  /**
   * Select Label
   * set backup data that selected label information list
   * render chart
   * @param labelIndexList {number[]}
   * @param targetAxis {string | null}
   * @returns {boolean}
   */
  selectLabelByData(labelIndexList, targetAxis) {
    this.defaultSelectInfo = this.getSelectedLabelInfoWithLabelData(labelIndexList, targetAxis);
    this.render();
  },

  /**
   * Select Series
   * set backup data that selected series information list
   * render chart
   * @param seriesIdList {number[]}  '
   * @returns {boolean}
   */
  selectSeriesByData(seriesIdList) {
    this.defaultSelectInfo.seriesId = seriesIdList;
    this.render();
  },

  /**
   * Get each series data and label text
   * @param labelIndexList{number[]}
   * @param targetAxis{string | null}
   * @returns {object[]}
   */
  getSelectedLabelInfoWithLabelData(labelIndexList, targetAxis) {
    const { selectLabel: selectLabelOpt, type: chartType, horizontal } = this.options;
    const result = cloneDeep(this.defaultSelectInfo);
    result.dataIndex = labelIndexList;

    switch (chartType) {
      default:
      case 'bar':
      case 'line': {
        result.dataIndex.splice(selectLabelOpt.limit);

        result.label = result.dataIndex.map(i => this.data.labels[i]);

        const dataEntries = Object.entries(this.data.data);
        result.data = result.dataIndex.map(labelIdx => Object.fromEntries(
          dataEntries.map(([sId, data]) => [sId, data[labelIdx]])));
        break;
      }

      case 'heatMap': {
        const { limit, useBothAxis } = this.options.selectLabel;

        result.dataIndex.splice(limit);

        let targetAxisDirection;
        if (useBothAxis) {
          targetAxisDirection = targetAxis === 'yAxis' ? 'y' : 'x';
        } else {
          targetAxisDirection = horizontal ? 'y' : 'x';
        }

        result.label = result.dataIndex.map(i => this.data.labels[targetAxisDirection][i]);

        const dataValues = Object.values(this.data.data)[0];
        result.data = dataValues.filter(({ x, y }) =>
          (result.label.includes(targetAxisDirection === 'y' ? y : x)),
        );
        break;
      }
    }

    return result;
  },

  /**
   * Add or delete selected label index, according to policy and option
   * @param labelIndex {number}
   * @param targetAxis {string | null}
   * @returns after {number[]}  '[0, 1 ...]' result Label index List
   */
  regulateSelectedLabelInfo(labelIndex, targetAxis) {
    const option = this.options?.selectLabel ?? {};
    const before = targetAxis === null || this.defaultSelectInfo?.targetAxis === targetAxis
      ? { ...this.defaultSelectInfo, targetAxis }
      : { dataIndex: [], targetAxis };

    const after = cloneDeep(before);

    if (before.dataIndex.includes(labelIndex)) {
      const idx = before.dataIndex.indexOf(labelIndex);
      after.dataIndex.splice(idx, 1);
    } else if (labelIndex > -1) {
      after.dataIndex.push(labelIndex);
      if (option.limit > 0 && option.limit < after.dataIndex.length) {
        if (option.useDeselectOverflow) {
          after.dataIndex.splice(0, 1);
        } else {
          after.dataIndex.pop();
        }
      }
    }

    return after;
  },

  /**
   * Add or delete selected series Index,according to policy and option
   * @param seriesId {number}
   * @returns after {number[]}  '[0, 1 ...]' result series Id List
   */
  updateSelectedSeriesInfo(seriesId) {
    const option = this.options?.selectSeries ?? {};
    const before = this.defaultSelectInfo ?? { seriesId: [] };
    const after = cloneDeep(before);

    if (before.seriesId.includes(seriesId)) {
      const idx = before.seriesId.indexOf(seriesId);
      after.seriesId.splice(idx, 1);
    } else if (seriesId) {
      after.seriesId.push(seriesId);
      if (option.limit > 0 && option.limit < after.seriesId.length) {
        if (option.useDeselectOverflow) {
          after.seriesId.splice(0, 1);
        } else {
          after.seriesId.pop();
        }
      }
    }

    return after;
  },

  /**
   * Find items by series within a range
   * @param {object} range  object for find series items
   *
   * @returns {object}
   */
  findSelectedItems(range) {
    const items = [];
    const sIds = Object.keys(this.seriesList);
    for (let ix = 0; ix < sIds.length; ix++) {
      const sId = sIds[ix];
      const series = this.seriesList[sId];
      const findFn = series.findItems;
      if (findFn) {
        const item = findFn.call(series, range);
        if (item && item.length) {
          items.push({
            seriesName: series.name,
            seriesId: sId,
            items: item,
          });
        }
      }
    }

    return items;
  },

  /**
   * Returns the data-based range value for a selection
   * @param {object} object for calculating data-based range
   *                 object.range: coordinate-based range in graph
   * @returns {object}
   */
  getSelectionRange({ xsp, ysp, width, height, range }) {
    const dataRangeX = this.axesSteps.x.length ? this.axesSteps.x[0] : null;
    const dataRangeY = this.axesSteps.y.length ? this.axesSteps.y[0] : null;

    if (!dataRangeX || !dataRangeY) {
      return null;
    }

    const xep = xsp + width;
    const yep = ysp + height;
    const graphWidth = dataRangeX.graphMax - dataRangeX.graphMin;
    const graphHeight = dataRangeY.graphMax - dataRangeY.graphMin;

    const xMinRatio = this.getRatioInRange(range.x1, range.x2, xsp);
    const xMaxRatio = this.getRatioInRange(range.x1, range.x2, xep);
    const yMinRatio = this.getRatioInRange(range.y1, range.y2, yep);
    const yMaxRatio = this.getRatioInRange(range.y1, range.y2, ysp);

    const xMin = this.isMobile && this.boxOverflow?.x1
      ? Math.min(this.minMax.x[0].min, dataRangeX.graphMin)
      : Math.max(dataRangeX.graphMin + graphWidth * xMinRatio, dataRangeX.graphMin);
    const xMax = this.isMobile && this.boxOverflow?.x2
      ? Math.max(this.minMax.x[0].max, dataRangeX.graphMax)
      : Math.min(dataRangeX.graphMin + graphWidth * xMaxRatio, dataRangeX.graphMax);
    const yMin = this.isMobile && this.boxOverflow?.y2
      ? Math.min(this.minMax.y[0].min, dataRangeY.graphMin)
      : Math.max(dataRangeY.graphMin + graphHeight * (1 - yMinRatio), dataRangeY.graphMin);
    const yMax = this.isMobile && this.boxOverflow?.y1
      ? Math.max(this.minMax.y[0].max, dataRangeY.graphMax)
      : Math.min(dataRangeY.graphMin + graphHeight * (1 - yMaxRatio), dataRangeY.graphMax);

    return {
      xMin: +xMin.toFixed(3),
      xMax: +xMax.toFixed(3),
      yMin: +yMin.toFixed(3),
      yMax: +yMax.toFixed(3),
    };
  },

  /**
   * Returns the position ratio of 'value' between 'min' and 'max'
   * @param {number} min    min value
   * @param {number} max    max value
   * @param {number} value  value is between min and max
   *
   * @returns {number}
   */
  getRatioInRange(min, max, value) {
    const total = max - min;
    const targetValue = value - min;

    return targetValue / total;
  },

  getDragInfoForHeatMap(range) {
    const sId = Object.keys(this.seriesList)[0];
    return this.seriesList[sId].findBlockRange(range);
  },

  getSelectionRangeForHeatMap(range) {
    const dataRangeX = this.axesSteps.x.length ? this.axesSteps.x[0] : null;
    const dataRangeY = this.axesSteps.y.length ? this.axesSteps.y[0] : null;

    if (!dataRangeX || !dataRangeY) {
      return null;
    }

    const sId = Object.keys(this.seriesList)[0];
    const { xMin, xMax, yMin, yMax } = this.seriesList[sId].findSelectionRange(range) ?? {};

    return {
      xMin: xMin ?? dataRangeX.graphMin,
      xMax: xMax ?? dataRangeX.graphMax,
      yMin: yMin ?? dataRangeY.graphMin,
      yMax: yMax ?? dataRangeY.graphMax,
    };
  },

  /**
   * Check hitInfo is deselected Item through re-click
   * @param hitInfo
   * @returns {boolean}
   */
  isDeselectItem(hitInfo) {
    return this.options.selectItem.useDeselectItem
      && hitInfo?.maxIndex === this.defaultSelectItemInfo?.dataIndex
      && hitInfo?.sId === this.defaultSelectItemInfo?.seriesID
      && !isNaN(hitInfo?.maxIndex);
  },

  /**
   * Get current mouse location (xAxis, yAxis, chartBackground, canvas)
   * @param offset
   * @returns {string}
   */
  getCurMouseLocation(offset) {
    const [offsetX, offsetY] = offset;

    const aPos = {
      x1: this.chartRect.x1 + this.labelOffset.left,
      x2: this.chartRect.x2 - this.labelOffset.right,
      y1: this.chartRect.y1 + this.labelOffset.top,
      y2: this.chartRect.y2 - this.labelOffset.bottom,
    };
    const xAxisStartPoint = aPos[this.axesX[0].units.rectStart];
    const xAxisEndPoint = aPos[this.axesX[0].units.rectEnd];
    const yAxisStartPoint = aPos[this.axesY[0].units.rectStart];
    const yAxisEndPoint = aPos[this.axesY[0].units.rectEnd];

    if (
      inRange(offsetX, this.chartRect.x1, aPos.x1)
      && inRange(offsetY, yAxisStartPoint, yAxisEndPoint)
    ) {
      return 'yAxis';
    } else if (
      inRange(offsetX, xAxisStartPoint, xAxisEndPoint)
      && inRange(offsetY, aPos.y2, this.chartRect.y2)) {
      return 'xAxis';
    } else if (
      inRange(offsetX, aPos.x1, aPos.x2)
      && inRange(offsetY, aPos.y1, aPos.y2)) {
      return 'chartBackground';
    }

    return 'canvas';
  },

  /**
   * Clear 'defaultSelectInfo'
   */
  clearSelectedLabelInfo() {
    this.defaultSelectInfo = { dataIndex: [] };
  },

  /**
   * Clear 'defaultSelectItemInfo'
   */
  clearSelectedItemInfo() {
    this.defaultSelectItemInfo = null;
  },
};

export default modules;
