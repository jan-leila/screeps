
module.exports = {
	run: function(creep) {
		if (creep.memory.currentCommand == 0) {
			if (creep.carry.energy == creep.carryCapacity) {
				creep.memory.currentCommand = 1;
			} else {
				//TODO check spawns and containers first
				var targets = Game.rooms[creep.room.name].find(FIND_STRUCTURES, {
					filter: (structure) => {
						return ((structure.structureType == STRUCTURE_CONTAINER && _.sum(structure.store) > 0))
					}
				});
				if (targets.length > 0) {
					var close = creep.pos.findClosestByRange(targets);
					if (creep.withdraw(close, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
						creep.moveTo(close);
					}
				} else {
					var source = creep.room.find(FIND_SOURCES)[0];
					if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
						creep.moveTo(source);
					}
				}
			}
		}
		else{
			if(creep.carry.energy == 0){
        		creep.memory.currentCommand = 0;
        	}
        	var controller = creep.room.controller;
            if(controller != undefined) {
                if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(controller);
                }
            }
		}
	}
};