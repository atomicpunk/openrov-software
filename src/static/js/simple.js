var Simple = function() {
	var self = this;
	this.socket = null;
	this.VdT = 500;
	this.HdT = 500;
	this.cmdlist = {
		81: { downcmd : ";tilt(1800);", pressed : 0 }, // q : tilt up
		65: { downcmd : ";tilt(1350);", pressed : 0 }, // a : tilt middle
		90: { downcmd : ";tilt(1000);", pressed : 0 }, // z : tilt down
		87: { downcmd : ";light(255);", pressed : 0 }, // w : light full
		83: { downcmd : ";light(127);", pressed : 0 }, // s : light half
		88: { downcmd : ";light(0);", pressed : 0 },   // x : light off
		38: { downcmd : "thrust", upcmd : "thrust", pressed : 0 }, // up - fwd
		40: { downcmd : "thrust", upcmd : "thrust", pressed : 0 }, // down - bwd
		37: { downcmd : "thrust", upcmd : "thrust", pressed : 0 }, // left - left
		39: { downcmd : "thrust", upcmd : "thrust", pressed : 0 }, // right - right
		33: { downcmd : "thrust", upcmd : "thrust", pressed : 0 }, // pageup - up
		34: { downcmd : "thrust", upcmd : "thrust", pressed : 0 }, // pagedwn - dwn
		17: { pressed : 0 }, // ctrl
		49: { downcmd : "tdelta", pressed : 0 }, // 1
		50: { downcmd : "tdelta", pressed : 0 }, // 2
		51: { downcmd : "tdelta", pressed : 0 }, // 3
		52: { downcmd : "tdelta", pressed : 0 }, // 4
		53: { downcmd : "tdelta", pressed : 0 }, // 5
		54: { downcmd : "tdelta", pressed : 0 }, // 6
		55: { downcmd : "tdelta", pressed : 0 }, // 7
		56: { downcmd : "tdelta", pressed : 0 }, // 8
		57: { downcmd : "tdelta", pressed : 0 }, // 9
	};
	function thrustDelta(val) {
		var dT = 64 + Math.pow(2, val);
		dT = Math.max(Math.min(dT, 500), 64);
		var ctrl = self.cmdlist[17].pressed;
		if(ctrl) {
			var meter = document.getElementById("vmeter");
			meter.className = "meter bar"+(val+1);
			self.VdT = dT
		} else {
			var meter = document.getElementById("hmeter");
			meter.className = "meter bar"+(val+1);
			self.HdT = dT
		}
	}
	function thrust() {
		var f = self.cmdlist[38].pressed;
		var b = self.cmdlist[40].pressed;
		var l = self.cmdlist[37].pressed;
		var r = self.cmdlist[39].pressed;
		var u = self.cmdlist[33].pressed;
		var d = self.cmdlist[34].pressed;

		// ignore the non-sensical inputs
		if((l+r+f+b > 2)||(l && r)||(f && b)||(u && d))
			return;

		var vert = 1500 + (u?-self.VdT:0) + (d?self.VdT:0);
		var star = 1500;
		var port = 1500;
		if(l && !r && !f && !b) {
			port -= self.HdT; star += self.HdT;
		} else if(!l && r && !f && !b) {
			port += self.HdT; star -= self.HdT;
		} else if(l && !r && f && !b) {
			star += self.HdT;
		} else if(!l && r && f && !b) {
			port += self.HdT;
		} else if(l && !r && !f && b) {
			star -= self.HdT;
		} else if(!l && r && !f && b) {
			port -= self.HdT;
		} else if(!l && !r && f && !b) {
			port += self.HdT; star += self.HdT;
		} else if(!l && !r && !f && b) {
			port -= self.HdT; star -= self.HdT;
		}

		var cmd = ";go("+star+","+vert+","+port+");"
		self.socket.emit('raw_command', cmd);
	}
	document.body.addEventListener("keydown", function(e) {
		if(!(e.keyCode in self.cmdlist))
			return;
		if(self.cmdlist[e.keyCode].pressed)
			return;
		self.cmdlist[e.keyCode].pressed = 1;
		var cmd = self.cmdlist[e.keyCode].downcmd;
		if(!cmd)
			return;
		if(cmd[0] == ';')
			self.socket.emit('raw_command', cmd);
		else if(cmd == "thrust")
			thrust();
		else if(cmd == "tdelta")
			thrustDelta(e.keyCode - 48);
		e.preventDefault();
	});
	document.body.addEventListener("keyup", function(e) {
		if(!(e.keyCode in self.cmdlist))
			return;
		self.cmdlist[e.keyCode].pressed = 0;
		var cmd = self.cmdlist[e.keyCode].upcmd;
		if(!cmd)
			return;
		if(cmd[0] == ';')
			self.socket.emit('raw_command', cmd);
		else if(cmd == "thrust")
			thrust();
		e.preventDefault();
	});
	function init() {
		var viewmodel = new OpenRovViewModel();
		var tiltstatus = document.getElementById("tiltstatus");
		var lightstatus = document.getElementById("lighton");
		var motorstatus = [];
		motorstatus[0] = document.getElementById("starmotor");
		motorstatus[1] = document.getElementById("vertmotor");
		motorstatus[2] = document.getElementById("portmotor");
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
			} else if(field[0] == "light") {
				var val = parseInt(field[1]);
				if(val > 0 && val < 156)
					lightstatus.className = "lightstatus half";
				else if(val <= 0)
					lightstatus.className = "lightstatus off";
				else if(val >= 156)
					lightstatus.className = "lightstatus full";
			} else if(field[0] == "go") {
				var val = field[1].split(",");
				if(val.length != 3)
					return;
				for(var i = 0; i < 3; i++) {
					var thrust = parseInt(val[i]);
					if(thrust == 1500)
						motorstatus[i].className = "motor";
					else if(thrust < 1500)
						motorstatus[i].className = "motor reverse";
					else if(thrust > 1500)
						motorstatus[i].className = "motor forward";
				}
			}
		});

		setupFrameHandling(self.socket);
	}
	init();
}
var simpleController = new Simple();
