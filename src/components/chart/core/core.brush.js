export default {
  brushLine(dataSet, xInc, yRatio, context, sizeInfo) {
    let prevX = 0;
    let prevY = 0;
    let ptX;
    let pt;
    const data = dataSet.txn_elapse;
    const padding = sizeInfo.padding;

    const ctx = context;
    // 이 부분은 수정 예정입니다.
    ctx.translate(0, -440);
    for (let ix = 0, ixLen = data.length; ix < ixLen; ix++) {
      pt = data[ix];
      let ptY = (pt.y + padding.bottom) * yRatio;

      if (ptY < padding.top) {
        ptY = padding.top;
      }

      ptX = (ix * xInc) + padding.left;
      if (ix > 0) {
        ctx.lineWidth = '2';
        ctx.beginPath();
        ctx.moveTo(ptX, ptY);
        ctx.lineTo(prevX, prevY);
        ctx.stroke();
        ctx.closePath();
      }

      prevX = ptX;
      prevY = ptY;
    }
  },
};
