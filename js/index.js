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
stage.addChild(container);
var cw = document.body.clientWidth;
var ch = document.body.clientHeight;
var wrapper = document.getElementsByClassName('canvasWrapper')[0];
var renderer = PIXI.autoDetectRenderer(cw,ch,{transparent: true});
wrapper.appendChild(renderer.view);


var particleTexture = new PIXI.Texture.fromImage('particle_sprite.png');
var particles = [];
var butterflyParticles = [];
function Particle(x,y)
{
  var pSprite = new PIXI.Sprite(particleTexture);
  pSprite.position.x = x;
  pSprite.position.y = y;
  pSprite.tint = 0xFF0000;
  pSprite.scale.set(0.1);
  particles.push(pSprite);
  //stage.addChild(pSprite);
}

function ButterflyParticle(x,y,rgba)
{
  var pSprite = new PIXI.Sprite(particleTexture);
  pSprite.position.x = x + butterfly.canvas.width/2;
  pSprite.position.y = y;
  //debugger;
  pSprite.tint = '0x' + rgbToHex.apply(0,rgba);
  //pSprite.tint = 0xFF0000;
  pSprite.scale.set(0.1);
  butterflyParticles.push(pSprite);
  container.addChild(pSprite);
}



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
         if (!p.added)
         {
           container.addChild(p);
           p.added = true;
         }
         p.rotation += Math.random()/10;
       }


     }
  }

  requestAnimFrame(animate);
  renderer.render(stage);
  stats.end();
}
