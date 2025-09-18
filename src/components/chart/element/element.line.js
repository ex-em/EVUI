import { defaultsDeep, isNil, isUndefined } from 'lodash-es';
import { COLOR, LINE_OPTION } from '../helpers/helpers.constant';
import Util from '../helpers/helpers.util';
import Canvas from '../helpers/helpers.canvas';

class Line {
  constructor(sId, opt, sIdx) {
    const merged = defaultsDeep({}, opt, LINE_OPTION);
    Object.keys(merged).forEach((key) => {
      this[key] = merged[key];
    });

    if (this.name === undefined) {
      this.name = `series-${sIdx}`;
    }

    ['color', 'pointFill', 'fillColor'].forEach((colorProp) => {
      if (this[colorProp] === undefined) {
        this[colorProp] = colorProp === 'pointFill' ? this.color : COLOR[(sIdx) % COLOR.length];
      }
    });
    this.type = 'line';
    this.sId = sId;
    this.extent = {
      downplay: { opacity: 0.1, lineWidth: 1 },
      normal: { opacity: 1, lineWidth: 1 },
      highlight: { opacity: 1, lineWidth: 2 },
    };
    /** @type {import('../model/index').ChartSeriesDataPoint[]} */
    this.data = [];
    this.beforeMouseXp = 0;
    this.beforeMouseYp = 0;
    this.beforeFindItemIndex = -1;
    this.size = {
      comboOffset: 0,
    };
  }

  useLinearInterpolation() {
    return this.interpolation === 'linear' || (this.interpolation === 'none' && !!this.passingValue && this.hasPassingValueInData);
  }

