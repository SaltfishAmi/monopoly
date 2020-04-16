/** DJQ Restaurant Monopoly
  * version 1.1r
  * by SEU Infinite Gods Anime Club
  * Copyright (C) 2017 All rights reserved.
  *
  * All information are provided 'as is' and without warranty of any kind, either expressed or implied.
  * This core library file(game.js) is open-source under WTFPLv2(www.wtfpl.org)
  * while every other thing Copyright (C) 2017 Fuckami.moe All right reserved.
  * First released on:
  * http://fuckami.moe/monopoly
  */

var player = [
	{
		id : 0,
		posX : 0,
		posY : 0,
		cash : 500,
		name : "sb",
		possess : []
	},
	{
		id : 1,
		posX : 0,
		posY : 0,
		cash : 500,
		name : "sb2",
		possess : [
			//[4,9]
		]
	},
]; 
var player_count=1;
var active_player=0;


function init(){
	//set start pos;
	pointlist = [];
	for(var index=0; index<path.length; ++index){
		if(index<=path.length-2){
			pointlist = pointlist.concat(generatePointsByPath(path[index], path[index+1]));
			pointlist.pop();
		}
		else
			pointlist = pointlist.concat(generatePointsByPath(path[path.length-1], path[0]));
	}
	pointlist.pop();
	var list = document.getElementsByTagName("td");
	for (var index = 0; index < list.length; ++index){
		list[index].addEventListener('click', queryCell, false);
		list[index].setAttribute("title", list[index].id);
	}
	for(var index=0; index < player_count; ++index){
		player[index].id = index;
		addPlayer(player[index],startPoint);
	}
	firstrun=0;
	setActive(player[0]);
	setTurn(1);
	$("direction").innerHTML="正";
	animateDice=1;
	setInterval(diceRollAnimate, 50);
	okToRoll = 1;
	setState("玩家1: " + player[0].name + " 指令阶段");
	$("act").innerHTML="掷骰子";
}

function _moveTo(playr, pos){
	removePlayer(playr);
	addPlayer(playr, pos);
}
function moveTo(playr, pos){
	_moveTo(playr, pos);
	var elem = $p(pos);
	if(elem.getAttribute("data-toll")!=""&&elem.getAttribute("data-toll")!=null){
		if(elem.getAttribute("data-owner") == (playr.id + 1))return;
		
		playr.cash -= parseInt(elem.getAttribute("data-toll"));
		if(elem.hasClass("start"))
			$("cell_info").innerHTML = "经过起始点获得$" + elem.getAttribute("data-toll").slice(1);
		else $("cell_info").innerHTML = "支付了$" + elem.getAttribute("data-toll") + "买路财";
		if(elem.getAttribute("data-owner")!=""&&elem.getAttribute("data-owner")!=null){
			player[parseInt(elem.getAttribute("data-owner"))-1].cash += parseInt(elem.getAttribute("data-toll"));
			$("cell_info").innerHTML += ("给<b>" + elem.getAttribute("data-owner") + "</b>: " + player[parseInt(elem.getAttribute("data-owner"))-1].name);
		}
		refreshIndicator();
	}
	// else if(elem.hasClass("cell")&&elem.getAttribute("data-owner")!=""&&elem.getAttribute("data-owner")!=null)
}

