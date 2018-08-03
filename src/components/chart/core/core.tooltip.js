export default class ChartTooltip {
  constructor(props) {
    Object.keys(props).forEach((key) => {
      this[key] = props[key];
    });

    this.tooltipDOM = document.createElement('div');
    this.tooltipDOM.className = 'evui-chart-tooltip';
    this.tooltipDOM.style.display = 'none';

    this.titleDOM = document.createElement('div');
    this.titleDOM.className = 'evui-chart-tooltip-title';

    this.ulDOM = document.createElement('ul');
    this.ulDOM.className = 'evui-chart-tooltip-ul';

    this.tooltipDOM.appendChild(this.titleDOM);
    this.tooltipDOM.appendChild(this.ulDOM);
  }

  init() {
    this.createTooltip();
    document.body.appendChild(this.tooltipDOM);
  }

  createTooltip() {
    const series = this.seriesList;

    let liDOM;
    let colorDOM;
    let nameDOM;
    let colonDOM;
    let valueDOM;

    for (let ix = 0, ixLen = series.length; ix < ixLen; ix++) {
      liDOM = document.createElement('li');
      liDOM.className = 'evui-chart-tooltip-li';
      liDOM.setAttribute('data-series-id', series[ix].id);

      colorDOM = document.createElement('span');
      colorDOM.className = 'evui-chart-tooltip-color';
      colorDOM.style.backgroundColor = series[ix].color;

      nameDOM = document.createElement('span');
      nameDOM.className = 'evui-chart-tooltip-name';
      nameDOM.textContent = series[ix].name;

      colonDOM = document.createElement('span');
      colonDOM.className = 'evui-chart-tooltip-colon';
      colonDOM.textContent = ' : ';
      colonDOM.style.color = series[ix].color;

      valueDOM = document.createElement('span');
      valueDOM.className = 'evui-chart-tooltip-value';
      valueDOM.textContent = series[ix].oData[5].y;

      liDOM.appendChild(colorDOM);
      liDOM.appendChild(nameDOM);
      liDOM.appendChild(colonDOM);
      liDOM.appendChild(valueDOM);
      this.ulDOM.appendChild(liDOM);
    }
  }

  showTooltip(offset, e, dataIndex) {
    if (dataIndex === null) {
      this.tooltipDOM.style.display = 'none';
      return;
    }

    const offsetX = offset[0];
    const offsetY = offset[1];

    const mouseX = e.x;
    const mouseY = e.y;
    const graphPos = this.getChartGraphPos();
    const seriesList = this.seriesList;

    let series;

    for (let ix = 0, ixLen = seriesList.length; ix < ixLen; ix++) {
      if (seriesList[ix].show) {
        series = seriesList[ix];
        break;
      }
    }

    if ((offsetX >= (graphPos.x1 - 1) && offsetX <= (graphPos.x2))
      && (offsetY >= (graphPos.y1 - 1) && offsetY <= (graphPos.y2 + 1))) {
      const listDOM = this.ulDOM.children;
      let valueDOM;

      this.titleDOM.textContent = series ? series.cData[dataIndex].x : '';

      for (let ix = 0, ixLen = listDOM.length; ix < ixLen; ix++) {
        if (seriesList[ix].show) {
          listDOM[ix].style.display = 'block';
          valueDOM = listDOM[ix].children[3];
          valueDOM.textContent = seriesList[ix].oData[dataIndex].y;
        } else {
          listDOM[ix].style.display = 'none';
        }
      }

      this.tooltipDOM.style.top = `${mouseY + 10}px`;
      this.tooltipDOM.style.left = `${mouseX + 15}px`;

      this.tooltipDOM.style.display = 'block';
    } else {
      this.tooltipDOM.style.display = 'none';
    }
  }
}
