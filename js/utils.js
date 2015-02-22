function objOff(obj)
{
    var currleft = currtop = 0;
    if( obj.offsetParent )
    { do { currleft += obj.offsetLeft; currtop += obj.offsetTop; }
      while( obj = obj.offsetParent ); }
    else { currleft += obj.offsetLeft; currtop += obj.offsetTop; }
    return [currleft,currtop];
}
function FontMetric(fontName,fontSize,textString)
{
    var text = document.createElement("span");
    text.style.fontFamily = fontName;
    text.style.fontSize = fontSize + "px";
    text.innerHTML = textString;
    // if you will use some weird fonts, like handwriting or symbols, then you need to edit this test string for chars that will have most extreme accend/descend values

    var block = document.createElement("div");
    block.style.display = "inline-block";
    block.style.width = "1px";
    block.style.height = "0px";

    var div = document.createElement("div");
    div.appendChild(text);
    div.appendChild(block);

    // this test div must be visible otherwise offsetLeft/offsetTop will return 0
    // but still let's try to avoid any potential glitches in various browsers
    // by making it's height 0px, and overflow hidden
    div.style.height = "0px";
    div.style.overflow = "hidden";

    // I tried without adding it to body - won't work. So we gotta do this one.
    document.body.appendChild(div);

    block.style.verticalAlign = "baseline";
    var bp = objOff(block);
    var tp = objOff(text);
    var taccent = bp[1] - tp[1];
    block.style.verticalAlign = "bottom";
    bp = objOff(block);
    tp = objOff(text);
    var theight = bp[1] - tp[1];
    var tdescent = theight - taccent;

    // now take it off :-)
    document.body.removeChild(div);

    // return text accent, descent and total height
    return [taccent,theight,tdescent];
}