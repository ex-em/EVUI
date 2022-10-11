import { numberWithComma } from '@/common/utils';
import dayjs from 'dayjs';
import Canvas from '../helpers/helpers.canvas';

const modules = {
  /**
   * Draw TextTip with tip's locationInfo
   * @param {object} [tipLocationInfo=undefined]   tip location information
   *
   * @returns {undefined}
   */
  drawTips(tipLocationInfo) {
    const opt = this.options;
    const isHorizontal = !!opt.horizontal;
    const maxTipOpt = opt.maxTip;
    const selTipOpt = opt.selectItem;
    const labelTipOpt = opt.selectLabel;
    let maxArgs;
    let isExistSelectedLabel;

    const executeDrawTip = (tipOpt) => {
      tipLocationInfo.forEach((tipInfo) => {
        if (tipInfo && !isExistSelectedLabel) {
          const seriesInfo = this.seriesList[tipInfo?.sId];

          if (!seriesInfo?.show) {
            return;
          }

          const selArgs = this.calculateTipInfo(
            seriesInfo,
            'sel',
            tipInfo,
          );

          if (selArgs) {
            let isSamePos = false;

            if (maxTipOpt.use && maxArgs?.dp === selArgs.dp) {
              isSamePos = true;
            }

            if (tipOpt.showTextTip || tipOpt.showTip) {
              if (tipOpt.tipText === 'label') {
                const axisOpt = isHorizontal ? opt.axesY[0] : opt.axesX[0];
                const label = selArgs.label;
                selArgs.text = axisOpt.type === 'time' ? dayjs(label).format(axisOpt.timeFormat) : label;
              } else {
                selArgs.text = numberWithComma(selArgs.value);
              }

              this.drawTextTip({ opt: tipOpt, tipType: 'sel', seriesOpt: seriesInfo, isSamePos, ...selArgs });
            }

            if (tipOpt.showIndicator) {
              this.drawFixedIndicator({ opt: tipOpt, seriesOpt: seriesInfo, ...selArgs });
            }
          }

          if (tipInfo && tipInfo?.label && tipInfo?.label === 0) {
            this.lastHitInfo = tipInfo;
          }
        }
      });
    };

    if (tipLocationInfo) {
      if (selTipOpt.use) {
        executeDrawTip(selTipOpt);
      } else if (labelTipOpt.use) {
        executeDrawTip(labelTipOpt);
      }
    }

    if (maxTipOpt.use && !isExistSelectedLabel) {
      const maxSID = this.minMax[isHorizontal ? 'x' : 'y'][0].maxSID;
      const seriesInfo = this.seriesList[maxSID];
      maxArgs = this.calculateTipInfo(seriesInfo, 'max', null);

      if (maxTipOpt.use && maxArgs) {
        maxArgs.text = numberWithComma(maxArgs.value);
        this.drawTextTip({ opt: maxTipOpt, tipType: 'max', seriesOpt: seriesInfo, ...maxArgs });

        if (maxTipOpt.showIndicator) {
          this.drawFixedIndicator({ opt: maxTipOpt, seriesOpt: seriesInfo, ...maxArgs });
        }
      }
    }
  },

  /**
   * Calculate tip size and contents
   * @param {object} series     series information (max series or selected series)
   * @param {string} tipType    tip type
   * [sel = user select series, label = user select label, max = max value]
   * @param {object} hitInfo    mouse hit information
   *
   * @returns {object} size and tip contents
   */
  calculateTipInfo(series, tipType, hitInfo) {
    if (!series) {
      return false;
    }

    const isHorizontal = !!this.options.horizontal;
    const lastTip = this.lastTip;
    const chartRect = this.chartRect;
    const labelOffset = this.labelOffset;
    const graphPos = {
      x1: chartRect.x1 + labelOffset.left,
      x2: chartRect.x2 - labelOffset.right,
      y1: chartRect.y1 + labelOffset.top,
      y2: chartRect.y2 - labelOffset.bottom,
    };

    const yArea = chartRect.chartHeight - (labelOffset.top + labelOffset.bottom);
    const xArea = chartRect.chartWidth - (labelOffset.left + labelOffset.right);

    const graphX = this.axesSteps.x[series.xAxisIndex];
    const graphY = this.axesSteps.y[series.yAxisIndex];

    const xsp = graphPos.x1;
    const xep = graphPos.x2;
    const ysp = graphPos.y2;

    const { type, size } = series;
    const { maxDomain, maxDomainIndex } = series.minMax;

    if (maxDomain === null || maxDomainIndex < 0) {
      return false;
    }

    let ldata = type === 'bar' ? maxDomainIndex : maxDomain;

    if (tipType === 'sel') {
      if (hitInfo && hitInfo.label !== null) {
        lastTip.pos = type === 'bar' ? hitInfo.maxIndex : hitInfo.label;
        ldata = lastTip.pos;
      } else if (lastTip.pos !== null) {
        ldata = lastTip.pos;
      }
    }

    let value = isHorizontal ? series.minMax.maxX : series.minMax.maxY;
    let label;
    if (tipType === 'sel') {
      if (hitInfo && hitInfo.value !== null) {
        value = hitInfo.useStack ? hitInfo.acc : hitInfo.value;
        label = hitInfo.label;
        lastTip.value = value;
        lastTip.label = label;
      } else if (lastTip.value !== null) {
        value = lastTip.value;
        label = lastTip.label;
      } else if (lastTip.pos !== null) {
        const item = type === 'bar'
          ? this.getItemByLabelIndex(lastTip.pos) : this.getItemByLabel(lastTip.pos);

        value = item.useStack ? item.acc : item.value;
        label = item.label;
        lastTip.value = value;
        lastTip.label = label;
      }
    }

    let cp;
    let halfBarSize;
    let dp;

    if (type === 'bar') {
      if (isHorizontal) {
        halfBarSize = Math.round(size.h / 2);
        cp = ysp - (size.cat * ldata) - size.cPad;
        dp = (cp - ((size.bar * size.ix) - (size.h + size.bPad))) - halfBarSize;
      } else {
        halfBarSize = Math.round(size.w / 2);
        cp = xsp + (size.cat * ldata) + size.cPad;
        dp = cp + ((size.bar * size.ix) - (size.w + size.bPad)) + halfBarSize;
      }
    } else if (type === 'line') {
      dp = Canvas.calculateX(
        ldata,
        graphX.graphMin,
        graphX.graphMax,
        xArea - size.comboOffset,
        xsp + (size.comboOffset / 2),
      );
    } else if (type === 'scatter') {
      dp = Canvas.calculateX(
        ldata,
        graphX.graphMin,
        graphX.graphMax,
        xArea,
        xsp,
      );
    }

    const sizeObj = { xArea, yArea, graphX, graphY, xsp, xep, ysp };
    const dataObj = { dp, value, label, type };

    return { ...sizeObj, ...dataObj };
  },
  drawFixedIndicator(param) {
    const isHorizontal = !!this.options.horizontal;
    const ctx = this.bufferCtx;
    const { graphX, graphY, xArea, yArea, xsp, ysp, dp, type, value, opt, seriesOpt } = param;
    let offset = 0;

    if (type === 'line') {
      offset += 3;
    } else if (type === 'scatter') {
      offset += seriesOpt?.pointSize ?? 0;
    }

    let gp;

    if (opt.fixedPosTop) {
      if (isHorizontal) {
        gp = Canvas.calculateX(graphX.graphMax, graphX.graphMin, graphX.graphMax, xArea, xsp);
      } else {
        gp = Canvas.calculateY(graphY.graphMax, graphY.graphMin, graphY.graphMax, yArea, ysp);
        gp -= offset;
      }
    } else if (isHorizontal) {
      gp = Canvas.calculateX(value, graphX.graphMin, graphX.graphMax, xArea, xsp);
    } else {
      gp = Canvas.calculateY(value, graphY.graphMin, graphY.graphMax, yArea, ysp);
      gp -= offset;
    }

    if (dp === null) {
      return;
    }

    ctx.beginPath();
    ctx.save();
    ctx.strokeStyle = opt.indicatorColor;
    ctx.lineWidth = 2;

    if (isHorizontal) {
      ctx.moveTo(xsp, dp);
      ctx.lineTo(gp, dp);
    } else {
      ctx.moveTo(dp, ysp);
      ctx.lineTo(dp, gp);
    }

    ctx.stroke();
    ctx.restore();
    ctx.closePath();
  },

  /**
   * Draw Selected Label Tip
   * @returns {boolean} Whether drew at least one tip
   */
  drawLabelTip() {
    const opt = this.options;
    const isHorizontal = !!opt.horizontal;
    const labelTipOpt = opt.selectLabel;
    const { dataIndex, data, label } = this.defaultSelectInfo;
    let drawTip = false;

    if (dataIndex.length) {
      drawTip = true;

      const chartRect = this.chartRect;
      const labelOffset = this.labelOffset;
      const aPos = {
        x1: chartRect.x1 + labelOffset.left,
        x2: chartRect.x2 - labelOffset.right,
        y1: chartRect.y1 + labelOffset.top,
        y2: chartRect.y2 - labelOffset.bottom,
      };
      const labelAxes = isHorizontal ? this.axesY[0] : this.axesX[0];
      const valueAxes = isHorizontal ? this.axesX[0] : this.axesY[0];
      const valueAxesRange = isHorizontal ? this.axesRange.x[0] : this.axesRange.y[0];
      const valuePositionCalcFunction = isHorizontal ? Canvas.calculateX : Canvas.calculateY;
      const labelPositionCalcFunction = isHorizontal ? Canvas.calculateY : Canvas.calculateX;

      const chartWidth = chartRect.chartWidth - (labelOffset.left + labelOffset.right);
      const chartHeight = chartRect.chartHeight - (labelOffset.top + labelOffset.bottom);
      const valueSpace = isHorizontal ? chartWidth : chartHeight;
      const valueStartPoint = aPos[valueAxes.units.rectStart];
      let offset = this.options.type === 'bar' ? 4 : 6;
      offset *= isHorizontal ? 1 : -1;

      const seriesList = Object.keys(this.seriesList ?? {});
      const visibleSeries = seriesList.filter(sId => this.seriesList[sId].show);
      const isExistGrp = seriesList.some(sId => this.seriesList[sId].isExistGrp);
      const groups = this.data.groups?.[0] ?? [];

      let gp;
      let dp;
      let value;
      let labelStartPoint;
      let labelEndPoint;
      let labelGap;
      let graphX;
      let lineSeries;
      let sizeObj;

      if (labelAxes.labels) {
        labelStartPoint = aPos[labelAxes.units.rectStart];
        labelEndPoint = aPos[labelAxes.units.rectEnd];
        labelGap = (labelEndPoint - labelStartPoint) / labelAxes.labels.length;
      } else {
        graphX = this.axesSteps.x[0];
        lineSeries = seriesList.find(sId => this.seriesList[sId]?.type === 'line');
        sizeObj = this.seriesList[lineSeries].size;
      }

      data.forEach((selectedData, i) => {
        if (labelTipOpt.fixedPosTop) {
          value = valueAxesRange.max;
        } else if (isExistGrp) {
          const sumValue = visibleSeries.reduce((ac, sId) => (
            groups.includes(sId) ? ac + (selectedData[sId]?.value ?? selectedData[sId]) : ac), 0);
          const nonGroupValues = visibleSeries
            .filter(sId => !groups.includes(sId))
            .map(sId => selectedData[sId]?.value ?? selectedData[sId]);
          value = Math.max(...nonGroupValues, sumValue);
        } else if (visibleSeries.length) {
          const visibleValue = visibleSeries
            .map(sId => selectedData[sId]?.value ?? selectedData[sId]);
          value = Math.max(...visibleValue);
        } else {
          value = valueAxesRange.max;
        }

        if (labelAxes.labels) {
          const labelCenter = Math.round(labelStartPoint + (labelGap * dataIndex[i]));

          dp = labelCenter + (labelGap / 2);
        } else {
          dp = labelPositionCalcFunction(
            label[i],
            graphX.graphMin,
            graphX.graphMax,
            chartWidth - sizeObj.comboOffset,
            aPos.x1 + (sizeObj.comboOffset / 2),
          );
        }
        gp = valuePositionCalcFunction(
          value,
          valueAxesRange.min,
          valueAxesRange.max,
          valueSpace,
          valueStartPoint);
        gp += offset;

        this.showTip({
          context: this.bufferCtx,
          x: isHorizontal ? gp : dp,
          y: isHorizontal ? dp : gp,
          opt: labelTipOpt,
          isSamePos: false,
        });
      });
    }

    return drawTip;
  },
  /**
   * Calculate x, y position to draw text tip
   * @param {object} param     object for drawing text tip
   *
   * @returns {undefined}
   */
  drawTextTip(param) {
    const isHorizontal = !!this.options.horizontal;
    const ctx = this.bufferCtx;
    const { graphX, graphY, xArea, yArea, xsp, xep, ysp } = param;
    const { dp, value, text, opt, type, tipType, isSamePos, seriesOpt } = param;

    const arrowSize = 4;
    const borderRadius = 4;
    const {
      fontSize,
      fontFamily,
      fontWeight,
      height: maxTipHeight,
    } = opt.tipStyle;
    const textStyle = `normal normal ${fontWeight} ${fontSize}px ${fontFamily}`;

    let offset = 1;
    if (type === 'line') {
      offset += 6;
    } else if (type === 'scatter') {
      offset += seriesOpt?.pointSize;
    } else if (type === 'bar') {
      offset += 4;
    }

    let gp;
    let tdp = dp;

    if (opt.fixedPosTop) {
      if (isHorizontal) {
        gp = Canvas.calculateX(graphX.graphMax, graphX.graphMin, graphX.graphMax, xArea, xsp);
        gp += offset;
      } else {
        gp = Canvas.calculateY(graphY.graphMax, graphY.graphMin, graphY.graphMax, yArea, ysp);
        gp -= offset;
      }
    } else if (isHorizontal) {
      gp = Canvas.calculateX(value, graphX.graphMin, graphX.graphMax, xArea, xsp);
      gp += offset;
    } else {
      gp = Canvas.calculateY(value, graphY.graphMin, graphY.graphMax, yArea, ysp);
      gp -= offset;
    }

    let maxTipType = 'center';

    ctx.save();
    ctx.font = textStyle;
    const maxTipWidth = Math.round(Math.max(ctx.measureText(text).width + 12, 40));

    if (!isHorizontal) {
      if (dp + (maxTipWidth / 2) > xep - 10) {
        maxTipType = 'right';
        tdp -= (maxTipWidth / 2) - (arrowSize * 2);
      } else if (dp - (maxTipWidth / 2) < xsp + 10) {
        maxTipType = 'left';
        tdp += (maxTipWidth / 2) - (arrowSize * 2);
      }
    }

    ctx.restore();

    if (opt.showTextTip || tipType === 'max') {
      this.showTextTip({
        context: ctx,
        type: maxTipType,
        width: maxTipWidth,
        height: maxTipHeight,
        x: isHorizontal ? gp + (maxTipWidth / 2) : tdp,
        y: isHorizontal ? tdp + (maxTipHeight / 2) : gp,
        opt,
        arrowSize,
        borderRadius,
        text,
        textStyle,
      });
    }

    if (opt.showTip && tipType === 'sel') {
      this.showTip({
        context: ctx,
        x: isHorizontal ? gp : dp,
        y: isHorizontal ? dp : gp,
        opt,
        isSamePos,
      });
    }
  },

  /**
   * Draw text tip
   * @param {object} param     object for drawing text tip
   *
   * @returns {undefined}
   */
  showTextTip(param) {
    const isHorizontal = !!this.options.horizontal;
    const { type, width, height, x, y, arrowSize, borderRadius, text, opt, textStyle } = param;

    const ctx = param.context;

    const sx = x - (width / 2);
    const ex = x + (width / 2);
    const sy = y - height;
    const ey = y;

    ctx.save();
    ctx.font = textStyle;

    ctx.fillStyle = opt.tipBackground ?? opt.tipStyle.background;
    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.moveTo(sx + borderRadius, sy);
    ctx.quadraticCurveTo(sx, sy, sx, sy + borderRadius);

    if (isHorizontal) {
      ctx.lineTo(sx, sy + borderRadius + (arrowSize / 2));
      ctx.lineTo(sx - arrowSize, ey - (height / 2));
      ctx.lineTo(sx, ey - borderRadius - (arrowSize / 2));
    }

    ctx.lineTo(sx, ey - borderRadius);
    ctx.quadraticCurveTo(sx, ey, sx + borderRadius, ey);

    if (!isHorizontal) {
      if (type === 'left') {
        ctx.lineTo(sx + borderRadius + arrowSize, ey + arrowSize);
        ctx.lineTo(sx + borderRadius + (arrowSize * 2), ey);
      } else if (type === 'right') {
        ctx.lineTo(ex - (arrowSize * 2) - borderRadius, ey);
        ctx.lineTo(ex - arrowSize - borderRadius, ey + arrowSize);
      } else {
        ctx.lineTo(x - arrowSize, ey);
        ctx.lineTo(x, ey + arrowSize);
        ctx.lineTo(x + arrowSize, ey);
      }
    }

    ctx.lineTo(ex - borderRadius, ey);
    ctx.quadraticCurveTo(ex, ey, ex, ey - borderRadius);
    ctx.lineTo(ex, sy + borderRadius);
    ctx.quadraticCurveTo(ex, sy, ex - borderRadius, sy);
    ctx.lineTo(sx + borderRadius, sy);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.font = textStyle;
    ctx.fillStyle = opt.tipTextColor ?? opt.tipStyle.textColor;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillText(`${text}`, x, sy + (height / 2));
    ctx.restore();
  },

  /**
   * Draw arrow tip
   * @param {object} param     object for drawing arrow tip
   *
   * @returns {undefined}
   */
  showTip(param) {
    const isHorizontal = !!this.options.horizontal;
    const { x, y, opt, isSamePos } = param;
    const ctx = param.context;
    const offset = isSamePos ? 24 : 0;
    const cy = y - offset;
    ctx.save();

    ctx.fillStyle = opt.tipBackground ?? opt.tipStyle.background;
    ctx.beginPath();
    ctx.moveTo(x, cy);
    if (isHorizontal) {
      ctx.lineTo(x + 6, cy - 6);
      ctx.lineTo(x + 6, cy + 6);
    } else {
      ctx.lineTo(x + 6, cy - 6);
      ctx.lineTo(x - 6, cy - 6);
    }
    ctx.lineTo(x, cy);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  },
};

export default modules;
