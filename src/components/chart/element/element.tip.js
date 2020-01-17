import { numberWithComma } from '@/common/utils';
import Canvas from '../helpers/helpers.canvas';

const modules = {
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

      if (selectItemOpt.use && selArgs) {
        if (selectItemOpt.showTextTip || selectItemOpt.showTip) {
          this.drawTextTip({ opt: selectItemOpt, tipType: 'sel', ...selArgs });
        }

        if (selectItemOpt.showIndicator) {
          this.drawFixedIndicator({ opt: selectItemOpt, ...selArgs });
        }
      }

      if (maxTipOpt.use && maxArgs) {
        this.drawTextTip({ opt: maxTipOpt, tipType: 'max', ...maxArgs });

        if (maxTipOpt.showIndicator) {
          this.drawFixedIndicator({ opt: maxTipOpt, ...maxArgs });
        }
     }
    }
  },
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
    const maxX = this.minMax.x[series.xAxisIndex].max;
    const maxY = this.minMax.y[series.yAxisIndex].max;

    const xsp = graphPos.x1;
    const xep = graphPos.x2;
    const ysp = graphPos.y2;

    const { type, size } = series;
    const { maxDomain, maxDomainIndex } = series.minMax;
    const seriesMaxY = series.minMax.maxY;

    // pos calculate
    let cp;
    let halfBarSize;
    let dp;

    // domain pos
    if (type === 'bar') {
      if (isHorizontal) {
        halfBarSize = Math.round(size.h / 2);
        cp = ysp - (size.cat * maxDomainIndex) - size.cPad;
        dp = (cp - ((size.bar * size.ix) - (size.h + size.bPad))) + halfBarSize;
      } else {
        halfBarSize = Math.round(size.w / 2);
        cp = xsp + (size.cat * maxDomainIndex) + size.cPad;
        dp = cp + ((size.bar * size.ix) - (size.w + size.bPad)) + halfBarSize;
      }
    } else if (type === 'line') {
      dp = Canvas.calculateX(
        maxDomain,
        graphX.graphMin,
        graphX.graphMax,
        xArea - size.comboOffset,
        xsp + (size.comboOffset / 2),
      );
    }

    if (tipType === 'sel') {
      if (hitInfo && hitInfo.pos !== null) {
        dp = type === 'bar' ? hitInfo.pos + halfBarSize : hitInfo.pos;
        lastTip.pos = dp;
      } else if (lastTip.pos !== null) {
        dp = lastTip.pos;
      }
    }

    // graph value
    let text;
    let value;

    text = numberWithComma(seriesMaxY);
    value = seriesMaxY;

    if (tipType === 'sel') {
      if (hitInfo && hitInfo.value !== null) {
        value = hitInfo.useStack ? hitInfo.acc : hitInfo.value;
        text = numberWithComma(value);
        lastTip.value = text;
      } else if (lastTip.value !== null) {
        text = lastTip.value;
        value = +((text).replace(/,/gi, ''));
      }
    }

    const sizeObj = { xArea, yArea, graphX, graphY, xsp, xep, ysp };
    const dataObj = { dp, value, text, maxX, maxY, type };

    return { ...sizeObj, ...dataObj };
  },
  drawFixedIndicator(param) {
    const isHorizontal = !!this.options.horizontal;
    const ctx = this.bufferCtx;
    const { graphX, graphY, maxX, maxY, xArea, yArea, xsp, ysp, dp, type, value, opt } = param;
    const offset = type === 'bar' ? 0 : 3;

    let gp;

    if (opt.fixedPosTop) {
      if (isHorizontal) {
        gp = Canvas.calculateX(maxX, graphX.graphMin, graphX.graphMax, xArea, xsp);
      } else {
        gp = Canvas.calculateY(maxY, graphY.graphMin, graphY.graphMax, yArea, ysp);
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
  drawTextTip(param) {
    const isHorizontal = !!this.options.horizontal;
    const ctx = this.bufferCtx;
    const { graphX, graphY, maxX, maxY, xArea, yArea, xsp, xep, ysp } = param;
    const { dp, value, text, opt, type, tipType } = param;

    const arrowSize = 4;
    const maxTipHeight = 20;
    const borderRadius = 4;
    const offset = type === 'bar' ? 4 : 6;

    let gp;
    let tdp = dp;

    if (opt.fixedPosTop) {
      if (isHorizontal) {
        gp = Canvas.calculateX(maxX, graphX.graphMin, graphX.graphMax, xArea, xsp);
        gp += offset;
      } else {
        gp = Canvas.calculateY(maxY, graphY.graphMin, graphY.graphMax, yArea, ysp);
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
    ctx.font = 'bold 14px Roboto';
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
      });
    }
  },
  showTextTip(param) {
    const { type, width, height, x, y, arrowSize, borderRadius, text, opt } = param;
    const ctx = param.context;

    const sx = x - (width / 2);
    const ex = x + (width / 2);
    const sy = y - height;
    const ey = y;

    ctx.save();
    ctx.font = 'bold 14px Roboto';

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
    ctx.font = 'bold 14px Roboto';
    ctx.fillStyle = opt.tipTextColor;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillText(`${text}`, x, sy + (height / 2));
    ctx.restore();
  },
  showTip(param) {
    const { x, y, opt } = param;
    const ctx = param.context;
    ctx.save();

    ctx.fillStyle = opt.tipBackground;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 6, y - 6);
    ctx.lineTo(x - 6, y - 6);
    ctx.lineTo(x, y);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  },
};

export default modules;
