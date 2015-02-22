var stats = new Stats();
stats.setMode(0); // 0: fps, 1: ms

// align top-left
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';
document.body.appendChild( stats.domElement );
$('.inputWrapper').addClass('ready');
setTimeout(function(){
  $('#request').focus().keypress(function(e) {
    if(e.which == 13) {
        $('.inputWrapper,body').addClass('go');
        go($(this).val());
        setTimeout(function(){
         // $('body').css('background','black');
        },1000);
    }
  });
}, 1300);

var stage = new PIXI.Stage();
var container = new PIXI.DisplayObjectContainer();
//var container = new PIXI.SpriteBatch();
stage.addChild(container);
var cw = document.body.clientWidth;
var ch = document.body.clientHeight;
var wrapper = document.getElementsByClassName('canvasWrapper')[0];
var renderer = PIXI.autoDetectRenderer(cw,ch,{transparent: true});
wrapper.appendChild(renderer.view);


var particleTexture = new PIXI.Texture.fromImage('particle_sprite.png');
var particles = [];
var butterflyParticles = [];
// function Particle(x,y)
// {
//   var pSprite = new PIXI.Sprite(particleTexture);
//   pSprite.position.x = x;
//   pSprite.position.y = y;
//   pSprite.tint = 0xFF0000;
//   pSprite.scale.set(0.1);
//   particles.push(pSprite);
//   //stage.addChild(pSprite);
// }
//

function Vector(x,y)
{
  this.x == x || 0;
  this.y == y || 0;
}

function ButterflyParticle(x,y,rgba)
{
  var pSprite = new PIXI.Sprite(particleTexture);
  this.initialX = x;
  pSprite.position.x = x + butterfly.canvas.width/2;
  pSprite.position.y = y;
  //debugger;
  pSprite.tint = '0x' + rgbToHex.apply(0,rgba);
  //pSprite.tint = 0xFF0000;
  pSprite.scale.set(0.1);
  this.rgba = rgba;
  this.sprite = pSprite;

  this.x = pSprite.position.x;
  this.y = y;
  this.xVelocity=Math.random()*10-5;
  this.yVelocity=Math.random()*10-5;


  particles.push(this);
  container.addChild(pSprite);
}

ButterflyParticle.prototype.move = function()
{
    if (!this.homeX) this.homeX = cw/2+Math.random()*cw/10;
    if (!this.homeY) this.homeY = -50;

    var homeDX = this.homeX-this.x;
    var homeDY = this.homeY-this.y;
    var distance = Math.sqrt(Math.pow(homeDX,2)+Math.pow(homeDY,2));

    if (distance < 0.1)
    {
      this.finished = true;
      return;
    }
    var attractForce = distance*0.01;
    var angle = Math.atan2(homeDY,homeDX);

    this.xVelocity += attractForce*Math.cos(angle);
    this.yVelocity += attractForce*Math.sin(angle);
    this.xVelocity *= 0.92;
    this.yVelocity *= 0.92;

    this.x += this.xVelocity;
    this.y += this.yVelocity;
    this.sprite.position.x = this.x;
    this.sprite.position.y = this.y;
};

var butterfly = new Scene('butterfly');
butterfly.init(532,606);
butterfly.putButterfly();

var bg = new Scene('bg');

// Uncomment to write words ?
// Write words letter by letter ??

bg.init();

function go(keyword){
  bg.prepare(keyword);
  bg.setupParticles();
  bg.ready = true;
  bg.iteration = 0;
}
// keyword = (location.search && location.search.split('text=')[1] ? decodeURIComponent(location.search.split('text=')[1]) : 'Hello');


requestAnimFrame(animate);
function animate()
{
  stats.begin();
  if (bg.ready)
  {
     bg.iteration+=30;
     for(var i=0;i<particles.length;i++)
     {
       var p = particles[i];
       if (i < bg.iteration)
       {
         if (!p.finished)
         {
            p.move();
         }
         else
         {
          p.sprite.rotation += Math.random()/10;
        }
       }
       else
       {
           p.sprite.rotation += Math.random()/10;
       }
     }
  }
  else
  {
      for(var i=0;i<particles.length;i++)
      {
          var p = particles[i];
           p.sprite.rotation += Math.random()/10;
      }
  }

  requestAnimFrame(animate);
  renderer.render(stage);
  stats.end();
}
