import _ from 'lodash';
import Core from '../core/core';
import Data from '../core/core.data';
import Axis from '../core/core.axis';
import Brush from '../core/core.brush';

export default class BaseChart {
  constructor(canvas, ctx, props) {
    // default chart info
    const defaultProps = {
      title: {
        text: '',
        style: '15px Arial',
        color: '#000000',
        align: 'center',
        showTitle: false,
      },
      xAxis: [{
        position: 'bottom',
        axisTitle: '',
        showAxisTitle: false,
        labelStyle: '12px Arial',
        axisTitleStyle: '12px Arial',
        unit: 'number',
      }],
      yAxis: [{
        position: 'left',
        axisTitle: '',
        showAxisTitle: false,
        labelStyle: '12px Arial',
        axisTitleStyle: '12px Arial',
        unit: 'number',
      }],
    };

    const defaultStyles = {
      width: '100%',
      height: '100%',
      background: '#FFFFFF',
    };

    this.canvas = canvas;
    this.ctx = ctx;

    this.props = _.merge({}, defaultProps, props.props);
    this.styles = _.merge({}, defaultStyles, props.styles);
    this.rawData = props.data;
  }

  init() {
    // set chart layout
    this.sizeInfo = Core.getChartSizeInfo(this.canvas, this.ctx, this.props);

    // set chart data
    Data.setData(this.rawData);
    Data.createDataStore();

    this.seriesInfo = Data.seriesInfo;
    this.dataSet = Data.dataSet;
    this.range = Data.getDataRange();

    this.render();
  }

  render() {
    this.renderChartBackground();
    if (this.props.title.showTitle) {
      this.renderTitle();
    }
    this.renderAxis();
    this.renderBrush();
  }

  renderChartBackground() {
    // chart area
    const style = this.styles;
    const padding = this.sizeInfo.padding;

    // temp code total area 확인용
    this.ctx.strokeStyle = '#FF0000';
    this.ctx.lineWidth = '1';
    this.ctx.rect(0, 0, this.sizeInfo.totalWidth, this.sizeInfo.totalHeight);
    this.ctx.stroke();

    if (style && style.background) {
      this.ctx.fillStyle = style.background;
      this.ctx.fillRect(padding.left, padding.top,
        this.sizeInfo.chartWidth, this.sizeInfo.chartHeight);
    }
  }

  renderTitle() {
    const titleProps = this.props.title;
    const padding = this.sizeInfo.padding;
    const titleText = titleProps.text;

    this.ctx.fillStyle = titleProps.color;
    this.ctx.font = titleProps.style;
    this.ctx.textAlign = titleProps.align;

    // Title
    this.ctx.fillText(titleText, (this.sizeInfo.chartWidth / 2), (padding.top / 2));
  }

  renderAxis() {
    this.xAxis = new Axis({
      type: 'x',
      size: this.sizeInfo,
      axisProps: this.props.xAxis,
      ctx: this.ctx,
      range: this.range,
    });

    this.yAxis = new Axis({
      type: 'y',
      size: this.sizeInfo,
      axisProps: this.props.yAxis,
      ctx: this.ctx,
      range: this.range,
    });

    this.xAxis.createAxis();
    this.yAxis.createAxis();
  }

  renderBrush() {
    const yRatio = this.sizeInfo.chartHeight / this.range.maxY;
    Brush.brushLine(this.dataSet, this.xAxis.xInc, yRatio, this.ctx, this.sizeInfo);
  }
}
