
global.updateAllRoomData = function(){
	function updateRoomData(room){
		Memory.rooms[room] = {
			"creeps" : {
				"harvester" : {
					"min" : getHarverterCount(room),
					"current" : 0,
				},
				"runner" : {
					"min" : getHarverterCount(room) * 2,
					"current" : 0,
				},
				"upgrader" : {
					"min" : 2,
					"current" : 0,
				},
				"builder" : {
					"min" : 2,
					"current" : 0,
				}
			},
			"fullHarvesters" : {}
		}
		console.log("Creating memory for room: " + room)
	}
	
	function getHarverterCount(roomName) {
		var sources = Game.rooms[roomName].find(FIND_SOURCES);
		i=0;
		for(let sourceName in sources){
		    var source = sources[sourceName];
			let area = source.room.lookForAtArea(LOOK_TERRAIN, source.pos.y - 1, source.pos.x - 1, source.pos.y + 1, source.pos.x + 1, true);
			for (let block of area) {
				if (block.terrain == 'wall') {
					i++;
				}
			}
		}
		return (sources.length* 9)-i;
	}
	
    for(var roomName in Memory.rooms){
		updateRoomData(roomName);
		for(var roleName in Game.rooms[roomName].memory.creeps){
			Game.rooms[roomName].memory.creeps[roleName].current = _.sum(Game.rooms[roomName].find(FIND_MY_CREEPS), (c) => c.memory.role == roleName);
		}
	}
	
	return "Done";
}


global.sendScout = function(){
	Game.spawns["Spawn1"].spawnCreep([MOVE],Game.time.toString(),{ memory: {"role" : "scout"}});
	return "you got it";
}

module.exports = {
	
};