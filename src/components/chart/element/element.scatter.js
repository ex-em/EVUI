import { merge } from 'lodash-es';
import { COLOR, LINE_OPTION } from '../helpers/helpers.constant';
import Util from '../helpers/helpers.util';
import Canvas from '../helpers/helpers.canvas';

class Scatter {
  constructor(sId, opt, sIdx, realTimeScatter = false) {
    const merged = merge({}, LINE_OPTION, opt);
    Object.keys(merged).forEach((key) => {
      this[key] = merged[key];
    });

    if (this.name === undefined) {
      this.name = `series-${sIdx}`;
    }

    ['color', 'pointFill', 'fillColor', 'overflowColor'].forEach((colorProp) => {
      if (this[colorProp] === undefined) {
        this[colorProp] = COLOR[sIdx % COLOR.length];
      }
    });

    this.sId = sId;
    this.data = [];
    this.type = 'scatter';
    this.realTimeScatter = realTimeScatter;
    this._rtTotalCount = 0;

    this._colorCache = new Map();
  }

  /**
   * Get cached color with opacity
   * colorStringToRgba cache the result of colorStringToRgba to avoid repeated calculations.
   * @param {string} colorStr - Color string
   * @param {number} opacity - Opacity value
   * @returns {string} rgba string
   */
  getCachedColor(colorStr, opacity) {
    const cacheKey = `${colorStr}_${opacity}`;

    if (this._colorCache.has(cacheKey)) {
      return this._colorCache.get(cacheKey);
    }

    const result = Util.colorStringToRgba(colorStr, opacity);

    if (this._colorCache.size > 100) {
      const firstKey = this._colorCache.keys().next().value;
      this._colorCache.delete(firstKey);
    }

    this._colorCache.set(cacheKey, result);
    return result;
  }

  /**
   * Draw series data
   * @param {object} param     object for drawing series data
   *
   * @returns {undefined}
   */
  draw(param) {
    if (!this.show) {
      return;
    }

    // 기하(xp/yp)는 기하 패스(computeGeometry)가 채운다. 아래 래스터 패스는 그 값을 읽기만 한다.
    this.computeGeometry(param);

    if (this.realTimeScatter) {
      this.realTimeScatterDraw(param);
    } else {
      this.defaultScatterDraw(param);
    }
  }

  /**
   * Compute pixel geometry (xp/yp) for drawable points and store it on the main model.
   * draw와 동일한 dedupe/legend 필터로 그려질 점만 calcItem 한다(기존 동작과 동일).
   * 래스터 패스(draw)는 calcItem을 호출하지 않고 여기서 채운 xp/yp를 읽는다.
   * @param {object} param
   * @returns {undefined}
   */
  computeGeometry(param) {
    if (!this.show) {
      return;
    }

    if (this.realTimeScatter) {
      this.computeRealTimeGeometry(param);
    } else {
      this.computeDefaultGeometry(param);
    }
  }

  computeDefaultGeometry(param) {
    const { duple, legendHitInfo, coordinateDedupe } = param;
    const drawnKeys = new Set();
    const isDedupeOn = coordinateDedupe !== false;

    for (let i = 0; i < this.data.length; i++) {
      const item = this.data[i];
      const key = Util.coordinateKey(item.x, item.y);
      let shouldDraw;
      if (legendHitInfo) {
        shouldDraw = legendHitInfo.sId === this.sId;
      } else if (isDedupeOn) {
        shouldDraw = duple.get(key) === this.sId && !drawnKeys.has(key);
      } else {
        shouldDraw = true;
      }

      if (shouldDraw) {
        this.calcItem(item, param);

        if (item.xp !== null && item.yp !== null) {
          if (isDedupeOn && !legendHitInfo) drawnKeys.add(key);
        }
      }
    }
  }

  computeRealTimeGeometry(param) {
    const { duple, legendHitInfo, coordinateDedupe } = param;
    const isDedupeOnRT = coordinateDedupe !== false;
    let totalCount = 0;

    for (let i = 0; i < this.data[this.sId]?.dataGroup?.length; i++) {
      for (let j = 0; j < this.data[this.sId]?.dataGroup[i]?.data.length; j++) {
        const item = this.data[this.sId]?.dataGroup[i]?.data[j];
        totalCount++;

        let shouldDraw;
        if (legendHitInfo) {
          shouldDraw = legendHitInfo.sId === this.sId;
        } else if (isDedupeOnRT) {
          shouldDraw = duple.get(Util.coordinateKey(item.x, item.y)) === this.sId;
        } else {
          shouldDraw = true;
        }

        if (shouldDraw) {
          this.calcItem(item, param);
        }
      }
    }

    this._rtTotalCount = totalCount;
  }

