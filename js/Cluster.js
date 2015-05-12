function Cluster(name,cluster,intervalNb)
{
   this.currentInterval = intervalNb;
   this.name = name;
   this.cluster = cluster;
   this.reset();
   clusters.push(this);
}
Cluster.prototype.reset = function(keepweight)
{
  this.children = this.cluster.children.slice(0,5);
  if (!keepweight)
  {
    this.weight = maxClusterSize/(clusters.length+1);
  }
  this.wordField = new WordField(this.name,this.weight,this);
};

Cluster.prototype.resetWith = function(cluster)
{
   this.name = cluster.name.split('cluster ')[1];
   this.cluster = cluster;
   this.children = cluster.children.slice(0,5);
   this.loadCorrelated();
};
Cluster.prototype.isInNextInterval = function()
{
    this.currentInterval++;
    var clusterName = this.name;
    var next = this.currentInterval;
    if (!intervals[next]) return false;
    var potentialCluster = intervals[next].children[1].children.slice(0,3).filter(function(cluster){
        var name = cluster.name.split('cluster ')[1];
        return name == clusterName;
      });
    if (!potentialCluster.length) return false;
    return potentialCluster[0];
};

Cluster.prototype.findNext = function()
{
    //Interval got already upgraded
    var next = this.currentInterval;
    var list = clusters.map(function(c){return c.name;});
    if (!intervals[next]) return false;
    var potentialCluster = intervals[next].children[1].children.slice(0,3).filter(function(cluster){
        var name = cluster.name.split('cluster ')[1];
        return list.indexOf(name) == -1;
      });
    if (!potentialCluster.length) return false;
    return potentialCluster[0];
};

Cluster.prototype.newFrom = function(newCluster)
{
    this.name = newCluster.name.split('cluster ')[1];
    this.reset(true);
};

Cluster.prototype.loadCorrelated = function()
{
   console.log('Loading correlated for',this.name,this.children.length);
   this.doneCorrelated = this.children.length;
   for (var i=0;i<this.children.length;i++)
   {
     this.doTimeout(this,i);
   }
};

Cluster.prototype.doTimeout = function(that,i)
{
  setTimeout(function(){
    var c = that.children[i];
    c.wordField = new WordField(c.name,that.weight/2+(that.weight*c.keyword_count/100),that);

  },i*3000);
};