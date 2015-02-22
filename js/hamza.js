var cw = document.body.clientWidth/3;
var ch = document.body.clientHeight/3;
var wrapper = document.getElementsByClassName('canvasWrapper')[0];
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

function objOff(obj)
{
    var currleft = currtop = 0;
    if( obj.offsetParent )
    { do { currleft += obj.offsetLeft; currtop += obj.offsetTop; }
      while( obj = obj.offsetParent ); }
    else { currleft += obj.offsetLeft; currtop += obj.offsetTop; }
    return [currleft,currtop];
}
function FontMetric(fontName,fontSize)
{
    var text = document.createElement("span");
    text.style.fontFamily = fontName;
    text.style.fontSize = fontSize + "px";
    text.innerHTML = "ABCjgq|";
    // if you will use some weird fonts, like handwriting or symbols, then you need to edit this test string for chars that will have most extreme accend/descend values

    var block = document.createElement("div");
    block.style.display = "inline-block";
    block.style.width = "1px";
    block.style.height = "0px";

    var div = document.createElement("div");
    div.appendChild(text);
    div.appendChild(block);

    // this test div must be visible otherwise offsetLeft/offsetTop will return 0
    // but still let's try to avoid any potential glitches in various browsers
    // by making it's height 0px, and overflow hidden
    div.style.height = "0px";
    div.style.overflow = "hidden";

    // I tried without adding it to body - won't work. So we gotta do this one.
    document.body.appendChild(div);

    block.style.verticalAlign = "baseline";
    var bp = objOff(block);
    var tp = objOff(text);
    var taccent = bp[1] - tp[1];
    block.style.verticalAlign = "bottom";
    bp = objOff(block);
    tp = objOff(text);
    var theight = bp[1] - tp[1];
    var tdescent = theight - taccent;

    // now take it off :-)
    document.body.removeChild(div);

    // return text accent, descent and total height
    return [taccent,theight,tdescent];
}


var bg = new Scene('bg');

  var measure = {width:0};
Scene.prototype.prepare = function (keyword)
{
  var font = 'Arial';
  var ctx = this.context;
  var canvas = this.canvas;

  var margin = 80;
  var fontSize = 1;
  for (;measure.width + margin < canvas.w;fontSize+=10){
  ctx.font = fontSize + "px '"+font+"'";
  measure = ctx.measureText(keyword);
  }
  ctx.clearRect(0,0,cw,ch);
  measure.height = FontMetric(font,fontSize)[1];
  for (;measure.height > canvas.h;fontSize-=10){
  measure.height = FontMetric(font,fontSize)[1];
  }
  ctx.font = fontSize + "px '"+font+"'";
  // resolution = ~~((cw / measure.width + ch/ measure.actualBoundingBoxAscent) + keyword.length/2 + 1);
  //resolution = 30;
  //debugger;
  ctx.fillText(keyword, (canvas.w / 2) - Math.round(measure.width / 2), (canvas.h / 2) + ~~(measure.height /2));
};

bg.init();
bg.prepare('Hello');
