var Api = function (word)
{
    this.word = word;
    this.resolved = false;
    this.setup();
};
Api.prototype.setup = function ()
{
    var that = this;
    $.getJSON('http://api.keywordmeme.com/v1/fetch?api_token=' + token + '&interval_records=100&q=' + this.word, function (data)
    {
        console.log(data);
        that.query_token = data.query_token;
        that.pollStatus();
    });
};
Api.prototype.pollStatus = function ()
{
    var that = this;
    if (!this.resolved)
    {
        setTimeout(function ()
        {
            $.getJSON('http://api.keywordmeme.com/v1/fetch?query_token=' + that.query_token + '&api_token=' + token, function (data)
            {
                //console.log(data);
                if (data[0] && data[0].status == "success")
                {
                    that.data = data;
                    that.resolved = true;
                    that.words = data[1].children[0].children[0].children;
                    console.log('Api Result ready !');
                }
                that.pollStatus();
            });
        }, 2000);
    }

};

// api.data[1].children.forEach(function(interval){ console.log(interval.interval_start_time,interval.children[1]) })