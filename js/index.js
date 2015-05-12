// FPS STATS COUNTER
var stats = new Stats();
stats.setMode(0); // 0: fps, 1: ms

// align top-left
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';
document.body.appendChild( stats.domElement );
var token = "71ffe134c2cb7f2c5375d7c23fbf90d2";


// Init
setTimeout(function(){
  $('.inputWrapper').addClass('ready');
  $('#request').focus().keypress(function(e) {
    if(e.which == 13) {
        $(this).blur();
        $('.inputWrapper,body').addClass('go');
        go($(this).val());
    }
  });
}, 1500);

// Creating stage and containers
var stage = new PIXI.Stage();
var container = new PIXI.DisplayObjectContainer();
var wordsContainer = new PIXI.DisplayObjectContainer();
//var container = new PIXI.SpriteBatch();
stage.addChild(container);
stage.addChild(wordsContainer);
var cw = document.body.clientWidth;
var ch = document.body.clientHeight;
var wrapper = document.getElementsByClassName('canvasWrapper')[0];
var renderer = PIXI.autoDetectRenderer(cw,ch,null,true,true);
wrapper.appendChild(renderer.view);

// Getting particles textures
var particleTexture = new PIXI.Texture.fromImage('particle_sprite.png');
var particleStarTexture = new PIXI.Texture.fromImage('particle-star.png');
var particles = [];
var butterflyParticles = [];
var particlesDone = 0;


// Setupin attraction field
var mainhole = new Field(new Vector(cw/2, ch/2), 440);
var fields = [mainhole];


// Drawing
drawBlackhole();


//Select some to be animated
var animatedParticles = [];


var bg = new Scene('bg');
bg.init();

var butterfly = new Scene('butterfly');
butterfly.init(532,606);
butterfly.putButterfly();

//Create background
var maxParticles = 4226;
for (var i =0;i<maxParticles;i++)
{
  new StarParticle();
}


currentInterval = 0;
clusters = [];
maxClusterSize = 90;
words = [];


// Creating clusters from api data
function parseData(apiData)
{
  intervals = apiData[1].children;
  intervals[currentInterval].children[1].children.slice(0,3).forEach(function(cluster,index){
    var name = cluster.name.split('cluster ')[1];
    setTimeout(function(){
      new Cluster(name,cluster,currentInterval);
    },index*2000);

  });
}

// Launching animation
function go(keyword){
  api = new Api(keyword);
  $('.infoWrapper').text('Checking connectivity').removeClass('hidden');
  bg.prepare(keyword);
  bg.setupParticles();
  bg.ready = true;
  bg.iteration = 0;
  checkStep1Done();
  particlesLeft = particles.filter(function(x){return !x.destination;});
  particlesTo = particles.length - particlesLeft.length;
  console.log('Left',particlesLeft.length);
}


requestAnimFrame(animate);

//Animation handling
// Step 0 : Particles on background
// Step 1 : Animate into word
// Step 2 : Animate into butterfly
// Step 3 : Animate into Field
// Step 4 : Animate from field around words
function animate()
{
  stats.begin();

  if (bg.ready)
  {
     bg.iteration+=10;
     for (var i =0;i<particlesLeft.length;i++)
     {
        var p = particlesLeft[i];
        if (p.sprite.alpha >= 0) p.sprite.alpha -= 0.01;
     }
     for(var i=0;i<particles.length;i++)
     {
       var p = particles[i];
       if (i < bg.iteration)
       {
         if (!p.doneToWord)
         {
            p.moveToWord();
            if (!p.tintSet && p.desiredTint) p.tintSet = true,p.sprite.tint = p.desiredTint;
            if (p.sprite.pivot.x > 5) p.sprite.pivot.x -= Math.min(p.sprite.pivot.x,10);
            if (p.sprite.pivot.y > 5) p.sprite.pivot.y -= Math.min(p.sprite.pivot.y,10);
         }
         else
         {
          if (butterfly.ready)
          {
            p.sprite.pivot.set(5,5);
            p.sprite.rotation += Math.random()*0.08;
          }
          else
          {
            p.sprite.pivot.set(cw/2,ch/2);
            p.sprite.rotation += Math.random()*0.08;
          }

        }
       }
       else
       {
          p.sprite.pivot.set(cw/2,ch/2);
          p.sprite.rotation += Math.random()*0.01;
       }
     }
  }
  else
  {
    for(var i=0;i<particles.length;i++)
    {
      var p = particles[i];
      p.submitToFields(fields);
    }
    if (bg.outPut)
    {
      for(var i=0;i<words.length;i++)
      {
        var w = words[i];
        w.move();
      }
    }
  }





  requestAnimFrame(animate);
  renderer.render(stage);
  stats.end();
}

