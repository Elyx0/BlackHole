var a = 100; // size of the black hole.
var b = 200; // distance of black hole from canvas center.
var c = 1; // speed of black hole rotation.
var d = 20;  // the amount of stars to spawn every frame.

// ---------------------------------------------

var canvas = document.getElementById('c'),
    ctx = canvas.getContext('2d'),
    stars = [],
    m = {},
    r = 0

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

m.x = null;
m.y = null;

ctx.strokeStyle = '#fff';
ctx.translate(0.5, 0.5);

// create stars
function createStars(n){

    if(m.x == null) return;

    for(var i=0;i<n;i++){
        var shape = {
            x: m.x,
            y: m.y,
            r: 1,
            speed: 1,
            accel: 1.01,
            accel2: 0.001,
            angle: Math.random() * 360
        }

        var vel = {
            x: a * Math.cos(shape.angle * Math.PI / 180),
            y: a * Math.sin(shape.angle * Math.PI / 180)
        };

        shape.x += vel.x;
        shape.y += vel.y;

        stars.push(shape);
    }
}

function render(){
    createStars(d);

    var bench = [];
    // ctx.save();
    // ctx.fillStyle = 'rgba(0,0,0,0.5)';
    // ctx.fillRect(0, 0, canvas.width, canvas.height);
    // ctx.restore();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    r+=c;
    if(r < 360){
        m = { x: canvas.width / 2, y: canvas.height / 2, angle: r }

        var targetAngle = m.angle * Math.PI / 180;

        m.x += b * Math.cos(targetAngle);
        m.y += b * Math.sin(targetAngle);
    }else{
        r = 0;
    }

    while(stars.length){
        var star = stars.pop();

        var vel = {
            x: star.speed * Math.cos(star.angle * Math.PI / 180),
            y: star.speed * Math.sin(star.angle * Math.PI / 180)
        };

        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(star.x + vel.x, star.y + vel.y);
        ctx.closePath();
        ctx.stroke();

        star.x += vel.x;
        star.y += vel.y;

        star.speed *= star.accel;

        star.accel += star.accel2;

        if(star.x < canvas.width && star.x > 0 && star.y < canvas.height && star.y > 0){
            bench.push(star);
        }
    }

    stars = bench.slice(0).reverse();
}

window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame   ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        function(callback){
            window.setTimeout(callback, 1000 / 60);
        };
})();

(function animloop(){
    requestAnimFrame(animloop);
    render();
})();