import { defaultsDeep, isNil, isUndefined } from 'lodash-es';
import { COLOR, LINE_OPTION } from '../helpers/helpers.constant';
import Util from '../helpers/helpers.util';
import Canvas from '../helpers/helpers.canvas';

// Canvas.drawPoint 의 switch 에서 default 분기 (원/circle) 로 떨어지는 스타일은
// 모든 점을 단일 path 에 합쳐 fill/stroke 1회로 그릴 수 있다.
// 그 외 스타일은 도형별 closePath 처리가 달라 batching 대상에서 제외한다.
const NON_CIRCLE_POINT_STYLES = new Set([
  'triangle',
  'rect',
  'rectRounded',
  'rectRot',
  'cross',
  'crossRot',
  'star',
  'line',
]);
const TWO_PI = Math.PI * 2;

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
        this[colorProp] = colorProp === 'pointFill' ? this.color : COLOR[sIdx % COLOR.length];
      }
    });
    this.type = 'line';
    this.sId = sId;
    this.extent = {
      downplay: { opacity: 0.3, lineWidth: 1 },
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
    return (
      this.interpolation === 'linear' ||
      (this.interpolation === 'none' && !!this.passingValue && this.hasPassingValueInData)
    );
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
   * @property {number} [unSelectedOpacity] - 비선택 시 opacity (0~1)
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
      ctx,
      chartRect,
      labelOffset,
      axesSteps,
      selectLabel,
      selectSeries,
      legendHitInfo,
      isBrush,
      unSelectedOpacity,
      displayOverflow,
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

    if (extent === this.extent.downplay) {
      extent = { ...extent, opacity: unSelectedOpacity };
    }

    const getOpacity = (colorStr) =>
      colorStr?.includes('rgba') ? Util.getOpacity(colorStr) : extent.opacity;
    const mainColor = this.color;
    const mainColorOpacity = getOpacity(mainColor);
    const pointFillColor = this.pointFill;
    const pointFillColorOpacity = getOpacity(pointFillColor);
    const fillOpacity = this.extent.downplay ? this.fillOpacity * extent.opacity : this.fillOpacity;
    const lineWidth = this.lineWidth * extent.lineWidth;

    ctx.beginPath();
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = Util.colorStringToRgba(mainColor, mainColorOpacity);
    if (this.segments) {
      ctx.setLineDash(this.segments);
    }

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

    const xsp = chartRect.x1 + labelOffset.left + barAreaByCombo / 2;
    const ysp = chartRect.y2 - labelOffset.bottom;

    const getXPos = (val) =>
      Canvas.calculateX(val, minmaxX.graphMin, minmaxX.graphMax, xArea, xsp);
    // 값 축(현재 line 은 세로 전용 → 값 축 = Y)이 graphMax 를 초과하면, displayOverflow 가
    // 켜졌을 때만 graphMax 로 clamp 해 상단 경계에 표시한다(scatter 와 동일). 꺼져 있으면 raw →
    // calculateY 가 null 반환 → 숨김. horizontal line 지원 시 값 축이 X 로 바뀌므로
    // getXPos 에도 동일 clamp 를 적용해야 한다.
    const getYPos = (val) =>
      Canvas.calculateY(
        displayOverflow && val > minmaxY.graphMax ? minmaxY.graphMax : val,
        minmaxY.graphMin,
        minmaxY.graphMax,
        yArea,
        ysp,
      );

    const includeNegativeValue = this.data.some((data) => data.o < 0);
    const endPoint = includeNegativeValue ? getYPos(0) : chartRect.y2 - labelOffset.bottom;

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
        return;
      } else if (x === null || y === null) {
        // axis range 밖 데이터는 라인을 끊고 prevValid 도 리셋해 다음 valid 포인트가 moveTo 로 재시작하도록.
        prevValid = undefined;
        return;
      } else if (
        (isNil(prevValid?.y) && !this.isExistGrp) ||
        (!isLinearInterpolation && (isNil(prevValid?.y) || isNil(curr.o)))
      ) {
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
        const mainGradientColor = extent.opacity < 1 ? fillColor : mainColor;
        gradient.addColorStop(0, includeNegativeValue ? mainGradientColor : fillColor);
        gradient.addColorStop(0.5, fillColor);
        gradient.addColorStop(1, mainGradientColor);

        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = fillColor;
      }

      // Set dataIndex List for filling
      // ex) [10, passing, null, 10, 10, passing, 10] -> [[0, 1], [3, 6]]
      let start = null;
      let end = null;
      const valueArray = this.data.map((item) => item?.o);
      /** @type {Array<[number, number]>} */
      const needFillDataIndexList = [];
      for (let i = 0; i < valueArray.length + 1; i++) {
        if (
          (isLinearInterpolation && isUndefined(valueArray[i])) ||
          (!isLinearInterpolation && isNil(valueArray[i]))
        ) {
          if (start !== null && end !== null) {
            const temp = valueArray.slice(start, i);
            const lastNormalValueIndex = temp.findLastIndex(
              (item) => !isNil(item) && item !== null,
            );
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
          // axis range 밖이면 xp/yp 가 null. 그대로 ctx 에 전달하면 좌상단으로 fill 이 튕긴다.
          if (singleData.xp === null || singleData.yp === null) {
            return;
          }
          ctx.moveTo(singleData.xp - lineWidth, singleData.yp);
          ctx.lineTo(singleData.xp + lineWidth, singleData.yp);
          ctx.lineTo(singleData.xp + lineWidth, getYPos(singleData.b) ?? endPoint);
          ctx.closePath();
          return;
        }

        let pathStarted = false;
        for (let ix = startIndex; ix <= endIndex; ix++) {
          const currData = this.data[ix];
          // axis range 밖 (xp/yp null) 이면 path 추가는 건너뛰고 다음 valid 포인트에서 새 path 를 시작.
          const isInRange = currData.xp !== null && currData.yp !== null;

          if (isInRange) {
            if (!pathStarted) {
              ctx.moveTo(currData.xp, currData.yp);
              pathStarted = true;
            } else if (currData.o !== null) {
              ctx.lineTo(currData.xp, currData.yp);
            }
          }

          if (ix === endIndex) {
            for (let jx = endIndex; jx >= startIndex; jx--) {
              const nextData = this.data[jx];
              const xp = getXPos(nextData.x);

              if (xp !== null && nextData.o !== null) {
                const bp = getYPos(nextData.b) ?? getYPos(0);
                ctx.lineTo(xp, bp);
              }
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

      // isLinearSingle: 전체 filter 대신 2개 발견 시점에 즉시 종료.
      let isLinearSingle = false;
      if (this.interpolation === 'linear') {
        let nonNullCount = 0;
        for (let i = 0; i < this.data.length; i++) {
          if (this.data[i].o !== null) {
            nonNullCount++;
            if (nonNullCount > 1) break;
          }
        }
        isLinearSingle = nonNullCount === 1;
      }

      // includes(O(n)) → Set(O(1))
      const selectedLabelIndexSet = selectedLabelIndexList.length
        ? new Set(selectedLabelIndexList)
        : null;

      const pointSize = this.pointSize;
      const pointStyle = this.pointStyle;
      const data = this.data;
      const dataLen = data.length;
      // 다수 series × 다수 point 환경에서 점마다 beginPath/fill/stroke 를 호출하면
      // 캔버스 rasterizer flush 가 수만 회 발생한다. circle 스타일(default)일 때는
      // 모든 점을 단일 path 에 모아 fill/stroke 를 1회만 호출하도록 batching 한다.
      const canBatch = !NON_CIRCLE_POINT_STYLES.has(pointStyle);

      // 점 그리기 판정은 circle/비-circle 두 분기 공통이므로 이 함수 한 곳에서만 관리한다.
      // (두 분기는 "어떤 점을 그리느냐"가 아니라 "어떻게 그리느냐"만 달라야 한다.)
      // 반환값: 0 = 그리지 않음, 1 = 일반(blur), 2 = 강조(focus).
      // hot loop라 점당 객체 할당을 피하려고 객체 대신 정수 코드를 반환한다.
      const pointDrawKind = (ix) => {
        const curr = data[ix];
        if (curr.xp === null || curr.yp === null || curr.o === null) {
          return 0;
        }

        let isSingle;
        if (isLinearSingle) {
          isSingle = true;
        } else if (!isLinearInterpolation) {
          const prevO = ix > 0 ? data[ix - 1].o : null;
          const nextO = ix + 1 < dataLen ? data[ix + 1].o : null;
          isSingle = prevO == null && nextO == null;
        } else {
          isSingle = false;
        }

        const isSelectedLabel = selectedLabelIndexSet ? selectedLabelIndexSet.has(ix) : false;
        if (!(this.point || isSingle || isSelectedLabel)) {
          return 0;
        }
        return isSelectedLabel && !legendHitInfo ? 2 : 1;
      };

      if (canBatch) {
        let blurPathOpen = false;
        let focusPoints = null;

        for (let ix = 0; ix < dataLen; ix++) {
          const kind = pointDrawKind(ix);
          if (kind !== 0) {
            const curr = data[ix];
            if (kind === 2) {
              if (focusPoints === null) focusPoints = [];
              focusPoints.push(curr);
            } else {
              if (!blurPathOpen) {
                ctx.beginPath();
                blurPathOpen = true;
              }
              // arc 직전 moveTo 로 sub-path 를 분리해 점 사이 line 연결을 막는다.
              ctx.moveTo(curr.xp + pointSize, curr.yp);
              ctx.arc(curr.xp, curr.yp, pointSize, 0, TWO_PI);
            }
          }
        }
        if (blurPathOpen) {
          ctx.fillStyle = blurStyle;
          ctx.fill();
          ctx.stroke();
        }
        if (focusPoints !== null) {
          ctx.beginPath();
          for (let i = 0; i < focusPoints.length; i++) {
            const p = focusPoints[i];
            ctx.moveTo(p.xp + pointSize, p.yp);
            ctx.arc(p.xp, p.yp, pointSize, 0, TWO_PI);
          }
          ctx.fillStyle = focusStyle;
          ctx.fill();
          ctx.stroke();
        }
      } else {
        for (let ix = 0; ix < dataLen; ix++) {
          const kind = pointDrawKind(ix);
          if (kind !== 0) {
            const curr = data[ix];
            ctx.fillStyle = kind === 2 ? focusStyle : blurStyle;
            Canvas.drawPoint(ctx, pointStyle, pointSize, curr.xp, curr.yp);
          }
        }
      }
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
    const gdata = this.data.filter((data) => !Util.isNullOrUndefined(data.x));
    const isLinearInterpolation = this.useLinearInterpolation();

    // line 포인트 "정확 히트" 판정용 반경.
    // combo 차트에서 line 포인트 중심을 직격한 경우, 같은 좌표의 bar(directHit)보다
    // line이 우선되도록 item.directHit = true로 표시한다. 그 외(단순 Y축 근접)는 기존처럼 hit만.
    // 포인트 반지름에 기본 포인트 크기(LINE_OPTION.pointSize)만큼의 클릭 여유 마진을 더하고,
    // 시각적으로 하이라이트되는 포인트 반경(highlight.maxSize)을 최소 보장값으로 사용한다.
    const directHitRadius = Math.max(
      (this.pointSize ?? LINE_OPTION.pointSize) + LINE_OPTION.pointSize,
      LINE_OPTION.highlight.maxSize,
    );
    const isLinePointDirectHit = (point) => {
      if (!point || point.xp === undefined || point.yp === undefined) {
        return false;
      }
      const dx = xp - point.xp;
      const dy = yp - point.yp;
      return dx * dx + dy * dy <= directHitRadius * directHitRadius;
    };

    if (gdata?.length) {
      if (typeof dataIndex === 'number' && this.show) {
        item.data = gdata[dataIndex];
        item.index = dataIndex;
        if (item.data) {
          const point = gdata[dataIndex];
          // null 좌표는 산술에서 0 으로 강제 변환되므로 hit 판정 대상에서 제외.
          const hasValidPoint = point.o !== null && point.o !== undefined
            && point.yp !== null && point.yp !== undefined;
          if (hasValidPoint) {
            const yDist = Math.abs(yp - point.yp);
            const directHitThreshold = 15; // 직접 히트 임계값

            if (yDist <= directHitThreshold) {
              item.hit = true;
            }
            if (isLinePointDirectHit(point)) {
              item.hit = true;
              item.directHit = true;
            }
          }
        }
      } else if (
        typeof this.beforeFindItemIndex === 'number' &&
        this.beforeFindItemIndex !== -1 &&
        this.show &&
        useSelectLabelOrItem
      ) {
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
          gdata.forEach((point, idx) => {
            validData.push({ ...point, originalIndex: idx });
          });
        }

        // 이진 탐색으로 가장 가까운 포인트 찾기
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
        const foundIdx = validData.findIndex((p) => p.originalIndex === closestIndex);
        if (foundIdx !== -1) {
          // 앞뒤 2개씩 추가 확인
          for (
            let i = Math.max(0, foundIdx - 2);
            i <= Math.min(validData.length - 1, foundIdx + 2);
            i++
          ) {
            const point = validData[i];
            const xDistance = Math.abs(xp - point.xp);
            if (xDistance < closestXDistance) {
              closestXDistance = xDistance;
              closestIndex = point.originalIndex;
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
          const threshold = Math.max(avgInterval, 1);

          // 1. 먼저 엄격한 임계값으로 정확한 매치 확인
          if (closestXDistance <= threshold) {
            // 정확히 일치하거나 매우 가까운 데이터가 있음
            item.data = gdata[closestIndex];
            item.index = closestIndex;
          } else {
            // 2. 정확한 매치가 없을 때, 현재 X 위치 근처에 다른 데이터가 있는지 확인
            let hasNearbyAnyData = false;
            let closestDistance = isLinearInterpolation ? Infinity : threshold;
            const dataSet = isLinearInterpolation ? validData : gdata;
            for (let i = 0; i < dataSet.length; i++) {
              const xDist = Math.abs(xp - dataSet[i].xp);
              if (xDist <= closestDistance) {
                hasNearbyAnyData = true;
                closestDistance = xDist;
                closestIndex = isLinearInterpolation ? dataSet[i].originalIndex : i;
              }
            }

            if (hasNearbyAnyData) {
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
            if (isLinePointDirectHit(point)) {
              item.hit = true;
              item.directHit = true;
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
    const gdata = this.data.filter((data) => !Util.isNullOrUndefined(data.x));

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
      if (x - xpInterval <= xp && xp <= x + xpInterval) {
        // 중간점 주변 데이터들과 거리 비교
        const checkStart = Math.max(0, m - 2);
        const checkEnd = Math.min(gdata.length - 1, m + 2);

        for (let i = checkStart; i <= checkEnd; i++) {
          if (gdata[i].xp !== null && gdata[i].yp !== null) {
            const distance = Math.sqrt((xp - gdata[i].xp) ** 2 + (yp - gdata[i].yp) ** 2);

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

    return this.data.filter((seriesData) => xsp - 1 <= seriesData.xp && seriesData.xp <= xep + 1);
  }
}

export default Line;