function showInfo(pos){
	var elem = $p(pos);
	if(elem.hasClass("start"))
		$("cell_info").innerHTML = "经过起始点获得$" + elem.getAttribute("data-toll").slice(1);
	else if(elem.hasClass("empty"))
		$("cell_info").innerHTML = "该地点没有东西";
	else if(elem.hasClass("warp")){
		$("cell_info").innerHTML = elem.innerHTML.trim().slice(0, elem.innerHTML.trim().indexOf("<br")).trim() + " 传送点";
	}
	else if(elem.hasInClass("road")){
		if(elem.getAttribute("data-toll")!=""&&elem.getAttribute("data-toll")!=null)
			$("cell_info").innerHTML = "要从此路过，留下$" + elem.getAttribute("data-toll");
		else $("cell_info").innerHTML = "该地点没有东西";
	}
	else if(elem.hasClass("cell")){
		if(elem.getAttribute("data-type")=="hospital"||elem.getAttribute("data-type")=="jail"){
			$("cell_info").innerHTML = "Currently not implemented";
			return;//TODO
		}
		if(elem.getAttribute("data-price")==""||elem.getAttribute("data-price")==null){
			$("cell_info").innerHTML = elem.innerHTML.trim().slice(0, elem.innerHTML.trim().indexOf("<br")).trim();
			return;
		}
		$("cell_info").innerHTML = elem.innerHTML.slice(0, elem.innerHTML.indexOf("$")).trim() + " $" + elem.getAttribute("data-price");
		if(elem.getAttribute("data-owner")!=""&&elem.getAttribute("data-owner")!=null){
			$("cell_info").innerHTML +=( " 拥有者：<b>" + elem.getAttribute("data-owner") + "</b>: " + player[elem.getAttribute("data-owner")-1].name);
			if(elem.getAttribute("data-owner")-1 == active_player)
				$("cell_info").innerHTML +=("（自己），住宿费：$");
			else $("cell_info").innerHTML +=( "，要在此住宿，留下$");
			$("cell_info").innerHTML += (elem.getAttribute("data-stay"));
		}
	}
	if(pointlist._indexOf(q(elem.id)) == -1){
		$("cell_info").innerHTML += "；该点不处于路线上";
	}
	
	if(elem.id==p(player[active_player].posX, player[active_player].posY)&&elem.getAttribute("data-price")!=""&&elem.getAttribute("data-price")!=null&&elem.getAttribute("data-owner")!=(active_player+1))
		$("cell_info").innerHTML += " <a href='javascript:;' onclick='buyCell([" + elem.id + "]);'>购买地块</a>";
	
	if(elem.hasClass("reverse"))
		$("cell_info").innerHTML = "折返点，" + $("cell_info").innerHTML ;
}

function nextPoint(pos){
	if(loop==1||(loop==0&&direction==1))return _nextPoint(pos);
	else if(loop==0&&direction==0)return _prevPoint(pos);
}

function step(){
	moveTo(player[active_player], nextPoint([player[active_player].posX, player[active_player].posY]));
	if(loop==0)$("direction").innerHTML = direction==1?"正":"反";
}

var animateDest;
var animateStep;
var intervalID;
var again=0;
var stepMove=function(){
	if(p(player[active_player].posX, player[active_player].posY).toString()==animateDest.toString()){
		clearInterval(intervalID);
		if(again){
			setState("玩家1: " + player[0].name + " 骰子掷出6，还有一次行动机会");
			okToRoll=1;
			again=0;
		}
		else {
			setState("玩家1: " + player[0].name + " 行动完毕");
			okToRoll=2;
			$("act").innerHTML="下回合";
		}//MTYsMCwyLDEsNyw1NzAsc2I=
		var elem=$(p(player[active_player].posX, player[active_player].posY));
		if(elem.getAttribute("data-stay")!=""&&elem.getAttribute("data-stay")!=null){
			if(elem.getAttribute("data-owner") == (active_player + 1))
				return showInfo([player[active_player].posX, player[active_player].posY]);
			player[active_player].cash -= parseInt(elem.getAttribute("data-stay"));
			$("cell_info").innerHTML = "支付了$" + elem.getAttribute("data-stay") + "住宿费";
			if(elem.getAttribute("data-owner")!=""&&elem.getAttribute("data-owner")!=null)
				$("cell_info").innerHTML += ("给<b>" + elem.getAttribute("data-owner") + "</b>: " + player[parseInt(elem.	getAttribute("data-owner"))-1].name);

			$("cell_info").innerHTML += " <a href='javascript:;' onclick='buyCell([" + elem.id + "]);'>购买地块</a>";
			refreshIndicator();
		} else if(elem.getAttribute("data-warp")!=""&&elem.getAttribute("data-warp")!=null){
			//warp to other page
			window.location.href = window.location.href.slice(0, window.location.href.lastIndexOf("/") + 1) + elem.getAttribute("data-warp") + ".html?warp=" + _suspend("warp to "+elem.innerHTML.trim().slice(0, elem.innerHTML.trim().indexOf("<br")).trim());
		} else if(elem.hasInClass("road")&&(elem.getAttribute("data-toll")!=""||elem.getAttribute("data-toll")!=null)&&$("cell_info").innerHTML)
			var shenmedoubuzuo = 0;	//下面buyCell()中留下了购买road类型方块的余地
		else
			showInfo([player[active_player].posX, player[active_player].posY]);
		return;
	}
	step();
	if(animateStep)animateStep--;

	if(!loop&&$(p(player[active_player].posX, player[active_player].posY)).hasClass("reverse")){
		setActive(player[active_player]);
		direction=Math.abs(--direction);
		clearInterval(intervalID);
		stepFor(animateStep);
		showInfo([player[active_player].posX, player[active_player].posY]);
		return;
	}
	setActive(player[active_player]);
}