  /**
   * Calculate opacity for a data item in the series.
   * @param {object} param - The parameter object passed to the draw function.
   * @param {string} colorStr - The color string of the item.
   * @param {number} dataIndex - The index of the item in the data array.
   *
   * @returns {number} - The calculated opacity level for the item.
   */
  getOpacity(param, colorStr, dataIndex) {
    const noneDownplayOpacity = colorStr.includes('rgba') ? Util.getOpacity(colorStr) : 1;
    let isDownplay = false;

    const { selectInfo, legendHitInfo, unSelectedOpacity } = param;
    if (legendHitInfo) {
      isDownplay = legendHitInfo.sId !== this.sId;
    } else if (selectInfo) {
      isDownplay = selectInfo?.seriesID !== this.sId || selectInfo?.dataIndex !== dataIndex;
    }
    return isDownplay ? unSelectedOpacity : noneDownplayOpacity;
  }

  /**
   * Calculate x and y coordinates for a data item in the series.
   * @param {object} item - The data item for which coordinates are to be calculated.
   * @param {object} param - The parameter object passed to the draw function.
   *
   * @returns {undefined}
   */
  calcItem(item, param) {
    const { chartRect, labelOffset, axesSteps, displayOverflow } = param;

    const minmaxX = axesSteps.x[this.xAxisIndex];
    const minmaxY = axesSteps.y[this.yAxisIndex];

    const xArea = chartRect.chartWidth - (labelOffset.left + labelOffset.right);
    const yArea = chartRect.chartHeight - (labelOffset.top + labelOffset.bottom);
    // realtime scatter blit: full redraw 가 blit 시프트(정수 CSS px)와 ceil 양자화를 일치시키도록
    // startPoint 에 sub-pixel carry(rtXOffsetCss, [-0.5,0.5])를 더한다. blit 라스터에 베이크된 위상과
    // 동일 위상으로 점을 찍어, full 전환(legend hover 등) 시 점이 한 점도 안 움직인다(chart.blit.js).
    const rtXOffset = this.realTimeScatter ? (param.rtXOffsetCss ?? 0) : 0;
    const xsp = chartRect.x1 + labelOffset.left + rtXOffset;
    const ysp = chartRect.y2 - labelOffset.bottom;

    let x = Canvas.calculateX(item.x, minmaxX.graphMin, minmaxX.graphMax, xArea, xsp);
    const y = Canvas.calculateY(
      displayOverflow && item.y > minmaxY.graphMax ? minmaxY.graphMax : item.y,
      minmaxY.graphMin,
      minmaxY.graphMax,
      yArea,
      ysp,
    );

    // realtime scatter 는 aliasPixel(정수 x 의 홀/짝에 따라 +0.5)을 적용하지 않는다 — 패리티가
    // 시프트(Σg 누적)로 바뀌어 시프트된 옛 점(생성시 패리티)과 fresh full-draw(현재 패리티)가
    // 1px 어긋난다. aliasPixel 을 빼면 device x = pr·ceil(...) 로 시프트 불변이 되어 blit≡full.
    if (x !== null && !this.realTimeScatter) {
      x += Util.aliasPixel(x);
    }

    item.xp = x;
    item.yp = y;
  }