  /**
   * @typedef {Object} LineDrawParam
   * @property {CanvasRenderingContext2D} ctx - 캔버스 렌더링 컨텍스트
   * @property {object} chartRect - 차트 영역 정보
   * @property {object} labelOffset - 라벨 오프셋 정보
   * @property {object} axesSteps - 축 스텝 정보
   * @property {object} [selectLabel] - 선택된 라벨 정보
   * @property {object} [selectSeries] - 선택된 시리즈 정보
   * @property {object} [legendHitInfo] - 범례 히트 정보
   * @property {boolean} [isBrush] - 브러시 사용 여부
   */
  /**
   * Draw series data
   * @param {LineDrawParam} param     object for drawing series data
   *
   * @returns {undefined}
   */
  draw(param) {
    if (!this.show) {
      return;
    }

    const {
      ctx, chartRect,
      labelOffset, axesSteps,
      selectLabel, selectSeries, legendHitInfo,
      isBrush,
    } = param;

    // about selectLabel
    const selectLabelOption = selectLabel?.option;
    const useSelectLabel = selectLabelOption?.use && selectLabelOption?.useSeriesOpacity;
    const selectedLabelIndexList = selectLabel?.selected?.dataIndex ?? [];

    // set Style
    let extent;
    if (legendHitInfo) {
      extent = this.extent[legendHitInfo?.sId === this.sId ? 'highlight' : 'downplay'];
    } else if (selectSeries?.option?.use && selectSeries?.selected?.seriesId?.length) {
      const isSelectedSeries = selectSeries?.selected?.seriesId?.includes(this.sId);
      extent = this.extent[isSelectedSeries ? 'highlight' : 'downplay'];
    } else if (useSelectLabel && selectedLabelIndexList.length) {
      extent = this.extent.downplay;
    } else {
      extent = this.extent.normal;
    }

    const getOpacity = colorStr => (colorStr?.includes('rgba') ? Util.getOpacity(colorStr) : extent.opacity);
    const mainColor = this.color;
    const mainColorOpacity = getOpacity(mainColor);
    const pointFillColor = this.pointFill;
    const pointFillColorOpacity = getOpacity(pointFillColor);
    const fillOpacity = this.fillOpacity;
    const lineWidth = this.lineWidth * extent.lineWidth;

    ctx.beginPath();
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = Util.colorStringToRgba(mainColor, mainColorOpacity);
    if (this.segments) {
      ctx.setLineDash(this.segments);
    }

    const endPoint = chartRect.y2 - labelOffset.bottom;

    const isLinearInterpolation = this.useLinearInterpolation();

    let barAreaByCombo = 0;

    const minmaxX = axesSteps.x[this.xAxisIndex];
    const minmaxY = axesSteps.y[this.yAxisIndex];

    let xArea = chartRect.chartWidth - (labelOffset.left + labelOffset.right);
    const yArea = chartRect.chartHeight - (labelOffset.top + labelOffset.bottom);

    if (this.combo) {
      barAreaByCombo = xArea / (this.data.length || 1);
      xArea -= barAreaByCombo;
      this.size.comboOffset = barAreaByCombo;
    }

    const xsp = chartRect.x1 + labelOffset.left + (barAreaByCombo / 2);
    const ysp = chartRect.y2 - labelOffset.bottom;

    const getXPos = val => Canvas.calculateX(val, minmaxX.graphMin, minmaxX.graphMax, xArea, xsp);
    const getYPos = val => Canvas.calculateY(val, minmaxY.graphMin, minmaxY.graphMax, yArea, ysp);

    // draw line
    let prevValid;
    this.data.forEach((curr) => {
      let x = getXPos(curr.x);
      let y = getYPos(curr.y);

      if (this.isExistGrp && isLinearInterpolation && curr.o === null) {
        y = getYPos(curr.b ?? 0);
      }

      if (x !== null) {
        x += Util.aliasPixel(x);
      }

      curr.xp = x;
      curr.yp = y;

      if (isLinearInterpolation && curr.o === null) {
        if (!this.isExistGrp) {
          return;
        }
      }

      if ((isNil(prevValid?.y) && !this.isExistGrp)
        || (!isLinearInterpolation && (isNil(prevValid?.y) || isNil(curr.o)))) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      prevValid = curr;
    });

    ctx.stroke();
    if (this.segments) {
      ctx.setLineDash([]);
    }


    // draw fill
    if (this.fill && this.data.length) {
      ctx.beginPath();

      const fillColor = Util.colorStringToRgba(this.fillColor || mainColor, fillOpacity);
      if (this.fill?.gradient) {
        let maxValueYPos = this.data[0].yp;
        let minValueYBottomPos = this.data[0].y;
        this.data.forEach((data) => {
          if (data.yp && data.yp <= maxValueYPos) {
            maxValueYPos = data.yp;
          } else if (data.y && data.y >= minValueYBottomPos) {
            minValueYBottomPos = data.y;
          }
        });
        const gradient = ctx.createLinearGradient(0, chartRect.y2, 0, maxValueYPos);
        gradient.addColorStop(0, fillColor);
        gradient.addColorStop(0.5, fillColor);
        gradient.addColorStop(1, (extent.opacity < 1 ? fillColor : mainColor));

        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = fillColor;
      }

      // Set dataIndex List for filling
      // ex) [10, passing, null, 10, 10, passing, 10] -> [[0, 1], [3, 6]]
      let start = null;
      let end = null;
      const valueArray = this.data.map(item => (item?.o));
      /** @type {Array<[number, number]>} */
      const needFillDataIndexList = [];
      for (let i = 0; i < valueArray.length + 1; i++) {
        if ((isLinearInterpolation && isUndefined(valueArray[i]))
          || (!isLinearInterpolation && isNil(valueArray[i]))) {
          if (start !== null && end !== null) {
            const temp = valueArray.slice(start, i);
            const lastNormalValueIndex = temp.findLastIndex(
              item => !isNil(item) && item !== null);
            needFillDataIndexList.push([start, start + lastNormalValueIndex]);
            start = null;
            end = null;
          }
        } else if (isLinearInterpolation && valueArray[i] === null) {
          end = i;
        } else {
          start = start === null ? i : start;
          end = i;
        }
      }

      // Draw rect for filling
      needFillDataIndexList.forEach(([startIndex, endIndex]) => {
        if (startIndex === endIndex) {
          const singleData = this.data[startIndex];
          ctx.moveTo(singleData.xp - lineWidth, singleData.yp);
          ctx.lineTo(singleData.xp + lineWidth, singleData.yp);
          ctx.lineTo(singleData.xp + lineWidth, getYPos(singleData.b) ?? endPoint);
          ctx.closePath();
          return;
        }

        for (let ix = startIndex; ix <= endIndex; ix++) {
          const currData = this.data[ix];

          if (ix === startIndex) {
            ctx.moveTo(currData.xp, currData.yp);
          } else if (this.isExistGrp || currData.o !== null) {
            ctx.lineTo(currData.xp, currData.yp);
          }

          if (ix === endIndex) {
            for (let jx = endIndex; jx >= startIndex; jx--) {
              const nextData = this.data[jx];
              const xp = getXPos(nextData.x);
              const bp = getYPos(nextData.b) ?? endPoint;
              ctx.lineTo(xp, bp);
            }

            ctx.closePath();
          }
        }
      });

      ctx.fill();
    }

    // Draw points
    if (!isBrush) {
      ctx.strokeStyle = Util.colorStringToRgba(mainColor, mainColorOpacity);
      const focusStyle = Util.colorStringToRgba(pointFillColor, 1);
      const blurStyle = Util.colorStringToRgba(pointFillColor, pointFillColorOpacity);
      const isLinearSingle = this.interpolation === 'linear' && this.data.filter(item => item.o !== null).length === 1;

      this.data.forEach((curr, ix) => {
        if (curr.xp === null || curr.yp === null || curr.o === null) {
          return;
        }

        const prevData = this.data[ix - 1]?.o;
        const nextData = this.data[ix + 1]?.o;

        const isSingle = (!isLinearInterpolation && isNil(prevData) && isNil(nextData))
          || isLinearSingle;
        const isSelectedLabel = selectedLabelIndexList.includes(ix);
        if (this.point || isSingle || isSelectedLabel) {
          ctx.fillStyle = isSelectedLabel && !legendHitInfo ? focusStyle : blurStyle;
          Canvas.drawPoint(ctx, this.pointStyle, this.pointSize, curr.xp, curr.yp);
        }
      });
    }

    ctx.restore();
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

    const { xp, yp, o } = gdata;

    ctx.save();
    if (xp !== null && yp !== null && o !== null && this.pointHighlight) {
      ctx.strokeStyle = Util.colorStringToRgba(this.color, 0);
      ctx.fillStyle = Util.colorStringToRgba(this.color, this.highlight.maxShadowOpacity);
      Canvas.drawPoint(ctx, this.pointStyle, this.highlight.maxShadowSize, xp, yp);

      ctx.fillStyle = this.color;
      Canvas.drawPoint(ctx, this.pointStyle, this.highlight.maxSize, xp, yp);

      ctx.fillStyle = '#fff';
      Canvas.drawPoint(ctx, this.pointStyle, this.highlight.defaultSize, xp, yp);
    }

    ctx.restore();
  }

