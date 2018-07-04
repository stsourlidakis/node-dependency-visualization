const exec = require('await-exec');
const fs = require('fs');

let fileName = './public/dependency-data.js';
let data = {
	nodes: [],
	edges: []
};

module.exports = async function(){
	const {stdout} =  await exec('npm ls --json');
	const dependencies = JSON.parse(stdout);

	data.nodes.push({id: dependencies.name, label: dependencies.name});
	addLevel(dependencies.dependencies, dependencies.name);

	const visData = 'const data = ' + JSON.stringify(data);

	fs.writeFile(fileName, visData, 'utf8', function(err){
		if(err){
			console.log(err);
		} else {
			console.log('Visualization data ready.');
		}
	});
}


function addLevel(obj, name){
	if(typeof obj === undefined) return;

	for(let child in obj){
		if(!nodeExists(child)){
			data.nodes.push({id: child, label: child});
		}

		data.edges.push({from: name, to: child, arrows: 'to'});

		addLevel(obj[child].dependencies, child);
	}
}

function nodeExists(id){
	for(let child of data.nodes){
		if(child.id === id) return true;
	}
	
	return false;
}
