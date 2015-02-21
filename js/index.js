var stats = new Stats();
stats.setMode(0); // 0: fps, 1: ms

// align top-left
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';
document.body.appendChild( stats.domElement );

var stage = new PIXI.Stage(0x66FF99);
var cw = document.body.clientWidth/3;
var ch = document.body.clientHeight/3;
var wrapper = document.getElementsByClassName('canvasWrapper')[0];
var renderer = PIXI.autoDetectRenderer(cw,ch,{transparent: true});
wrapper.appendChild(renderer.view);


// var assetsToLoad = ["sprite/sprite.json"];
// var loader = new PIXI.AssetLoader(assetsToLoad);
// loader.onComplete = makeSprites.bind(this);
// loader.load();

// function makeSprites() {
//   var frames = ["npc_butterfly__x1_fly-top_png_1354829528.png"];
//   var sprite = PIXI.MovieClip.fromFrames(frames);
//   sprite.position.x = 200;
//   sprite.position.y = 200;
//   stage.addChild(sprite);
// }
//

var particleTexture = new PIXI.Texture.fromImage('particle_sprite.png');
var particles = [];
function Particle(x,y)
{
  var pSprite = new PIXI.Sprite(particleTexture);
  pSprite.position.x = x;
  pSprite.position.y = y;
  pSprite.scale.set(0.1,0.1);
  particles.push(pSprite);
  stage.addChild(pSprite);
}


function Scene(name)
{
  this.name = name;
  this.canvas = document.createElement("canvas");
  this.canvas.setAttribute('class', name);
  this.canvas.setAttribute('id', name);
  this.context = this.canvas.getContext("2d");
};

Scene.prototype.init = function ()
{
  var style = this.canvas.style;
  style.left = 0;
  style.top = 0;
  style.width = window.width;
  this.canvas.width = this.canvas.w = cw;
  this.canvas.height = this.canvas.h = ch;
  style.background = 'transparent';
  style.position = 'absolute';
  wrapper.appendChild(this.canvas);
};

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

var image_data;
Scene.prototype.setupParticles = function ()
{
  var ctx = this.context;
  var canvas = this.canvas;
  particles = [];
  var imageData,
    pixel,
    width = 0,
    index = 0,
    slide = false;
  console.log(canvas.w,canvas.h);
  imageData = ctx.getImageData(0, 0, canvas.w, canvas.h);
  image_data = imageData.data;
  console.log(canvas,imageData);
  // for(var x=0;x<imageData.width;x+=resolution) //var i=0;i<imageData.data.length;i+=4)
  // {
  //   for(var y=0;y<imageData.height;y+=resolution)
  //   {
  //     i=(y*imageData.width + x)*4;

  //     if(imageData.data[i+3] == 255)
  //     {
  //       if(index >= particles.length)
  //       {
  //         new Particle(x,y);
  //       }
  //       else
  //       {
  //        // particles[index].homeX=x;
  //        // particles[index].homeY=y;
  //       }
  //       index++;
  //     }
  //   }
  // }
  //debugger;
  //particles.splice(index,particles.length-index);
};


bg.init();
keyword = (location.search && location.search.split('text=')[1] ? decodeURIComponent(location.search.split('text=')[1]) : 'Hello');
bg.prepare(keyword);
bg.setupParticles();



// requestAnimFrame(animate);
// function animate()
// {
//   stats.begin();
//   for(var i=0;i<particles.length;i++)
//   {
//     var p = particles[i];
//     p.rotation += Math.random()/10;
//   }
//   requestAnimFrame(animate);
//   renderer.render(stage);
//   stats.end();
// }
