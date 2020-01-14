import { numberWithComma } from '@/common/utils';
import Canvas from '../helpers/helpers.canvas';

const modules = {
  createTipInfo(hitInfo) {
    const opt = this.options;
    const maxTipOpt = opt.maxTip;
    const indicatorOpt = opt.fixedIndicator;
    const isHorizontal = !!opt.horizontal;

    if (indicatorOpt.use || maxTipOpt.use) {
      const chartRect = this.chartRect;
      const labelOffset = this.labelOffset;
      const graphPos = {
        x1: chartRect.x1 + labelOffset.left,
        x2: chartRect.x2 - labelOffset.right,
        y1: chartRect.y1 + labelOffset.top,
        y2: chartRect.y2 - labelOffset.bottom,
      };
      let barAreaByCombo = 0;

      const maxSID = this.minMax[isHorizontal ? 'x' : 'y'][0].maxSID;
      const series = this.seriesList[maxSID];

      if (!series) {
        return;
      }

      const type = series.type;
      const size = type === 'bar' ? series.size : null;
      const maxDomain = series.minMax.maxDomain;
      const maxY = series.minMax.maxY;
      const minmaxX = this.axesSteps.x[0];
      const minmaxY = this.axesSteps.y[0];


      const yArea = chartRect.chartHeight - (labelOffset.top + labelOffset.bottom);
      let xArea = chartRect.chartWidth - (labelOffset.left + labelOffset.right);

      if (opt.combo) {
        barAreaByCombo = xArea / (series.data.length || 1);
        xArea -= barAreaByCombo;
      }

      const xsp = graphPos.x1 + (barAreaByCombo / 2);
      const ysp = graphPos.y2;

      if (indicatorOpt.use) {
        const args = { hitInfo, maxDomain, graphPos, opt: indicatorOpt };
        let calculateFn;
        let minmaxAxis;
        let area;
        let sp;

        if (isHorizontal) {
          calculateFn = Canvas.calculateY;
          minmaxAxis = minmaxY;
          area = yArea;
          sp = ysp;
        } else {
          calculateFn = Canvas.calculateX;
          minmaxAxis = minmaxX;
          area = xArea;
          sp = xsp;
        }

        this.drawFixedIndicator({ calculateFn, minmaxAxis, area, sp, ...args });
      }

      if (maxTipOpt.use) {
        this.drawMaxTip({
          hitInfo,
          opt: maxTipOpt,
          maxDomain,
          maxY,
          minmaxX,
          minmaxY,
          graphPos,
          xArea,
          yArea,
          xsp,
          ysp,
          size,
        });
      }
    }
  },
  drawFixedIndicator(param) {
    const { hitInfo, maxDomain, calculateFn, minmaxAxis, area, sp, graphPos, opt } = param;
    const isHorizontal = !!this.options.horizontal;
    const ctx = this.bufferCtx;
    const lastTip = this.lastTip;

    let pos;

    if (hitInfo && hitInfo.pos !== null) {
      pos = hitInfo.pos;
      lastTip.pos = pos;
    } else if (lastTip.pos !== null) {
      pos = lastTip.pos;
    } else {
      pos = calculateFn(maxDomain, minmaxAxis.graphMin, minmaxAxis.graphMax, area, sp);
    }

    ctx.beginPath();
    ctx.save();
    ctx.strokeStyle = opt.color;
    ctx.lineWidth = 2;

    if (isHorizontal) {
      ctx.moveTo(graphPos.x1, pos);
      ctx.lineTo(graphPos.x2, pos);
    } else {
      ctx.moveTo(pos, graphPos.y1);
      ctx.lineTo(pos, graphPos.y2);
    }

    ctx.stroke();
    ctx.restore();
    ctx.closePath();
  },
  drawMaxTip(param) {
    const ctx = this.bufferCtx;
    const lastTip = this.lastTip;
    const {
      hitInfo,
      maxDomain,
      maxY,
      minmaxX,
      minmaxY,
      graphPos,
      opt,
      xArea,
      yArea,
      xsp,
      ysp,
    } = param;

    let maxValue;

    if (hitInfo && hitInfo.value !== null) {
      maxValue = numberWithComma(hitInfo.value);
      lastTip.value = maxValue;
    } else if (lastTip.value !== null) {
      maxValue = lastTip.value;
    } else {
      maxValue = numberWithComma(maxY);
    }

    if (maxValue === false) {
      return;
    }

    const arrowSize = 4;
    const maxTipHeight = 20;
    const borderRadius = 4;
    const yOffset = 8;

    let maxTipType = 'center';
    let x;

    if (hitInfo && hitInfo.pos !== null) {
      x = hitInfo.pos;
      lastTip.pos = x;
    } else if (lastTip.pos !== null) {
      x = lastTip.pos;
    } else {
      x = Canvas.calculateX(maxDomain, minmaxX.graphMin, minmaxX.graphMax, xArea, xsp);
    }

    const y = Canvas.calculateY(maxY, minmaxY.graphMin, minmaxY.graphMax, yArea, ysp)
      - yOffset;

    ctx.save();
    ctx.font = 'bold 14px Roboto';
    const maxTipWidth = Math.round(Math.max(ctx.measureText(maxValue).width + 12, 40));

    if (x + (maxTipWidth / 2) > graphPos.x2 - 10) {
      maxTipType = 'right';
      x -= (maxTipWidth / 2) - (arrowSize * 2);
    } else if (x - (maxTipWidth / 2) < graphPos.x1 + 10) {
      maxTipType = 'left';
      x += (maxTipWidth / 2) - (arrowSize * 2);
    }

    ctx.restore();
    this.showMaxTip({
      context: ctx,
      type: maxTipType,
      width: maxTipWidth,
      height: maxTipHeight,
      opt,
      x,
      y,
      arrowSize,
      borderRadius,
      maxValue,
    });
  },

  showMaxTip(param) {
    const { type, width, height, x, y, arrowSize, borderRadius, maxValue, opt } = param;
    const ctx = param.context;

    const sx = x - (width / 2);
    const ex = x + (width / 2);
    const sy = y - height;
    const ey = y;

    ctx.save();
    ctx.font = 'bold 14px Roboto';

    ctx.fillStyle = opt.background;
    ctx.shadowColor = opt.color;
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
    ctx.fillText(`${maxValue}`, x, sy + (height / 2));
    ctx.restore();
  },
};

export default modules;