  /**
   * Draw default scatter chart
   * @param {object} param - The parameter object passed to the draw function.
   *
   * @returns {undefined}
   */
  defaultScatterDraw(param) {
    const { ctx, axesSteps, duple, legendHitInfo, coordinateDedupe } = param;
    const minmaxY = axesSteps.y[this.yAxisIndex];

    // 비-realtime 경로는 push 시점 dedupe가 없어 시리즈 내부 (x,y) overdraw로 두께가 흔들린다.
    // realtime은 createRealTimeScatterDataSet 적재 단계에서 dedupe 처리.
    const drawnKeys = new Set();
    const isDedupeOn = coordinateDedupe !== false;
    // dedupe on이면 좌표 비겹침이 보장돼 색(stroke+fill)별 배치 렌더가 가능하다.
    // legendHitInfo/dedupe off는 같은 좌표 중복 가능성이 있어(반투명 겹침 차이) per-point 유지.
    const canBatch = isDedupeOn && !legendHitInfo;
    const groups = canBatch ? new Map() : null;

    // Adjusted because Real Time Scatter is drawn from the back.
    for (let i = 0; i < this.data.length; i++) {
      const item = this.data[i];
      const idx = i;
      const key = Util.coordinateKey(item.x, item.y);
      let shouldDraw;
      if (legendHitInfo) {
        shouldDraw = legendHitInfo.sId === this.sId;
      } else if (isDedupeOn) {
        shouldDraw = duple.get(key) === this.sId && !drawnKeys.has(key);
      } else {
        shouldDraw = true;
      }

      if (shouldDraw) {
        // 기하(xp/yp)는 computeGeometry가 채운다. 여기서는 읽기만 한다.
        if (item.xp !== null && item.yp !== null) {
          const overflowColor = item.y > minmaxY.graphMax && this.overflowColor;
          const color = overflowColor || item.dataColor || this.color;
          const strokeOpacity = this.getOpacity(param, color, idx);
          const strokeStyle = this.getCachedColor(color, strokeOpacity);

          const pointFillColor = item.dataColor || this.pointFill;
          const fillOpacity = this.getOpacity(param, pointFillColor, idx);
          const fillStyle = this.getCachedColor(pointFillColor, fillOpacity);

          if (canBatch) {
            const colorKey = `${strokeStyle} ${fillStyle}`;
            let group = groups.get(colorKey);
            if (!group) {
              group = { strokeStyle, fillStyle, points: [] };
              groups.set(colorKey, group);
            }
            group.points.push(item);
            drawnKeys.add(key);
          } else {
            ctx.strokeStyle = strokeStyle;
            ctx.fillStyle = fillStyle;
            Canvas.drawPoint(ctx, this.pointStyle, this.pointSize, item.xp, item.yp);
          }
        }
      }
    }

    if (canBatch) {
      groups.forEach((group) => {
        ctx.strokeStyle = group.strokeStyle;
        ctx.fillStyle = group.fillStyle;
        Canvas.drawPointBatch(ctx, this.pointStyle, this.pointSize, group.points);
      });
    }
  }

