var roleRepair = require('role.repair');

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
			
			var constructionSites = Game.rooms[creep.memory.home].find(FIND_CONSTRUCTION_SITES);
			for (var childRoom in creep.room.memory.childRooms) {
				if (Game.rooms[childRoom] != undefined) {
				    var childConstructionSite = Game.rooms[childRoom].find(FIND_CONSTRUCTION_SITES);
					for(var constructionSiteName in childConstructionSite){
						constructionSites.push(childSources[sourceName]);
					}
				}
			}
			
        	var constructionSite = creep.pos.findClosestByRange(constructionSites);
            if(constructionSite != undefined) {
                if (creep.build(constructionSite) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(constructionSite);
                }
            }
			else{
				roleRepair.run(creep);
			}
		}
	}
};