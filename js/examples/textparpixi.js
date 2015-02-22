(function(){
    var stage, textStage, textCTX, form, input;
    var clouds, textPixels, textFormed;
    var offsetX, offsetY, text, renderer;
    var cloudBitmaps = ['https://s3-us-west-2.amazonaws.com/s.cdpn.io/53148/cloud-0.png', 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/53148/cloud-1.png', 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/53148/cloud-2.png', 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/53148/cloud-3.png', 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/53148/cloud-4.png'];

    function init() {
        initStages();
        initForm();
        initText();
        initClouds();
        addListeners();
    }

    // Init Canvas
    function initStages() {
        offsetX = (window.innerWidth-600)/2;
        offsetY = (window.innerHeight-300)/2;
        textStage = document.getElementById("text");
        textStage.width = 600;
        textStage.height = 200;
        textStage.style.left = offsetX+'px';
        textStage.style.top = offsetY+'px';
        textCTX = textStage.getContext('2d');
        var rendererOptions = {
            transparent:true,
        }
        stage = new PIXI.Stage(0x66FF99);
        renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, rendererOptions);
        document.body.appendChild(renderer.view);
    }

    function initForm() {
        form = document.getElementById('form');
        form.style.top = offsetY+200+'px';
        form.style.left = offsetX+'px';
        input = document.getElementById('inputText');
    }

    function initText() {
        textCTX.font = "900 80px 'Source Sans Pro'";
        textCTX.fillStyle = '#28abf6';
        textCTX.fillText("t", 300, 150);
        textCTX.textAlign = 'center';
    }

    function initClouds() {
        clouds = [];
        for(var i=0; i<600; i++) {
          // create a texture from an image path
          var texture = PIXI.Texture.fromImage(cloudBitmaps[Math.floor(Math.random()*cloudBitmaps.length)]);
          // create a new Sprite using the texture
          var cloudBit = new PIXI.Sprite(texture);

          // center the sprites anchor point
          cloudBit.anchor.x = 0.5;
          cloudBit.anchor.y = 0.5;

          // move the sprite t the center of the screen
          cloudBit.position.x = cloudBit.targetX = window.innerWidth*Math.random();
          cloudBit.position.y = cloudBit.targetY =  window.innerHeight*Math.random();

          cloudBit.alpha = cloudBit.targetA = Math.random()*0.1;
          cloudBit.targetV = Math.random()*0.1;

          stage.addChild(cloudBit);
          clouds.push(cloudBit);
          shiftCloud(cloudBit);
        }

        animate();
    }

    function shiftCloud(c) {
      c.targetX = c.targetX + (-3 + Math.random()* 6);
      c.targetY = c.targetY + (-4 + Math.random()* 6);
      setTimeout(function() {
        shiftCloud(c);
      }, 2000 + Math.random()*5000);
    }


    // animating circles
    function animate() {
        var l = clouds.length;
        for(var i = 0; i < l; i++) {
          if(clouds[i].position.x != clouds[i].targetX) {
            clouds[i].position.x += clouds[i].targetV*(clouds[i].targetX - clouds[i].position.x);
          }

          if(clouds[i].position.y != clouds[i].targetY) {
            clouds[i].position.y += clouds[i].targetV*(clouds[i].targetY - clouds[i].position.y);
          }

          if(clouds[i].alpha != clouds[i].targetA) clouds[i].alpha += 0.01*(clouds[i].targetA - clouds[i].alpha);

        }

        renderer.render(stage);
        requestAnimationFrame(animate);
    }

    function formText() {

        for(var i= 0, l=textPixels.length; i<l; i++) {
            clouds[i].targetX = offsetX + textPixels[i].x;
            clouds[i].targetY = offsetY + textPixels[i].y;
            clouds[i].targetV = Math.random()*0.1;
            clouds[i].targetA = 1;
        }
        textFormed = true;
        if(textPixels.length < clouds.length) {
            for(var j = textPixels.length, cl = clouds.length; j<cl; j++) {
                clouds[j].targetX = window.innerWidth*Math.random();
                clouds[j].targetY = window.innerHeight*Math.random();
                clouds[j].targetA = Math.random()*0.1;
                clouds[i].targetV = Math.random()*0.01;
            }
        }
    }


    // event handlers
    function addListeners() {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            if(textFormed) {
                if(input.value != '') {
                    setTimeout(function() {
                        createText(input.value.toUpperCase());
                    }, 810);
                } else {
                    textFormed = false;
                }
            } else {
                createText(input.value.toUpperCase());
            }
        });

        window.addEventListener('resize', resize);
    }

    function resize() {
        offsetX = (window.innerWidth-600)/2;
        offsetY = (window.innerHeight-300)/2;
        textStage.style.left = offsetX+'px';
        textStage.style.top = offsetY+'px';
        renderer.resize(window.innerWidth, window.innerHeight);
        form.style.top = offsetY+200+'px';
        form.style.left = offsetX+'px';
    }

    function createText(t) {
        console.log(t);
        var fontSize = 860/(t.length);

        if (fontSize > 160) fontSize = 160;
        textCTX.clearRect(0,0,600,200);
        textCTX.font = "400 "+fontSize+"px 'Source Sans Pro'";
        textCTX.textAlign = 'center';
        textCTX.textBaseline = 'top';
        textCTX.fillText(t, 300, (172-fontSize)/2);

        var ctx = document.getElementById('text').getContext('2d');
        var pix = ctx.getImageData(0,0,600,200).data;
        textPixels = [];
        for (var i = pix.length; i >= 0; i -= 4) {
            if (pix[i] != 0) {
                var x = (i / 4) % 600;
                var y = Math.floor(Math.floor(i/600)/4);

                if((x && x%12 == 0) && (y && y%12 == 0)) textPixels.push({x: x, y: y});
            }
        }

        formText();

    }

    window.onload = function() { init() };
})();