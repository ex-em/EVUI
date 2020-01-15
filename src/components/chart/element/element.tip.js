import { numberWithComma } from '@/common/utils';
import Canvas from '../helpers/helpers.canvas';

const modules = {
  createTipInfo(hitInfo) {
    const opt = this.options;
    const lastTip = this.lastTip;
    const maxTipOpt = opt.maxTip;
    const indicatorOpt = opt.fixedIndicator;
    const isHorizontal = !!opt.horizontal;

    if (indicatorOpt.use || maxTipOpt.use) {
      // size
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

      // series
      const maxSID = hitInfo && hitInfo.sId ? hitInfo.sId : this.minMax[isHorizontal ? 'x' : 'y'][0].maxSID;
      const series = this.seriesList[maxSID];

      if (!series) {
        return;
      }

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
      let d;

      // domain pos
      if (type === 'bar') {
        if (isHorizontal) {
          halfBarSize = Math.round(size.h / 2);
          cp = ysp - (size.cat * maxDomainIndex) - size.cPad;
          d = (cp - ((size.bar * size.ix) - (size.h + size.bPad))) + halfBarSize;
        } else {
          halfBarSize = Math.round(size.w / 2);
          cp = xsp + (size.cat * maxDomainIndex) + size.cPad;
          d = cp + ((size.bar * size.ix) - (size.w + size.bPad)) + halfBarSize;
        }
      } else if (type === 'line') {
        d = Canvas.calculateX(
          maxDomain,
          graphX.graphMin,
          graphX.graphMax,
          xArea - size.comboOffset,
          xsp + (size.comboOffset / 2),
        );
      }

      if (hitInfo && hitInfo.pos !== null) {
        d = type === 'bar' ? hitInfo.pos + halfBarSize : hitInfo.pos;
        lastTip.pos = d;
      } else if (lastTip.pos !== null) {
        d = lastTip.pos;
      }

      // graph value
      let maxTipText;
      let maxValue;

      if (hitInfo && hitInfo.value !== null) {
        maxValue = hitInfo.useStack ? hitInfo.acc : hitInfo.value;
        maxTipText = numberWithComma(maxValue);

        if (maxTipText === false) {
          return;
        }

        lastTip.value = maxTipText;
      } else if (lastTip.value !== null) {
        maxTipText = lastTip.value;
        maxValue = +((maxTipText).replace(/,/gi, ''));
      } else {
        maxTipText = numberWithComma(seriesMaxY);
        maxValue = seriesMaxY;
      }

      const args = { graphX, graphY, maxX, maxY, xArea, yArea, xsp, ysp, d, maxValue };

      if (indicatorOpt.use) {
        this.drawFixedIndicator({ opt: indicatorOpt, type, ...args });
      }

      if (maxTipOpt.use) {
        this.drawMaxTip({ opt: maxTipOpt, maxTipText, xep, type, ...args });
      }
    }
  },
  drawFixedIndicator(param) {
    const isHorizontal = !!this.options.horizontal;
    const ctx = this.bufferCtx;
    const { graphX, graphY, maxX, maxY, xArea, yArea, xsp, ysp, d, type, maxValue, opt } = param;
    const offset = type === 'bar' ? 0 : 3;

    let g;

    if (opt.fixedPosTop) {
      if (isHorizontal) {
        g = Canvas.calculateX(maxX, graphX.graphMin, graphX.graphMax, xArea, xsp);
      } else {
        g = Canvas.calculateY(maxY, graphY.graphMin, graphY.graphMax, yArea, ysp);
        g -= offset;
      }
    } else if (isHorizontal) {
      g = Canvas.calculateX(maxValue, graphX.graphMin, graphX.graphMax, xArea, xsp);
    } else {
      g = Canvas.calculateY(maxValue, graphY.graphMin, graphY.graphMax, yArea, ysp);
      g -= offset;
    }

    ctx.beginPath();
    ctx.save();
    ctx.strokeStyle = opt.color;
    ctx.lineWidth = 2;

    if (isHorizontal) {
      ctx.moveTo(xsp, d);
      ctx.lineTo(g, d);
    } else {
      ctx.moveTo(d, ysp);
      ctx.lineTo(d, g);
    }

    ctx.stroke();
    ctx.restore();
    ctx.closePath();
  },
  drawMaxTip(param) {
    const isHorizontal = !!this.options.horizontal;
    const ctx = this.bufferCtx;
    const { graphX, graphY, maxX, maxY, xArea, yArea, xsp, xep, ysp } = param;
    const { maxValue, maxTipText, opt, type } = param;

    const arrowSize = 4;
    const maxTipHeight = 20;
    const borderRadius = 4;
    const offset = type === 'bar' ? 4 : 6;

    let d = param.d;
    let g;

    if (opt.fixedPosTop) {
      if (isHorizontal) {
        g = Canvas.calculateX(maxX, graphX.graphMin, graphX.graphMax, xArea, xsp);
        g += offset;
      } else {
        g = Canvas.calculateY(maxY, graphY.graphMin, graphY.graphMax, yArea, ysp);
        g -= offset;
      }
    } else if (isHorizontal) {
      g = Canvas.calculateX(maxValue, graphX.graphMin, graphX.graphMax, xArea, xsp);
      g += offset;
    } else {
      g = Canvas.calculateY(maxValue, graphY.graphMin, graphY.graphMax, yArea, ysp);
      g -= offset;
    }

    let maxTipType = 'center';

    ctx.save();
    ctx.font = 'bold 14px Roboto';
    const maxTipWidth = Math.round(Math.max(ctx.measureText(maxTipText).width + 12, 40));

    if (d + (maxTipWidth / 2) > xep - 10) {
      maxTipType = 'right';
      d -= (maxTipWidth / 2) - (arrowSize * 2);
    } else if (d - (maxTipWidth / 2) < xsp + 10) {
      maxTipType = 'left';
      d += (maxTipWidth / 2) - (arrowSize * 2);
    }

    ctx.restore();
    this.showMaxTip({
      context: ctx,
      type: maxTipType,
      width: maxTipWidth,
      height: maxTipHeight,
      x: d,
      y: g,
      opt,
      arrowSize,
      borderRadius,
      maxTipText,
    });
  },

  showMaxTip(param) {
    const { type, width, height, x, y, arrowSize, borderRadius, maxTipText, opt } = param;
    const ctx = param.context;

    const sx = x - (width / 2);
    const ex = x + (width / 2);
    const sy = y - height;
    const ey = y;

    ctx.save();
    ctx.font = 'bold 14px Roboto';

    ctx.fillStyle = opt.background;
    ctx.shadowColor = opt.background;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 4;

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
    ctx.fillStyle = opt.color;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillText(`${maxTipText}`, x, sy + (height / 2));
    ctx.restore();
  },
};

export default modules;