function stepTo(pos){
	animateStep = -1;
	animateDest = pos;
	setState("玩家1: " + player[0].name + " 行动中");
	intervalID = setInterval(stepMove, 200);
}
function stepFor(steps){
	animateStep = steps;
	if(loop==0&&direction==0)steps = -steps;
	var dest = pointlist._indexOf([player[active_player].posX, player[active_player].posY]) + steps;
	if(dest >= pointlist.length)
		dest -= pointlist.length;
	else if(dest<0)dest+=pointlist.length;
	animateDest = pointlist[dest];
	setState("玩家1: " + player[0].name + " 行动中");
	intervalID = setInterval(stepMove, 200);
}
function _buyCell(pos){
	var elem = $p(pos);
	var price = parseInt(elem.getAttribute("data-price"));
	player[active_player].possess.push(pos);
	elem.setAttribute("data-owner", (active_player + 1) + "");
	if(elem.hasInClass("road"))elem.setAttribute("data-toll", Math.floor(price/20)>0?Math.floor(price/20):1);
	else elem.setAttribute("data-stay", Math.floor(price/10)>0?Math.floor(price/10):1);
	
}
function buyCell(pos){
	var elem = $p(pos);
	if(elem.getAttribute("data-price")==""||elem.getAttribute("data-price")==null)
		return alert("Error: not for sale");
	
	var price = parseInt(elem.getAttribute("data-price"));
	if(player[active_player].cash < price)
		return alert("没钱，滚！");
	
	if(elem.getAttribute("data-owner")==""||elem.getAttribute("data-owner")==null){
		if(player[active_player].name!=window.prompt("请签名确认购买："))
			return alert("已取消地产购买申请");
		//no owner
		player[active_player].cash -= price;
		_buyCell(pos);
	}
	else {
		//have owner
		if(player[parseInt(elem.getAttribute("data-owner"))-1].name!=window.prompt("此处为他人地产，欲购买须请当前拥有者在下框中签名同意："))
			return alert("地产拥有者未签名同意，驳回购买申请");
		
		player[active_player].cash -= price;
		player[parseInt(elem.getAttribute("data-owner"))-1].cash += price;
		player[parseInt(elem.getAttribute("data-owner"))-1].possess.splice(player[parseInt(elem.getAttribute("data-owner"))-1].possess._indexOf(pos), 1);
		_buyCell(pos);
	}
	alert("成功购买该地块！")
	showInfo(pos);
	refreshIndicator();
}