function drawBlackhole()
{
  bhGraphics = new PIXI.Graphics();
  bhGraphics.lineStyle ( 2 , 0x000000,  1);
  bhGraphics.beginFill('0x000000');
  bhGraphics.drawCircle(cw/2, ch/2, 50);
  bhSprite = new PIXI.Sprite(particleTexture);
  bhSprite.anchor.set(0.5);
  bhSprite.scale.set(3);
  bhSprite.alpha = 0.3;
  bhSprite.tint = '0x' + rgbToHex(255,184,0);
  bhSprite.position.x = cw/2;
  bhSprite.position.y = ch/2;
  container.addChild(bhSprite);
  container.addChild(bhGraphics);
}

function animateBg()
{
  if (animatedParticles.length < 1000)
  {
    //Push random particle to be animated
    animatedParticles.push(particles[~~(Math.random()*particles.length) - 1])
  }

  for (var i=0,l=animatedParticles.length;i<l;i++)
  {
    animatedParticles[i] && animatedParticles[i].animateBackground();
  }
}


function animCallBack(text)
{
  var $div = $('.infoWrapper');
  var deferred = $.Deferred();
  $div.addClass('hidden').one('transitionend webkitTransitionEnd oTransitionEnd',function(){
    $div.text(text).removeClass('hidden').one('transitionend webkitTransitionEnd oTransitionEnd',function(){
      deferred.resolve();
    });
  });
  return deferred.promise();
}

function formButterfly()
{
  butterfly.setupParticles(true);
  particles.forEach(function(p){
    p.doneToWord = false;
  });
  butterfly.ready = true;
  particlesLeft = [];
  bg.iteration = 0;
  particlesTo = particles.length;
  particlesDone = 0;
}

function checkStep1Done()
{
  setTimeout(function(){
    if (particlesTo !== particlesDone)
    {
      checkStep1Done();
    }
    else
    {
      console.log('Step1 Ended');
      animCallBack('Digesting the digital moment').done(function(){
            formButterfly();
            checkStep2Done();
            setTimeout(function(){
              animCallBack('Approaching The threshold of momentary intelligibility')
            },8000);
      });
    }
  }, 500);
}

function checkStep2Done()
{
  setTimeout(function(){
    if (particlesTo !== particlesDone)
    {
      checkStep2Done();
    }
    else
    {
      console.log('Step2 Ended');
      animCallBack('Merging Cluster Data');
      bg.ready = false;
      bg.input = true;
      particlesDone = 0;
      bhSprite.alpha = 0.4;
      checkStep3Done();
    }
  }, 500);
}

function unlockParticles()
{
  mainhole.setMass(1);
  bg.outPut = true;
  bg.input = false;
  particles.forEach(function(p){
    p.locked = false;
  });
}

function checkStep3Done()
{
  setTimeout(function(){
    if (particlesTo !== particlesDone)
    {
      checkStep3Done();
    }
    else
    {
      console.log('Step3 Ended');
      animCallBack('Extracting Info').done(function(){
        unlockParticles();
        setTimeout(function(){
          parseData(api.data);
          animCallBack('Done processing ' + api.data[0].message.split(' ')[3] + ' clusters for ' + api.data[0].term);
        },2000);
      });


      //
    }
  }, 500);
}
