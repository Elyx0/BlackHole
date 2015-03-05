var stats = new Stats();
stats.setMode(0); // 0: fps, 1: ms

// align top-left
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';
document.body.appendChild( stats.domElement );
var token = "71ffe134c2cb7f2c5375d7c23fbf90d2";

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
       if (distance < 50 && !field.dontHideParticles)
       {
        this.sprite.alpha = 0;
        if (bg.input) this.locked = true,particlesDone++;
       }
       else if (distance > 65 && bg.outPut)
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

     if (bg.outPut)
     {
        var distance = this.position.getDistance(new Vector(cw/2,ch/2));
        if (!this.initialDistance) this.initialDistance = cw/2;
        if (!this.maxScale) this.maxScale = Math.random()*0.3+0.2;
        //var scale = ((cw/2)/(cw/2)-distance);
        var scale = Math.max(0.1,this.maxScale*(distance)/this.initialDistance);
        if (scale > 3 || scale < 0 || isNaN(scale) || typeof scale != "number") scale = 0.1;
        //console.log(scale);
        this.sprite.scale.set(Math.max(scale,0.1));
     }

     var margin = 70;
     if (bg.outPut && (this.position.x > cw+margin || this.position.x < 0-margin || this.position.y > ch+margin || this.position.y < 0-margin))
     {
        //Out of bounds
        if (particles.length < 200)
        {
           this.reset();
        }
        else
        {
            //Delete from particle array.
            particles.splice(particles.indexOf(this),1);
            container.removeChild(this.sprite);
        }
     }
};

var mainhole = new Field(new Vector(cw/2, ch/2), 440);
var fields = [mainhole];

drawBlackhole();

//Create background
var maxParticles = 4226;
//maxParticles = 200;
for (var i =0;i<maxParticles;i++)
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


// for (var i =0;i<particles.length;i++)
// {
//   var p = particles[i];
//   p.reset();
// }
// unlockParticles();

words = [];
function WordField(word,maxSize)
{
  this.word = word;
  this.color = "orange";
  this.reset();
  var text = new PIXI.Text(word, {font: this.fontSize + "px Lato", fill: this.color});
  text.anchor.set(0.5);
  text.position = this.position;
  this.sprite = text;
  this.field = new Field(this.position, this.fontSize);
  this.field.dontHideParticles = true;
  fields.push(this.field);
  this.maxSize = maxSize;

  container.addChild(text);
  words.push(this);
}
WordField.prototype.move = function()
{
   var acceleration = this.velocity;
   this.position.add(acceleration);
   //this.updateField();



   var distance = this.position.getDistance(new Vector(cw/2,ch/2));
   if (!this.initialDistance) this.initialDistance = cw/2;
   //var scale = ((cw/2)/(cw/2)-distance);
   var scale = Math.max(10,this.maxSize*(distance)/this.initialDistance);
   if (scale > this.maxSize || scale < 0 || isNaN(scale) || typeof scale != "number") scale = 10;
   //console.log(scale);
   this.fontSize = Math.max(scale,10);
   this.updateText();
   this.field.mass = scale;
};
WordField.prototype.reset = function()
{
  var wCoef = Math.random() > 0.5 ? -1 : 1;
  var hCoef = Math.random() > 0.5 ? -1 : 1;
  this.velocity = new Vector(wCoef*(Math.random()+0.01),hCoef*(Math.random()+0.01));
  this.position = new Vector(cw/2+wCoef*(Math.random()*20+10),ch/2+hCoef*(Math.random()*20+10));
  this.fontSize = 10;
};
// WordField.prototype.updateField = function()
// {
//   this.field.position = new Field(new Vector(this.sprite.position.x, this.sprite.position.y), -this.fontSize*500);
// };
WordField.prototype.updateText = function()
{
  this.sprite.style.font = this.fontSize + "px Lato";
  this.sprite.updateText();
};

var apiData;
$.getJSON('sample.json',function(data){
 apiData = data;

});

//go('Hello');

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

function unlockParticles()
{
  mainhole.setMass(1);
  bg.outPut = true;
  bg.input = false;
  particles.forEach(function(p){
    p.locked = false;
  });
  container.addChild(bhGraphics);
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
        unlockParticles();
      });


      //
    }
  }, 500);
}