  /**
   * Draw real time scatter chart
   * @param {object} param - The parameter object passed to the draw function.
   *
   * @returns {undefined}
   */
  realTimeScatterDraw(param) {
    const { ctx, axesSteps, duple, legendHitInfo, coordinateDedupe } = param;
    const minmaxY = axesSteps.y[this.yAxisIndex];
    const pointStyle =
      typeof this.pointStyle === 'string' ? this.pointStyle : this.pointStyle.value;
    const pointSize = typeof this.pointSize === 'number' ? this.pointSize : this.pointSize.value;
    let totalCount = 0;

    const isDedupeOnRT = coordinateDedupe !== false;
    // dedupe on이면 좌표 비겹침이 보장돼 색별 배치 렌더 가능. 그 외는 per-point 유지(반투명 겹침 차이 회피).
    const canBatch = isDedupeOnRT && !legendHitInfo;
    const groups = canBatch ? new Map() : null;

    for (let i = 0; i < this.data[this.sId]?.dataGroup?.length; i++) {
      for (let j = 0; j < this.data[this.sId]?.dataGroup[i]?.data.length; j++) {
        const item = this.data[this.sId]?.dataGroup[i]?.data[j];
        totalCount++;

        let shouldDraw;
        if (legendHitInfo) {
          shouldDraw = legendHitInfo.sId === this.sId;
        } else if (isDedupeOnRT) {
          // item.k 는 push 단계에서 캐시한 좌표 키. 렌더마다 재생성하지 않는다(없으면 폴백).
          shouldDraw = duple.get(item.k ?? Util.coordinateKey(item.x, item.y)) === this.sId;
        } else {
          shouldDraw = true;
        }

        if (shouldDraw) {
          // 기하(xp/yp)는 computeGeometry가 채운다. 여기서는 읽기만 한다.
          if (item.xp !== null && item.yp !== null) {
            const overflowColor = item.y > minmaxY.graphMax && this.overflowColor;
            const baseStrokeColor = overflowColor || item.color || this.color;
            const baseFillColor = overflowColor || item.color || this.pointFill || this.color;

            const strokeOpacity = this.getOpacity(param, baseStrokeColor, j);
            const fillOpacity = this.getOpacity(param, baseFillColor, j);

            const strokeStyle = this.getCachedColor(baseStrokeColor, strokeOpacity);
            const fillStyle = this.getCachedColor(baseFillColor, fillOpacity);

            if (canBatch) {
              const colorKey = `${strokeStyle} ${fillStyle}`;
              let group = groups.get(colorKey);
              if (!group) {
                group = { strokeStyle, fillStyle, points: [] };
                groups.set(colorKey, group);
              }
              group.points.push(item);
            } else {
              ctx.strokeStyle = strokeStyle;
              ctx.fillStyle = fillStyle;
              Canvas.drawPoint(ctx, pointStyle, pointSize, item.xp, item.yp);
            }
            // blit 점 레이어 baseline 을 그리는 경우(rebuildPointsLayer)에만 raster 표식을 남긴다.
            // 이후 strip 은 drawn=true 인 점을 건너뛰어 점당 1회 합성을 유지한다(반투명 알파 누적 차단).
            // buffer 직접 그리기(drawSeriesLayer/legend hover)는 markDrawn 없이 호출돼 레이어 상태를
            // 오염시키지 않는다 — 그 경로는 점 레이어가 아니라 buffer 에 그리기 때문이다.
            if (param.markDrawn) {
              item.drawn = true;
            }
          }
        }
      }
    }

    if (canBatch) {
      groups.forEach((group) => {
        ctx.strokeStyle = group.strokeStyle;
        ctx.fillStyle = group.fillStyle;
        Canvas.drawPointBatch(ctx, pointStyle, pointSize, group.points);
      });
    }

    // findGraphData(realTimeScatter)에서 역순 탐색 시 global index 계산에 사용한다.
    // draw 단계에서 이미 전체 순회를 하기 때문에 여기서 캐시하면 mousemove마다 카운트용 1패스를 줄일 수 있다.
    this._rtTotalCount = totalCount;
  }

