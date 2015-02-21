var stage, renderer, stageWidth, stageHeight;
var particleTexture, particles, stats, gui, changing;
var mousex, mousey;
var TOTAL = 1000;

function init() {
    // dimension
    stageWidth = window.innerWidth;
    stageHeight = window.innerHeight;
    mousex = stageWidth/2;
    mousey = stageHeight/2;

    // renderer
    renderer = PIXI.autoDetectRenderer(stageWidth, stageHeight);
    document.body.appendChild(renderer.view);
    stage = new PIXI.Stage;

    // particles
    particleTexture = new PIXI.Texture.fromImage("http://jsrun.it/assets/9/i/I/p/9iIpS.png");
    particles = [];
    changing = false;

    // remove all particles from stage
    function removeAllBalls() {
        var len = particles.length;
        for(i = 0; i<len; i++) {
            var old = particles[i].sprite;
            stage.removeChild(old);
        }

        particles = [];
        renderer.render(stage);
    }

     // add particles on stage
    function addParticles() {
        removeAllBalls();

        for (i = 0; i < TOTAL; i++) {
            var ball = new PIXI.Sprite(particleTexture);
            ball.anchor.x = 0.5;
            ball.anchor.y = 0.5;
            ball.vx = 0;
            ball.vy = 0;
            ball.position.x = Math.random() * stageWidth;
            ball.position.y = Math.random() * stageHeight;
            stage.addChild(ball);

            particles.push({sprite:ball, vx:0, vy:0});
        }
    }

    // mouse move
    function moveHandler(event) {
        mousex = event.clientX;
        mousey = event.clientY;
    }
    document.body.onmousemove = moveHandler;

    // Stats
    stats = new Stats();
    stats.setMode(0);
    document.body.appendChild(stats.domElement);

     // GUI
    gui = new dat.GUI();
    gui.width = 220;
    var totalc = gui.add(window, 'TOTAL', 500, 10000).step(500).name('Particles');
    gui.close();

    totalc.onChange(function(value) {
       changing = true;
    });
    totalc.onFinishChange(function(value) {
        changing = false;
        removeAllBalls();
        addParticles();
        requestAnimFrame(tick);
    });

    // go!
    addParticles();

    // animate
    requestAnimFrame(tick);
}

function tick() {
    if(changing) return;

     for (var i = 0; i < TOTAL; i++) {
        var ball = particles[i].sprite;
        var dx = ball.position.x - mousex;
        var dy = ball.position.y - mousey;
        var vx = particles[i].vx;
        var vy = particles[i].vy;

        if (dx * dx + dy * dy <= 10000) {
            vx += dx * 0.01;
            vy += dy * 0.01;
        }
        vx *= 0.95;
        vy *= 0.95;

        vx += Math.random() - 0.5;
        vy += Math.random() - 0.5;

        var x = ball.position.x += vx;
        var y = ball.position.y += vy;

        if (x < 0 || x > stageWidth || y < 0 || y > stageHeight) {
            var r = Math.atan2(y - stageHeight / 2, x - stageWidth / 2);
            vx = -Math.cos(r);
            vy = -Math.sin(r);
        }

        particles[i].vx = vx;
        particles[i].vy = vy;
    }

    renderer.render(stage);
    stats.update();

    requestAnimFrame(tick);
}

// Init
window.addEventListener('load', init, false);