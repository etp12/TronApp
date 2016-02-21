//dependencies: JQuery, Socket.IO

var canvas,ctx,socket,player,opponent,playerId;
var lastKey = 0;
var PLAYER_WIDTH = 20;
var PLAYER_HEIGHT = 20;

$(function() {
	var socket = io();
	socket.on("connect",function() {
		$("#wait .title").text("Waiting");
	});
	socket.on("play",function(data) {
		//time for countdown
		var players = data.p;
		var id = data.id;
		player = players[id];
		opponent = players[1-id];
		playerId = id;
		$(".page.wait").fadeOut(1000,function() {
			//remove waiting screen, then...
			$(".page.game").css({display:"block"});
			var $playerLabel = $(".player-label");
			$playerLabel.css({top:player.y-$playerLabel.height()+"px", left:player.x+PLAYER_WIDTH/2-$playerLabel.width()/2+"px"});
			ctx.fillStyle = "#000";
			ctx.fillRect(0,0,canvas.width,canvas.height);
			ctx.fillStyle = "#fff";
			ctx.fillRect(player.x,player.y,PLAYER_WIDTH,PLAYER_HEIGHT);
			ctx.fillRect(opponent.x,opponent.y,PLAYER_WIDTH,PLAYER_HEIGHT);
			setTimeout(function() {
				//delay 2 seconds, then...
				$playerLabel.fadeOut(1000,init);
			},2000);
		});
	});
	socket.on("tick",function(data) {
		player = data.players[playerId];
		opponent = data.players[1-playerId];
	});

});

function init() {
	window.requestAnimationFrame(draw);
	document.addEventListener("keydown",keyHandler);
}

function draw() {
	ctx.fillStyle = "#000";
	ctx.fillRect(0,0,canvas.width,canvas.height);
	ctx.fillStyle = "#fff";
	for(var i=0; i<player.path.length-1; i++) {
		var p1 = player.path[i];
		var p2 = player.path[i+1];
		if(p1.x==p2.x) {
			if(p1.y>p2.y) {
				var temp = p1;
				p1 = p2;
				p2 = temp;
			}
		} else {
			if(p1.x>p2.x) {
				var temp = p1;
				p1 = p2;
				p2 = temp;
			}
		}
		
		ctx.fillRect(p1.x,p1.y,p2.x-p1.x+PLAYER_WIDTH,p2.y-p1.y+PLAYER_HEIGHT);
	}
	for(var i=0; i<opponent.path.length-1; i++) {
		var p1 = opponent.path[i];
		var p2 = opponent.path[i+1];
		if(p1.x==p2.x) {
			if(p1.y>p2.y) {
				var temp = p1;
				p1 = p2;
				p2 = temp;
			}
		} else {
			if(p1.x>p2.x) {
				var temp = p1;
				p1 = p2;
				p2 = temp;
			}
		}
		
		ctx.fillRect(p1.x,p1.y,p2.x-p1.x+PLAYER_WIDTH,p2.y-p1.y+PLAYER_HEIGHT);
	}
	ctx.fillRect(player.x,player.y,PLAYER_WIDTH,PLAYER_HEIGHT);
	ctx.fillRect(opponent.x,opponent.y,PLAYER_WIDTH,PLAYER_HEIGHT);
	window.requestAnimationFrame(draw);
}

function keyHandler(e) {
	var key = e.keyCode;
	if(key!=0&&key!=lastKey) {
		if(key==65||key==68||key==83||key==87) {
			socket.emit("input",{keyCode:key,id:playerId});
			lastKey = key;
		}
	}
}
