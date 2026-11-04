/* v0.12: personajes y bichos con formas redondeadas (cuerpos, extremidades, cabezas) en lugar de bloques */
const _makeEnemyMesh12=makeEnemyMesh;
makeEnemyMesh=function(type){ROUNDING=true;try{return _makeEnemyMesh12(type)}finally{ROUNDING=false}};
