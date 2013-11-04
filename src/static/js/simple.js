var Simple = function() {
	var self = this;
	this.socket = null;
	this.keypressed = false;
	this.cmdlist = {
		81: { downcmd : ";tilt(1800);", upcmd : "" }, // q : tilt up
		65: { downcmd : ";tilt(1350);", upcmd : "" }, // a : tilt middle
		90: { downcmd : ";tilt(1000);", upcmd : "" }, // z : tilt down
		87: { downcmd : ";light(255);", upcmd : "" }, // w : light full
		83: { downcmd : ";light(127);", upcmd : "" }, // s : light half
		88: { downcmd : ";light(0);", upcmd : "" },   // x : light off
		38: { downcmd : ";go(2000,1500,2000);", upcmd : ";go(1500,1500,1500);" }, // up - fwd
		40: { downcmd : ";go(1000,1500,1000);", upcmd : ";go(1500,1500,1500);" }, // down - bwd
		37: { downcmd : ";go(1000,1500,2000);", upcmd : ";go(1500,1500,1500);" }, // left - left
		39: { downcmd : ";go(2000,1500,1000);", upcmd : ";go(1500,1500,1500);" }, // right - right
		33: { downcmd : ";go(1500,1000,1500);", upcmd : ";go(1500,1500,1500);" }, // pageup - up
		34: { downcmd : ";go(1500,2000,1500);", upcmd : ";go(1500,1500,1500);" }, // pagedwn - dwn
	};
	document.body.addEventListener("keydown", function(e) {
		if(self.keypressed)
			return;
		self.keypressed = true;
		if(!(e.keyCode in self.cmdlist))
			return;
		var cmd = self.cmdlist[e.keyCode].downcmd;
		self.socket.emit('raw_command', cmd);
		e.preventDefault();
	});
	document.body.addEventListener("keyup", function(e) {
		self.keypressed = false;
		if(!(e.keyCode in self.cmdlist))
			return;
		var cmd = self.cmdlist[e.keyCode].upcmd;
		if(!cmd)
			return;
		self.socket.emit('raw_command', cmd);
		e.preventDefault();
	});
	function init() {
		var viewmodel = new OpenRovViewModel();
		var tiltstatus = document.getElementById("tiltstatus");
		ko.applyBindings(viewmodel);

		self.socket = io.connect();
		self.socket.on('status', function (data) {
			viewmodel.updateStatus(data);
			if(!data.cmd)
				return;
			var field = data.cmd.split("(");
			if(field[0] == "tilt") {
				var val = parseInt(field[1]);
				if(val > 1300 && val < 1500)
					tiltstatus.className = "";
				else if(val <= 1300)
					tiltstatus.className = "down";
				else if(val >= 1500)
					tiltstatus.className = "up";
			}
		});

		setupFrameHandling(self.socket);
	}
	init();
}
var simpleController = new Simple();
