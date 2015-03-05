function Field(point, mass) {
  this.position = point;
  this.setMass(mass);
}

Field.prototype.setMass = function(mass) {
  this.mass = mass || 100;
  this.drawColor = mass < 0 ? "#f00" : "#0f0";
};

function StarParticle(neutral)
{
  var pSprite = new PIXI.Sprite(particleTexture);
  var scale;

  if (neutral)
  {
    this.reset();
  }
  else
  {
      this.position = new Vector(Math.random()*cw,Math.random()*ch);
      scale  = Math.random()*0.05+0.03;
      this.alpha = Math.random()*0.5;
      this.velocity = new Vector(Math.random()*10-5,Math.random()*10-5);
  }



  this.scale = new Vector(scale,scale);
  pSprite.alpha = this.alpha;
  pSprite.position = this.position;
  pSprite.anchor.set(0.5);
  pSprite.scale = this.scale;
  this.sprite = pSprite;

  particles.push(this);
  container.addChild(pSprite);
}

StarParticle.prototype.reset = function()
{
  var pSprite = this.sprite;
  scale = 0.1;
  this.alpha = 1;
  var wCoef = Math.random() > 0.5 ? -1 : 1;
  var hCoef = Math.random() > 0.5 ? -1 : 1;
  this.velocity = new Vector(wCoef*(Math.random()+0.1),hCoef*(Math.random()+0.1));
  this.position = new Vector(cw/2+wCoef*(Math.random()*20+10),ch/2+hCoef*(Math.random()*20+10));
  this.scale = new Vector(scale,scale);
  pSprite.alpha = this.alpha;
  pSprite.position = this.position;
  pSprite.anchor.set(0.5);
  pSprite.scale.set(scale);
  pSprite.tint = Math.random() < 0.7 ? '0x' + rgbToHex(255,184,0) : '0xffffff';
};

StarParticle.prototype.moveToWord = function()
{
   if (!this.destination || this.doneToWord) return;

   var diff = new Vector(this.destination.x-this.position.x,this.destination.y-this.position.y);
   var distance = diff.getMagnitude();
   if (!this.initialDistance) this.initialDistance = distance+0.1;
   var angle = diff.getAngle();

   var attractForce = distance * 0.01;
   var acceleration = Vector.fromAngle(angle,attractForce);
   this.velocity.add(acceleration);
   this.velocity.mult(0.7);

   if (distance < 0.1)
   {
     this.doneToWord = true;
     particlesDone++;
   }

   this.position.add(this.velocity);
   var maxScale = 0.1;
    if (this.sprite.scale.x < maxScale)
    {
    var scale = Math.max(this.sprite.scale.x,maxScale* (this.initialDistance-distance)/this.initialDistance);
    this.sprite.scale.x = scale;
    this.sprite.scale.y = scale;
    }
   if (this.sprite.alpha < 1)
   {
     this.sprite.alpha = Math.max(this.sprite.alpha,1* (this.initialDistance-distance)/this.initialDistance);
   }

};

StarParticle.prototype.animateBackground = function()
{
  var frames = Math.random()*100+150;
  var pSprite = this.sprite;
  if (!this.bgAnim)
  {
    this.bgAnim = {frames: frames,
      alpha: 1,
      initialAlpha: this.alpha,
      scale: this.scale.x + Math.random()*0.05,
      initialScale: this.scale
    };
    var alphaDiff =this.bgAnim.alpha -  this.alpha;
    var alphaPerFrame = alphaDiff / this.bgAnim.frames;
    var scaleDiff = this.bgAnim.scale - this.scale.x;
    this.bgAnim.scalePerFrame = scaleDiff / this.bgAnim.frames;
    this.bgAnim.alphaPerFrame = alphaPerFrame;
  }
  //debugger;
  //console.log(this.bgAnim);
  pSprite.alpha += this.bgAnim.alphaPerFrame;
  pSprite.scale.set(pSprite.scale.x + this.bgAnim.scalePerFrame);
  this.bgAnim.frames--;
  if (this.bgAnim.frames <= 0)
  {
    if (!this.bgAnim.reverse) {
      this.bgAnim.frames = frames;
      this.bgAnim.alpha = this.bgAnim.initialAlpha;
      this.bgAnim.alphaPerFrame = -this.bgAnim.alphaPerFrame;
      this.bgAnim.scale = this.bgAnim.initialScale;
      this.bgAnim.scalePerFrame = -this.bgAnim.scalePerFrame;
      this.bgAnim.reverse = 1;
    }
    else
    {
      animatedParticles.splice(animatedParticles.indexOf(this),1);
    }
  }
};


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
        if (particles.length < 10)
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