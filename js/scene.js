function Scene(name)
{
  this.name = name;
  this.canvas = document.createElement("canvas");
  this.canvas.setAttribute('class', name);
  this.canvas.setAttribute('id', name);
  this.context = this.canvas.getContext("2d");
};

Scene.prototype.init = function (sw,sh)
{
  var style = this.canvas.style;
  style.left = 0;
  style.top = 0;
  style.width = window.width;
  this.canvas.width = this.canvas.w = sw || document.body.clientWidth;
  this.canvas.height = this.canvas.h = sh || document.body.clientHeight;
  style.background = 'transparent';
  style.position = 'absolute';
  wrapper.appendChild(this.canvas);
};

Scene.prototype.putButterfly = function()
{
  this.img = new Image();
  this.img.src = '/darwin.png';
  this.img.onload = this.drawButterfly.bind(this);
};

Scene.prototype.drawButterfly = function()
{
  this.context.drawImage(this.img,0,0,this.img.width,this.img.height);
  this.resolution = 6;
  this.setupParticles(true);
};

Scene.prototype.prepare = function (keyword)
{
  var font = 'Arial';
  var ctx = this.context;
  var canvas = this.canvas;
  var measure = {width:0};
  var margin = 80;
  var fontSize = 1;
  var resolution;
  //Stupid optimal measurement bullshit.
  for (;measure.width + margin < canvas.w;fontSize+=5){
  ctx.font = fontSize + "px '"+font+"'";
  measure.width = ctx.measureText(keyword).width;
  }
  ctx.clearRect(0,0,cw,ch);
  measure.height = FontMetric(font,fontSize)[1];
  for (;measure.height > canvas.h;fontSize-=5){
  var r = FontMetric(font,fontSize,keyword);
  measure.height = r[0]-(r[2]/1.2);
  }
  ctx.font = fontSize + "px '"+font+"'";
  measure.width = ctx.measureText(keyword).width;
  var r = FontMetric(font,fontSize,keyword);
  measure.height = r[0]-(r[2]/1.2);
  //End of stupid bullshit
  //
  resolution = ~~((cw / measure.width + ch/ measure.height) + keyword.length/2 + 1);
  this.resolution = resolution;
  //resolution = 30;
  console.log(measure,resolution,FontMetric(font,fontSize,keyword));
  console.log( cw/2 - Math.round(measure.width / 2), ch/2 + Math.round(measure.height / 2));
  ctx.fillText(keyword, cw/2 - Math.round(measure.width / 2), ch/2 + Math.round(measure.height / 2));
};

Scene.prototype.setupParticles = function (getTint)
{
  var ctx = this.context;
  var canvas = this.canvas;
  var resolution = this.resolution;
  particles = [];
  var imageData,
    image_data,
    pixel,
    width = 0,
    index = 0,
    slide = false;
  console.log(canvas.w,canvas.h);
  imageData = ctx.getImageData(0, 0, canvas.w, canvas.h);
  image_data = imageData.data;
  console.log(canvas,imageData);
  for(var x=0;x<imageData.width;x+=resolution) //var i=0;i<imageData.data.length;i+=4)
  {
    for(var y=0;y<imageData.height;y+=resolution)
    {
      i=(y*imageData.width + x)*4;

      if(imageData.data[i+3] == 255)
      {
        if(index >= particles.length)
        {
          if (getTint)
          {
            var rgba = [imageData.data[i],imageData.data[i+1],imageData.data[i+2]];
            //debugger;
            new ButterflyParticle(x,y,rgba);
          }
          else
          {
            new Particle(x,y);
          }

        }
        else
        {
         // particles[index].homeX=x;
         // particles[index].homeY=y;
        }
        index++;
      }
    }
  }
  //debugger;
  //particles.splice(index,particles.length-index);
};
