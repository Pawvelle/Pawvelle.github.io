/* Lightweight animated voxel particles, aligned to the cover's two hands. */
(function setupMineSymphony() {
    const cover = document.getElementById("mineSymphonyCover");
    const canvas = cover?.querySelector("canvas");
    const context = canvas?.getContext("2d");
    const button = cover?.querySelector("button");
    if (!context || !button) return;

    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    let paused = reducedMotion.matches;
    let visible = false;
    let frame = 0;
    let previous = 0;
    let time = 0;
    let width = 0;
    let height = 0;
    let leftFloat = 0;
    let rightFloat = 0;
    const image = cover.querySelector('img');
    const TAU = Math.PI * 2;
    const wrap = value => ((value % 1) + 1) % 1;
    const random = (min, max) => min + Math.random() * (max - min);
    const streams = Array.from({ length: 250 }, (_, i) => ({
        lane: i % 7, phase: Math.random(), speed: random(.04, .078),
        size: random(1, 2.6), direction: i % 3 === 0 ? -1 : 1,
    }));
    const spray = Array.from({ length: 170 }, () => ({
        phase: Math.random(), lane: Math.floor(random(0, 7)),
        offset: random(-1, 1), angle: random(0, TAU), speed: random(.035, .065),
        size: random(.45, 1.2),
    }));
    // Three depths, evenly scattered with a few brighter foreground stars.
    const dust = Array.from({ length: 540 }, (_, i) => {
        const depth = i % 12 === 0 ? 2 : i % 3 === 0 ? 1 : 0;
        return {
            x: (i % 30 + Math.random()) / 30,
            y: (Math.floor(i / 30) + Math.random()) / 18,
            phase: random(0, TAU), twinkle: random(.35, .85), depth,
            speed: random(.001, .003) * (depth + 1),
            size: depth === 2 ? random(2, 3.1) : depth === 1 ? random(1, 1.6) : random(.55, 1.05),
        };
    });
    const bloom = document.createElement('canvas');
    bloom.width = bloom.height = 48;
    const bloomContext = bloom.getContext('2d');
    const gradient = bloomContext.createRadialGradient(24, 24, 0, 24, 24, 24);
    gradient.addColorStop(0, 'rgba(255,255,255,.8)');
    gradient.addColorStop(.15, 'rgba(255,255,255,.28)');
    gradient.addColorStop(.45, 'rgba(255,255,255,.045)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    bloomContext.fillStyle = gradient;
    bloomContext.fillRect(0, 0, 48, 48);

    function point(t, lane) {
        const u = 1 - t;
        const spread = (lane - 3) * .026;
        const envelope = Math.sin(Math.PI * t);
        // Small travelling ripples break up the formerly perfectly smooth strands.
        const ripple = Math.sin(t*23 - time*1.1 + lane*.8)*.0038
            + Math.sin(t*43 + time*.6 + lane)*.0014;
        return {
            x: (u*u*u*.273 + 3*u*u*t*.43 + 3*u*t*t*.59 + t*t*t*.742) * width,
            // A lower, broader wave with gently tapered strands at both hands.
            y: (u*u*u*.38 + 3*u*u*t*.42 + 3*u*t*t*.015
                + t*t*t*.41 + 3*u*t*spread*envelope + ripple*envelope) * height
                + u*u*u*leftFloat + t*t*t*rightFloat,
        };
    }

    function drawCharacters() {
        if (!image.complete || !image.naturalWidth) return;
        const fit = Math.max(width/image.naturalWidth, height/image.naturalHeight);
        const ox = (width-image.naturalWidth*fit)/2;
        const oy = (height-image.naturalHeight*fit)/2;
        // Each character floats with its island; redraw the original side bands
        // before particles so neither the static silhouette nor a black trail shows.
        const bands = [
            { start: 0, end: .276, offset: leftFloat },
            { start: .735, end: 1, offset: rightFloat },
        ];
        context.globalAlpha = 1;
        for (const band of bands) {
            const sx = Math.round(image.naturalWidth*band.start);
            const sw = Math.round(image.naturalWidth*band.end)-sx;
            const dx = ox+sx*fit;
            context.fillStyle = '#000';
            context.fillRect(dx, 0, sw*fit, height);
            context.drawImage(image, sx, 0, sw, image.naturalHeight,
                dx, oy+band.offset, sw*fit, image.naturalHeight*fit);
        }
        context.fillStyle = '#fff';
    }

    function drawStar(x, y, size, alpha, glow = false) {
        context.globalAlpha = alpha;
        if (glow) {
            const diameter = size * 8;
            context.drawImage(bloom, x-diameter/2, y-diameter/2, diameter, diameter);
        }
        context.fillRect(x-size/2, y-size/2, size, size);
    }

    function drawTitle() {
        if (!image.complete || !image.naturalWidth) return;
        // Animate the existing lettering directly, preserving its exact typeface.
        // Match object-fit: cover, including the source's slightly non-16:9 ratio.
        const fit = Math.max(width/image.naturalWidth, height/image.naturalHeight);
        const ox = (width-image.naturalWidth*fit)/2;
        const oy = (height-image.naturalHeight*fit)/2;
        const sx = Math.floor(image.naturalWidth*.277);
        const sy = Math.floor(image.naturalHeight*.432);
        const sw = Math.ceil(image.naturalWidth*.451);
        const sh = Math.ceil(image.naturalHeight*.135);
        const dx = ox + sx*fit;
        const dy = oy + sy*fit;
        context.globalAlpha = 1;
        context.fillStyle = '#000';
        context.fillRect(dx, dy-12*fit, sw*fit, (sh+24)*fit);
        // Thin slices create a continuous, gentle but visibly moving water refraction.
        const amplitude = Math.min(time/2, 1) * 4.3 * fit;
        for (let column = 0; column < sw; column += 2) {
            const fraction = column/sw;
            const envelope = Math.sin(fraction*Math.PI);
            const wave = Math.sin(fraction*TAU*1.8-time*.85)*.8
                + Math.sin(fraction*TAU*3.5+time*.425)*.2;
            const shift = wave * amplitude * envelope;
            const stretch = 1 + .015*envelope*Math.sin(fraction*TAU*1.25-time*.5);
            const sliceWidth = Math.min(2, sw-column);
            const highlight = Math.pow(.5+.5*Math.sin(fraction*TAU-time*.7), 8);
            context.globalAlpha = .8 + .2*highlight;
            context.drawImage(image, sx+column, sy, sliceWidth, sh,
                dx+column*fit, dy+shift-(stretch-1)*sh*fit/2,
                sliceWidth*fit+.15, sh*fit*stretch);
        }
        context.globalAlpha = 1;
        context.fillStyle = '#fff';
    }

    function draw() {
        if (!width || !height) return;
        context.clearRect(0, 0, width, height);
        const floatEntrance = Math.min(time/2, 1);
        leftFloat = -Math.sin(time*.75)*height*.007*floatEntrance;
        rightFloat = -leftFloat;
        drawCharacters();
        context.fillStyle = '#fff';
        const scale = width / 1000;
        for (const particle of dust) {
            const x = wrap(particle.x + Math.sin(time*.1+particle.phase)*.003*(particle.depth+1))*width;
            const y = wrap(particle.y-time*particle.speed)*height;
            if (x > width*.27 && x < width*.735 && y > height*.425 && y < height*.58) continue;
            if (x > width*.27 && x < width*.73 && y > height*.62 && y < height*.69) continue;
            const shimmer = .5+.5*Math.sin(time*particle.twinkle+particle.phase);
            const edgeFade = Math.min(1, y/(height*.03), (height-y)/(height*.03));
            const alpha = (.23 + particle.depth*.13 + shimmer*.36)*edgeFade;
            drawStar(x, y, Math.max(.5, particle.size*scale), alpha, particle.depth === 2);
        }
        context.globalAlpha = 1;
        context.lineWidth = Math.max(.4, scale*.65);
        for (let lane = 0; lane < 7; lane++) {
            context.beginPath();
            for (let step = 0; step <= 96; step++) {
                const p = point(step/96, lane);
                if (!step) context.moveTo(p.x, p.y);
                else context.lineTo(p.x, p.y);
            }
            context.strokeStyle = `rgba(255,255,255,${.14+.035*Math.sin(time*.7+lane)})`;
            context.stroke();
        }
        for (const particle of streams) {
            const progress = wrap(particle.phase+time*particle.speed*particle.direction);
            const opacity = Math.pow(Math.sin(progress*Math.PI), .5);
            const size = Math.max(.75, particle.size*scale);
            for (let tail = 7; tail >= 0; tail--) {
                const t = progress-tail*.003*particle.direction;
                if (t < 0 || t > 1) continue;
                const p = point(t, particle.lane);
                drawStar(p.x, p.y, size, opacity*(tail ? .23*(1-tail/8) : .98), !tail && particle.size > 1.6);
            }
        }
        // Finer particles peel away from the strands and return to the stream.
        for (const particle of spray) {
            const t = wrap(particle.phase+time*particle.speed);
            const p = point(t, particle.lane);
            const envelope = Math.sin(t*Math.PI);
            const spread = particle.offset*envelope*height*.025;
            const x = p.x + Math.cos(time*.7+particle.angle)*envelope*width*.002;
            const y = p.y + spread + Math.sin(t*18-time+particle.angle)*height*.004;
            drawStar(x, y, Math.max(.5, particle.size*scale), envelope*.35);
        }
        context.globalAlpha = 1;
        drawTitle();
    }

    function tick(now) {
        time += previous ? Math.min((now - previous) / 1000, .05) : 0;
        previous = now;
        draw();
        frame = requestAnimationFrame(tick);
    }

    function sync() {
        cancelAnimationFrame(frame);
        frame = 0;
        previous = 0;
        const chinese = document.documentElement.lang.startsWith("zh");
        const label = paused
            ? (chinese ? "播放封面动画" : "Play cover animation")
            : (chinese ? "暂停封面动画" : "Pause cover animation");
        button.setAttribute("aria-label", label);
        button.title = label;
        button.classList.toggle("is-paused", paused);
        if (visible && !document.hidden && !paused) frame = requestAnimationFrame(tick);
    }

    new ResizeObserver(() => {
        width = cover.clientWidth;
        height = cover.clientHeight;
        const ratio = Math.min(devicePixelRatio || 1, 2);
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        draw();
    }).observe(cover);
    new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        sync();
    }, { threshold: .05 }).observe(cover);
    new MutationObserver(sync).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    document.addEventListener("visibilitychange", sync);
    reducedMotion.addEventListener("change", () => { paused = reducedMotion.matches; sync(); });
    button.addEventListener("click", () => { paused = !paused; sync(); });
    image.addEventListener("load", draw);
    button.hidden = false;
    sync();
})();
