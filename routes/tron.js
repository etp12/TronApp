//dependencies: JQuery, Socket.IO

var canvas,ctx,socket,player,opponent;

$(function() {
	var socket = io();
	socket.on("connect",function() {
		$("#wait .title").text("Waiting");
	});
	socket.on("play",function(data) {
		//assign player and opponent positions
		socket.emit("response id",{my: "data"});
		$(".page.wait").fadeOut(1000,function() {
			$(".page.game").css({display:"block"});
			var $playerLabel = $(".player-label");
			$playerLabel.css({top:"px",left:"px"})
			setTimeout(function() {
				$playerLabel.fadeOut(1000,function() {

					window.requestAnimationFrame(draw);
				});
			},2000);
		});
	});
	socket.on("tick",function(data) {
		//assign player and opponent positions, and paths
	});

});

function draw() {

	window.requestAnimationFrame(draw);
}