  /**
   * blit fast-path 전용: 지정한 dataGroup 버킷의 점만 그린다.
   * multi-series 면 param.duple(strip-local owner 맵)로 cross-series dedupe 를 적용해 full redraw 와
   * 픽셀이 일치한다(같은 좌표는 owner series 만 그림). 단일 series(duple 없음/coordinateDedupe=false)면
   * 전부 그린다. 좌표/색/마커 계산은 realTimeScatterDraw 와 동일한 calcItem + drawPoint 경로를 쓴다.
   * 호출자(chart.core fast-path)가 ctx 변환을 scale(pixelRatio)로 맞춰 둔 상태여야 한다.
   * @param {CanvasRenderingContext2D} ctx          점 레이어 컨텍스트(scale(pr) 적용 상태)
   * @param {number[]} bucketIdxList                그릴 dataGroup 버킷 인덱스 목록(링 인덱스)
   * @param {object} param                          calcItem/색 계산 + duple/coordinateDedupe(owner 판정용)
   * @returns {undefined}
   */
  realTimeScatterDrawStrip(ctx, bucketIdxList, param) {
    if (!this.show) {
      return;
    }
    const dataGroup = this.data[this.sId]?.dataGroup;
    if (!dataGroup) {
      return;
    }

    const { duple, coordinateDedupe } = param;
    // multi-series: owner 가 아닌 좌표는 skip(drawSeries 의 dedupe 와 동일). 단일이면 duple 없음 → 전부 그림.
    const isDedupeOn = coordinateDedupe !== false && !!duple;

    const minmaxY = param.axesSteps.y[this.yAxisIndex];
    const pointStyle =
      typeof this.pointStyle === 'string' ? this.pointStyle : this.pointStyle.value;
    const pointSize = typeof this.pointSize === 'number' ? this.pointSize : this.pointSize.value;

    for (let b = 0; b < bucketIdxList.length; b++) {
      const group = dataGroup[bucketIdxList[b]];
      if (!group?.data) {
        // eslint-disable-next-line no-continue
        continue;
      }
      for (let j = 0; j < group.data.length; j++) {
        const item = group.data[j];

        // 이미 레이어에 raster 된 점은 무손실 시프트로 정위치에 살아 있다 — 다시 그리면 source-over 가
        // 반투명에서 멱등이 아니라 알파를 누적(α→2α-α²)시켜 full(점당 1회)보다 진해진다. "점당 정확히
        // 1회 raster" 불변식을 지키려 한 번이라도 그려진 점은 건너뛴다(calcItem 도 생략 — 좌표는
        // hit-test 진입 시 ensureHitCoordsFresh 가 일괄 갱신). 아직 안 그려진 점(신규/지연)만 strip 이
        // 그린다. drawn 은 실제 raster 시점에만 set 되므로, x>graphMax 로 미뤄졌던 deferred 점도
        // 윈도우에 들어와 처음 그려지는 틱에 정확히 한 번 raster 된다(누락 없음).
        if (item.drawn) {
          // eslint-disable-next-line no-continue
          continue;
        }

        if (isDedupeOn && duple.get(item.k ?? Util.coordinateKey(item.x, item.y)) !== this.sId) {
          // 이 좌표의 owner 가 아니면 그리지 않는다(cross-series overdraw 방지).
          // eslint-disable-next-line no-continue
          continue;
        }

        this.calcItem(item, param);

        if (item.xp !== null && item.yp !== null) {
          const overflowColor = item.y > minmaxY.graphMax && this.overflowColor;
          const baseStrokeColor = overflowColor || item.color || this.color;
          const baseFillColor = overflowColor || item.color || this.pointFill || this.color;

          const strokeOpacity = this.getOpacity(param, baseStrokeColor, j);
          const fillOpacity = this.getOpacity(param, baseFillColor, j);

          ctx.strokeStyle = this.getCachedColor(baseStrokeColor, strokeOpacity);
          ctx.fillStyle = this.getCachedColor(baseFillColor, fillOpacity);

          Canvas.drawPoint(ctx, pointStyle, pointSize, item.xp, item.yp);
          item.drawn = true; // 이제 이 점은 레이어에 있다 — 이후 틱은 시프트로만 이동(재그림 금지)
        }
      }
    }
  }

  /**
   * blit 틱으로 스테일해진 hit-test 좌표(item.xp/yp)를 현재 축 매핑으로 일괄 재계산한다.
   * raster 는 하지 않는다 — calcItem 의 좌표 부수효과만 사용(tooltip/dragSelect/highlight 용).
   * @param {object} param   { chartRect, labelOffset, axesSteps, displayOverflow }
   * @returns {undefined}
   */
  refreshRtHitCoords(param) {
    const dataGroup = this.data[this.sId]?.dataGroup;
    if (!dataGroup) {
      return;
    }
    for (let i = 0; i < dataGroup.length; i++) {
      const items = dataGroup[i]?.data;
      if (!items) {
        // eslint-disable-next-line no-continue
        continue;
      }
      for (let j = 0; j < items.length; j++) {
        this.calcItem(items[j], param);
      }
    }
  }

  /**
   * realtime scatter 전체 점 수를 dataGroup 길이 합으로 갱신한다(O(버킷), 점 수와 무관).
   * blit fast-path 는 전체 순회를 건너뛰므로 mousemove(findGraphData)용 _rtTotalCount 를 별도로 맞춘다.
   * @returns {number} 총 점 수
   */
  refreshRtTotalCount() {
    let totalCount = 0;
    const dataGroup = this.data[this.sId]?.dataGroup;
    if (dataGroup) {
      for (let i = 0; i < dataGroup.length; i++) {
        totalCount += dataGroup[i]?.data?.length ?? 0;
      }
    }
    this._rtTotalCount = totalCount;
    return totalCount;
  }

