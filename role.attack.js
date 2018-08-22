module.exports = {
    run: function(creep) {
        if(creep.room != Game.flags["attack"].room){
            creep.moveTo(Game.flags["attack"]);
        }
        else{
            var hostiles = Game.rooms[creep.room.name].find(FIND_HOSTILE_CREEPS);
            if(hostiles.length > 0){
                var target = creep.pos.findClosestByRange(hostiles);
                if(creep.attack(target) == ERR_NOT_IN_RANGE){
                    creep.moveTo(target);
                }
            }
            else{
                hostiles = Game.rooms[creep.room.name].find(FIND_HOSTILE_SPAWNS);
                if(hostiles.length > 0){
                    var target = hostiles[0];
                    if(creep.attack(target) == ERR_NOT_IN_RANGE){
                        creep.moveTo(target);
                    }
                }
                else{
                    hostiles = Game.rooms[creep.room.name].find(FIND_HOSTILE_STRUCTURES);
                    if(hostiles.length > 0){
                        var target = hostiles[0];
                        if(creep.attack(target) == ERR_NOT_IN_RANGE){
                            creep.moveTo(target);
                        }
                    }
                }
            }
        }
    }
};