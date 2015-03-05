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
var wordsContainer = new PIXI.DisplayObjectContainer();
//var container = new PIXI.SpriteBatch();
stage.addChild(container);
stage.addChild(wordsContainer);
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



var mainhole = new Field(new Vector(cw/2, ch/2), 440);
var fields = [mainhole];

drawBlackhole();



// var text = new PIXI.Text("Pixi.js can has text!", {font:"50px Arial", fill:"red"});
// stage.addChild(text);



//Select some to be animated
var animatedParticles = [];


var bg = new Scene('bg');
bg.init();

var butterfly = new Scene('butterfly');
butterfly.init(532,606);
butterfly.putButterfly();

//Create background
var maxParticles = 4226;
//maxParticles = 10;
//maxParticles = 1;
for (var i =0;i<maxParticles;i++)
{
  new StarParticle();
}

//UNCOMMENT BEHIND + REDUCE MAX PARTICLES


// for (var i =0;i<particles.length;i++)
// {
//   var p = particles[i];
//   p.reset();
// }
// unlockParticles();
// var apiData;
// $.getJSON('sample.json',function(data){
//  apiData = data;
//    parseData(apiData);
// });

currentInterval = 0;
clusters = [];
maxClusterSize = 90;


words = [];
function WordField(word,maxSize,cluster)
{
  this.cluster = cluster;
  this.word = word;
  this.isCluster = this.isWordACluster();
  this.color = this.isCluster ? "orange" : "white";
  this.reset();
  var text = new PIXI.Text(word, {font: this.fontSize + "px Lato", fill: this.color});
  text.anchor.set(0.5);
  text.position = this.position;
  this.sprite = text;
  this.field = new Field(this.position, this.fontSize);
  this.field.dontHideParticles = true;
  fields.push(this.field);
  this.maxSize = maxSize;

  wordsContainer.addChild(text);
  words.push(this);
}
WordField.prototype.move = function()
{
   if (this.locked) return;
   var acceleration = this.velocity;
   this.position.add(acceleration);
   //this.updateField();



   var distance = this.position.getDistance(new Vector(cw/2,ch/2));
   //console.log(distance);
   if (distance > cw/4*0.8 && this.isCluster && !this.noLock)this.locked = true, this.cluster.loadCorrelated();


   if (!this.initialDistance) this.initialDistance = cw/4;
   //var scale = ((cw/2)/(cw/2)-distance);
   var scale = this.maxSize*(distance)/this.initialDistance;
   //if (scale > this.maxSize || scale < 0 || isNaN(scale) || typeof scale != "number") scale = 10;
   //console.log(scale);
   this.fontSize = Math.min(scale,this.maxSize);
   this.updateText();
   this.field.mass = scale;

   var margin = Math.max(this.sprite.height/2,this.sprite.width/2);
   if (this.position.x > cw+margin || this.position.x < 0-margin || this.position.y > ch+margin || this.position.y < 0-margin)
   {
      console.log(this,this.position,'OUT');
      this.locked = true;

      //Cleaning word and field.
      wordsContainer.removeChild(this.text);
      fields.splice(fields.indexOf(this.field),1);
      words.splice(words.indexOf(this),1);


      if (this.isCluster)
      {
        //Delete from clusters array
        //Delete all children sprite + self sprite.
        var next = this.cluster.findNext();
        if (next)
        {
          this.locked = false;
          this.cluster.noLock = false;
          this.cluster.newFrom(next);
        }
        else
        {
          if (!words.length)
          {
            animCallBack('Data Fetching Ended').done(function(){
              setTimeout(function(){
                  $('.bodywrapper').animate({opacity:0},2000,function(){
                    document.location.reload();
                  });
                },4000);
            });
          }
        }
        return;
      }
      //Out of bounds.



      this.cluster.doneCorrelated--;
      if (this.cluster.doneCorrelated === 0 && !this.cluster.wordField.noLock)
      {
        this.cluster.doneCorrelated--;
        console.log(this.cluster,'ENDED->next interval');
        var nextCluster = this.cluster.isInNextInterval();
        if (nextCluster)
        {
          this.cluster.resetWith(nextCluster);
        }
        else
        {
          if (!this.cluster.wordField.noLock)
          {
            //debugger;
            this.cluster.wordField.noLock = true;
            this.cluster.wordField.locked = false;
          }
        }
      }
   }
};
WordField.prototype.isWordACluster = function()
{
  //debugger;
  return this.cluster.name == this.word;
};
WordField.prototype.reset = function()
{
  var wCoef = Math.random() > 0.5 ? -1 : 1;
  var hCoef = Math.random() > 0.5 ? -1 : 1;
  if (this.isCluster)
  {
    var oldCluster = clusters.indexOf(this.cluster);
    var id = oldCluster > -1 ? oldCluster : clusters.length % 3;
    if (id === 0)
    {
      this.velocity = new Vector(Math.random()/2+0.05,Math.random()/2+0.05);
    }
    if (id == 1)
    {
      this.velocity = new Vector(-(Math.random()/2+0.05),-(Math.random()/2+0.05));
    }
    if (id == 2)
    {
      this.velocity = new Vector(Math.random()/2+0.05,-(Math.random()/2+0.05));
    }
    console.log(id,this.velocity,this);
  }
  else
  {
    //random this.velocity = new Vector(wCoef*(Math.random()/2+0.05),hCoef*(Math.random()/2+0.05));
    this.velocity = this.cluster.wordField.velocity.clone();
    this.velocity.mult(1.05);
  }

  this.position = new Vector(cw/2+wCoef*(Math.random()*20+10),ch/2+hCoef*(Math.random()*20+10));
  this.fontSize = 1;
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




function Cluster(name,cluster,intervalNb)
{
   this.currentInterval = intervalNb;
   this.name = name;
   this.cluster = cluster;
   this.reset();
   clusters.push(this);
}
Cluster.prototype.reset = function(keepweight)
{
  this.children = this.cluster.children.slice(0,5);
  if (!keepweight)
  {
    this.weight = maxClusterSize/(clusters.length+1);
  }
  this.wordField = new WordField(this.name,this.weight,this);
};

Cluster.prototype.resetWith = function(cluster)
{
   this.name = cluster.name.split('cluster ')[1];
   this.cluster = cluster;
   this.children = cluster.children.slice(0,5);
   this.loadCorrelated();
};
Cluster.prototype.isInNextInterval = function()
{
    this.currentInterval++;
    var clusterName = this.name;
    var next = this.currentInterval;
    if (!intervals[next]) return false;
    var potentialCluster = intervals[next].children[1].children.slice(0,3).filter(function(cluster){
        var name = cluster.name.split('cluster ')[1];
        return name == clusterName;
      });
    if (!potentialCluster.length) return false;
    return potentialCluster[0];
};

Cluster.prototype.findNext = function()
{
    //Interval got already upgraded
    var next = this.currentInterval;
    var list = clusters.map(function(c){return c.name;});
    if (!intervals[next]) return false;
    var potentialCluster = intervals[next].children[1].children.slice(0,3).filter(function(cluster){
        var name = cluster.name.split('cluster ')[1];
        return list.indexOf(name) == -1;
      });
    if (!potentialCluster.length) return false;
    return potentialCluster[0];
};

Cluster.prototype.newFrom = function(newCluster)
{
    this.name = newCluster.name.split('cluster ')[1];
    this.reset(true);
};

Cluster.prototype.loadCorrelated = function()
{
   console.log('Loading correlated for',this.name,this.children.length);
   this.doneCorrelated = this.children.length;
   for (var i=0;i<this.children.length;i++)
   {
     this.doTimeout(this,i);
   }
};

Cluster.prototype.doTimeout = function(that,i)
{
  //console.log(i,'i');
  setTimeout(function(){
    var c = that.children[i];
    c.wordField = new WordField(c.name,that.weight/2+(that.weight*c.keyword_count/100),that);

  },i*3000);
};


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
  //container.addChild(bhGraphics);
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
        setTimeout(function(){
          parseData(api.data);
          animCallBack('Done processing ' + api.data[0].message.split(' ')[3] + ' clusters for ' + api.data[0].term);
        },2000);
      });


      //
    }
  }, 500);
}