//function mapChange(to, pos)
function act(){
	if(firstrun){
		player[0].name = window.prompt("玩家1请输入你的名字，请使用英文、数字或下划线：", "sb");
		if(!player[0].name)player[0].name="sb";
		return init();
	}
	if(okToRoll==0){
		$("status").innerHTML = "游戏未开始或当前状态未结束，请稍候再试";
		return;
	} else if(okToRoll==1){
		okToRoll=0;
		animateDice=0;
		var dice = Math.floor(Math.random() * 6 + 1);
		if(dice==6)again=1;
		$("dice_result").innerHTML = dice;
		$("dice_result").className += " red";
		stepFor(dice);
	} else if(okToRoll==2){
		//next turn
		nextTurn();
	}
}

function suspend(){
	if(okToRoll==0){
		alert("游戏未开始或当前状态未结束，请稍候再试");
		return;
	}
	$("save").innerHTML="<b>请稍候...</b>";
	var slotname = prompt("请输入存档名称（可选）：", "NoName");
	if(slotname == null || slotname == "")slotname = "NoName"
	slotname = "T"+turn_count+" "+slotname;
	var suspendStr = _suspend(slotname);
	window.open("", "_blank", "toolbar=0,location=0,menubar=0,modal=yes,width=400,height=400").document.write("<script>window.onbeforeunload = function(){window.opener.document.getElementById('save').innerHTML='本地存档';}</script><p>你好，<br/><br/>存档 " + slotname + " <span style='color: red; font-family: Lucida Console, monospace;'>" + suspendStr +"</span>已经保存至 cookie。<br/>请注意 cookie 只在<b>当前浏览器的当前用户</b>（如果有多用户设定）有效。如果需要跨浏览器共享存档，请<a href='javascript:;' onclick='window.prompt(\"按 Ctrl+C 复制中断存档\", \"" + suspendStr +"\");'>复制</a>你的存档并在目标浏览器中载入。</p><a href='javascript:;' onclick='window.close()'>关闭</a>"); 
	return suspendStr;
}
window.resumeCleanup = function(){
	$("continue").innerHTML="本地读档";
	if(window.loadStr == "clear"){
		clearCookie();
		alert("全部存档已清除");
	}
	else if(window.loadStr=="")return;
	else {
		window.location.href = window.location.href.split("?")[0] + "?" + window.loadStr;
	}
}
function resume(){
	$("continue").innerHTML="<b>请稍候...</b>";
	if(!checkCookie()){
		var resumeStr = window.prompt("没有存档。如果有复制的存档，请在下方输入：");
		$("continue").innerHTML="本地读档";
		if(!resumeStr)return;
		return _resume(resumeStr);
	}
	var loadWindow = window.open("", "_blank", "toolbar=0,location=0,menubar=0,modal=yes,width=400,height=500");
	loadWindow.document.write("<script>window.onbeforeunload=function(){window.opener.resumeCleanup();}</script>");
	loadWindow.document.write("<p>你好，<br/><br/> 请点击载入存档。存档以时间顺序排列。<br/>如果有复制的存档，请<a href='javascript:;' onclick='var dat=window.prompt(\"输入存档：\");if(dat!=\"\"&&dat!=null){window.opener.loadStr=dat;window.close();}'>点此输入</a>。</p>");
	var count = parseInt(getCookie("slots"));
	window.loadStr="";
	for(var index=1; index<=count; index++){
		var tmp = getCookie("slot" + index);
		var tmpn = getCookie("name" + index);
		loadWindow.document.write(index +". "+ tmpn + " <a href='javascript:;' onclick='window.opener.loadStr = \"" + tmp + "\"; window.close()' style='font-family: Lucida Console, monospace;'>"+ tmp + "</a><br/>");
	}
	loadWindow.document.write("<br/><a href='javascript:;' onclick='window.close()'>关闭</a> | <a href='javascript:;' onclick='if(window.prompt(\"输入 clear 以确认清空存档：\")==\"clear\"){window.opener.loadStr=\"clear\";window.close();}'>清空所有存档</a>");
}