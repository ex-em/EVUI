import { cloneDeep, defaultsDeep, inRange, isEqual, isNil } from 'lodash-es';
import dayjs from 'dayjs';
import { numberWithComma } from '@/common/utils';
import throttle from '@/common/utils.throttle';
import Util from '../helpers/helpers.util';

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

      // #6: 커서가 value-only 라벨 박스(plot 라벨, z-order 상 series 위) 안에 있으면 라벨 tooltip 을
      // series tooltip 보다 우선한다. 해당 프레임의 series hit 을 비워 아래 파이프라인이 'no hit' 으로
      // 동작하게 하고(series tooltip/highlight off), handlePlotLabelHover 가 라벨 tooltip 을 띄운다.
      const plotLabelHit = this.findPlotLabelHitRegion(offset);
      if (plotLabelHit) {
        hitInfo.items = {};
        hitInfo.hitId = null;
      }

      if (!plotLabelHit && tooltip?.showAllValueInRange && hitInfo?.items) {
        this.addNotHitInfo(hitInfo);
      }

      const ctx = this.overlayCtx;
      const itemKeys = Object.keys(hitInfo.items);
      const hasItems = itemKeys.length > 0;

      // hover 시그니처: hitId + 시리즈/dataIndex 집합이 동일하면 같은 데이터 포인트 위.
      // formatter.html 경로에서 비용 가장 큰 drawCustomTooltip(고객 formatter + htmlToElement +
      // virtualScroll teardown→reinit) 만 스킵하고, 나머지(overlay/indicator/listener/hoveredLabel)
      // 흐름은 그대로 유지한다. fast path 를 더 넓히면 부수 효과가 생길 수 있어 보수적으로 둔다.
      let hoverSig = '';
      if (hasItems) {
        hoverSig = `h=${hitInfo.hitId}`;
        const sortedKeys = itemKeys.slice().sort();
        for (let i = 0; i < sortedKeys.length; i++) {
          const k = sortedKeys[i];
          hoverSig += `|${k}:${hitInfo.items[k].index}`;
        }
      }

      const skipCustomTooltipRedraw =
        hoverSig !== '' &&
        hoverSig === this._lastHoverSig &&
        this.tooltipDOM &&
        this.tooltipDOM.style.display !== 'none';

      this.overlayClear();

      if (hasItems) {
        if (tooltip.use && this.isInitTooltip) {
          this.drawItemsHighlight(hitInfo, ctx);

          if (typeof tooltip?.returnValue === 'function') {
            const seriesList = [];
            for (let i = 0; i < itemKeys.length; i++) {
              const sId = itemKeys[i];
              const it = hitInfo.items[sId];
              seriesList.push({
                sId,
                data: it.data,
                color: it.color,
                name: it.name,
                dataId: it.id,
                index: it.index,
              });
            }

            this.hideTooltipDOM();
            tooltip.returnValue(seriesList, e);
          } else if (tooltip?.formatter?.html) {
            if (!skipCustomTooltipRedraw) {
              this.drawCustomTooltip(hitInfo?.items);
            }
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

        // tooltip이 표시될 때 indicator를 해당 라벨 위치로 이동 (line 차트이거나 line series가 포함된 경우)
        const hasLineSeries = Object.values(this.seriesList || {}).some(
          (series) => series.type === 'line',
        );
        if (tooltip.use && (type === 'line' || hasLineSeries)) {
          // indicator를 그리고 실제 위치한 라벨 정보를 받음
          const indicatorInfo = this.drawIndicatorForTooltip(hitInfo, indicator.color);

          // 실제 indicator가 위치한 라벨 값을 동기화에 사용
          const actualLabelValue = indicatorInfo?.labelValue;
          const label = this.getTimeLabel(offset);

          args.hoveredLabel = {
            horizontal: this.options.horizontal,
            label,
            mousePosition: [e.clientX, e.clientY],
            dataLabel: actualLabelValue,
          };
        }
      } else if (tooltip.use && this.isInitTooltip) {
        if (typeof tooltip?.returnValue === 'function') {
          tooltip.returnValue([], e);
        }

        this.hideTooltipDOM();
      }

      // value-only plot 라벨 hover → text tooltip (#6). 라벨 박스 위에선 위에서 series hit 을 비워
      // 라벨을 우선한다.
      this.handlePlotLabelHover(plotLabelHit, e);

      this._lastHoverSig = hoverSig;

      // 전용 드래그 캔버스를 쓰면 keepDisplay 영역이 그 캔버스에 그대로 남아 있어(매 hover의
      // overlayClear는 메인 overlay만 비움) 여기서 다시 그릴 필요가 없다.
      // (clear 없이 다시 그리면 opacity가 누적되어 짙어진다.)
      if (this.dragInfoBackup && !this.dragDisplayCanvas) {
        this.drawSelectionArea(this.dragInfoBackup);
      }

      // tooltip 기반 indicator가 아직 설정되지 않은 경우에만 일반 indicator 처리
      if (!args.hoveredLabel && !this.isNotUseIndicator()) {
        // line 차트가 아니고 line series가 없거나, tooltip이 없을 때는 일반 indicator 표시
        const hasLineSeries = Object.values(this.seriesList || {}).some(
          (series) => series.type === 'line',
        );
        if (
          (type !== 'line' && !hasLineSeries) ||
          !tooltip.use ||
          !Object.keys(hitInfo.items).length
        ) {
          this.drawIndicator(offset, indicator.color);
        }
        const label = this.getTimeLabel(offset);
        args.hoveredLabel = {
          horizontal: this.options.horizontal,
          label,
          mousePosition: [e.clientX, e.clientY],
        };
      } else if (!args.hoveredLabel) {
        args.hoveredLabel = {
          label: '',
        };
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

    this.onMouseLeave = (e) => {
      const { tooltip, dragSelection } = this.options;

      if (tooltip.throttledMove) {
        this.onMouseMove.cancel();
      }

      if (!dragSelection.use || !dragSelection.keepDisplay) {
        this.overlayClear();
      }

      this.hidePlotLabelTooltip?.();

      if (tooltip.use && this.isInitTooltip) {
        if (typeof tooltip?.returnValue === 'function') {
          tooltip.returnValue([], e);
        }

        this.tooltipClear();
      }

      // 다음 hover 진입 시 fast path 가 stale 시그니처로 잘못 매치되지 않도록 초기화한다.
      this._lastHoverSig = '';

      // 다음 hover 시작 시 레이아웃 변화를 반영하도록 캐시를 무효화한다.
      this.invalidateClientRectCache();
      this.listeners['mouse-leave']();
    };

    /**
     * Dealing with graph item select and invoking user custom dblclick event
     *
     * @returns {undefined}
     */
    this.onDblClick = (e) => {
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

      if (useSelectItem) {
        args.eventTarget = 'item';
      } else if (useSelectLabel) {
        args.eventTarget = 'label';
      } else if (useSelectSeries) {
        args.eventTarget = 'series';
      }

      const setSelectedItemInfo = () => {
        const hitInfo = this.findHitItem(offset, true);

        // 실제 클릭된 아이템의 정보 추출 (hitId가 있으면 해당 아이템, 없으면 첫 번째 아이템)
        const hitItemId = hitInfo.hitId ?? Object.keys(hitInfo.items)[0];
        const hitItem = hitInfo.items[hitItemId];

        if (hitItem) {
          args.label = hitItem.label;
          args.value = hitItem.data?.o;
          args.seriesId = hitItemId;
          args.dataIndex = hitItem.index;
          args.acc = hitItem.data?.acc;
        }
      };

      const setSelectedLabelInfo = (targetAxis) => {
        const hitInfo = this.findHitItem(offset, true);
        const hitItemId = hitInfo.hitId ?? Object.keys(hitInfo.items)[0];
        const hitItem = hitInfo.items[hitItemId];

        const { labelIndex: clickedLabelIndex } = this.getLabelInfoByPosition(offset, targetAxis);

        const { dataIndex: dataIndexList } = this.regulateSelectedLabelInfo(
          clickedLabelIndex,
          targetAxis,
        );

        this.defaultSelectInfo = this.getSelectedLabelInfoWithLabelData(dataIndexList, targetAxis);

        if (hitItem) {
          args.label = hitItem.label;
          args.seriesId = hitItemId;
          args.value = hitItem.data?.o;
          args.acc = hitItem.data?.acc;
          args.dataIndex = hitItem.index;
        }
      };

      const setSelectedSeriesInfo = () => {
        const hitInfo = this.findHitItem(offset, true);
        const hitItemId = hitInfo.hitId ?? Object.keys(hitInfo.items)[0];
        const hitItem = hitInfo.items[hitItemId];

        if (hitItemId !== null) {
          const allSelectedList = this.updateSelectedSeriesInfo(hitItemId, true);

          if (hitItem) {
            args.label = hitItem.label;
            args.value = hitItem.data?.o;
            args.seriesId = allSelectedList.seriesId?.at(0);
            args.acc = hitItem.data?.acc;
            args.dataIndex = hitItem.index;
          }
        }
      };

      switch (chartType) {
        case 'bar': {
          if (useSelectLabel) {
            setSelectedLabelInfo(this.options.horizontal ? 'yAxis' : 'xAxis');
          } else {
            setSelectedItemInfo();
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
        default: {
          setSelectedItemInfo();
          break;
        }
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
        const hitInfo = this.getHitItemByPosition(offset, false, undefined, false, true);

        ({
          label: args.label,
          value: args.value,
          sId: args.seriesId,
          dataIndex: args.dataIndex,
          acc: args.acc,
        } = hitInfo);

        if (hitInfo?.sId) {
          args.selected = {
            eventTarget: 'item',
            seriesId: this.isDeselectItem(hitInfo) ? null : hitInfo.sId,
            dataIndex: this.isDeselectItem(hitInfo) ? null : hitInfo.dataIndex,
          };
        }
      };

      const setSelectedLabelInfo = (targetAxis) => {
        const { labelIndex: clickedLabelIndex } = this.getLabelInfoByPosition(offset, targetAxis);

        const { dataIndex: dataIndexList } = this.regulateSelectedLabelInfo(
          clickedLabelIndex,
          targetAxis,
        );

        this.defaultSelectInfo = this.getSelectedLabelInfoWithLabelData(dataIndexList, targetAxis);

        if (targetAxis) {
          this.defaultSelectInfo.targetAxis = dataIndexList?.length ? targetAxis : null;
        }

        args.selected = {
          eventTarget: 'label',
          ...cloneDeep(this.defaultSelectInfo),
        };
        args.label = this.defaultSelectInfo?.label?.at(0);
        args.dataIndex = this.defaultSelectInfo?.dataIndex?.at(0);
      };

      const setSelectedSeriesInfo = () => {
        const hitInfo = this.findHitItem(offset, true);
        const hitItemId = hitInfo.hitId ?? Object.keys(hitInfo.items)[0];
        const hitItem = hitInfo.items[hitItemId];

        if (!isNil(hitItemId)) {
          const allSelectedList = this.updateSelectedSeriesInfo(hitItemId, false);
          this.defaultSelectInfo.seriesId = allSelectedList.seriesId;

          args.selected = {
            eventTarget: 'series',
            ...cloneDeep(this.defaultSelectInfo),
          };
          args.label = hitItem.label;
          args.dataIndex = hitItem.index;
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

            if (
              this.options.dragSelection.keepDisplay &&
              (e.layerX < touchInfo.range.x1 ||
                e.layerY < touchInfo.range.y1 ||
                e.layerX > touchInfo.range.x2 ||
                e.layerY > touchInfo.range.y2)
            ) {
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
      const isTooltipVisible = this.tooltipDOM?.style?.display === 'block';
      if (!isTooltipVisible) return;

      // 가상 스크롤 활성 세션에서는 모듈이 실제 스크롤 컨테이너(rowContainer)를 알고 있으므로
      // 이를 최우선으로 사용한다. (커스텀 툴팁 경로에서 tooltipBodyDOM은 detach 상태라 사용 불가)
      const scrollTarget =
        this.vsState?.scrollEl ||
        (this.options.tooltip.htmlScrollTarget
          ? this.tooltipDOM?.querySelector(this.options.tooltip.htmlScrollTarget)
          : null) ||
        this.tooltipBodyDOM;
      if (!scrollTarget || scrollTarget.scrollHeight <= scrollTarget.clientHeight) {
        this.hideTooltipDOM();
        return;
      }

      const { scrollTop, scrollHeight, clientHeight } = scrollTarget;
      const isAtTop = scrollTop <= 0;
      const isAtBottom = Math.ceil(scrollTop) + clientHeight >= scrollHeight;
      const isScrollingUp = e.deltaY < 0;
      const isScrollingDown = e.deltaY > 0;

      e.preventDefault();

      if (!(isAtTop && isScrollingUp) && !(isAtBottom && isScrollingDown)) {
        scrollTarget.scrollTop += e.deltaY;
      }
    };

    // 가상 스크롤은 스크롤을 전제로 한 기능이므로, VS가 활성화될 수 있는 차트
    // (formatter.html + virtualScroll 미비활성)에서는 useScrollbar와 무관하게 wheel 핸들러를
    // 보장한다. 그렇지 않으면 기본 설정(useScrollbar:false)에서 잘려나간 행에 접근할 수 없다.
    const tooltipOpt = this.options?.tooltip;
    const canVirtualScroll =
      !!tooltipOpt?.formatter?.html &&
      !!tooltipOpt?.virtualScroll &&
      tooltipOpt.virtualScroll.use !== false;
    if (tooltipOpt?.useScrollbar || canVirtualScroll) {
      this.overlayCanvas.addEventListener('wheel', this.onWheel, { passive: false });
    }
    if (this.options?.tooltip?.throttledMove) {
      this.onMouseMove = throttle(this.onMouseMove, 30);
    }

    this.overlayCanvas.addEventListener('mousemove', this.onMouseMove);
    this.overlayCanvas.addEventListener('mouseleave', this.onMouseLeave);
    this.overlayCanvas.addEventListener('dblclick', this.onDblClick);
    this.overlayCanvas.addEventListener('click', this.onClick);

    // dragSelection.startArea(CSS 셀렉터)가 지정되면 해당 영역에서 시작한 드래그도 인식한다.
    // 기본값은 overlayCanvas이므로 캔버스 안에서 시작해야만 동작한다(기존 동작).
    // 셀렉터는 차트 자신의 조상에서 탐색하므로 멀티 차트에서도 각자 자신의 영역만 바라본다.
    const { startArea, displayFromStartArea } = this.options.dragSelection;
    this.dragStartTarget = (startArea && this.target.closest(startArea)) || this.overlayCanvas;
    this.dragStartTarget.addEventListener('mousedown', this.onMouseDown);

    // displayFromStartArea: scatter(PC)에서 드래그 영역을 startArea 지점부터 표시하기 위한 전용 캔버스.
    // overlayCanvas는 .ev-chart-container(overflow:hidden) 안에 있어 캔버스 밖으로 그릴 수 없으므로,
    // startArea를 덮는 별도의 pointer-events:none 캔버스가 필요하다.
    if (
      displayFromStartArea &&
      this.options.type === 'scatter' &&
      !this.isMobile &&
      this.dragStartTarget !== this.overlayCanvas
    ) {
      this.createDragDisplayCanvas();
    }

    this.dragTouchSelectionEvent = (e) => this.dragTouchSelectionDestroy(e);
    window.addEventListener('click', this.dragTouchSelectionEvent);

    // 스크롤 시 viewport 기준 위치가 바뀌므로 캐시된 client rect를 무효화한다.
    // scroll 이벤트는 버블링하지 않으므로 capture 단계로 모든 스크롤 컨테이너를 감지한다.
    this.invalidateRectOnScroll = () => this.invalidateClientRectCache();
    window.addEventListener('scroll', this.invalidateRectOnScroll, {
      capture: true,
      passive: true,
    });
  },

  /**
   * Start drag-move when the mouse pointer is in the graph
   *
   * @returns {undefined}
   */
  dragStart(evt, type) {
    if (this.dragDisplayCanvas) {
      this.refreshDragDisplayCanvas();
    }

    // displayFromStartArea: startArea 텍스트가 드래그 중 선택되는 것을 막는다.
    // mousedown의 preventDefault는 포커스 이동까지 막아 startArea 안의 button/input 등
    // 포커스 가능한 자식이 동작하지 않으므로, 포커스에 영향이 없는 user-select만 끈다.
    // 드래그가 끝나면(dragEnd) 원래 인라인 값으로 되돌린다.
    let prevUserSelect;
    if (this.dragDisplayCanvas) {
      prevUserSelect = this.dragStartTarget.style.userSelect;
      this.dragStartTarget.style.userSelect = 'none';
    }

    const [rawOffsetX, rawOffsetY, canvasWidth, canvasHeight] = this.getMousePosition(evt);
    let offsetX = rawOffsetX;
    let offsetY = rawOffsetY;
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

    // 포인터가 캔버스(차트 영역) 안에 있는지 판별
    const isInsideCanvas = (x, y) => x >= 0 && x <= canvasWidth && y >= 0 && y <= canvasHeight;

    // 드래그 활성화 여부. 캔버스 바깥에서 시작한 경우 포인터가 캔버스에 진입할 때 활성화된다.
    let isActivated = false;
    const activate = () => {
      if (isActivated) {
        return;
      }
      isActivated = true;
      this.removeSelectionArea();
    };

    // 캔버스 안에서 드래그를 시작했다면 기존 동작과 동일하게 즉시 활성화.
    // displayFromStartArea(전용 캔버스)면 startArea 지점부터 그려야 하므로 시작 즉시 활성화한다.
    if (isInsideCanvas(rawOffsetX, rawOffsetY) || this.dragDisplayCanvas) {
      activate();
    }

    /**
     * Calculate drag-section position and size, and drawing drag-section
     *
     * @returns {undefined}
     */
    const dragMove = (e) => {
      const [aOffsetX, aOffsetY] = this.getMousePosition(e);

      // 캔버스 바깥에서 시작한 드래그는 포인터가 캔버스에 진입한 순간 활성화한다.
      // 진입 전에는 preventDefault를 호출하지 않아 페이지의 다른 인터랙션을 방해하지 않는다.
      if (!isActivated) {
        if (isInsideCanvas(aOffsetX, aOffsetY)) {
          activate();
        } else {
          return;
        }
      }

      e.preventDefault();
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
        dragInfo.height =
          type === 'scatter' ? Math.ceil(Math.abs(yep - ycp)) : aRange.y2 - aRange.y1;
      }

      // displayFromStartArea: 선택/range 계산용 clamped rect(위)와 별개로,
      // startArea 지점부터 그리기 위한 raw(미clamp) rect를 별도로 보관한다.
      // 선택 동작과 drag-select range 페이로드는 기존과 동일하게 유지된다.
      if (this.dragDisplayCanvas && type === 'scatter') {
        dragInfo.displayRect = {
          xsp: Math.min(rawOffsetX, aOffsetX),
          ysp: Math.min(rawOffsetY, aOffsetY),
          width: Math.ceil(Math.abs(aOffsetX - rawOffsetX)),
          height: Math.ceil(Math.abs(aOffsetY - rawOffsetY)),
          range: aRange,
        };
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

      if (isActivated && dragInfo?.isMove && dragInfo?.width > 1 && dragInfo?.height > 1) {
        const args = {
          e,
          data: this.findSelectedItems(dragInfo),
          range:
            type === 'heatMap'
              ? this.getSelectionRangeForHeatMap(dragInfo)
              : this.getSelectionRange(dragInfo),
        };

        this.dragInfoBackup = defaultsDeep({}, dragInfo);

        if (typeof this.listeners['drag-select'] === 'function' && !this.options?.zoom?.use) {
          this.listeners['drag-select'](args);
        } else {
          const { xsp, range: chartRange, width: dragWidth } = dragInfo;
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

      if (prevUserSelect !== undefined) {
        this.dragStartTarget.style.userSelect = prevUserSelect;
      }

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
  drawSelectionArea(dragInfo) {
    // displayFromStartArea가 활성화된 경우, 전용 캔버스에 raw(미clamp) displayRect를 그린다.
    // 그 외에는 기존과 동일하게 overlayCanvas에 clamped rect를 그린다.
    const useDedicated = !!this.dragDisplayCanvas;
    const ctx = useDedicated ? this.dragDisplayCtx : this.overlayCtx;
    const { fillColor, opacity } = this.options.dragSelection;

    // 전용 캔버스는 차트 영역만 덮는 overlayCanvas와 원점이 다르다(startArea를 덮음).
    // 차트 좌표 → 전용 캔버스 좌표 변환 오프셋은 geometry가 바뀌는 시점(dragStart/render/resize)에
    // refreshDragDisplayCanvas에서 미리 측정·캐시한 값을 쓴다. 매 프레임 getBoundingClientRect를
    // 호출하지 않아 layout thrashing을 피한다.
    let offsetX = 0;
    let offsetY = 0;
    if (useDedicated) {
      this.dragDisplayClear();
      offsetX = this.dragDisplayOffset?.x ?? 0;
      offsetY = this.dragDisplayOffset?.y ?? 0;
    }

    const chartRect = this.chartRect;
    const labelOffset = this.labelOffset;
    const newRange = {
      x1: chartRect.x1 + labelOffset.left,
      x2: chartRect.x2 - labelOffset.right,
      y1: chartRect.y1 + labelOffset.top,
      y2: chartRect.y2 - labelOffset.bottom,
    };

    ctx.fillStyle = fillColor;
    ctx.globalAlpha = opacity;

    if (useDedicated && dragInfo.displayRect) {
      // raw displayRect는 chart 영역을 벗어나 startArea까지 뻗는 픽셀 꼬리를 포함한다.
      // resize(keepDisplay) 시 chart 영역 portion(clamped rect)만 chart-range 비율로 재스케일하고,
      // startArea로 뻗은 꼬리는 chart range와 무관하므로 픽셀 길이를 그대로 유지한다.
      // resize가 없으면(newRange === range) 아래 계산은 raw displayRect를 그대로 복원한다.
      const raw = dragInfo.displayRect;
      const { xsp, ysp, width, height, range } = dragInfo;

      let clampedXsp = xsp;
      let clampedYsp = ysp;
      let clampedWidth = width;
      let clampedHeight = height;
      if (!isEqual(newRange, range)) {
        const rectWidth = range.x2 - range.x1;
        const rectHeight = range.y2 - range.y1;
        const newRectWidth = newRange.x2 - newRange.x1;
        const newRectHeight = newRange.y2 - newRange.y1;

        clampedXsp = newRange.x1 + newRectWidth * ((xsp - range.x1) / rectWidth);
        clampedYsp = newRange.y1 + newRectHeight * ((ysp - range.y1) / rectHeight);
        clampedWidth = newRectWidth * (width / rectWidth);
        clampedHeight = newRectHeight * (height / rectHeight);
      }

      // clamped rect와 raw rect의 픽셀 차이(startArea로 뻗은 꼬리)를 재스케일된 clamped rect에 다시 더한다.
      const leftExt = xsp - raw.xsp;
      const topExt = ysp - raw.ysp;
      const rightExt = raw.xsp + raw.width - (xsp + width);
      const bottomExt = raw.ysp + raw.height - (ysp + height);

      ctx.fillRect(
        clampedXsp - leftExt + offsetX,
        clampedYsp - topExt + offsetY,
        clampedWidth + leftExt + rightExt,
        clampedHeight + topExt + bottomExt,
      );
    } else {
      const { xsp, ysp, width, height, range } = dragInfo;

      if (isEqual(newRange, range)) {
        ctx.fillRect(xsp + offsetX, ysp + offsetY, width, height);
      } else {
        const rectWidth = range.x2 - range.x1;
        const rectHeight = range.y2 - range.y1;
        const newRectWidth = newRange.x2 - newRange.x1;
        const newRectHeight = newRange.y2 - newRange.y1;

        const ratioX = (xsp - range.x1) / rectWidth;
        const ratioY = (ysp - range.y1) / rectHeight;
        const newXsp = newRange.x1 + newRectWidth * ratioX;
        const newYsp = newRange.y1 + newRectHeight * ratioY;

        const ratioWidth = width / rectWidth;
        const ratioHeight = height / rectHeight;
        const newWidth = newRectWidth * ratioWidth;
        const newHeight = newRectHeight * ratioHeight;

        ctx.fillRect(newXsp + offsetX, newYsp + offsetY, newWidth, newHeight);
      }
    }

    ctx.globalAlpha = 1;
  },

  /**
   * Create a dedicated drag-display canvas mounted on the startArea element.
   * Used only when dragSelection.displayFromStartArea is on (scatter, PC).
   *
   * @returns {undefined}
   */
  createDragDisplayCanvas() {
    const startAreaEl = this.dragStartTarget;
    if (!startAreaEl || startAreaEl === this.overlayCanvas) {
      return;
    }

    // 전용 캔버스의 절대배치/크기 기준이 startArea가 되도록, static이면 relative로 승격한다.
    // (chart destroy 시 원래 inline 값으로 복원)
    if (window.getComputedStyle(startAreaEl).position === 'static') {
      this.dragStartAreaPrevPosition = startAreaEl.style.position;
      startAreaEl.style.position = 'relative';
    }

    const canvas = document.createElement('canvas');
    canvas.className = 'ev-chart-drag-display-canvas';
    canvas.style.position = 'absolute';
    canvas.style.top = '0px';
    canvas.style.left = '0px';
    // overlayCanvas(z-index:2)보다 위에서 그려져 선택 영역이 차트 위에 보이도록 한다.
    canvas.style.zIndex = '3';
    // 그리기 전용 — startArea의 다른 인터랙션을 막지 않는다(mousedown은 startArea가 처리).
    canvas.style.pointerEvents = 'none';

    startAreaEl.appendChild(canvas);

    this.dragDisplayCanvas = canvas;
    this.dragDisplayCtx = canvas.getContext('2d');

    this.refreshDragDisplayCanvas();
  },

  /**
   * Resize the dedicated drag-display canvas to cover the current startArea bounds.
   * Called on creation and on chart render/resize.
   *
   * @returns {undefined}
   */
  refreshDragDisplayCanvas() {
    if (!this.dragDisplayCanvas || !this.dragStartTarget) {
      return;
    }

    const { width, height } = this.dragStartTarget.getBoundingClientRect();
    const cssWidth = Math.max(1, Math.round(width));
    const cssHeight = Math.max(1, Math.round(height));
    const deviceWidth = cssWidth * this.pixelRatio;
    const deviceHeight = cssHeight * this.pixelRatio;

    if (
      this.dragDisplayCanvas.width !== deviceWidth ||
      this.dragDisplayCanvas.height !== deviceHeight
    ) {
      this.dragDisplayCanvas.width = deviceWidth;
      this.dragDisplayCanvas.height = deviceHeight;
      this.dragDisplayCanvas.style.width = `${cssWidth}px`;
      this.dragDisplayCanvas.style.height = `${cssHeight}px`;
    }

    // canvas.width 변경은 transform을 초기화하므로 매번 재설정한다.
    this.dragDisplayCtx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
    this.dragDisplayClear();

    // 차트 좌표 → 전용 캔버스 좌표 오프셋을 여기서 한 번만 측정해 캐시한다.
    // 주의: 차트와 startArea 사이 조상에 CSS transform이 걸리거나 드래그 도중 startArea가
    // 차트에 대해 내부 스크롤되면 오프셋이 어긋날 수 있다(일반적 사용에선 발생하지 않음).
    const overlayRect = this.overlayCanvas.getBoundingClientRect();
    const canvasRect = this.dragDisplayCanvas.getBoundingClientRect();
    this.dragDisplayOffset = {
      x: overlayRect.left - canvasRect.left,
      y: overlayRect.top - canvasRect.top,
    };
  },

  /**
   * Clear the dedicated drag-display canvas.
   *
   * @returns {undefined}
   */
  dragDisplayClear() {
    if (!this.dragDisplayCtx || !this.dragDisplayCanvas) {
      return;
    }

    const ratio = this.pixelRatio < 1 ? this.pixelRatio : 1;
    this.dragDisplayCtx.clearRect(
      0,
      0,
      this.dragDisplayCanvas.width / ratio,
      this.dragDisplayCanvas.height / ratio,
    );
  },

  /** Remove drag selection area
   *
   */
  removeSelectionArea() {
    this.dragInfoBackup = null;
    this.overlayClear();
    if (this.dragDisplayCanvas) {
      this.dragDisplayClear();
    }
  },

  /**
   * Computing mouse position on canvas
   *
   * @returns {array} mouse pointer position
   */
  getMousePosition(evt) {
    const e = evt.originalEvent || evt;
    const rect = this.getOverlayClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top, rect.width, rect.height];
  },

  /**
   * 커서 위치(offset)가 들어가는 value-only plot 라벨 hit 영역을 찾는다. (#6 showTextOnHover)
   * @param {array} offset  getMousePosition() 결과 [x, y]
   *
   * @returns {object|null} 매칭된 라벨 hit 영역(text/style 포함) 또는 null
   */
  findPlotLabelHitRegion(offset) {
    const regions = this.plotLabelHitRegions;

    if (!regions?.length) {
      return null;
    }

    const [x, y] = offset;
    return (
      regions.find(
        (r) => x >= r.x && x <= r.x + r.width && y >= r.y && y <= r.y + r.height,
      ) ?? null
    );
  },

  /**
   * value-only plot 라벨 hover 시 text tooltip 을 표시/숨김한다. (#6 showTextOnHover)
   * 라벨 박스 위에선 라벨을 series tooltip 보다 우선하므로(onMouseMove 에서 series hit 을 비움),
   * 여기서는 미리 구한 hit 영역만 받아 표시/숨김을 처리한다. (데스크탑 전용 — onMouseMove 가
   * isMobile 에서 조기 반환)
   * @param {object|null} hit  findPlotLabelHitRegion() 결과
   * @param {MouseEvent} e     mousemove 이벤트
   *
   * @returns {undefined}
   */
  handlePlotLabelHover(hit, e) {
    if (hit) {
      this.showPlotLabelTooltip(hit, e.originalEvent || e);
    } else {
      this.hidePlotLabelTooltip?.();
    }
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
        curMouseTargetVal.labelVal =
          axes[0].type === 'time' ? dayjs(labelVal).format(axes[0].timeFormat) : labelVal;
        curMouseTargetVal.originVal = axes[0].type === 'time' ? dayjs(labelVal) : labelVal;
      };

      const setAxisLabelInfo = (targetAxis) => {
        const { labelIndex } = this.getLabelInfoByPosition(offset, location);
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
    if (this.options.dragSelection?.use && e.target !== this.overlayCanvas && this.isTouchOverlay) {
      this.isTouchOverlay = false;
      this.overlayClear();
    }
  },

  /**
   * Find graph item on mouse position
   * @param {number[]} offset    return value from getMousePosition()
   *
   * @returns {{
   *   items: Record<string, {
   *     data: any,
   *     hit: boolean,
   *     color: string,
   *     name: string,
   *     id: string,
   *     index: number,
   *     label: string | import('dayjs').Dayjs,
   *     axis: { x: number, y: number },
   *   }>,
   *   hitId: string | null,
   *   maxTip: [string, string],
   *   maxHighlight: [string, number] | null,
   * }} hit item information
   */
  findHitItem(offset, disableNullLabelSnap = false) {
    // realtime scatter blit 틱은 strip 밖 점들의 xp/yp 갱신을 건너뛴다 — hit-test 전에 지연 복구.
    this.ensureHitCoordsFresh?.();
    const sIds = Object.keys(this.seriesList);
    const items = {};
    const isHorizontal = !!this.options.horizontal;
    const ctx = this.tooltipCtx;

    const [cx, cy] = offset;
    let hitId = null;
    let maxs = '';
    let maxsw = 0;
    let maxv = '';
    let maxg = null;
    let maxSID = null;
    let minDistance = Infinity;
    // directHit 가 하나라도 있으면 일반 hit 는 hitId 후보에서 배제.
    let hasDirectHit = false;
    // hit 이 없을 때 거리 기반으로 선택할 fallback (기존 "첫 시리즈 고정" 대체).
    let fallbackId = null;
    let fallbackDistance = Infinity;

    // 1. 먼저 공통으로 사용할 데이터 인덱스 결정
    const targetDataIndex = this.findClosestDataIndex(offset, sIds, disableNullLabelSnap);

    if (targetDataIndex === -1 && !this.isNotUseIndicator()) {
      return { items, hitId, maxTip: [maxs, maxv], maxHighlight: null };
    }

    // 2. 모든 시리즈가 동일한 데이터 인덱스 사용
    const allSeriesIsBar = sIds.every((sId) => this.seriesList[sId].type === 'bar');

    for (let ix = 0; ix < sIds.length; ix++) {
      const sId = sIds[ix];
      const series = this.seriesList[sId];

      if (series.findGraphData && series.show) {
        // 특정 데이터 인덱스로 데이터 요청
        const item = series.findGraphData(offset, isHorizontal, targetDataIndex, !allSeriesIsBar);

        if (item?.data) {
          let gdata;

          if (item.data.o === null && series.interpolation !== 'zero') {
            if (!series.isExistGrp) {
              gdata = isHorizontal ? item.data.x : item.data.y;
            }
          } else if (!isNaN(item.data.o)) {
            gdata = item.data.o;
          }

          if (gdata !== null && gdata !== undefined) {
            const formattedSeriesName = this.getFormattedTooltipLabel({
              dataId: series.id,
              seriesId: sId,
              seriesName: series.name,
              itemData: item.data,
            });
            const sw = ctx ? ctx.measureText(formattedSeriesName).width : 1;

            item.id = series.id;
            item.name = formattedSeriesName;
            item.axis = { x: series.xAxisIndex, y: series.yAxisIndex };
            item.label = isHorizontal ? item.data?.y : item.data?.x;
            items[sId] = item;

            const formattedTxt = this.getFormattedTooltipValue({
              dataId: series.id,
              seriesId: sId,
              seriesName: formattedSeriesName,
              value: gdata,
              itemData: item.data,
            });

            item.data.formatted = formattedTxt;

            if (maxsw < sw) {
              maxs = formattedSeriesName;
              maxsw = sw;
            }

            if (maxv.length <= `${formattedTxt}`.length) {
              maxv = `${formattedTxt}`;
            }

            if (maxg === null || maxg <= gdata) {
              maxg = gdata;
              maxSID = sId;
            }

            // hit 기반 선택: directHit 최우선, 그 외 일반 hit 는 directHit 없을 때만.
            if (item.hit && item.data.xp !== undefined && item.data.yp !== undefined) {
              const distance = (item.data.xp - offset[0]) ** 2 + (item.data.yp - offset[1]) ** 2;

              if (item.directHit) {
                if (!hasDirectHit || distance < minDistance) {
                  minDistance = distance;
                  hitId = sId;
                }
                hasDirectHit = true;
              } else if (!hasDirectHit && distance < minDistance) {
                minDistance = distance;
                hitId = sId;
              }
            }

            // fallback 후보: 거리가 가장 가까운 시리즈. ② hitId 는 한 번 정해지면 풀리지 않으므로,
            // 이미 hit 이 잡힌 뒤에는 fallback 이 소비되지 않는다(아래 `if (hitId === null)` 에서만 사용).
            // 따라서 hitId 가 아직 없을 때만 calcBoxDistance 를 계산해 hover 당 중복 계산을 줄인다.
            // 참고: 이 블록은 outer `if (gdata !== null && gdata !== undefined)` 안에 있어서
            // 값이 null 인 시리즈는 items 수집 단계에서 이미 걸러진 상태. 별도 null 값 가드 불필요.
            if (
              hitId === null &&
              item.data.xp !== undefined &&
              item.data.yp !== undefined &&
              item.data.xp !== null &&
              item.data.yp !== null
            ) {
              const fbDistance = Util.calcBoxDistance(item.data, cx, cy);
              if (fbDistance < fallbackDistance) {
                fallbackDistance = fbDistance;
                fallbackId = sId;
              }
            }
          }
        }
      }
    }

    // hit 없으면 거리 기반 fallback, 그것도 없으면 items 첫 키(방어적 fallback).
    if (hitId === null) {
      hitId = fallbackId !== null ? fallbackId : Object.keys(items)[0];
    }
    const maxHighlight = maxg !== null ? [maxSID, maxg] : null;

    // all-null 라벨인 경우 synthetic items[''] 로 label/index 만 채워 전달.
    if (disableNullLabelSnap && Object.keys(items).length === 0 && targetDataIndex !== -1) {
      const refSeriesID = sIds.find((sId) => {
        const s = this.seriesList[sId];
        return s?.show && s?.data?.length > 0;
      });
      const refPoint = refSeriesID ? this.seriesList[refSeriesID].data?.[targetDataIndex] : null;
      if (refPoint) {
        items[''] = {
          id: '',
          name: '',
          label: isHorizontal ? refPoint.y : refPoint.x,
          index: targetDataIndex,
          axis: { x: 0, y: 0 },
          data: { o: undefined, x: refPoint.x, y: refPoint.y },
        };
        hitId = '';
      }
    }

    return { items, hitId, maxTip: [maxs, maxv], maxHighlight };
  },

  /**
   * 라벨 인덱스별 "유효(non-null) o 값을 가진 가시(show) 시리즈가 하나라도 있는가"를 사전 계산한다.
   *
   * findClosestDataIndex 가 hover 마다 라벨별로 sIds.some() 을 돌려 유효성을 검사하던 것
   * (O(라벨×시리즈) — hit test 의 dominant term)을, 이 mask 의 O(1) 조회로 대체하기 위한 것이다.
   * 빌드 자체는 O(라벨×시리즈)이지만 hover 가 아니라 createDataSet(데이터 변경·시리즈 show 토글)
   * 시점에 1회만 수행되므로 hover hot path 에서 곱셈항이 사라진다.
   *
   * 무효화: 데이터 변경·범례(show) 토글은 모두 update()→createDataSet() 를 재호출하며,
   * createDataSet 가 끝날 때 이 mask 를 다시 만든다(아래 model.store.createDataSet 참고).
   *
   * @param {array} [sIds] series IDs (기본: 전체 시리즈)
   * @returns {Uint8Array} mask[i] === 1 이면 라벨 i 에 유효 데이터를 가진 가시 시리즈가 존재
   */
  buildLabelValidMask(sIds) {
    const ids = sIds ?? Object.keys(this.seriesList);

    let maxLen = 0;
    for (let s = 0; s < ids.length; s++) {
      const series = this.seriesList[ids[s]];
      if (series?.show && series.data?.length > maxLen) {
        maxLen = series.data.length;
      }
    }

    const mask = new Uint8Array(maxLen);
    for (let s = 0; s < ids.length; s++) {
      const series = this.seriesList[ids[s]];
      if (series?.show && series.data) {
        const { data } = series;
        for (let i = 0; i < data.length; i++) {
          const o = data[i]?.o;
          if (o !== null && o !== undefined) {
            mask[i] = 1;
          }
        }
      }
    }

    this.labelValidMask = mask;
    return mask;
  },

  /**
   * Find the closest data index (label) based on mouse position
   * @param {array} offset mouse position
   * @param {array} sIds series IDs
   * @returns {number} closest data index
   */
  findClosestDataIndex(offset, sIds, disableNullLabelSnap = false) {
    const [xp, yp] = offset;
    const isHorizontal = !!this.options.horizontal;
    const mousePos = isHorizontal ? yp : xp;

    // 데이터 있는 시리즈를 기준으로 라벨 위치 확인
    const referenceSeries = sIds.find((sId) => {
      const series = this.seriesList[sId];
      return series?.show && series?.data?.length > 0;
    });
    if (!referenceSeries || !this.seriesList[referenceSeries]?.data) {
      return -1;
    }

    const referenceData = this.seriesList[referenceSeries].data;

    // 데이터 간격 계산 - 모든 데이터(null 포함)의 평균 간격 사용
    let avgInterval = 50;
    if (referenceData.length > 1) {
      const intervals = [];
      for (let i = 1; i < referenceData.length; i++) {
        const prevPoint = referenceData[i - 1];
        const currPoint = referenceData[i];
        if (prevPoint && currPoint) {
          let prevPos;
          let currPos;

          if (isHorizontal) {
            prevPos = prevPoint.h ? prevPoint.yp + prevPoint.h / 2 : prevPoint.yp;
            currPos = currPoint.h ? currPoint.yp + currPoint.h / 2 : currPoint.yp;
          } else {
            prevPos = prevPoint.w ? prevPoint.xp + prevPoint.w / 2 : prevPoint.xp;
            currPos = currPoint.w ? currPoint.xp + currPoint.w / 2 : currPoint.xp;
          }

          if (prevPos !== null && currPos !== null) {
            intervals.push(Math.abs(currPos - prevPos));
          }
        }
      }
      if (intervals.length > 0) {
        avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      }
    }

    let closestDistance = Infinity;
    let closestIndex = -1;

    // ③ per-label 유효성 검사: 매 hover sIds.some()(O(라벨×시리즈)) 대신 사전계산 mask 를 O(1) 조회한다.
    // 정상 경로에서는 createDataSet 가 mask 를 만들어두지만, createDataSet 를 거치지 않는 경로
    // (예: 단위 테스트)에서도 동일 결과를 내도록 mask 가 없거나 길이가 모자라면 여기서 1회 build & cache.
    let mask = this.labelValidMask;
    if (!disableNullLabelSnap && (!mask || mask.length < referenceData.length)) {
      mask = this.buildLabelValidMask(sIds);
    }

    // 각 라벨에서 가장 가까운 것 찾기 (disableNullLabelSnap=true 면 all-null 라벨도 후보)
    for (let i = 0; i < referenceData.length; i++) {
      const hasValidData = disableNullLabelSnap || mask[i] === 1;

      if (hasValidData) {
        const point = referenceData[i];
        if (point) {
          // 라벨 위치 계산
          let labelPos;
          if (isHorizontal) {
            labelPos = point.h ? point.yp + point.h / 2 : point.yp;
          } else {
            labelPos = point.w ? point.xp + point.w / 2 : point.xp;
          }

          if (labelPos !== null) {
            const distance = Math.abs(mousePos - labelPos);
            if (distance < closestDistance) {
              closestDistance = distance;
              closestIndex = i;
            }
          }
        }
      }
    }

    if (closestIndex === -1) {
      return -1;
    }

    // 최소 hover snap 반경 (px)
    // - 데이터 밀도가 높을 때 avgInterval이 1px 이하로 감소하는 문제 보정
    // - 마우스 포인터의 실제 조작 정밀도(≈1px 이하)보다 충분히 넓은 범위를 확보하여 안정적인 hover 보장
    // - 주요 차트 라이브러리 기준: tooltip.snap 기본값 10px (touch 25px)
    // → 6px은 과도하게 넓지 않으면서도 안정적인 선택이 가능한 절충값
    const MIN_SNAP_THRESHOLD_PX = 6;
    const snapThreshold = Math.max(avgInterval, MIN_SNAP_THRESHOLD_PX);

    if (closestDistance >= snapThreshold) {
      const useLinearInterpolation = sIds.some((sId) => {
        const series = this.seriesList[sId];

        if (series?.show) {
          const passingValue = series.passingValue;
          const interpolation = series.interpolation;
          const hasPassingValueInData = series.hasPassingValueInData;

          return (
            interpolation === 'linear' ||
            (interpolation === 'none' && !!passingValue && hasPassingValueInData)
          );
        }

        return false;
      });
      return useLinearInterpolation ? closestIndex : -1;
    }

    return closestIndex;
  },

  /**
   * get formatted label for tooltip
   * @param dataId
   * @param seriesId
   * @param seriesName
   * @param itemData
   * @returns {string}
   */
  getFormattedTooltipLabel({ dataId, seriesId, seriesName, itemData }) {
    const opt = this.options;
    const tooltipOpt = opt.tooltip;
    const tooltipLabelFormatter = tooltipOpt?.formatter?.label;

    let formattedLabel = seriesName;
    if (tooltipLabelFormatter) {
      formattedLabel = tooltipLabelFormatter({
        dataId,
        seriesId,
        seriesName,
        itemData,
      });
    }

    return formattedLabel;
  },

  /**
   * get formatted value for tooltip
   * @param dataId
   * @param seriesId
   * @param seriesName
   * @param value
   * @param itemData
   * @returns {string}
   */
  getFormattedTooltipValue({ dataId, seriesId, seriesName, value, itemData }) {
    const opt = this.options;
    const isHorizontal = !!opt.horizontal;
    const tooltipOpt = opt.tooltip;
    const tooltipValueFormatter =
      typeof tooltipOpt?.formatter === 'function'
        ? tooltipOpt?.formatter
        : tooltipOpt?.formatter?.value;

    // 동일 itemData 객체에 대한 포맷 결과를 캐시한다.
    // 주의: point 객체는 풀링되어 데이터 갱신 시 같은 객체가 in-place 로 덮어써진다
    // (model.store addData 의 target 재사용) — WeakMap 자동 GC 로는 무효화되지 않으므로
    // chart.core update() 가 updateData/updateSeries 시 캐시 전체를 명시적으로 비운다.
    // 같은 mousemove 윈도우 안에서 hover 중 큰 비용(고객 value formatter; big.js 등)을 1회만 부담.
    const useCache =
      itemData !== null && typeof itemData === 'object' && tooltipValueFormatter;
    if (useCache) {
      if (!this._tooltipValueCache) {
        this._tooltipValueCache = new WeakMap();
      }
      const bucket = this._tooltipValueCache.get(itemData);
      if (bucket !== undefined) {
        const cached = bucket[seriesId];
        if (cached !== undefined) {
          return cached;
        }
      }
    }

    let formattedTxt = value;
    if (tooltipValueFormatter) {
      if (opt.type === 'pie') {
        formattedTxt = tooltipValueFormatter({
          value,
          name: seriesName,
          percentage: itemData?.percentage,
          seriesId,
          dataId,
        });
      } else if (opt.type === 'heatMap') {
        formattedTxt = tooltipValueFormatter({
          x: itemData?.x,
          y: itemData?.y,
          value: value > -1 ? value : 'error',
          seriesId,
          dataId,
        });
      } else {
        formattedTxt = tooltipValueFormatter({
          x: isHorizontal ? value : itemData?.x,
          y: isHorizontal ? itemData?.y : value,
          o: itemData?.o,
          name: seriesName,
          seriesId,
          dataId,
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

    if (useCache) {
      let bucket = this._tooltipValueCache.get(itemData);
      if (!bucket) {
        bucket = Object.create(null);
        this._tooltipValueCache.set(itemData, bucket);
      }
      bucket[seriesId] = formattedTxt;
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
      ? hitInfo.items?.[hitItemId]?.data?.y
      : hitInfo.items?.[hitItemId]?.data?.x;
    let maxSeriesName = '';
    let maxValueTxt = '';

    const sIds = Object.keys(this.seriesList);
    for (let ix = 0; ix < sIds.length; ix++) {
      const sId = sIds[ix];
      const series = this.seriesList[sId];

      if (series?.show) {
        const hasData = series.data.find((data) =>
          isHorizontal ? data?.y === hitItemData : data?.x === hitItemData,
        );

        const formattedSeriesName = this.getFormattedTooltipLabel({
          dataId: series.id,
          seriesId: sId,
          seriesName: series.name,
          itemData: hasData,
        });

        const formattedValue = this.getFormattedTooltipValue({
          dataId: series.id,
          seriesId: sId,
          seriesName: formattedSeriesName,
          value: hasData?.o,
          itemData: hasData,
        });

        // Only add data if there's a valid value for this exact label
        if (hasData && hasData.o !== null && hasData.o !== undefined && !hitInfo.items[sId]) {
          const item = {};
          item.color = series.color;
          item.hit = false;
          item.name = formattedSeriesName;
          item.axis = { x: series.xAxisIndex, y: series.yAxisIndex };
          item.index = isHorizontal ? series.yAxisIndex : series.xAxisIndex;
          item.data = hasData;
          item.data.formatted = formattedValue;

          hitInfo.items[sId] = item;
        }

        const maxSeriesNameWidth = ctx ? ctx.measureText(maxSeriesName).width : 1;
        const seriesNameWidth = ctx ? ctx.measureText(formattedSeriesName).width : 1;
        if (maxSeriesNameWidth < seriesNameWidth) {
          maxSeriesName = formattedSeriesName;
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
   * @param seriesIdList {number[]}
   * @returns {boolean}
   */
  selectSeriesByData(seriesIdList) {
    // 차트 그룹에서 비선택 차트의 selectedSeries 가 빈 배열로 반복 리셋(재할당)되며 deep watch 가
    // 매 인터랙션마다 selectSeriesByData([]) 를 호출하는 스팸을 차단한다. 단 비교 기준은
    // defaultSelectInfo.seriesId 가 아니라 '마지막으로 render 한 선택(_renderedSelectSeriesIds)' 이다 —
    // onClick(setSelectedSeriesInfo)이 클릭 즉시 defaultSelectInfo.seriesId 를 선반영하므로, 그 값을
    // 기준으로 비교하면 클릭한 차트는 항상 동일로 판정돼 선택/해제 render 가 스킵된다(하이라이트 누락).
    const next = seriesIdList ?? [];
    const rendered = this._renderedSelectSeriesIds;
    if (rendered && rendered.length === next.length && rendered.every((v, i) => v === next[i])) {
      return;
    }
    this.defaultSelectInfo.seriesId = seriesIdList;
    this._renderedSelectSeriesIds = [...next];
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

        result.label = result.dataIndex.map((i) => this.data.labels[i]);

        const dataEntries = Object.entries(this.data.data);
        result.data = result.dataIndex.map((labelIdx) =>
          Object.fromEntries(dataEntries.map(([sId, data]) => [sId, data[labelIdx]])),
        );
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

        result.label = result.dataIndex.map((i) => this.data.labels[targetAxisDirection][i]);

        const dataValues = Object.values(this.data.data)[0];
        result.data = dataValues.filter(({ x, y }) =>
          result.label.includes(targetAxisDirection === 'y' ? y : x),
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
    const before =
      targetAxis === null || this.defaultSelectInfo?.targetAxis === targetAxis
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
   * @param keepSelection {boolean}
   * @returns after {number[]}  '[0, 1 ...]' result series Id List
   */
  updateSelectedSeriesInfo(seriesId, keepSelection) {
    const option = this.options?.selectSeries ?? {};
    const before = this.defaultSelectInfo ?? { seriesId: [] };

    if (typeof before.seriesId === 'string') {
      before.seriesId = [before.seriesId];
    }

    const after = cloneDeep(before);

    if (before.seriesId.includes(seriesId)) {
      if (!keepSelection) {
        const idx = before.seriesId.indexOf(seriesId);
        after.seriesId.splice(idx, 1);
      }
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
   * Draw indicator at the label position when tooltip is displayed
   * @param {object} hitInfo hit item information from findHitItem
   * @param {string} color indicator color
   * @returns {object|null} indicator position info with actual label value
   */
  drawIndicatorForTooltip(hitInfo, color) {
    if (!hitInfo?.items || !Object.keys(hitInfo.items).length) {
      return null;
    }

    const ctx = this.overlayCtx;
    const { horizontal } = this.options;
    const graphPos = {
      x1: this.chartRect.x1 + this.labelOffset.left,
      x2: this.chartRect.x2 - this.labelOffset.right,
      y1: this.chartRect.y1 + this.labelOffset.top,
      y2: this.chartRect.y2 - this.labelOffset.bottom,
    };

    // 첫 번째 시리즈의 데이터를 기준으로 라벨 위치 계산
    const firstSeriesId = Object.keys(hitInfo.items)[0];
    const firstItem = hitInfo.items[firstSeriesId];

    if (!firstItem?.data) {
      return null;
    }

    // 실제 indicator가 위치하는 라벨 값 추출
    const actualLabelValue = horizontal ? firstItem.data.y : firstItem.data.x;

    let indicatorPosition;

    if (horizontal) {
      // 수평 차트에서는 Y축 라벨 위치에 수평선
      const yPosition = firstItem.data.yp + (firstItem.data.h ? firstItem.data.h / 2 : 0);
      indicatorPosition = [graphPos.x1, yPosition];
    } else {
      // 수직 차트에서는 X축 라벨 위치에 수직선
      const xPosition = firstItem.data.xp + (firstItem.data.w ? firstItem.data.w / 2 : 0);
      indicatorPosition = [xPosition, graphPos.y1];
    }

    ctx.beginPath();
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;

    if (this.options.indicator?.segments) {
      ctx.setLineDash(this.options.indicator.segments);
    }

    if (horizontal) {
      ctx.moveTo(graphPos.x1, indicatorPosition[1] + 0.5);
      ctx.lineTo(graphPos.x2, indicatorPosition[1] + 0.5);
    } else {
      ctx.moveTo(indicatorPosition[0] + 0.5, graphPos.y1);
      ctx.lineTo(indicatorPosition[0] + 0.5, graphPos.y2);
    }

    ctx.stroke();
    ctx.restore();
    ctx.closePath();

    // 실제 indicator가 위치한 라벨 정보 반환
    return {
      labelValue: actualLabelValue,
      position: indicatorPosition,
    };
  },

  /**
   * Find items by series within a range
   * @param {object} range  object for find series items
   *
   * @returns {object}
   */
  findSelectedItems(range) {
    // realtime scatter blit 틱 이후의 스테일 xp/yp 를 drag select 전에 지연 복구.
    this.ensureHitCoordsFresh?.();
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

    const xMin =
      this.isMobile && this.boxOverflow?.x1
        ? Math.min(this.minMax.x[0].min, dataRangeX.graphMin)
        : Math.max(dataRangeX.graphMin + graphWidth * xMinRatio, dataRangeX.graphMin);
    const xMax =
      this.isMobile && this.boxOverflow?.x2
        ? Math.max(this.minMax.x[0].max, dataRangeX.graphMax)
        : Math.min(dataRangeX.graphMin + graphWidth * xMaxRatio, dataRangeX.graphMax);
    const yMin =
      this.isMobile && this.boxOverflow?.y2
        ? Math.min(this.minMax.y[0].min, dataRangeY.graphMin)
        : Math.max(dataRangeY.graphMin + graphHeight * (1 - yMinRatio), dataRangeY.graphMin);
    const yMax =
      this.isMobile && this.boxOverflow?.y1
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
    return (
      this.options.selectItem.useDeselectItem &&
      hitInfo?.dataIndex === this.defaultSelectItemInfo?.dataIndex &&
      hitInfo?.sId === this.defaultSelectItemInfo?.seriesID &&
      !isNaN(hitInfo?.dataIndex)
    );
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
      inRange(offsetX, this.chartRect.x1, aPos.x1) &&
      inRange(offsetY, yAxisStartPoint, yAxisEndPoint)
    ) {
      return 'yAxis';
    } else if (
      inRange(offsetX, xAxisStartPoint, xAxisEndPoint) &&
      inRange(offsetY, aPos.y2, this.chartRect.y2)
    ) {
      return 'xAxis';
    } else if (inRange(offsetX, aPos.x1, aPos.x2) && inRange(offsetY, aPos.y1, aPos.y2)) {
      return 'chartBackground';
    }

    return 'canvas';
  },

  isNotUseIndicator() {
    return (
      this.options.type === 'pie' ||
      this.options.type === 'scatter' ||
      this.options.type === 'heatMap'
    );
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