  /**
   * Find graph item
   * @param {array}    offset          mouse position
   * @param {boolean}  isHorizontal
   * @param {number}   dataIndex       selected label data index
   * @param {boolean}  useSelectLabelOrItem   used to display select label/item at tooltip location
   *
   * @returns {object} graph item
   */
  findGraphData(offset, isHorizontal, dataIndex, useSelectLabelOrItem) {
    const xp = offset[0];
    const yp = offset[1];
    const item = { data: null, hit: false, color: this.color };
    const gdata = this.data.filter(data => !Util.isNullOrUndefined(data.x));
    const isLinearInterpolation = this.useLinearInterpolation();

    if (gdata?.length) {
      if (typeof dataIndex === 'number' && this.show) {
        item.data = gdata[dataIndex];
        item.index = dataIndex;
      } else if (typeof this.beforeFindItemIndex === 'number' && this.show && useSelectLabelOrItem) {
        item.data = gdata[this.beforeFindItemIndex];
        item.index = this.beforeFindItemIndex;
      } else {
        // Axis 트리거 방식: X축 위치에서 가장 가까운 데이터 포인트 찾기
        let closestXDistance = Infinity;
        let closestIndex = -1;

        // null이 아닌 유효한 데이터만 필터링
        const validData = [];
        gdata.forEach((point, idx) => {
          if (point.xp !== null && point.yp !== null && point.o !== null) {
            validData.push({ ...point, originalIndex: idx });
          }
        });

        if (validData.length === 0) {
          return item;
        }

        // 데이터가 적은 경우 선형 탐색, 많은 경우 이진 탐색
        if (validData.length <= 10) {
          // 선형 탐색 - sparse 데이터에 효과적
          for (let i = 0; i < validData.length; i++) {
            const point = validData[i];
            const xDistance = Math.abs(xp - point.xp);

            if (xDistance < closestXDistance) {
              closestXDistance = xDistance;
              closestIndex = point.originalIndex;
            }
          }
        } else {
          // 이진 탐색 - 데이터가 많을 때 효율적
          let left = 0;
          let right = validData.length - 1;

          while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            const point = validData[mid];
            const xDistance = Math.abs(xp - point.xp);

            if (xDistance < closestXDistance) {
              closestXDistance = xDistance;
              closestIndex = point.originalIndex;
            }

            if (point.xp < xp) {
              left = mid + 1;
              // 다음 포인트도 확인
              if (left < validData.length) {
                const nextDistance = Math.abs(xp - validData[left].xp);
                if (nextDistance < closestXDistance) {
                  closestXDistance = nextDistance;
                  closestIndex = validData[left].originalIndex;
                }
              }
            } else if (point.xp > xp) {
              right = mid - 1;
              // 이전 포인트도 확인
              if (right >= 0) {
                const prevDistance = Math.abs(xp - validData[right].xp);
                if (prevDistance < closestXDistance) {
                  closestXDistance = prevDistance;
                  closestIndex = validData[right].originalIndex;
                }
              }
            } else {
              // 정확히 일치하는 경우
              break;
            }
          }

          // 이진 탐색 후 주변 포인트 추가 확인 (정확도 향상)
          const foundIdx = validData.findIndex(p => p.originalIndex === closestIndex);
          if (foundIdx !== -1) {
            // 앞뒤 2개씩 추가 확인
            for (let i = Math.max(0, foundIdx - 2);
              i <= Math.min(validData.length - 1, foundIdx + 2);
              i++) {
              const point = validData[i];
              const xDistance = Math.abs(xp - point.xp);
              if (xDistance < closestXDistance) {
                closestXDistance = xDistance;
                closestIndex = point.originalIndex;
              }
            }
          }
        }

        // 가장 가까운 포인트 설정
        if (closestIndex !== -1) {
          // 데이터 간격 계산 - 모든 데이터(null 포함)의 평균 간격 사용
          let avgInterval = 50;
          if (gdata.length > 1) {
            const intervals = [];
            for (let i = 1; i < gdata.length; i++) {
              if (gdata[i].xp !== null && gdata[i - 1].xp !== null) {
                intervals.push(Math.abs(gdata[i].xp - gdata[i - 1].xp));
              }
            }
            if (intervals.length > 0) {
              avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
            }
          }

          // 두 가지 임계값 설정
          const strictThreshold = avgInterval * 0.3; // 엄격한 임계값: 데이터 간격의 30%
          const relaxedThreshold = avgInterval; // 느슨한 임계값: 데이터 간격 전체

          // 1. 먼저 엄격한 임계값으로 정확한 매치 확인
          if (closestXDistance <= strictThreshold) {
            // 정확히 일치하거나 매우 가까운 데이터가 있음
            item.data = gdata[closestIndex];
            item.index = closestIndex;
          } else {
            // 2. 정확한 매치가 없을 때, 현재 X 위치 근처에 다른 유효 데이터가 있는지 확인
            let hasNearbyValidData = false;
            for (let i = 0; i < validData.length; i++) {
              const xDist = Math.abs(xp - validData[i].xp);
              if (xDist <= strictThreshold) {
                hasNearbyValidData = true;
                break;
              }
            }

            // 3. 근처에 다른 유효 데이터가 없을 때만 느슨한 임계값 적용
            if (!hasNearbyValidData && closestXDistance <= relaxedThreshold) {
              item.data = gdata[closestIndex];
              item.index = closestIndex;
            }
          }

          // Y축 거리를 확인하여 직접 히트 판정
          if (item.data) {
            const point = gdata[closestIndex];
            const yDist = Math.abs(yp - point.yp);
            const directHitThreshold = 15; // 직접 히트 임계값

            if (yDist <= directHitThreshold) {
              item.hit = true;
            }
          }
        }
      }
    }

