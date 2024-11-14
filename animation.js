function startSpectreAnimation() {
    const ctx = elements.canvas.getContext('2d');
    elements.canvas.width = elements.canvas.offsetWidth;
    elements.canvas.height = elements.canvas.offsetHeight;
    const centerX = elements.canvas.width / 2;
    const centerY = elements.canvas.height / 2;
    const maxRadius = Math.min(centerX, centerY) - 5;
    let hue = 0;

    function animate() {
        ctx.clearRect(0, 0, elements.canvas.width, elements.canvas.height);
        
        for (let i = 0; i < 360; i += 2) {
            const angle = (i * Math.PI) / 180;
            const amplitude = maxRadius * (0.5 + Math.random() * 0.5);
            
            const x = centerX + amplitude * Math.cos(angle);
            const y = centerY + amplitude * Math.sin(angle);
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(x, y);
            ctx.strokeStyle = `hsla(${(hue + i) % 360}, 100%, 50%, 0.5)`;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        
        hue = (hue + 1) % 360;
        state.animationFrameId = requestAnimationFrame(animate);
    }

    animate();
}

function stopSpectreAnimation() {
    if (state.animationFrameId) {
        cancelAnimationFrame(state.animationFrameId);
    }
    const ctx = elements.canvas.getContext('2d');
    ctx.clearRect(0, 0, elements.canvas.width, elements.canvas.height);
}