var Simple = function() {
	var self = this;
	this.cmdlist = {
		219: ";tilt(1000);", // [ : tilt down
		221: ";tilt(1800);", // ] : tilt up
	};
	document.body.addEventListener("keydown", function(e) {
		if(!(e.keyCode in self.cmdlist))
			return;
		var cmd = self.cmdlist[e.keyCode];
		console.log(cmd);
		thesocket.emit('raw_command', cmd);
		e.preventDefault();
	});
}
var simpleController = new Simple();
