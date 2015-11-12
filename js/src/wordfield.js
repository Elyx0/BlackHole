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
    this.velocity = this.cluster.wordField.velocity.clone();
    this.velocity.mult(1.05);
  }

  this.position = new Vector(cw/2+wCoef*(Math.random()*20+10),ch/2+hCoef*(Math.random()*20+10));
  this.fontSize = 1;
};

WordField.prototype.updateText = function()
{
  this.sprite.style.font = this.fontSize + "px Lato";
  this.sprite.updateText();
};