  /**
   * Filters and returns data items based on input coordinates
   *
   * @param {Array} data - The data to filter
   * @param {number} xsp - Start X coordinate
   * @param {number} ysp - Start Y coordinate
   * @param {number} xep - End X coordinate
   * @param {number} yep - End Y coordinate
   * @returns {Array} Filtered data items
   */
  findItemsInRange(data, xsp, ysp, xep, yep) {
    return data.filter(
      (seriesData) =>
        xsp - 1 <= seriesData.xp &&
        seriesData.xp <= xep + 1 &&
        ysp - 1 <= seriesData.yp &&
        seriesData.yp <= yep + 1,
    );
  }

  defaultScatterFindItems(gdata, xsp, ysp, xep, yep) {
    return this.findItemsInRange(gdata, xsp, ysp, xep, yep);
  }

  realTimeScatterFindItems(gdata, xsp, ysp, xep, yep) {
    const items = [];
    for (let i = 0; i < gdata[this.sId].dataGroup.length; i++) {
      const obj = gdata[this.sId].dataGroup[i];
      items.push(...this.findItemsInRange(obj.data, xsp, ysp, xep, yep));
    }

    return items;
  }

  /**
   *Returns items in range
   * @param {object} params  range values
   *
   * @returns {array}
   */
  findItems({ xsp, ysp, width, height }) {
    const gdata = this.data;
    const xep = xsp + width;
    const yep = ysp + height;
    let items = [];

    if (this.realTimeScatter) {
      items = this.realTimeScatterFindItems(gdata, xsp, ysp, xep, yep);
    } else {
      items = this.defaultScatterFindItems(gdata, xsp, ysp, xep, yep);
    }

    return items;
  }

  /**
   * Draw item highlight
   * @param {object}   item       object for drawing series data
   * @param {object}   context    canvas context
   * @param {boolean}  isMax      determines if this series has max value
   *
   * @returns {undefined}
   */
  itemHighlight(item, context) {
    const gdata = item.data;
    const ctx = context;

    const x = gdata.xp;
    const y = gdata.yp;

    ctx.save();
    if (x !== null && y !== null) {
      const color = gdata.dataColor || this.color;
      const pointFillColor = gdata.dataColor || this.pointFill;

      ctx.strokeStyle = this.getCachedColor(color, 0);

      ctx.fillStyle = this.getCachedColor(pointFillColor, this.highlight.maxShadowOpacity);
      Canvas.drawPoint(ctx, this.pointStyle, this.highlight.maxShadowSize, x, y);

      ctx.fillStyle = color;
      Canvas.drawPoint(ctx, this.pointStyle, this.highlight.maxSize, x, y);

      ctx.fillStyle = '#fff';
      Canvas.drawPoint(ctx, this.pointStyle, this.highlight.defaultSize, x, y);
    }

    ctx.restore();
  }

  /**
   * Find graph item for tooltip
   * @param {array}  offset       mouse position
   *
   * @returns {object} graph item
   */
  findGraphData(offset) {
    const xp = offset[0];
    const yp = offset[1];
    const item = { data: null, hit: false, color: this.color, index: null };
    const pointSize = this.pointSize;

    if (this.realTimeScatter) {
      const dataGroup = this.data[this.sId]?.dataGroup;
      if (!dataGroup) {
        return item;
      }

      const totalCount = this._rtTotalCount;
      let currentIndex = totalCount - 1;

      for (let i = dataGroup.length - 1; i >= 0; i--) {
        const group = dataGroup[i];
        if (group?.data) {
          for (let j = group.data.length - 1; j >= 0; j--) {
            const dataItem = group.data[j];
            if (dataItem.xp !== null && dataItem.yp !== null) {
              const x = dataItem.xp;
              const y = dataItem.yp;

              if (
                x - pointSize <= xp &&
                xp <= x + pointSize &&
                y - pointSize <= yp &&
                yp <= y + pointSize
              ) {
                item.data = dataItem;
                item.index = currentIndex;
                item.hit = true;
                return item;
              }
            }
            currentIndex--;
          }
        }
      }

      return item;
    }

    const gdata = this.data;

    const targetIndex = gdata.findIndex((data) => {
      const x = data.xp;
      const y = data.yp;

      return (
        x - pointSize <= xp && xp <= x + pointSize && y - pointSize <= yp && yp <= y + pointSize
      );
    });

    if (targetIndex > -1) {
      item.data = gdata[targetIndex];
      item.index = targetIndex;
      item.hit = true;
    }

    return item;
  }
}

export default Scatter;
