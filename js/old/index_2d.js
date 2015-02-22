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


var mouse = {};

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
  style.width = window.width;
  this.canvas.width = document.body.clientWidth;
  this.canvas.height = document.body.clientHeight;
  style.background = 'transparent';
  style.position = 'absolute';
  wrapper.appendChild(this.canvas);
};


var x = 6;
var y = 3;
var z = 0;
var a = 5; // ø
var b = 15;// p
var c = 1; // B
var dt=0.02;
var it = 0;
function run() {
  //return;
  var h = scene.canvas.height;
  var w = scene.canvas.width;
  var ctx = scene.context;
  var context = ctx;
  ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.fillRect(0,0,w,h);
  ctx.globalCompositeOperation = 'lighter';
  //ctx.fillStyle = "white";
  it++;
  if (it > 100000)
  {
    return;
  }
  function point(x,y,mult)
  {
    //var mult = mult;
    x *= mult;
    y *= mult;
    // Draw a circle particle on the canvas
    //context.rotate(5*Math.PI/180);
    context.beginPath();
    context.fillStyle = "rgba(227,190,20,0.3)";
    //context.shadowColor = 'rgba(255,255,255,0.1)';
    context.shadowBlur = 1;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
    // After setting the fill style, draw an arc on the canvas
    context.arc(w/2+x, h/2+y, 1, 0, Math.PI*2, true);
    context.closePath();
    context.fill();
  }

  function drawAttractor()
  {
    var newx=x - (a*x) * dt + (a*y) * dt;
    var newy=y+ (b*x)*dt - y*dt - (z*x)*dt;
    var newz=z-(c*z)*dt+(x*y)*dt;
    x=newx;
    y=newy;
    z=newz;
    //console.log('Point',newx,newy);
    point(newx,newy,30);
    //point(newx,newy,40);
  }

  //context.rotate(it*Math.PI/180);
  for (var i = 0;i<20;i++)
  {
    drawAttractor();

  }
  //context.translate(w / 2, h/ 2);
  //context.scale(it,it);
  //
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
run();

window.addEventListener('resize', scaleCanvas);


scene.canvas.addEventListener('mousemove', trackMouse);
scene.canvas.addEventListener('mouseleave', forgetMouse);