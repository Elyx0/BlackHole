/*
original script by Rishabh
additions by Rezoner: blur, pulsation, quality, blinking, arc/rect, trembling, background adjusting
*/

/* play with these values */

BLUR = false;

PULSATION = true;
PULSATION_PERIOD = 500;
PARTICLE_RADIUS = 5;

/* disable blur before using blink */

BLINK = false;

GLOBAL_PULSATION = false;

QUALITY = 2; /* 0 - 5 */

/* set false if you prefer rectangles */
ARC = true;

/* trembling + blur = fun */
TREMBLING = 0; /* 0 - infinity */

FANCY_FONT = "arial";

BACKGROUND = "#003";

BLENDING = true;

/* if empty the text will be a random number */
TEXT = "";

/* ------------------ */

var ENCODE_DATA = ["BLUR", "BLENDING", "GLOBAL_PULSATION", "TEXT", "TREMBLING", "ARC", "PULSATION_PERIOD", "PARTICLE_RADIUS", "PULSATION", "BLINK"];

var GET = {};

var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
  GET[key] = value;
});

decodeData();

QUALITY_TO_FONT_SIZE = [10, 20, 50, 100, 200, 350];
QUALITY_TO_SCALE = [20, 14, 6, 3, 1.5, 0.9];
QUALITY_TO_TEXT_POS = [10, 18, 43, 86, 170, 280];

window.onload = function() {
    document.body.style.backgroundColor = BACKGROUND;

  var canvas = document.getElementById("canvas");
  var ctx = canvas.getContext("2d");

  var W = canvas.width;
  var H = canvas.height;

  var tcanvas = document.createElement("canvas");
  var tctx = tcanvas.getContext("2d");
  tcanvas.width = W;
  tcanvas.height = H;


  total_area = W * H;
  total_particles = 800;
  single_particle_area = total_area / total_particles;
  area_length = Math.sqrt(single_particle_area);
  console.log(area_length);

  var particles = [];
  for(var i = 1; i <= total_particles; i++) {
    particles.push(new particle(i));
  }

  function particle(i) {
    this.r = Math.round(Math.random() * 255 | 0);
    this.g = Math.round(Math.random() * 255 | 0);
    this.b = Math.round(Math.random() * 255 | 0);
    this.alpha = 1;

    this.x = (i * area_length) % W;
    this.y = (i * area_length) / W * area_length;


    /* randomize delta to make particles sparkling */
    this.deltaOffset = Math.random() * PULSATION_PERIOD | 0;

    this.radius = 0.1 + Math.random() * 2;
  }

  var positions = [];

  function new_positions() {
    tctx.fillStyle = "white";
    tctx.fillRect(0, 0, W, H)
    tctx.fill();

    tctx.font = "bold " + QUALITY_TO_FONT_SIZE[QUALITY] + "px " + FANCY_FONT;
    var text = TEXT || String(Math.random()).substr(-3);

    tctx.strokeStyle = "black";
    tctx.strokeText(text, (QUALITY + 1) * 5, QUALITY_TO_TEXT_POS[QUALITY]);

    image_data = tctx.getImageData(0, 0, W, H);
    pixels = image_data.data;
    positions = [];
    for(var i = 0; i < pixels.length; i = i + 4) {
      if(pixels[i] != 255) {
        position = {
          x: (i / 4 % W | 0) * QUALITY_TO_SCALE[QUALITY] | 0,
          y: (i / 4 / W | 0) * QUALITY_TO_SCALE[QUALITY] | 0
        }
        positions.push(position);
      }
    }

    get_destinations();
  }

  function draw() {

    var now = Date.now();

    ctx.globalCompositeOperation = "source-over";

    if(BLUR) ctx.globalAlpha = 0.1;
        else if(!BLUR && !BLINK) ctx.globalAlpha = 1.0;

    ctx.fillStyle = BACKGROUND;
    ctx.fillRect(0, 0, W, H)

    if(BLENDING) ctx.globalCompositeOperation = "lighter";

    for(var i = 0; i < particles.length; i++) {
      p = particles[i];

      /* in lower qualities there is not enough full pixels for all of  them - dirty hack*/

      if(isNaN(p.x)) continue

      ctx.beginPath();
      ctx.fillStyle = "rgb(" + p.r + ", " + p.g + ", " + p.b + ")";
      ctx.fillStyle = "rgba(" + p.r + ", " + p.g + ", " + p.b + ", " + p.alpha + ")";


      if(BLINK) ctx.globalAlpha = Math.sin(Math.PI * mod * 1.0);

      if(PULSATION) { /* this would be 0 -> 1 */
                var mod = ((GLOBAL_PULSATION ? 0 : p.deltaOffset) + now) % PULSATION_PERIOD / PULSATION_PERIOD;

        /* lets make the value bouncing with sinus */
        mod = Math.sin(mod * Math.PI);
      } else var mod = 1;

      var offset = TREMBLING ? TREMBLING * (-1 + Math.random() * 2) : 0;

            var radius = PARTICLE_RADIUS * p.radius;

      if(!ARC) {
        ctx.fillRect(offset + p.x - mod * radius / 2 | 0, offset + p.y - mod * radius / 2 | 0, radius * mod, radius * mod);
      } else {
        ctx.arc(offset + p.x | 0, offset + p.y | 0, radius * mod, Math.PI * 2, false);
        ctx.fill();
      }



      p.x += (p.dx - p.x) / 10;
      p.y += (p.dy - p.y) / 10;
    }
  }

  function get_destinations() {
    for(var i = 0; i < particles.length; i++) {
      pa = particles[i];
      particles[i].alpha = 1;
      var distance = [];
      nearest_position = 0;
      if(positions.length) {
        for(var n = 0; n < positions.length; n++) {
          po = positions[n];
          distance[n] = Math.sqrt((pa.x - po.x) * (pa.x - po.x) + (pa.y - po.y) * (pa.y - po.y));
          if(n > 0) {
            if(distance[n] <= distance[nearest_position]) {
              nearest_position = n;
            }
          }
        }
        particles[i].dx = positions[nearest_position].x;
        particles[i].dy = positions[nearest_position].y;
        particles[i].distance = distance[nearest_position];

        var po1 = positions[nearest_position];
        for(var n = 0; n < positions.length; n++) {
          var po2 = positions[n];
          distance = Math.sqrt((po1.x - po2.x) * (po1.x - po2.x) + (po1.y - po2.y) * (po1.y - po2.y));
          if(distance <= 5) {
            positions.splice(n, 1);
          }
        }
      } else {
        //particles[i].alpha = 0;
      }
    }
  }

  function init() {
    new_positions();
    setInterval(draw, 16.67);
    setInterval(new_positions, 2000);
  }

  init();
}

