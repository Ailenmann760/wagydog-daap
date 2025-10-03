export const initStarfields = () => {
    createStarfield('starfield');
    createStarfield('starfield2');
};

function createStarfield(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.warn(`Canvas ${canvasId} not found`);
        return;
    }
    const ctx = canvas.getContext('2d');
    let stars = [];
    let numStars = 250;

    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        stars = [];
        for (let i = 0; i < numStars; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 1.5 + 0.5,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3
            });
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#fff";
        for (let i = 0, x = stars.length; i < x; i++) {
            let s = stars[i];
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.radius, 0, 2 * Math.PI);
            ctx.fill();
            s.x += s.vx;
            s.y += s.vy;
            if (s.x < 0 || s.x > canvas.width) s.vx = -s.vx;
            if (s.y < 0 || s.y > canvas.height) s.vy = -s.vy;
        }
        requestAnimationFrame(animate);
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animate();
    console.log(`Starfield ${canvasId} initialized`);
        }
