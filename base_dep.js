/** base_dep.js 
  * 2017/09/10
  * fuckami.moe
  */
  
function $(id) {
	return document.getElementById(id);
} function getElementsByClass(searchClass) {
	if(document.getElementsByClassName)
		return document.getElementsByClassName(searchClass);
    else if (document.all) {
        var classElements = new Array();
        var allElements = document.all;
            for (i = 0, j = 0; i < allElements.length; i++) {
                if (allElements[i].className == searchClass) {
                    classElements[j] = allElements[i];
                    j++;
                }
            }   
    } else if (document.getElementsByTagName) {
        var classElements = new Array();
        var allElements = document.getElementsByTagName("*");
            for (i = 0, j = 0; i < allElements.length; i++) {
                if (allElements[i].className == searchClass) {
                    classElements[j] = allElements[i];
                    j++;
                }
            }       
    } else {
      return;
    }
    return classElements;
} function c(className){
	return getElementsByClass(className)[0];
} function p(x, y){
	return x + "," + y;
} function q(str){
	return [parseInt(str.split(",")[0]),parseInt(str.split(",")[1])];
} function s(pos){
	return pos[0]+","+pos[1];
}function $p(pos){
	return $(s(pos));
}
function setState(state){
	$("status").innerHTML = state;
	document.title = state + " - 丁家桥约饭大富翁";
}
HTMLElement.prototype.hasClass = function(cls) {
    return (' ' + this.className + ' ').indexOf(' ' + cls+ ' ') > -1;
}
HTMLElement.prototype.hasInClass = function(cls) {
    return this.className.indexOf(cls) > -1;
}
HTMLElement.prototype.removeClass = function(remove) {
    var newClassName = "";
    var i;
    var classes = this.className.split(" ");
    for(i = 0; i < classes.length; i++) {
        if(classes[i] !== remove) {
            newClassName += classes[i] + " ";
        }
    }
    this.className = newClassName;
}; 
//cookie functions copied from w3schools and stackoverflow
function setCookie(cname, cvalue) {
    var d = new Date();
    d.setTime(d.getTime() + (36524 * 24 * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires ;//+ ";path=/monopoly";
} function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
} function checkCookie() {
    var user = getCookie("slots");
    if (user != "") {
        return 1;
    } else {
		return 0;
    }
} function clearCookie(){
	document.cookie.split(";").forEach(function(c) {
		
		document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=Thu, 01-Jan-1970 00:00:01 GMT");
	});
}