/* GUI */


    document.getElementById("globalPulsation").addEventListener("change", function() {
        switch(this.value | 0) {
            case 0: GLOBAL_PULSATION = false; break;
            case 1: GLOBAL_PULSATION = true; break;
        }
    });


    document.getElementById("effect").addEventListener("change", function() {
        TREMBLING = 0;
        switch(this.value | 0) {
            case 0: BLUR = false; BLINK = false; break;
            case 1: BLUR = true; BLINK = false; break;
            case 2: BLUR = false; BLINK = true; break;
            case 3: BLUR = true; TREMBLING = 5; break;
        }
    });

        document.getElementById("pulsationSpeed").addEventListener("change", function() {
        PULSATION_PERIOD = this.value;
    });

        document.getElementById("particleRadius").addEventListener("change", function() {
        PARTICLE_RADIUS = this.value;
    });

        document.getElementById("shape").addEventListener("change", function() {
        ARC = !parseInt(this.value);
    });


            document.getElementById("blending").addEventListener("change", function() {
        BLENDING = parseInt(this.value);
    });



document.getElementById("link").addEventListener("click", function() {
    var data = [ ];
    for(var i = 0; i < ENCODE_DATA.length; i++) {
        var key = ENCODE_DATA[i];
        var val = window[key];
        if(typeof val !== "string") val = val | 0;
        else val = encodeURIComponent(val);
        data.push(key, val);
    }

    var link = "http://cssdeck.com/labs/full/db2o5oej/0/noframe/?options=" + data.join("__");

    prompt("your link", link);
});

function decodeData() {
    if(GET['options']) {
        var temp = GET['options'].split("__");
        for(var i = 0; i < ENCODE_DATA.length * 2; i += 2) {
            var val = temp[i + 1];
            if(typeof window[temp[i]] !== "string") val = parseInt(val);
            else val = decodeURIComponent(val);
            window[temp[i]] = val;
        }
        document.getElementById("gui").style.display = "none";
    }
}

    document.getElementById("text").addEventListener("click", function() {
    TEXT = prompt("Enter new text", TEXT);
    });
