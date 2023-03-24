'use strict';
exports.__esModule = true;
/*
RUN ON CHANGE:
"tsc scripts/generateAutocompleteGraph.ts"
run to compile to .js file that can be run at predev and prebuild
*/
var fs = require('fs');
var graphology_1 = require('graphology');
var nodeFetch = require('node-fetch');
var aggregatedData = require('../data/autocomplete-min.json');
var prefixList = [];
var classList = [];
var professorList = [];
var sectionList = [];
aggregatedData.data.forEach(function (prefix) {
  var newPrefix = {
    classes: [],
    professors: [],
    value: prefix.sp,
  };
  prefixList.push(newPrefix);
  prefix.cns.forEach(function (course) {
    var newCourse = {
      prefix: newPrefix,
      number: course.cn,
      professors: [],
      sections: [],
    };
    if (course.cn == undefined) {
      console.log(course);
    }
    newPrefix.classes.push(newCourse);
    classList.push(newCourse);
    course.ass.forEach(function (session) {
      session.s.forEach(function (section) {
        var newSection = {
          class: newCourse,
          professors: [],
          section_number: section.sn,
        };
        newCourse.sections.push(newSection);
        sectionList.push(newSection);
        section.p.forEach(function (professor) {
          // @ts-ignore
          if (professor.fn != undefined && professor.ln != undefined) {
            var profExists_1 = false;
            var preExistingProf_1;
            professorList.forEach(function (existingProfessor) {
              // @ts-ignore
              if (
                !profExists_1 &&
                existingProfessor.firstName == professor.fn &&
                existingProfessor.lastName == professor.ln
              ) {
                profExists_1 = true;
                preExistingProf_1 = existingProfessor;
              }
            });
            if (profExists_1) {
              // @ts-ignore
              if (!preExistingProf_1.classes.includes(newCourse)) {
                // @ts-ignore
                preExistingProf_1.classes.push(newCourse);
              }
              // @ts-ignore
              newSection.professors.push(preExistingProf_1);
              // @ts-ignore
              if (!newCourse.professors.includes(preExistingProf_1)) {
                // @ts-ignore
                newCourse.professors.push(preExistingProf_1);
              }
              // @ts-ignore
              if (!newPrefix.professors.includes(preExistingProf_1)) {
                // @ts-ignore
                newPrefix.professors.push(preExistingProf_1);
              }
            } else {
              // @ts-ignore
              var newProf = {
                classes: [newCourse],
                firstName: professor.fn,
                lastName: professor.ln,
              };
              professorList.push(newProf);
              newSection.professors.push(newProf);
              newCourse.professors.push(newProf);
              newPrefix.professors.push(newProf);
            }
          }
        });
      });
    });
  });
});
nodeFetch['default']('https://catfact.ninja/fact', { method: 'GET' })
  // @ts-ignore
  .then(function (response) {
    return response.json();
  })
  // @ts-ignore
  .then(function (data) {
    console.log(data);
    var graph = new graphology_1.DirectedGraph({
      allowSelfLoops: false,
    });
    var numNodes = 0; //allows a unique name for each node
    var root = graph.addNode(numNodes++, {
      character: '',
      visited: false,
    });
    // recursively add a string to the graph, character by character, returning the last node. Doesn't create duplicate nodes with the same character
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
      if (
        !graph.hasEdge(professorFirstNameNode, professorLastNameFirstCharNode)
      ) {
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
      var professorFirstNameNode = addSearchQueryCharacter(
        root,
        profFirst + ' ',
      );
      var professorLastNameFirstCharNode = addSearchQueryCharacter(
        root,
        profLast[0],
      );
      if (
        !graph.hasEdge(professorFirstNameNode, professorLastNameFirstCharNode)
      ) {
        graph.addEdge(professorFirstNameNode, professorLastNameFirstCharNode);
      }
      var professorLastNameNode = addSearchQueryCharacter(
        professorLastNameFirstCharNode,
        profLast.slice(1),
        {
          professorName: profFirst + ' ' + profLast,
        },
      );
      var professorSpaceNode = addSearchQueryCharacter(
        professorLastNameNode,
        ' ',
      );
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
    for (var i = 0; i < prefixList.length; i++) {
      //console.log(myPrefixes[i].value);
      for (var j = 0; j < prefixList[i].classes.length; j++) {
        //console.log(myPrefixes[i].classes[j].number);
        for (var k = 0; k < prefixList[i].classes[j].professors.length; k++) {
          //console.log(myPrefixes[i].classes[j].professors[k].firstName + myPrefixes[i].classes[j].professors[k].lastName);
          addPrefixFirst(
            prefixList[i].value,
            prefixList[i].classes[j].number,
            prefixList[i].classes[j].professors[k].firstName,
            prefixList[i].classes[j].professors[k].lastName,
          );
          addProfFirst(
            prefixList[i].value,
            prefixList[i].classes[j].number,
            prefixList[i].classes[j].professors[k].firstName,
            prefixList[i].classes[j].professors[k].lastName,
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
  });
