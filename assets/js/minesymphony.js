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
    // Stable sampling keeps the composition consistent across reloads.
    let seed = 2719;
    const random = (min, max) => {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        return min + seed / 4294967296 * (max - min);
    };
    const streams = Array.from({ length: 250 }, (_, i) => ({
        lane: i % 7, phase: random(0, 1), speed: random(.04, .078),
        size: random(1, 2.1), direction: i % 3 === 0 ? -1 : 1,
    }));
    const spray = Array.from({ length: 170 }, () => ({
        phase: random(0, 1), lane: Math.floor(random(0, 7)),
        offset: random(-1, 1), angle: random(0, TAU), speed: random(.035, .065),
        size: random(.45, 1.2),
    }));
    // One projected voxel lattice supplies geometry, nodes and packet trajectories.
    const lattice = [];
    const nodes = [];
    const project = (x, z, upper) => {
        const depth = (z+1)/8;
        return [.5 + x*(.052 + depth*.018),
            upper ? .265-depth*.255 : .725+depth*.29];
    };
    for (const upper of [true, false]) {
        for (let z = 0; z < 7; z++) {
            for (let x = -7; x <= 7; x++) {
                const p = project(x, z, upper);
                const active = (x*7+z*3+28)%5 === 0;
                nodes.push({ p, z, active, cube: active && (x+z+14)%3===0 });
                if (x < 7) lattice.push({ a:p, b:project(x+1,z,upper), z, active });
                if (z < 6) lattice.push({ a:p, b:project(x,z+1,upper), z,
                    active: (x+z+14)%6===0 });
            }
        }
    }
    const pixels = Array.from({ length: 320 }, (_, i) => ({
        x: random(.02,.98), y: random(.025,.975), phase:random(0,TAU),
        depth:i%3, size:random(.65,1.5), speed:random(.001,.003),
    }));
    const packets = lattice.filter(edge => edge.active).map((edge, i) => ({
        ...edge, phase:random(0,1), speed:random(.08,.16), direction:i%2 ? 1:-1,
    }));
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

    function drawPixel(x, y, size, alpha, glow = false) {
        context.globalAlpha = alpha;
        if (glow) {
            const diameter = size * 5;
            context.drawImage(bloom, x-diameter/2, y-diameter/2, diameter, diameter);
        }
        context.fillRect(x-size/2, y-size/2, size, size);
    }

    function backgroundWeight(x, y) {
        const edge = Math.min(1, x/.055, (1-x)/.055, y/.04, (1-y)/.04);
        // A continuous fade around the headline and silhouettes avoids hard cutouts.
        const center = Math.exp(-Math.pow((x-.5)/.27,6)-Math.pow((y-.53)/.20,6));
        const figures = Math.exp(-Math.pow((y-.61)/.27,6)) *
            (Math.exp(-Math.pow((x-.14)/.13,4))+Math.exp(-Math.pow((x-.86)/.13,4)));
        return Math.max(0, edge)*(1-center*.97)*(1-Math.min(1,figures)*.88);
    }

    function drawBackground(scale) {
        context.globalAlpha = 1;
        context.lineWidth = Math.max(.55, scale*.65);
        context.strokeStyle = '#fff';
        // Two receding planes share the same voxel spacing and fade into the center.
        for (const edge of lattice) {
            const [x,y] = edge.a;
            const weight = backgroundWeight((x+edge.b[0])/2,(y+edge.b[1])/2);
            context.globalAlpha = weight*(edge.active ? .21 : .055)*( .65+edge.z*.065);
            context.beginPath();
            context.moveTo(x*width,y*height);
            context.lineTo(edge.b[0]*width,edge.b[1]*height);
            context.stroke();
        }
        for (const node of nodes) {
            const [x,y] = node.p;
            const weight = backgroundWeight(x,y);
            drawPixel(x*width,y*height,Math.max(.8,scale*(node.active?2:1)),
                weight*(node.active?.46:.15));
            if (!node.cube) continue;
            const u = scale*(4+node.z*.9);
            const cx=x*width, cy=y*height;
            context.globalAlpha=weight*.28;
            context.beginPath();
            context.moveTo(cx,cy-u*1.5);
            context.lineTo(cx+u,cy-u);
            context.lineTo(cx,cy-u*.5);
            context.lineTo(cx-u,cy-u);
            context.closePath();
            context.moveTo(cx-u,cy-u);
            context.lineTo(cx-u,cy);
            context.lineTo(cx,cy+u*.5);
            context.lineTo(cx+u,cy);
            context.lineTo(cx+u,cy-u);
            context.moveTo(cx,cy-u*.5);
            context.lineTo(cx,cy+u*.5);
            context.stroke();
        }
        // Square packets move on the grid itself, tying light and geometry together.
        for (const packet of packets) {
            const t=wrap(packet.phase+time*packet.speed*packet.direction);
            for (let tail=3;tail>=0;tail--) {
                const progress=t-tail*.035*packet.direction;
                if(progress<0 || progress>1) continue;
                const x=packet.a[0]+(packet.b[0]-packet.a[0])*progress;
                const y=packet.a[1]+(packet.b[1]-packet.a[1])*progress;
                const alpha=backgroundWeight(x,y)*Math.sin(Math.PI*progress)*
                    (tail ? .18*(1-tail/4):.72);
                drawPixel(x*width,y*height,Math.max(1,scale*(tail?1:2.1)),alpha,!tail);
            }
        }
        // Three slow particle depths; larger pixels stay scarce and square-edged.
        for (const pixel of pixels) {
            const x=pixel.x+Math.sin(time*.12+pixel.phase)*.002*(pixel.depth+1);
            const y=wrap(pixel.y-time*pixel.speed*(pixel.depth+1));
            const pulse=.65+.35*Math.sin(time*.7+pixel.phase);
            const alpha=backgroundWeight(x,y)*pulse*(.18+pixel.depth*.12);
            drawPixel(x*width,y*height,Math.max(.65,scale*pixel.size*(1+pixel.depth*.5)),
                alpha,pixel.depth===2 && pixel.size>1.35);
        }
        context.globalAlpha=1;
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
        const amplitude = Math.min(time/2, 1) * 3.2 * fit;
        for (let column = 0; column < sw; column += 2) {
            const fraction = column/sw;
            const envelope = Math.sin(fraction*Math.PI);
            const wave = Math.sin(fraction*TAU*1.8-time*.85)*.8
                + Math.sin(fraction*TAU*3.5+time*.425)*.2;
            const shift = wave * amplitude * envelope;
            const stretch = 1 + .015*envelope*Math.sin(fraction*TAU*1.25-time*.5);
            const sliceWidth = Math.min(2, sw-column);
            const highlight = Math.pow(.5+.5*Math.sin(fraction*TAU-time*.7), 8);
            context.globalAlpha = .91 + .09*highlight;
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
        drawBackground(scale);
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
                drawPixel(p.x, p.y, size, opacity*(tail ? .23*(1-tail/8) : .98), !tail && particle.size > 1.6);
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
            drawPixel(x, y, Math.max(.5, particle.size*scale), envelope*.35);
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
