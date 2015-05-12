font = 'Lato';

function Scene(name) {
  this.name = name;
  this.canvas = document.createElement("canvas");
  this.canvas.setAttribute('class', name);
  this.canvas.setAttribute('id', name);
  this.context = this.canvas.getContext("2d");
}

Scene.prototype.init = function(sw, sh) {
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

/**
 * The butterfly will be drawn on another canvas, then we will go through each pixels by steps of (resolution var) to find particles,
 * extract the corresponding rbga data from them, and create the according particles.
 */
Scene.prototype.putButterfly = function() {
  this.img = new Image();
  this.img.src = '/darwin.png';
  this.img.onload = this.drawButterfly.bind(this);
};

/**
 * Draws the butterfly onto the separate canvas
 */
Scene.prototype.drawButterfly = function() {
  this.context.drawImage(this.img, 0, 0, this.img.width, this.img.height);
  this.resolution = 6;
};

/**
 * Fill the canvas with a text with optimal size
 */
Scene.prototype.prepare = function(keyword) {
  var ctx = this.context;
  var canvas = this.canvas;
  var measure = {
    width: 0
  };
  var margin = 80;
  var fontSize = 1;
  var resolution;
  //Stupid optimal measurement loop.
  for (; measure.width + margin < canvas.w; fontSize += 5) {
    ctx.font = fontSize + "px '" + font + "'";
    measure.width = ctx.measureText(keyword).width;
  }
  ctx.clearRect(0, 0, cw, ch);
  measure.height = FontMetric(font, fontSize)[1];
  for (; measure.height > canvas.h / 2; fontSize -= 5) {
    var r = FontMetric(font, fontSize, keyword);
    measure.height = r[0] - (r[2] / 1.2);
  }
  ctx.font = fontSize + "px '" + font + "'";
  measure.width = ctx.measureText(keyword).width;
  var r = FontMetric(font, fontSize, keyword);
  measure.height = r[0] - (r[2] / 1.2);
  // End of measurement

  resolution = ~~((cw / measure.width + ch / measure.height) + keyword.length / 5 + 3);
  this.resolution = resolution;

  console.log(measure, resolution, FontMetric(font, fontSize, keyword));
  console.log(cw / 2 - Math.round(measure.width / 2), ch / 2 + Math.round(measure.height / 2));
  ctx.fillText(keyword, cw / 2 - Math.round(measure.width / 2), ch / 2 + Math.round(measure.height / 2));
};

/**
 * Loop on the canvas pixel to extracts colors and create particles.
 * @param  Boolean getTint
 */
Scene.prototype.setupParticles = function(getTint) {
  var ctx = this.context;
  var canvas = this.canvas;
  var resolution = this.resolution;
  var imageData,
    image_data,
    pixel,
    width = 0,
    index = 0,
    slide = false;
  console.log(canvas.w, canvas.h);
  imageData = ctx.getImageData(0, 0, canvas.w, canvas.h);
  image_data = imageData.data;
  console.log(canvas, imageData);
  for (var x = 0; x < imageData.width; x += resolution)
  {
    for (var y = 0; y < imageData.height; y += resolution) {
      i = (y * imageData.width + x) * 4;

      if (imageData.data[i + 3] == 255) {
        if (index >= particles.length) {

          // Means our butterfly doesn't have enough particles :( ? what to do.
          // else
          // {
          //   var rParticle = particles[~~(Math.random()*particles.length)];
          //   new ButterflyParticle(rParticle.initialX,rParticle.y,rParticle.rgba);
          //   particles[index].homeX=x;
          //   particles[index].homeY=y;
          // }

        }
        else {
          if (getTint) {
            particles[index].destination = new Vector(x + bg.canvas.width / 2 - butterfly.canvas.width / 2, y + 100);

            var rgba = [imageData.data[i], imageData.data[i + 1], imageData.data[i + 2]];
            particles[index].rgba = rgba;
            particles[index].desiredTint = '0x' + rgbToHex.apply(0, rgba);
          }
          else {
            particles[index].destination = new Vector(x, y);
          }
        }

        index++;
      }
    }
  }
  console.log('Found:', index);
};