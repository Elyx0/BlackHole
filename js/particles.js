function Field(point, mass) {
  this.position = point;
  this.setMass(mass);
}

Field.prototype.setMass = function(mass) {
  this.mass = mass || 100;
  this.drawColor = mass < 0 ? "#f00" : "#0f0";
};

function StarParticle()
{
  var pSprite = new PIXI.Sprite(particleTexture);
  this.position = new Vector(Math.random()*cw,Math.random()*ch);
  this.velocity = new Vector(Math.random()*10-5,Math.random()*10-5);

  var scale = Math.random()*0.05+0.03;
  this.scale = new Vector(scale,scale);
  pSprite.alpha = this.alpha = Math.random()*0.5;
  pSprite.position = this.position;
  pSprite.anchor.set(0.5);
  pSprite.scale = this.scale;
  this.sprite = pSprite;

  particles.push(this);
  container.addChild(pSprite);
}

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