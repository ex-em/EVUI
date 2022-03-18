import { merge } from 'lodash-es';
import Canvas from '../helpers/helpers.canvas';
import Util from '../helpers/helpers.util';
import { COLOR, LINE_OPTION } from '../helpers/helpers.constant';

class HeatMap {
    constructor(sId, opt, sIdx) {
        const merged = merge({}, LINE_OPTION, opt);
        Object.keys(merged).forEach((key) => {
            this[key] = merged[key];
        });

        ['color', 'pointFill', 'fillColor'].forEach((colorProp) => {
            if (this[colorProp] === undefined) {
                this[colorProp] = COLOR[sIdx];
            }
        });

        const defaultColorOpt = {
            min: '#FFFFFF',
            max: '#0052FF',
            categoryCnt: 5,
        };

        this.colorAxis = this.createColorAxis(opt.colorOpt || defaultColorOpt);
        this.errorColor = opt.colorOpt.errorColor || 'rgb(255, 0, 0)';
        this.borderColor = opt.colorOpt.borderColor || 'rgb(255, 255, 255)';

        this.sId = sId;
        this.data = [];
        this.spaces = opt.spaces || { x: null, y: null };
        this.size = {
            w: 0,
            h: 0,
        };
        this.countOpt = {
            max: 0,
            interval: 0,
        };
        this.type = 'heatMap';
    }

    /**
     * create series color axis
     * @param colorOpt
     * @returns {*[]}
     */
    createColorAxis(colorOpt) {
        const colorAxis = [];
        const { min, max, categoryCnt } = colorOpt;

        const minColor = min.includes('#') ? Util.hexToRgb(min) : min;
        const maxColor = max.includes('#') ? Util.hexToRgb(max) : max;

        const [minR, minG, minB] = minColor.split(',');
        const [maxR, maxG, maxB] = maxColor.split(',');

        const unitR = Math.floor((minR - maxR) / (categoryCnt - 1));
        const unitG = Math.floor((minG - maxG) / (categoryCnt - 1));
        const unitB = Math.floor((minB - maxB) / (categoryCnt - 1));

        for (let ix = 0; ix < categoryCnt; ix++) {
            const r = +minR - (unitR * ix);
            const g = +minG - (unitG * ix);
            const b = +minB - (unitB * ix);

            colorAxis.push({
                id: `color#${ix}`,
                value: `rgb(${r},${g},${b})`,
            });
        }

        return colorAxis;
    }

    drawItem(ctx, xp, yp) {
        ctx.beginPath();
        ctx.strokeRect(xp - this.size.w, yp, this.size.w, this.size.h);
        ctx.fillRect(xp - this.size.w, yp, this.size.w, this.size.h);
        ctx.closePath();
        ctx.stroke();
    }

    draw(param) {
        if (!this.show) {
            return;
        }

        const { ctx, chartRect, labelOffset, axesSteps } = param;

        const minmaxX = axesSteps.x[this.xAxisIndex];
        const minmaxY = axesSteps.y[this.yAxisIndex];

        const xArea = chartRect.chartWidth - (labelOffset.left + labelOffset.right);
        const yArea = chartRect.chartHeight - (labelOffset.top + labelOffset.bottom);

        const xsp = chartRect.x1 + labelOffset.left;
        const ysp = chartRect.y2 - labelOffset.bottom;

        this.size.w = Math.round(xArea / (this.spaces.x || (minmaxX.graphMax - minmaxX.graphMin)));
        this.size.h = Math.round(yArea / (this.spaces.y || (minmaxY.graphMax - minmaxY.graphMin)));

        this.data.forEach((item) => {
            item.xp = Canvas.calculateX(item.x, minmaxX.graphMin, minmaxX.graphMax, xArea, xsp);
            item.yp = Canvas.calculateY(item.y, minmaxY.graphMin, minmaxY.graphMax, yArea, ysp);

            const { xp, yp, o: count } = item;
            const opacity = item.state === 'downplay' ? 0.1 : 1;

           if (xp !== null && yp !== null) {
               let colorIndex = count < 0 ? count : Math.floor(count / this.countOpt.interval);
               colorIndex = colorIndex >= this.colorAxis.length
                   ? this.colorAxis.length - 1
                   : colorIndex;
               item.dataColor = count < 0 ? this.errorColor : this.colorAxis[colorIndex].value;
               item.cId = colorIndex < 0 ? 'color#error' : this.colorAxis[colorIndex].id;
               ctx.strokeStyle = Util.colorStringToRgba(this.borderColor, opacity);
               ctx.fillStyle = Util.colorStringToRgba(item.dataColor, opacity);
               this.drawItem(ctx, xp, yp);
           }
        });
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
        return gdata.filter(seriesData =>
            (xsp - 1 <= seriesData.xp && seriesData.xp <= xep + 1
                && ysp - 1 <= seriesData.yp && seriesData.yp <= yep + 1));
    }

    /**
     * Draw item highlight
     * @param {object}   item       object for drawing series data
     * @param {object}   context    canvas context
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
            const color = gdata.dataColor;
            ctx.strokeStyle = Util.colorStringToRgba(color, 1);
            ctx.fillStyle = Util.colorStringToRgba(color, this.highlight.maxShadowOpacity);
            this.drawItem(ctx, x, y);
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
        const item = { data: null, hit: false, color: null };
        const wSize = this.size.w;
        const hSize = this.size.h;
        const gdata = this.data;

        const foundItem = gdata.find((data) => {
            const x = data.xp;
            const y = data.yp;

            return (x - wSize <= xp)
                && (xp <= x)
                && (y <= yp)
                && (yp <= y + hSize);
        });

        if (foundItem) {
            item.data = foundItem;
            item.color = foundItem.dataColor;
            item.hit = true;
        }

        return item;
    }
}

export default HeatMap;
