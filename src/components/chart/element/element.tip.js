import { numberWithComma } from '@/common/utils';
import Canvas from '../helpers/helpers.canvas';

const modules = {
  /**
   * Draw TextTip with hitInfo
   * @param {object} [hitInfo=undefined]    mouse hit information
   *
   * @returns {undefined}
   */
  drawTip(hitInfo) {
    const opt = this.options;
    const isHorizontal = !!opt.horizontal;
    const maxTipOpt = opt.maxTip;
    const selectItemOpt = opt.selectItem;

    if (maxTipOpt.use || selectItemOpt.use) {
      const maxSID = this.minMax[isHorizontal ? 'x' : 'y'][0].maxSID;
      const selSID = hitInfo && hitInfo.sId ? hitInfo.sId : maxSID;

      const maxArgs = this.calculateTipInfo(this.seriesList[maxSID], 'max', null);
      const selArgs = this.calculateTipInfo(this.seriesList[selSID], 'sel', hitInfo);

      if (maxTipOpt.use && maxArgs) {
        this.drawTextTip({ opt: maxTipOpt, tipType: 'max', ...maxArgs });

        if (maxTipOpt.showIndicator) {
          this.drawFixedIndicator({ opt: maxTipOpt, ...maxArgs });
        }
      }

      if (selectItemOpt.use && selArgs) {
        let isSamePos = false;

        if (maxTipOpt.use && maxArgs && maxArgs.dp === selArgs.dp) {
          isSamePos = true;
        }

        if (selectItemOpt.showTextTip || selectItemOpt.showTip) {
          this.drawTextTip({ opt: selectItemOpt, tipType: 'sel', isSamePos, ...selArgs });
        }

        if (selectItemOpt.showIndicator) {
          this.drawFixedIndicator({ opt: selectItemOpt, ...selArgs });
        }
      }
    }
  },

  /**
   * Calculate tip size and contents
   * @param {object} series     series information (max series or selected series)
   * @param {string} tipType    tip type [sel = user select, max = max value]
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
    const seriesMaxY = series.minMax.maxY;

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

    let value = seriesMaxY;

    if (tipType === 'sel') {
      if (hitInfo && hitInfo.value !== null) {
        value = hitInfo.useStack ? hitInfo.acc : hitInfo.value;
        lastTip.value = value;
      } else if (lastTip.value !== null) {
        value = lastTip.value;
      } else if (lastTip.pos !== null) {
        const item = type === 'bar'
          ? this.getItemByLabelIndex(lastTip.pos) : this.getItemByLabel(lastTip.pos);

        value = item.useStack ? item.acc : item.value;
        lastTip.value = value;
      }
    }

    let cp;
    let halfBarSize;
    let dp;

    if (type === 'bar') {
      if (isHorizontal) {
        halfBarSize = Math.round(size.h / 2);
        cp = ysp - (size.cat * ldata) - size.cPad;
        dp = (cp - ((size.bar * size.ix) - (size.h + size.bPad))) + halfBarSize;
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
    }

    const sizeObj = { xArea, yArea, graphX, graphY, xsp, xep, ysp };
    const dataObj = { dp, value, text: numberWithComma(value), type };

    return { ...sizeObj, ...dataObj };
  },
  drawFixedIndicator(param) {
    const isHorizontal = !!this.options.horizontal;
    const ctx = this.bufferCtx;
    const { graphX, graphY, xArea, yArea, xsp, ysp, dp, type, value, opt } = param;
    const offset = type === 'bar' ? 0 : 3;

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

    if (dp === null || dp < xsp) {
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
   * Calculate x, y position to draw text tip
   * @param {object} param     object for drawing text tip
   *
   * @returns {undefined}
   */
  drawTextTip(param) {
    const isHorizontal = !!this.options.horizontal;
    const ctx = this.bufferCtx;
    const { graphX, graphY, xArea, yArea, xsp, xep, ysp } = param;
    const { dp, value, text, opt, type, tipType, isSamePos } = param;

    const arrowSize = 4;
    const maxTipHeight = 20;
    const borderRadius = 4;
    const offset = type === 'bar' ? 4 : 6;

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
    ctx.font = 'normal normal bold 14px Roboto';
    const maxTipWidth = Math.round(Math.max(ctx.measureText(text).width + 12, 40));

    if (dp + (maxTipWidth / 2) > xep - 10) {
      maxTipType = 'right';
      tdp -= (maxTipWidth / 2) - (arrowSize * 2);
    } else if (dp - (maxTipWidth / 2) < xsp + 10) {
      maxTipType = 'left';
      tdp += (maxTipWidth / 2) - (arrowSize * 2);
    }

    ctx.restore();

    if (opt.showTextTip || tipType === 'max') {
      this.showTextTip({
        context: ctx,
        type: maxTipType,
        width: maxTipWidth,
        height: maxTipHeight,
        x: tdp,
        y: gp,
        opt,
        arrowSize,
        borderRadius,
        text,
      });
    }

    if (opt.showTip && tipType === 'sel') {
      this.showTip({
        context: ctx,
        x: dp,
        y: gp,
        opt,
        arrowSize,
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
    const { type, width, height, x, y, arrowSize, borderRadius, text, opt } = param;
    const ctx = param.context;

    const sx = x - (width / 2);
    const ex = x + (width / 2);
    const sy = y - height;
    const ey = y;

    ctx.save();
    ctx.font = 'normal normal bold 14px Roboto';

    ctx.fillStyle = opt.tipBackground;
    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.moveTo(sx + borderRadius, sy);
    ctx.quadraticCurveTo(sx, sy, sx, sy + borderRadius);
    ctx.lineTo(sx, ey - borderRadius);
    ctx.quadraticCurveTo(sx, ey, sx + borderRadius, ey);

    if (type === 'left') {
      ctx.lineTo(sx + borderRadius + arrowSize, ey + arrowSize);
      ctx.lineTo(sx + borderRadius + (arrowSize * 2), ey);
      ctx.lineTo(ex - borderRadius, ey);
    } else if (type === 'right') {
      ctx.lineTo(ex - (arrowSize * 2) - borderRadius, ey);
      ctx.lineTo(ex - arrowSize - borderRadius, ey + arrowSize);
      ctx.lineTo(ex - borderRadius, ey);
    } else {
      ctx.lineTo(x - arrowSize, ey);
      ctx.lineTo(x, ey + arrowSize);
      ctx.lineTo(x + arrowSize, ey);
      ctx.lineTo(ex - borderRadius, ey);
    }

    ctx.quadraticCurveTo(ex, ey, ex, ey - borderRadius);
    ctx.lineTo(ex, sy + borderRadius);
    ctx.quadraticCurveTo(ex, sy, ex - borderRadius, sy);
    ctx.lineTo(sx + borderRadius, sy);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.font = 'normal normal bold 14px Roboto';
    ctx.fillStyle = opt.tipTextColor;
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
    const { x, y, opt, isSamePos } = param;
    const ctx = param.context;
    const offset = isSamePos ? 24 : 0;
    const cy = y - offset;
    ctx.save();

    ctx.fillStyle = opt.tipBackground;
    ctx.beginPath();
    ctx.moveTo(x, cy);
    ctx.lineTo(x + 6, cy - 6);
    ctx.lineTo(x - 6, cy - 6);
    ctx.lineTo(x, cy);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  },
};

export default modules;
