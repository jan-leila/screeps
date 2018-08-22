global.creepComands = require('creepComands');
var roleRunner = require('role.runner');
var roleHarvester = require('role.harvester');
var roleBuilder = require('role.builder');
var roleUpgrader = require('role.upgrader');
var roleAttack = require('role.attack');
var runTower = require('tower');
module.exports.loop = function() {
	console.log("---------------------------------------------------------------------------------")
	// check for memory entries of died creeps by iterating over Memory.creeps
	for (let name in Memory.creeps) {
		// and checking if the creep is still alive
		if (Game.creeps[name] == undefined) {
			// if not, delete the memory entry
			delete Memory.creeps[name];
		}
	}
	var roles = {
		"harvester": {
			"body": {
				1: [WORK, CARRY, MOVE],
				2: [WORK, WORK, CARRY, MOVE, MOVE],
				3: [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE]
			}
		},
		"runner": {
			"body": {
				1: [CARRY, CARRY, MOVE, MOVE],
				2: [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE],
				3: [CARRY, CARRY, CARRY, CARRY, MOVE, CARRY, MOVE, MOVE, MOVE]
			}
		},
		"upgrader": {
			"body": {
				1: [WORK, CARRY, MOVE],
				2: [WORK, CARRY, MOVE, WORK, MOVE, WORK, MOVE],
				3: [WORK, CARRY, MOVE, WORK, MOVE, WORK, MOVE]
			}
		},
		"builder": {
			"body": {
				1: [WORK, CARRY, MOVE],
				2: [WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, CARRY, MOVE],
				3: [WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, CARRY, MOVE]
			}
		}
	}
	// run code for each spawn
	runSpawners();
	// for every creep name in Game.creeps
	for (let name in Game.creeps) {
		// get the creep object
		var creep = Game.creeps[name];
		runCreep(creep);
	}
	for (var roomName in Game.rooms) {
		var room = Game.rooms[roomName];
		var towers = Game.rooms[roomName].find(FIND_MY_STRUCTURES, {
			filter: {
				structureType: STRUCTURE_TOWER
			}
		});
		if (towers.length > 0) {
			for (var index in towers) {
				runTower.run(towers[index]);
			}
		}
		if (room.memory != undefined) {
			if (room.memory.fullHarvesters != undefined) {
				for (var id in room.memory.fullHarvesters) {
					if (Game.getObjectById(id) == undefined) {
						console.log("error on target: " + id);
						delete room.memory.fullHarvesters[id];
					}
				}
			}
		}
		if (Game.time % 100 == 0) {
			for (var childName in room.memory.childRooms) {
				if(Game.rooms[childName] == undefined) {
					room.memory.childRooms[childName] = false;
				}
			}
			if(room.memory.creeps != undefined){
				room.memory.creeps.harvester.min = getHarverterCount(room);
				room.memory.creeps.runner.min = getHarverterCount(room) * 1.5;
			}
		}
	}

	function runSpawners() {
		for (let name in Game.spawns) {
			var spawn = Game.spawns[name];
			var room = Game.rooms[spawn.room.name];
			var roomUndefined = (room.memory == undefined || JSON.stringify(room.memory) == JSON.stringify({}));
			if (roomUndefined) {
				Memory.rooms[room.name] = {
					"creeps": {
						"harvester": {
							"min": getHarverterCount(room),
							"current": 0,
						},
						"runner": {
							"min": getHarverterCount(room) * 1.5,
							"current": 0,
						},
						"upgrader": {
							"min": 2,
							"current": 0,
						},
						"builder": {
							"min": 2,
							"current": 0,
						}
					},
					"fullHarvesters": {},
					"childRooms": {}
				}
				console.log("Creating memory for room: " + room.name)
			}
			for (let roleName in room.memory.creeps) {
				var role = room.memory.creeps[roleName];
				if (Game.time % 100 == 0) {
					var creeps = room.find(FIND_MY_CREEPS);
					var count = 0;
					for (creepName in creeps) {
						if (creeps[creepName].memory.role == roleName) {
							count++;
						}
					}
					room.memory.creeps[roleName].current = count;
				}
				if (role.current < role.min) {
					function calcCost(parts) {
						return _.sum(parts, p => BODYPART_COST[p]);
					}
					var body = roles[roleName].body[room.controller.level];
					while (calcCost(body) > spawn.room.energyCapacityAvailable) {
						body.slice(0, -1);
					}
					var creep = spawn.spawnCreep(body, Game.time.toString(), {
						memory: {
							"role": roleName,
							"currentCommand": 0,
							"home": spawn.room.name
						}
					});
					if (creep == 0) {
						role.current++;
					}
					return;
				}
			}
			for (var childName in room.memory.childRooms) {
				if (!room.memory.childRooms[childName]) {
					var errorCode = spawn.spawnCreep([MOVE], Game.time.toString(), {
							memory: {
								"role": "scout",
								"home": childName
							}
						});
					if (errorCode == OK) {
						room.memory.childRooms[childName] = true;
					}
				}
			}
		}
	}

	function runCreep(creep) {
		if (creep.memory == {} || creep.memory.role == undefined) {
			creep.suicide();
			console.log("creep had no purpose in life like me so it killed itself");
		}
		switch (creep.memory.role) {
			case "harvester":
				roleHarvester.run(creep);
				break;
			case "runner":
				roleRunner.run(creep);
				break;
			case "upgrader":
				roleUpgrader.run(creep);
				break;
			case "builder":
				roleBuilder.run(creep);
				break;
			case "sign":
				if (creep.room.controller) {
					if (creep.signController(creep.room.controller, "") == ERR_NOT_IN_RANGE) {
						creep.moveTo(creep.room.controller);
					}
				}
			case "scout":
				if(creep.room.name == creep.memory.home){
					creep.moveTo(Game.rooms[creep.memory.home].getPositionAt(25, 25));
				}
				else{
					creep.moveTo(creep.pos.findClosestByRange(creep.room.findExitTo(creep.memory.home)));
				}
				break;
			case "attack":
				roleAttack.run(creep);
				break;
			case "defend":
				break;
			default:
				creep.memory.role == "runner";
				break;
		}
	}

	function getHarverterCount(parentRoom) {
		var rooms = [parentRoom.name];
		for(var childRoom in parentRoom.memory.childRooms){
			rooms.push(childRoom);
		}
		var i = 0;
		var sourceCount = 0;
		for (var index in rooms) {
			var room = Game.rooms[rooms[index]];
			if(room!= undefined){
				var sources = room.find(FIND_SOURCES);
				sourceCount += sources.length;
				for (let sourceName in sources) {
					var source = sources[sourceName];
					let area = source.room.lookForAtArea(LOOK_TERRAIN, source.pos.y - 1, source.pos.x - 1, source.pos.y + 1, source.pos.x + 1, true);
					for (let block of area) {
						if (block.terrain == 'wall') {
							i++;
						}
					}
				}
			}
		}
		return (sourceCount * 9) - i;
	}
}