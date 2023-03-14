'use strict';
exports.__esModule = true;
/*
RUN ON CHANGE:
tsc scripts/generateAutocompleteGraph.ts
run to compile to .js file that can be run at build
*/
var fs = require('fs');
var graphology_1 = require('graphology');
var myProfessors = [
  { classes: [], firstName: 'arcs', lastName: 'test' },
  { classes: [], firstName: 'csre', lastName: 'acse' },
];
var myPrefixes = [
  { classes: [], professors: myProfessors, value: 'CS' },
  { classes: [], professors: [], value: 'ECS' },
  { classes: [], professors: [], value: 'CE' },
];
var myClasses = [
  { prefix: myPrefixes[0], number: 1337, professors: [myProfessors[0]] },
  { prefix: myPrefixes[0], number: 1336, professors: [myProfessors[1]] },
  { prefix: myPrefixes[2], number: 1337, professors: [myProfessors[0]] },
  { prefix: myPrefixes[2], number: 1336, professors: [myProfessors[1]] },
  {
    prefix: myPrefixes[0],
    number: 2337,
    professors: Array.of(myProfessors[0]),
  },
];
myProfessors[0].classes.push(myClasses[0]);
myProfessors[0].classes.push(myClasses[2]);
myProfessors[1].classes.push(myClasses[1]);
myProfessors[1].classes.push(myClasses[3]);
myPrefixes[0].classes.push(myClasses[0], myClasses[1]);
myPrefixes[2].classes.push(myClasses[2], myClasses[3]);
var graph = new graphology_1.DirectedGraph({
  allowSelfLoops: false,
});
var numNodes = 0; //allows a unique name for each node
var root = graph.addNode(numNodes++, {
  character: '',
  visited: false,
});
//recusively add a string to the graph, character by character, returning the last node. Doesn't create duplicate nodes with the same character
function addSearchQueryCharacter(node, characters, data) {
  characters = characters.toUpperCase();
  var preExisting = graph.findOutNeighbor(
    node,
    function (neighbor, attributes) {
      return attributes.character === characters[0];
    },
  );
  if (typeof preExisting === 'string') {
    if (characters.length <= 1) {
      //console.log('found: ', characters[0], 'end');
      return preExisting;
    }
    //console.log('found: ', characters[0]);
    return addSearchQueryCharacter(preExisting, characters.slice(1), data);
  }
  if (characters.length <= 1) {
    //console.log('new: ', characters[0], 'end');
    var newData = {
      character: characters[0],
      visited: false,
    };
    if (typeof data !== 'undefined') {
      newData.data = data;
    }
    var newNode_1 = graph.addNode(numNodes++, newData);
    graph.addEdge(node, newNode_1);
    return newNode_1;
  }
  //console.log('new: ', characters[0]);
  var newNode = graph.addNode(numNodes++, {
    character: characters[0],
    visited: false,
  });
  graph.addEdge(node, newNode);
  return addSearchQueryCharacter(newNode, characters.slice(1), data);
}
//Add node in format: (<prefix> <number> or <prefix><number>) (<professorLast> or <professorFirst> <professorLast>)
function addPrefixFirst(prefix, number, profFirst, profLast) {
  var prefixNode = addSearchQueryCharacter(root, prefix, {
    prefix: prefix,
  });
  var prefixSpaceNode = addSearchQueryCharacter(prefixNode, ' ');
  var classNodeFirstChar = addSearchQueryCharacter(
    prefixSpaceNode,
    number.toString()[0],
  );
  if (!graph.hasEdge(prefixNode, classNodeFirstChar)) {
    graph.addEdge(prefixNode, classNodeFirstChar);
  }
  var classNode = addSearchQueryCharacter(
    classNodeFirstChar,
    number.toString().slice(1),
    {
      prefix: prefix,
      number: number,
    },
  );
  var classSpaceNode = addSearchQueryCharacter(classNode, ' ');
  var professorFirstNameNode = addSearchQueryCharacter(
    classSpaceNode,
    profFirst + ' ',
  );
  var professorLastNameFirstCharNode = addSearchQueryCharacter(
    classSpaceNode,
    profLast[0],
  );
  if (!graph.hasEdge(professorFirstNameNode, professorLastNameFirstCharNode)) {
    graph.addEdge(professorFirstNameNode, professorLastNameFirstCharNode);
  }
  var professorLastNameNode = addSearchQueryCharacter(
    professorLastNameFirstCharNode,
    profLast.slice(1),
    {
      prefix: prefix,
      number: number,
      professorName: profFirst + ' ' + profLast,
    },
  );
}
//Add nodes in format: (<professorLast> or <professorFirst> <professorLast>) (<prefix> <number> or <prefix><number>)
function addProfFirst(prefix, number, profFirst, profLast) {
  var professorFirstNameNode = addSearchQueryCharacter(root, profFirst + ' ');
  var professorLastNameFirstCharNode = addSearchQueryCharacter(
    root,
    profLast[0],
  );
  if (!graph.hasEdge(professorFirstNameNode, professorLastNameFirstCharNode)) {
    graph.addEdge(professorFirstNameNode, professorLastNameFirstCharNode);
  }
  var professorLastNameNode = addSearchQueryCharacter(
    professorLastNameFirstCharNode,
    profLast.slice(1),
    {
      professorName: profFirst + ' ' + profLast,
    },
  );
  var professorSpaceNode = addSearchQueryCharacter(professorLastNameNode, ' ');
  var prefixNode = addSearchQueryCharacter(professorSpaceNode, prefix);
  var prefixSpaceNode = addSearchQueryCharacter(prefixNode, ' ');
  var classNodeFirstChar = addSearchQueryCharacter(
    prefixSpaceNode,
    number.toString()[0],
  );
  if (!graph.hasEdge(prefixNode, classNodeFirstChar)) {
    graph.addEdge(prefixNode, classNodeFirstChar);
  }
  var classNode = addSearchQueryCharacter(
    classNodeFirstChar,
    number.toString().slice(1),
    {
      prefix: prefix,
      number: number,
      professorName: profFirst + ' ' + profLast,
    },
  );
}
for (var i = 0; i < myPrefixes.length; i++) {
  //console.log(myPrefixes[i].value);
  for (var j = 0; j < myPrefixes[i].classes.length; j++) {
    //console.log(myPrefixes[i].classes[j].number);
    for (var k = 0; k < myPrefixes[i].classes[j].professors.length; k++) {
      //console.log(myPrefixes[i].classes[j].professors[k].firstName + myPrefixes[i].classes[j].professors[k].lastName);
      addPrefixFirst(
        myPrefixes[i].value,
        myPrefixes[i].classes[j].number,
        myPrefixes[i].classes[j].professors[k].firstName,
        myPrefixes[i].classes[j].professors[k].lastName,
      );
      addProfFirst(
        myPrefixes[i].value,
        myPrefixes[i].classes[j].number,
        myPrefixes[i].classes[j].professors[k].firstName,
        myPrefixes[i].classes[j].professors[k].lastName,
      );
    }
  }
}
fs.writeFileSync(
  'data/autocomplete_graph.json',
  JSON.stringify(graph['export']()),
);
console.log(
  'Generated a '.concat(
    process.env.VERCEL_ENV === 'production' ? 'crawlable' : 'non-crawlable',
    ' public/robots.txt',
  ),
);
