PIXI.point = Vector;
function Vector(x,y)
{
  this.x = x || 0;
  this.y = y || 0;
}

Vector.prototype.add = function(vector)
{
    this.x += vector.x;
    this.y += vector.y;
};

Vector.prototype.addScalar = function(nb)
{
    this.x += nb;
    this.y += nb;
};


Vector.prototype.set = function(nb)
{
    this.x = nb;
    this.y = nb;
};

Vector.prototype.clone = function()
{
    return new Vector(this.x,this.y);
}


Vector.prototype.mult = function(number)
{
    this.x *= number;
    this.y *= number;
};

Vector.prototype.getMagnitude = function()
{
    return Math.sqrt(this.x * this.x + this.y * this.y);
};

Vector.prototype.getAngle = function()
{
    return Math.atan2(this.y,this.x);
};

Vector.fromAngle = function(angle,magnitude)
{
    return new Vector(magnitude * Math.cos(angle),magnitude * Math.sin(angle));
};

Vector.prototype.getDistance = function(vector)
{
    return Math.sqrt(Math.pow(vector.x-this.x,2)+Math.pow(vector.y-this.y,2));
};