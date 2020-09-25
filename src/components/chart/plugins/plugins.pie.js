const modules = {
  pieDataSet: [],
  /**
   * Draw series data
   *
   * @returns {undefined}
   */
  drawPie() {
    const ctx = this.bufferCtx;
    const chartRect = this.chartRect;
    const pieDataSet = this.pieDataSet;

    let slice;
    let value;
    let sliceAngle;
    let startAngle = 1.5 * Math.PI;
    let endAngle;
    let series;

    const centerX = chartRect.chartWidth / 2;
    const centerY = chartRect.chartHeight / 2;

    const innerRadius = Math.min(centerX, centerY) * this.options.doughnutHoleSize;
    const outerRadius = Math.min(centerX, centerY);

    for (let ix = 0; ix < pieDataSet.length; ix++) {
      const pie = pieDataSet[ix];
      const radius = outerRadius - (((outerRadius - innerRadius) / pieDataSet.length) * ix);

      pie.or = radius;
      if (ix < pieDataSet.length - 1) {
        pie.ir = outerRadius - (((outerRadius - innerRadius) / pieDataSet.length) * (ix + 1));
      } else {
        pie.ir = 1;
      }

      if (pie.total) {
        for (let jx = 0; jx < pie.data.length; jx++) {
          slice = pie.data[jx];
          value = slice.value;
          sliceAngle = 2 * Math.PI * (value / pie.total);
          endAngle = startAngle + sliceAngle;

          slice.sa = startAngle;
          slice.ea = endAngle;
          series = this.seriesList[slice.id];

          if (value) {
            series.draw({
              ctx,
              centerX,
              centerY,
              radius,
              startAngle,
              endAngle,
            });
            startAngle += sliceAngle;
          }
        }
      }
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#fff';
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.closePath();
    }
  },

  /**
   * Draw series data
   *
   * @returns {undefined}
   */
  drawSunburst() {
    const ctx = this.bufferCtx;
    const chartRect = this.chartRect;
    const pieDataSet = this.pieDataSet;

    this.calculateAngle();

    let slice;
    let series;

    const centerX = chartRect.chartWidth / 2;
    const centerY = chartRect.chartHeight / 2;

    const innerRadius = Math.min(centerX, centerY) * this.options.doughnutHoleSize;
    const outerRadius = Math.min(centerX, centerY);

    for (let ix = 0; ix < pieDataSet.length; ix++) {
      const pie = pieDataSet[ix];
      const radius = outerRadius - (((outerRadius - innerRadius) / pieDataSet.length) * ix);

      pie.or = radius;
      if (ix < pieDataSet.length - 1) {
        pie.ir = outerRadius - (((outerRadius - innerRadius) / pieDataSet.length) * (ix + 1));
      } else {
        pie.ir = 1;
      }

      for (let jx = 0; jx < pie.data.length; jx++) {
        slice = pie.data[jx];

        if (slice.id === 'dummy') {
          ctx.save();
          ctx.globalCompositeOperation = 'destination-out';
          ctx.beginPath();
          ctx.fillStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#fff';
          ctx.moveTo(centerX, centerY);
          ctx.arc(centerX, centerY, radius, slice.sa, slice.ea);
          ctx.stroke();
          ctx.fill();
          ctx.closePath();
          ctx.restore();
        } else {
          series = this.seriesList[slice.id];

          if (slice.value) {
            series.draw({
              ctx,
              centerX,
              centerY,
              radius,
              startAngle: slice.sa,
              endAngle: slice.ea,
            });
          }
        }
      }

      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#fff';
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.closePath();
    }
  },

  /**
   * Draw doughnut hole
   *
   * @returns {undefined}
   */
  drawDoughnutHole() {
    const ctx = this.bufferCtx;

    const centerX = (this.chartRect.chartWidth / 2);
    const centerY = (this.chartRect.chartHeight / 2);

    const radius = Math.min(centerX, centerY) * this.options.doughnutHoleSize;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.fillStyle = '#fff';
    ctx.fillOpacity = 0;
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    ctx.closePath();
    ctx.restore();

    // inner stroke
    ctx.beginPath();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = this.options.border;
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.closePath();

    this.pieDataSet[this.pieDataSet.length - 1].ir = radius;
  },
};

export default modules;
