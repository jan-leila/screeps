module.exports = {
	run: function(creep) {
		if (creep.memory.currentCommand == 0) {
			if (creep.carry.energy == creep.carryCapacity) {
				creep.memory.currentCommand = 1;
				creep.memory.target = undefined;
			} 
			else {
				if(creep.memory.target == undefined || Game.getObjectById(creep.memory.target) == undefined || Game.getObjectById(creep.memory.target).store == 0){
					var targets = Game.rooms[creep.room.name].find(FIND_STRUCTURES, {
						filter: (structure) => {
							return ((structure.structureType == STRUCTURE_CONTAINER && _.sum(structure.store) > 0))
						}
					});
					if(targets.length > 0){
						creep.memory.target = targets[0].id;
					}
					else{
						creep.moveTo(25,25);
					}
				}
				else{
					var target = Game.getObjectById(creep.memory.target);
					if (creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
						creep.moveTo(target);
					}
				}
			}
		}
		else{
			if(creep.carry.energy == 0){
        		creep.memory.currentCommand = 0;
				creep.memory.target = undefined;
        	}
			
			if(creep.memory.target == undefined || Game.getObjectById(creep.memory.target) == undefined || Game.getObjectById(creep.memory.target).hits == Game.getObjectById(creep.memory.target).hitsMax || Game.time%100 == 0){
				var targets = Game.rooms[creep.room.name].find(FIND_STRUCTURES, {
					filter: (structure) => {
						return ((structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_ROAD) &&  structure.hits < structure.hitsMax)
					}
				});
				if(targets.length > 0){
					var lowestIndex = 0;
					for(var i = 0; i < targets.length; i++){
						var target = targets[i];
						if(target.hits / target.hitsMax < targets[lowestIndex].hits / targets[lowestIndex].hitsMax){
							lowestIndex = i;
						}
					}
					creep.memory.target = targets[lowestIndex].id;
				}
				else{
					var walls = Game.rooms[creep.room.name].find(FIND_STRUCTURES, {
						filter: (structure) => {
							return ((structure.structureType == STRUCTURE_WALL || structure.structureType == STRUCTURE_RAMPART) &&  structure.hits < structure.hitsMax)
						}
					});
					if(walls.length > 0){
						var lowestIndex = 0;
						for(var i = 0; i < walls.length; i++){
							var wall = walls[i];
							if(wall.hits < walls[lowestIndex].hits){
								lowestIndex = i;
							}
						}
						creep.memory.target = walls[lowestIndex].id;
					}
					else{
						creep.moveTo(25,25);
					}
				}
			}
			else{
				var target = Game.getObjectById(creep.memory.target);
				if (creep.repair(target) == ERR_NOT_IN_RANGE) {
					creep.moveTo(target);
				}
			}
		}
	}
};