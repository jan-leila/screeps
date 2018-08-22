module.exports = {
	run: function(tower) {
		
		var hostiles = Game.rooms[tower.room.name].find(FIND_HOSTILE_CREEPS);
		
		if(hostiles.length > 0){
			tower.attack(hostiles[0]);
		}
		else if(tower.energy > tower.energyCapacity/2){
			var target;
			var targets = Game.rooms[tower.room.name].find(FIND_STRUCTURES, {
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
				target = targets[lowestIndex];
				}
			else if(tower.energy > tower.energyCapacity * 0.75){
				var walls = Game.rooms[tower.room.name].find(FIND_STRUCTURES, {
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
					target = walls[lowestIndex];
				}
			}
			tower.repair(target);
		}
	}
}