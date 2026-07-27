// Gráfico de línea simple sobre <canvas>, sin dependencias externas.
export function drawLineChart(canvas, points, { color = '#ff8533', label = '' } = {}) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    if (points.length === 0) return;

    const padding = { top: 16, right: 16, bottom: 24, left: 40 };
    const plotW = width - padding.left - padding.right;
    const plotH = height - padding.top - padding.bottom;

    const values = points.map(p => p.value);
    let min = Math.min(...values);
    let max = Math.max(...values);
    if (min === max) { min -= 1; max += 1; }
    const pad = (max - min) * 0.1;
    min -= pad; max += pad;

    const x = i => padding.left + (points.length === 1 ? plotW / 2 : (i / (points.length - 1)) * plotW);
    const y = v => padding.top + plotH - ((v - min) / (max - min)) * plotH;

    // Ejes
    ctx.strokeStyle = 'rgba(128,128,128,0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + plotH);
    ctx.lineTo(padding.left + plotW, padding.top + plotH);
    ctx.stroke();

    // Etiquetas min/max
    ctx.fillStyle = 'rgba(128,128,128,0.8)';
    ctx.font = '11px -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(max.toFixed(1), padding.left - 6, padding.top + 4);
    ctx.fillText(min.toFixed(1), padding.left - 6, padding.top + plotH);

    // Línea
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    points.forEach((p, i) => {
        const px = x(i), py = y(p.value);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    });
    ctx.stroke();

    // Puntos
    ctx.fillStyle = color;
    points.forEach((p, i) => {
        ctx.beginPath();
        ctx.arc(x(i), y(p.value), 3, 0, Math.PI * 2);
        ctx.fill();
    });
}
