var Api = function (word)
{
    this.word = word;
    this.resolved = false;
    this.setup();
};

// Setup query for a term.
Api.prototype.setup = function ()
{
    var that = this;
    $.getJSON('https://api.keywordmeme.com/v1/fetch?api_token=' + token + '&q=' + this.word, function (data)
    {
        console.log(data);
        that.query_token = data.query_token;
        that.pollStatus();
    });
};
// Polls until status resolves
// Todo: Use deferred/promise
Api.prototype.pollStatus = function ()
{
    var that = this;
    if (!this.resolved)
    {
        setTimeout(function ()
        {
            $.getJSON('https://api.keywordmeme.com/v1/fetch?query_token=' + that.query_token + '&api_token=' + token, function (data)
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