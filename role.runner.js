//TODO make finding use memory

module.exports = {
	//runners role is to get energy from the world(harvesters, on ground) and put it in storge
	//role also to make sure to put energy into spawn and extension first an move container energy to spawn and extension
	run: function(creep) {
		//Get resocres from harvester
		if(creep.memory.currentCommand == undefined){
			creep.memory.currentCommand = 0;
		}
		
		if(creep.memory.target == undefined){
			creep.memory.target = "";
		}
		
		if (creep.memory.currentCommand == 0) {
			if (creep.carry.energy == creep.carryCapacity) {
				creep.memory.currentCommand = 2;
				creep.memory.target = "";
				return;
			}
			
			//If we arent moving to a harvester find one
			if(creep.memory.target == ""){
				for(var id in Memory.rooms[creep.memory.home].fullHarvesters){
					if(!Memory.rooms[creep.memory.home].fullHarvesters[id]){
						creep.memory.target = id;
						Memory.rooms[creep.memory.home].fullHarvesters[id] = true;
						return;
					}
				}
				//There are no available find out what needs resocres
				var targets = Game.rooms[creep.room.name].find(FIND_STRUCTURES, {
					filter: (structure) => {
						return ((structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity)
					}
				});
				
				//Things need resocres so go to the command to look for containers
				if(targets.length != 0){
					creep.memory.currentCommand = 1;
					creep.memory.target = "";
					return;
				}
			}
			//Harvester is picked
			else{
				var harvester = Game.getObjectById(creep.memory.target);
				//If something happend to our harvester remove it from the list and then find a new one
				if(harvester == undefined){
					for(var id in Memory.rooms[creep.memory.home].fullHarvesters){
						if(id == creep.memory.target){
						    console.log("error on target: " + id);
							delete Memory.rooms[creep.memory.home].fullHarvesters[id];
						}
					}
					creep.memory.target = "";
					return;
				}
				//If we do actualy have a target still take resocres from it
				else{
					var errorCode = harvester.transfer(creep, RESOURCE_ENERGY);
					if(errorCode == ERR_NOT_IN_RANGE) {
						//Move to harvester if we arent close enough to it
						creep.moveTo(harvester)
					}
					//If we pulled out the energy then remove the harvester from the list and get ready for new target
					else if(errorCode == OK){
						Game.getObjectById(creep.memory.target).memory.currentCommand = 0;
						creep.memory.target = "";
						return;
					}
					return;
				}
			}
		}
		//Get resocres from container
		else if(creep.memory.currentCommand == 1){
		    //This shit disabled like me
		    creep.memory.currentCommand = 2;
			creep.memory.target = "";
		    return;
			if (creep.carry.energy == creep.carryCapacity) {
				creep.memory.currentCommand = 2;
				creep.memory.target = "";
				return;
			}
			
			//Make sure things need energy
			var targets = Game.rooms[creep.room.name].find(FIND_STRUCTURES, {
				filter: (structure) => {
					return ((structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity)
				}
			});
				
			//Things need dont energy go back to looking for harvesters
			if(targets.length == 0){
				creep.memory.currentCommand = 0;
				creep.memory.target = "";
				return;
			}
			//If we havent picked a container yet find one
			if(creep.memory.target == ""){
				//find containers with energy in it
				var targets = Game.rooms[creep.room.name].find(FIND_STRUCTURES, {
					filter: (structure) => {
						return ((structure.structureType == STRUCTURE_CONTAINER && _.sum(structure.store) > 0))
					}
				});
				
				//If there are no containers available go back to looking for harvesters
				if(targets == 0){
					creep.memory.currentCommand = 0;
					creep.memory.target = "";
					return;
				}
				else{
					creep.memory.target = targets[0].id;
					return;
				}
			}
			//If we have alread picked a container go get resocres from it
			else{
				var container = Game.getObjectById(creep.memory.target);
				//if something happend to our container find a new one
				if(container == undefined){
					creep.memory.target = "";
					return;
				}
				else{
					if(container.store == 0){
						creep.memory.target = "";
						return;
					}
					//If the container is good go get resocres from it
					else{
						var errorCode = creep.withdraw(container, RESOURCE_ENERGY);
						if(errorCode == ERR_NOT_IN_RANGE){
							//If we arent close enough move closer
							creep.moveTo(container);
						}
						else if (errorCode == OK){
							//If we got stuff out of it get ready to find a new one
							creep.memory.target = "";	
						}
					}
				}
			}
		}
		//Bring resocres to spawn, extenders, towers and containers
		else if(creep.memory.currentCommand == 2){
			//If creep is empty forget our target and start looking for ways to get resocres
			if (creep.carry.energy == 0) {
				creep.memory.currentCommand = 0;
				creep.memory.target = "";
				return;
			}
			//If no target set find one
			if(creep.memory.target == ""){
				//find spawn or extender
				var targets = Game.rooms[creep.memory.home].find(FIND_STRUCTURES, {
					filter: (structure) => {
						return ((structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) && structure.energy < structure.energyCapacity)
					}
				});
				
				//find tower if no spawn or extender available
				if(targets.length == 0){
					targets = Game.rooms[creep.memory.home].find(FIND_STRUCTURES, {
						filter: (structure) => {
							return ((structure.structureType == STRUCTURE_TOWER && structure.energy < structure.energyCapacity * 0.75))
						}
					});
					//find container if nothing else available
					if(targets.length == 0){
						targets = Game.rooms[creep.memory.home].find(FIND_STRUCTURES, {
							filter: (structure) => {
								return ((structure.structureType == STRUCTURE_CONTAINER && _.sum(structure.store) < structure.storeCapacity))
							}
						});
							if(targets.length == 0){
            					targets = Game.rooms[creep.memory.home].find(FIND_STRUCTURES, {
            						filter: (structure) => {
            							return ((structure.structureType == STRUCTURE_TOWER && structure.energy < structure.energyCapacity))
            						}
            					});
							}
					}
				}
				//If something has been found remember it
				if(targets.length > 0){
					creep.memory.target = targets[0].id;
				}
			}
			//If target set do stuff
			else{
				var target = Game.getObjectById(creep.memory.target);
				//If target is full forget it so we can find a new one
				if(target == undefined){
					creep.memory.target = "";
					return;
				}
				else{
					var empty = false;
					if(target.structureType == STRUCTURE_CONTAINER){
						empty = target.store.energy == target.storeCapacity;
					}
					else{
						empty = target.energy == target.energyCapacity
					}
					if(empty){
						creep.memory.target = "";
						return;
					}
					//If target isnt full fill it up
					else{
						var errorCode = creep.transfer(target, RESOURCE_ENERGY);
						if (errorCode == ERR_NOT_IN_RANGE) {
							//If we arent close enough to target move to it
							creep.moveTo(target);
							return;
						}
						else if(errorCode == OK || errorCode == ERR_FULL){
							creep.memory.target == "";
							return;
						}
					}
				}
			}
		}
	}
}