    if (!useSelectLabelOrItem) {
      this.beforeMouseXp = xp;
      this.beforeMouseYp = yp;

      if (typeof item.index === 'number') {
        this.beforeFindItemIndex = item.index;
      }
    }

    if (isLinearInterpolation && item?.data?.o === null) {
      item.data = null;
    }

    return item;
  }

  /**
   * Find approximate graph item
   * @param {array}  offset       mouse position
   *
   * @returns {object} graph item
   */
  findApproximateData(offset) {
    const xp = offset[0];
    const yp = offset[1];
    const item = { data: null, hit: false, color: this.color };
    const gdata = this.data.filter(data => !Util.isNullOrUndefined(data.x));

    if (!gdata.length) {
      return item;
    }

    // 동적 감지 범위 계산
    const gap = gdata.length > 1 ? Math.abs(gdata[1]?.xp - gdata[0]?.xp) : 50;
    const xpInterval = Math.max(gap * 0.4, 10); // 데이터 간격의 40% 또는 최소 10px

    let s = 0;
    let e = gdata.length - 1;
    let closestIndex = -1;
    let closestDistance = Infinity;

    // 이진 탐색으로 근처 데이터 찾기
    while (s <= e) {
      const m = Math.floor((s + e) / 2);
      const x = gdata[m].xp;

      // X 좌표가 감지 범위 내에 있는 경우
      if ((x - xpInterval <= xp) && (xp <= x + xpInterval)) {
        // 중간점 주변 데이터들과 거리 비교
        const checkStart = Math.max(0, m - 2);
        const checkEnd = Math.min(gdata.length - 1, m + 2);

        for (let i = checkStart; i <= checkEnd; i++) {
          if (gdata[i].xp !== null && gdata[i].yp !== null) {
            const distance = Math.sqrt(
              ((xp - gdata[i].xp) ** 2)
              + ((yp - gdata[i].yp) ** 2),
            );

            if (distance < closestDistance) {
              closestDistance = distance;
              closestIndex = i;
            }
          }
        }

        if (closestIndex !== -1) {
          item.data = gdata[closestIndex];
          item.index = closestIndex;

          // 매우 가까운 경우 hit으로 표시
          if (closestDistance < 5) {
            item.hit = true;
          }
        }

        return item;
      } else if (x + xpInterval < xp) {
        // 마우스가 오른쪽에 있는 경우
        if (m < e && xp < gdata[m + 1].xp) {
          const curr = Math.abs(gdata[m].xp - xp);
          const next = Math.abs(gdata[m + 1].xp - xp);

          item.data = curr > next ? gdata[m + 1] : gdata[m];
          item.index = curr > next ? m + 1 : m;

          // Y 거리도 확인하여 hit 판정
          const selectedPoint = item.data;
          const yDist = Math.abs(yp - selectedPoint.yp);
          if (yDist < 10) {
            item.hit = true;
          }

          return item;
        }
        s = m + 1;
      } else {
        // 마우스가 왼쪽에 있는 경우
        if (m > 0 && xp > gdata[m - 1].xp) {
          const prev = Math.abs(gdata[m - 1].xp - xp);
          const curr = Math.abs(gdata[m].xp - xp);

          item.data = prev > curr ? gdata[m] : gdata[m - 1];
          item.index = prev > curr ? m : m - 1;

          // Y 거리도 확인하여 hit 판정
          const selectedPoint = item.data;
          const yDist = Math.abs(yp - selectedPoint.yp);
          if (yDist < 10) {
            item.hit = true;
          }

          return item;
        }
        e = m - 1;
      }
    }

    return item;
  }

  /**
   * Returns items in range
   * @param {object} params  range values
   *
   * @returns {array}
   */
  findItems({ xsp, width }) {
    const xep = xsp + width;

    return this.data.filter(seriesData => (xsp - 1 <= seriesData.xp) && (seriesData.xp <= xep + 1));
  }
}

export default Line;
