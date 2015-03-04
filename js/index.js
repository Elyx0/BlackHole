var stats = new Stats();
stats.setMode(0); // 0: fps, 1: ms

// align top-left
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';
document.body.appendChild( stats.domElement );
setTimeout(function(){
  $('.inputWrapper').addClass('ready');
  $('#request').focus().keypress(function(e) {
    if(e.which == 13) {
        $(this).blur();
        $('.inputWrapper,body').addClass('go');
        go($(this).val());
        setTimeout(function(){
         // $('body').css('background','black');
        },1000);
    }
  });
}, 1500);

var stage = new PIXI.Stage();
var container = new PIXI.DisplayObjectContainer();
//var container = new PIXI.SpriteBatch();
stage.addChild(container);
var cw = document.body.clientWidth;
var ch = document.body.clientHeight;
var wrapper = document.getElementsByClassName('canvasWrapper')[0];
var renderer = PIXI.autoDetectRenderer(cw,ch,null,true,true);
wrapper.appendChild(renderer.view);


var particleTexture = new PIXI.Texture.fromImage('particle_sprite.png');
var particleStarTexture = new PIXI.Texture.fromImage('particle-star.png');
var particles = [];
var butterflyParticles = [];
var particlesDone = 0;



StarParticle.prototype.submitToFields = function(fields){
  if (this.locked) return;
  // our starting acceleration this frame
    var totalAccelerationX = 0;
    var totalAccelerationY = 0;
   // for each passed field
     for (var i = 0; i < fields.length; i++) {
       var field = fields[i];

       // find the distance between the particle and the field
       var vectorX = field.position.x - this.position.x;
       var vectorY = field.position.y - this.position.y;
       var distanceVector = new Vector(vectorX,vectorY);
       var distance = distanceVector.getMagnitude();
       if (distance < 50)
       {
        this.sprite.alpha = 0;
        if (bg.input) this.locked = true,particlesDone++;
       }
       else if (distance > 55 && bg.outPut)
       {
         if (this.sprite.alpha === 0) this.sprite.alpha = 1;
       }
       // calculate the force via MAGIC and HIGH SCHOOL SCIENCE!
       var force = field.mass / Math.pow(vectorX*vectorX+vectorY*vectorY,1.5);

       // add to the total acceleration the force adjusted by distance
       totalAccelerationX += vectorX * force;
       totalAccelerationY += vectorY * force;
     }

     // update our particle's acceleration
     this.acceleration = new Vector(totalAccelerationX, totalAccelerationY);
     this.velocity.add(this.acceleration);
      // Add our current velocity to our position
     this.position.add(this.velocity);
};

var mainhole = new Field(new Vector(cw/2, ch/2), 440);
var fields = [mainhole];


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

drawBlackhole();

//Create background
for (var i =0;i<4226;i++)
{
  new StarParticle();
}

// var text = new PIXI.Text("Pixi.js can has text!", {font:"50px Arial", fill:"red"});
// stage.addChild(text);



//Select some to be animated
var animatedParticles = [];


var bg = new Scene('bg');
bg.init();

var butterfly = new Scene('butterfly');
butterfly.init(532,606);
butterfly.putButterfly();

//go('Hello');

function go(keyword){
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
// keyword = (location.search && location.search.split('text=')[1] ? decodeURIComponent(location.search.split('text=')[1]) : 'Hello');


requestAnimFrame(animate);
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
    //animateBg();
    for(var i=0;i<particles.length;i++)
    {
      var p = particles[i];
      p.submitToFields(fields);
    }
  }





  requestAnimFrame(animate);
  renderer.render(stage);
  stats.end();
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
      animCallBack('Merging Clusters Data');
      bg.ready = false;
      bg.input = true;
      //bg.outPut = true;
      particlesDone = 0;
      bhSprite.alpha = 0.4;
      checkStep3Done();
    }
  }, 500);
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
      animCallBack('Extracting Infos').done(function(){
        mainhole.setMass(1);
        bg.outPut = true;
        bg.input = false;
        particles.forEach(function(p){
          p.locked = false;
        });
      });


      //
    }
  }, 500);
}
