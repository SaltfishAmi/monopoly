/** function.js 
  * 2017/09/10
  * fuckami.moe
  */

var okToRoll=0;
var turn_count=1;
var firstrun = 1;
function refreshIndicator(){
	$("players_indicator").innerHTML="";
	for(var index=0; index < player_count; ++index){
		if(active_player == index){
			c(index+1).className += " _active";
			$("players_indicator").innerHTML += "<b class=\"_active\" title='玩家名称：" + player[active_player].name + "'>"+(index+1)+"</b>";
			$("cood_x").innerHTML = player[active_player].posX;
			$("cood_y").innerHTML = player[active_player].posY;
		}
		else {
			c(index+1).removeClass("_active");
			$("players_indicator").innerHTML += "<b title='玩家名称：" + player[index+1].name + "'>" + (index+1) + "</b>";
		}
		$("players_indicator").innerHTML += "$" + player[index].cash + " ";
	}
	$("players_indicator").innerHTML = $("players_indicator").innerHTML.slice(0, -1);
}
function setActive(playr){
	active_player = playr.id;
	refreshIndicator();
} function generatePointsByPath(start, end){
	var points = [
		start
	];
	if(start[0]==end[0]){
		if(start[1]==end[1])return points;
		if(start[1]>end[1]){
			for(var index=start[1]-1; index>=end[1]; --index)
				points.push([start[0], index]);
		} else if(start[1]<end[1]){
			for(var index=start[1]+1; index<=end[1]; ++index)
				points.push([start[0], index]);
		}
	}
	else if(start[1]==end[1]){
		if(start[0]==end[0])return points;
		if(start[0]>end[0]){
			for(var index=start[0]-1; index>=end[0]; --index)
				points.push([index, start[1]]);
		} else if(start[0]<end[0]){
			for(var index=start[0]+1; index<=end[0]; ++index)
				points.push([index, start[1]]);
		}
	} else {
		console.log("error generating path");
	}
	return points;
} var pointlist = [];
function setTurn(turn){
	turn_count = turn;
	$("turn_count").innerHTML = turn;
	$("cell_info").innerHTML = "";
} function nextTurn(){
	setTurn(turn_count+1);
	okToRoll = 1;
	$("dice_result").removeClass("red");
	animateDice=1;
	setState("玩家1: " + player[0].name + " 指令阶段");
	$("act").innerHTML="掷骰子";
}
var animateDice=0;
var diceRollAnimate=function(){
	if(animateDice!=0){
		animateDice = Math.floor(Math.random() * 6 + 1);
		$("dice_result").innerHTML = animateDice;
	} else return;
};
function removePlayer(playr){
	var rem = c(playr.id+1);
	$(p(playr.posX, playr.posY)).removeChild(rem);
}
function addPlayer(playr, pos){
	playr.posX = pos[0];
	playr.posY = pos[1];
	var sp = document.createElement("span");
	sp.className += " player";
	sp.className += " " + (playr.id+1);
	var tx = document.createTextNode(playr.id+1);
	sp.appendChild(tx);
	$p(pos).appendChild(sp);
}
function generatePointsByCurve(start, step){
	while(step>pointlist.length)step-=pointlist.length;
	var points = [
		start
	];
	points += pointlist.slice(pointlist.indexOf(start), pointlist.indexOf(start)+step);
}
Array.prototype._indexOf = function(item){
	for(var index=0; index<this.length; ++index){
		if(this[index].toString()==item.toString())return index;
	}
	return -1;
};
function _nextPoint(pos){
	if(pointlist._indexOf(pos)==-1)
		console.log("error no matching point");
	else if(pointlist._indexOf(pos)<=pointlist.length-2)
		return pointlist[pointlist._indexOf(pos)+1];
	else return pointlist[0];
}
function _prevPoint(pos){
	if(pointlist._indexOf(pos)==-1)
		console.log("error no matching point");
	else if(pointlist._indexOf(pos)>=1)
		return pointlist[pointlist._indexOf(pos)-1];
	else return pointlist[pointlist.length-1];
}

window.onload = function(){
	var items = location.search.substr(1).split("&");
	if (items[0] != "" && items[0]!=null) {
		if(items[0].slice(0, 4) != "warp"){
			var state = decodeURIComponent(items[0]);
			init();
			_resume(state);
			firstrun=0;
		} else {
			if(items.length==1){
				//?warp=***
				var tmp = decodeURIComponent(items[0].slice(5));
				//var suspendStr = tmp.split(",");
				
			} else {
				//?warp=***&pos=***
				var tmp = decodeURIComponent(items[0].slice(5));
				var tpos = decodeURIComponent(items[1].slice(4));
				//console.log(tmp);
				//console.log(tpos);
			}
		}
	}
}
function _suspend(name){
	var suspendStr = "";
	suspendStr += turn_count + ",";
	suspendStr += active_player + ",";
	suspendStr += okToRoll + ",";
	suspendStr += player[0].posX + ",";
	suspendStr += player[0].posY + ",";
	suspendStr += player[0].cash + ",";
	suspendStr += player[0].name + ",";
	
	var possessList = "null";
	if(player[0].possess.length != 0){
		possessList = "";
		for(var index=0; index < player[0].possess.length; ++index){
			possessList += s(player[0].possess[index]) + "|";
		}
		possessList = possessList.slice(0, -1);
	}
	possessList = btoa(possessList);
	suspendStr += possessList;
	
	suspendStr = btoa(suspendStr);
	
	var slots;
	if(!checkCookie()){
		setCookie("slots", "0");
	}
	
	slots = parseInt(getCookie("slots"));
	setCookie("slots", (++slots)+"");
	setCookie("name" + slots, name);
	setCookie("slot" + slots, suspendStr);
	return suspendStr;
}

function _resume(str){
	str = atob(str);
	var resumeList = str.split(",");
	setTurn(parseInt(resumeList[0]));
	player[0].cash = parseInt(resumeList[5]);
	player[0].name = resumeList[6];
	_moveTo(player[0], [parseInt(resumeList[3]), parseInt(resumeList[4])]);
	setActive(player[parseInt(resumeList[1])]);
	var possessList = atob(resumeList[7]);
	player[0].possess = [];
	if(possessList!="null"){
		possessList = possessList.split("|");
		for(var index=0; index < possessList.length; ++index){
			player[0].possess.push(q(possessList[index]));
			_buyCell(q(possessList[index]));
		}
	}
	okToRoll = parseInt(resumeList[2]);
	if(okToRoll==1){
		animateDice=1;
		$("act").innerHTML="掷骰子";
		setState("玩家1: " + player[0].name + " 指令阶段");
	} else if(okToRoll==2){
		animateDice=0;
		$("act").innerHTML="下回合";
		setState("玩家1: " + player[0].name + " 行动完毕");
		showInfo([player[0].posX, player[0].posY]);
	}
	alert("已读取存档");
}
function queryCell(ev){
	if(okToRoll==0){
		$("cell_info").innerHTML = "请在当前状态结束后再查询";
		return;
	}
    var P=q(ev.currentTarget.id);
	showInfo(P);
	$("cell_info").innerHTML = "[" + ev.currentTarget.id + "]" + $("cell_info").innerHTML;
}