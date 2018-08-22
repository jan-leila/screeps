module.exports = {
	run: function(creep) {
		//If source isnt picked find one
		if (creep.memory.source == undefined) {
			var sources = Game.rooms[creep.memory.home].find(FIND_SOURCES);
			for (var childRoom in creep.room.memory.childRooms) {
				if (Game.rooms[childRoom] != undefined) {
				    var childSources = Game.rooms[childRoom].find(FIND_SOURCES);
					for(var sourceName in childSources){
						sources.push(childSources[sourceName]);
					}
				}
			}
			//pick a randome one if none is picked
			if (creep.memory.sourceNumber == undefined) {
				creep.memory.sourceNumber = Math.floor(Math.random() * sources.length);
			}
			console.log(sources.length);
			//If our target source is higher then the amount in the room default to source 0
			if (creep.memory.sourceNumber >= sources.length) {
				creep.memory.sourceNumber = 0;
			}
			//Remember the target ID
			//console.log(JSON.stringify(sources));
			creep.memory.source = sources[creep.memory.sourceNumber].id;
		}
		//Make sure the room is remembering
		if (Memory.rooms[creep.memory.home].fullHarvesters == undefined) {
			Memory.rooms[creep.memory.home].fullHarvesters = {};
		}
		if (Memory.rooms[creep.memory.home].fullHarvesters[creep.id] == undefined) {
			Memory.rooms[creep.memory.home].fullHarvesters[creep.id] = !(creep.carry.energy == creep.carryCapacity);
		}
		//Harvest from source only if we arent full
		var source = Game.getObjectById(creep.memory.source)
		if (creep.carry.energy != creep.carryCapacity) {
			//Harvest from source
			if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
				//Move to it if we arent in range
				if (creep.moveTo(source) == ERR_NO_PATH) {
					//If there is no path try the next source
					creep.memory.source = undefined;
					creep.memory.sourceNumber++;
				}
			}
		}
		//if we havent requested a runner yet
		if (creep.memory.currentCommand == 0) {
			//request when full
			if (creep.carry.energy > 25) {
				creep.memory.currentCommand = 1;
				Memory.rooms[creep.memory.home].fullHarvesters[creep.id] = false;
			}
		} else if (Game.time % 200) {
			creep.memory.currentCommand = 0;
		}
	}
};