var words;
!function($){
    'use strict';
    var token = "71ffe134c2cb7f2c5375d7c23fbf90d2";
    var games = [];
    var Game = function(word)
    {
        this.word = word;
        this.resolved = false;
        games.push(this);
        this.setup();
    };
    Game.prototype.setup = function()
    {
        var that = this;
        $.getJSON('http://api.keywordmeme.com/v1/fetch?api_token='+token+'&q='+this.word,function(data)
                  {
                    console.log(data);
                    that.query_token = data.query_token;
                    that.pollStatus();
                  });
    };
    Game.prototype.pollStatus = function()
    {
        var that = this;
        if (!this.resolved)
        {
            setTimeout(function()
            {
                $.getJSON('http://api.keywordmeme.com/v1/fetch?query_token='+that.query_token+'&api_token='+token,function(data)
                          {
                            //console.log(data);
                            if (data[0] && data[0].status == "success")
                            {
                                that.resolved = true;
                                words = data[1].children[0].children[0].children;
                                run();
                                $('.text').text('Again !');
                            }
                            that.pollStatus();
                });
            },2000);
        }

    };
    $(function(){
      $('body').on('click tap','.button',function(e){
        var val = $('#word').val();
        if (val === "") { return; }
        var $this = $(this);
        setTimeout(function(){
            $('.text').text('Wait 10sec...');
        }, 1000);
        new Game(val || 'ibm');
        scene.init();
        var $that = $(this);
        var $ripple = $(this).find('.ripple');
        if ($ripple.length != 3)
          {
     $ripple.first().clone().addClass('second').insertAfter($ripple);
     $ripple.first().clone().addClass('third').insertAfter($ripple.last());
          }
         $ripple = $(this).find('.ripple');
         $ripple.removeClass('expand');
         var offset = $ripple.width()/2;
         var rect = this.getBoundingClientRect();
         var top = e.offsetY - offset,
           left = e.offsetX - offset;
        if (left == 0 || top == 0)
          {
            $ripple.addClass('expand');
            return;
          }
        $ripple.css({
           top:top,
           left:left,
         });
     /*
     // Callback if needed

     $ripple.first().off().one('animationEnd webkitAnimationEnd',function(){
          $(this).removeClass('expand');
            $that.toggleClass('changed');
            //$that.find('.text').text($that.hasClass('changed') ? 'Yeah !': 'Click me');
          });*/
          $ripple.addClass('expand');
        });
    });
}(jQuery);


var hearts = {};
var heartIndex = 0;
var mouse = {};
var headerHeight = 300;

function Scene()
{
  this.canvas = document.createElement("canvas");
  this.context = this.canvas.getContext("2d");
}

Scene.prototype.init = function()
{
  var wrapper = document.getElementsByClassName('canvasWrapper')[0];
  var style = this.canvas.style;
  style.left = 0;
  style.top = 0;
  style.width = 500;
  this.canvas.width = 500;
  this.canvas.height = wrapper.getClientRects()[0].height;
  style.background = 'transparent';
  style.height = headerHeight;
  style.position = 'absolute';
  wrapper.appendChild(this.canvas);
};

function Heart(canvas)
{
  this.scene = canvas;
  this.x = 430;
  this.y = headerHeight - 25;
  this.age = 0;
  this.currentScale = 0.1;
  this.maxScale = ~~(Math.random()*1) + 1;
  this.death = ~~(Math.random() * 50) + 150;
  this.speed = 0.9;
  this.angle = (Math.random()) * Math.PI * 2;
  heartIndex++;
  this.id = heartIndex;
  this.word = this.id > words.length - 1 ? words[this.id % (words.length - 1)].name : words[this.id].name;
  hearts[heartIndex] = this;
}

Heart.prototype.draw = function()
{
  // Wrong way to do it :D randomize Y each time
  // this.gravityY = (~~(Math.random() * 4) + 1) * (Math.floor(Math.random() - 0.5) === 0 ? 1 : -1);
  // this.gravityX = ~~(Math.random()) + 1;

  this.currentScale= this.currentScale > this.maxScale? this.maxScale : this.currentScale + 0.001;
  // this.y -= this.gravityY;
  // this.x += this.gravityX;

  // Less derpy way to do it, science bitches !
  this.x += Math.sin(this.angle) * this.speed;
  this.y += Math.cos(this.angle) * this.speed;
  this.age++;
  //Farewell my friend.
  if (this.age > this.death)
  {
      delete hearts[this.id];
  }

  var ctx = this.scene.context;
  var x = this.x,
      y = this.y;
  ctx.save(); // We're doing translate/scale, saving context state before
  ctx.translate(x/2, y/2);

  ctx.scale(this.currentScale,this.currentScale);
  // ctx.beginPath();
  // ctx.bezierCurveTo(75,37,70,25,50,25);
  // ctx.bezierCurveTo(20,25,20,62.5,20,62.5);
  // ctx.bezierCurveTo(20,80,40,102,75,120);
  // ctx.bezierCurveTo(110,102,130,80,130,62.5);
  // ctx.bezierCurveTo(130,62.5,130,25,100,25);
  // ctx.bezierCurveTo(85,25,75,37,75,40);
  ctx.imageSmoothingEnabled = false;
  //ctx.fillStyle = 'hsla(' + ~~(Math.random() * 20 - 10) + ',100%,50%,' + (1 - this.age/this.death) + ')';
  ctx.fillStyle = 'rgba(255,255,255,' + (1 - this.age/this.death) * 2 + ')';
  ctx.font = "80px Arial";
  ctx.fillText(this.word, this.x, this.y);
  //ctx.fill();
  ctx.restore();
  //console.log(this.id,' drawing. :)',this.x,this.y,this.currentScale,this.maxScale);
};

function run() {
  var h = scene.canvas.height;
  var w = scene.canvas.width;
  var ctx = scene.context;

  ctx.moveTo(0,0);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, w, h);

  // let's create some particles if needed
  var numHearts = Object.keys(hearts).length;
  if (numHearts < 10)
  {
    if (heartIndex === 0 || numHearts === 0)
    {
      new Heart(scene);
    }
    else if (numHearts > 0 && hearts[Object.keys(hearts).pop()].age > ~~(Math.random() * 20) + 40)
    {
      new Heart(scene);
    }

  }


  // and draw each one seperately
  //scene.context.clearRect(0,0,1280,150);
  for (var j in hearts) {
    hearts[j].draw();
  }

  // and run it over and over again
  requestAnimationFrame(run);
}


// init
var scene = new Scene();
scene.init();

function trackMouse(e) {
  mouse.x = e.pageX;
  mouse.y = e.pageY;
}

function forgetMouse(e) {
  mouse.x = false;
  mouse.y = false;
}

Scene.prototype.scale = function() {
  this.canvas.width = window.innerWidth;
};


function scaleCanvas() {
  scene.scale();
};
//scaleCanvas();
//run();

window.addEventListener('resize', scaleCanvas);


scene.canvas.addEventListener('mousemove', trackMouse);
scene.canvas.addEventListener('mouseleave', forgetMouse);