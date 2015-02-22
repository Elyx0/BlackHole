var stats = new Stats();
stats.setMode(0); // 0: fps, 1: ms

// align top-left
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';
document.body.appendChild( stats.domElement );

var mouse = {
    x: 0,
    y: 0
  },
  density = 5,
  particles = [],
  colour = '#fff0a4',
  isDrawing = false,
  wrapper = document.getElementsByClassName('canvasWrapper')[0],
  cw = document.body.clientWidth,
  ch = document.body.clientHeight;


function Scene(name)
{
  this.name = name;
  this.canvas = document.createElement("canvas");
  this.canvas.setAttribute('class', name);
  this.canvas.setAttribute('id', name);
  this.context = this.canvas.getContext("2d");
}

Scene.prototype.init = function ()
{
  var style = this.canvas.style;
  style.left = 0;
  style.top = 0;
  style.width = window.width;
  this.canvas.width = this.canvas.w = document.body.clientWidth;
  this.canvas.height = this.canvas.h = document.body.clientHeight;
  style.background = 'transparent';
  style.position = 'absolute';
  wrapper.appendChild(this.canvas);
};

var main = new Scene('main');
var bg = new Scene('bg');

Scene.prototype.prepare = function (keyword)
{
  var font = 'Arial';
  var ctx = this.context;
  var canvas = this.canvas;
  var measure = {width:0};
  var margin = 80;
  var fontSize = 1;
  for (;measure.width + margin < canvas.w;fontSize+=10){
  ctx.font = fontSize + "px '"+font+"'";
  measure = ctx.measureText(keyword);
  }
  for (;measure.actualBoundingBoxAscent + margin > canvas.h;fontSize-=10){
  ctx.font = fontSize + "px '"+font+"'";
  measure = ctx.measureText(keyword);
  }
  resolution = ~~((cw / measure.width + ch/ measure.actualBoundingBoxAscent) + keyword.length/2 + 1);
  //resolution = 30;
  //debugger;
  ctx.fillText(keyword, (canvas.w / 2) - Math.round(measure.width / 2), (canvas.h / 2) + Math.round(measure.actualBoundingBoxAscent / 2));
};

Scene.prototype.setupParticles = function ()
{
  var ctx = this.context;
  var canvas = this.canvas;
  particles = [];
  var imageData,
    image_data,
    pixel,
    width = 0,
    index = 0,
    slide = false;
  console.log(canvas.w,canvas.h);
  imageData = ctx.getImageData(0, 0, canvas.w, canvas.h);
  image_data = imageData.data;
  console.log(canvas,imageData);
  for(var x=0;x<imageData.width;x+=resolution) //var i=0;i<imageData.data.length;i+=4)
  {
    for(var y=0;y<imageData.height;y+=resolution)
    {
      i=(y*imageData.width + x)*4;

      if(imageData.data[i+3] == 255)
      {
        if(index >= particles.length)
        {
          particles[index]= new Particle(x,y);
        }
        else
        {
          particles[index].homeX=x;
          particles[index].homeY=y;
        }
        index++;
      }
    }
  }
  //debugger;
  //particles.splice(index,particles.length-index);
};

function Particle(homeX,homeY)
{
  this.homeX = homeX;
  this.homeY = homeY;
  this.x = Math.random()*cw;
  this.y = Math.random()*ch;
  this.xVelocity=Math.random()*10-5;
  this.yVelocity=Math.random()*10-5;
}

Particle.prototype.move = function()
{
  var homeDX = this.homeX-this.x;
  var homeDY = this.homeY-this.y;
  var distance = Math.sqrt(Math.pow(homeDX,2)+Math.pow(homeDY,2));
  var attractForce = distance*0.01;
  var angle = Math.atan2(homeDY,homeDX);
  this.xVelocity += attractForce*Math.cos(angle);
  this.yVelocity += attractForce*Math.sin(angle);
  this.xVelocity *= 0.92;
  this.yVelocity *= 0.92;

  this.x += this.xVelocity;
  this.y += this.yVelocity;
};

Scene.prototype.drawParticles = function(){
  var ctx = this.context;
  ctx.globalCompositeOperation = 'lighter';
  //ctx.fillStyle = 'rgba(0,0,0,0.05)';
  ctx.clearRect(0,0,cw,ch);
  for (var i=0;i<particles.length;i++)
  {
    var p = particles[i];
    ctx.beginPath();
    ctx.moveTo(p.x,p.y);
    ctx.fillStyle = "rgba(227,190,20,0.8)";
    //ctx.shadowColor = 'rgba(255,255,255,0.1)';
    //ctx.shadowBlur = 2;
    //ctx.shadowOffsetX = 0;
    //ctx.shadowOffsetY = 0;
    // After setting the fill style, draw an arc on the canvas
    ctx.arc(p.x, p.y, resolution/4, 0, Math.PI*2, true);
    ctx.closePath();
    ctx.fill();
  }
};

Scene.prototype.moveParticles = function()
{
   for (var i=0;i<particles.length;i++)
   {
      particles[i].move();
   }
};

function run()
{
  stats.begin();

  // monitored code goes here
  main.moveParticles();
  main.drawParticles();

  stats.end();

  requestAnimationFrame(run);
}

function init()
{
  wrapper.innerHTML = '';
  main.init();
  bg.init();
  keyword = (location.search && location.search.split('text=')[1] ? decodeURIComponent(location.search.split('text=')[1]) : 'Hello');
  bg.prepare(keyword);
  bg.setupParticles();
  main.drawParticles();
  run();
}


window.onresize = init;
init();