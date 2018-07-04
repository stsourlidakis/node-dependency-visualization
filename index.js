const exec = require('await-exec');
const fs = require('fs');

const http = require('http');
const finalhandler = require('finalhandler');
const serveStatic = require('serve-static');
const port = 8080;

const serve = serveStatic(__dirname+'/public/');
const server = http.createServer(function(req, res) {
	const done = finalhandler(req, res);
	serve(req, res, done);
});

const fileName = __dirname+'/public/dependency-data.js';
let data = {
	nodes: [],
	edges: []
};

module.exports = async function(){
	const {stdout} = await exec(`npm ls --production --json --silent`, {maxBuffer: 1024 * 1000});
	const dependencies = JSON.parse(stdout);

	addBaseNode(dependencies.name);
	addLevel(dependencies.dependencies, dependencies.name);

	const visData = 'const data = ' + JSON.stringify(data);

	fs.writeFile(fileName, visData, 'utf8', function(err){
		if(err){
			console.log(err);
		} else {
			console.log('Visualization data ready.');
			runServer();
		}
	});
}

function addBaseNode(name){
	data.nodes.push({
		id: name,
		label: name,
		borderWidth: 2,
		color: {
			border: "#168235",
			highlight: { background: "#222", border: "#168235" }
		},
		font: { size: 20 }
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

function runServer(){
	server.listen(port, function(){
		console.log(`Visit http://localhost:${port}`);
	});
}
