"use strict";
exports.__esModule = true;
/*
RUN ON CHANGE:
"tsc scripts/generateAutocompleteGraph.ts"
run to compile to .js file that can be run at predev and prebuild
*/
var fs = require('fs');
var graphology_1 = require("graphology");
var nodeFetch = require('node-fetch');
var aggregatedData = require("../data/autocomplete-min.json");
var prefixList = [];
var classList = [];
var professorList = [];
var sectionList = [];
aggregatedData.data.forEach(function (prefix) {
    var newPrefix = {
        classes: [],
        professors: [],
        value: prefix.sp
    };
    prefixList.push(newPrefix);
    prefix.cns.forEach(function (course) {
        var newCourse = {
            prefix: newPrefix,
            number: course.cn,
            professors: [],
            sections: []
        };
        if (course.cn == undefined) {
            console.log(course);
        }
        newPrefix.classes.push(newCourse);
        classList.push(newCourse);
        course.ass.forEach(function (session) {
            session.s.forEach(function (section) {
                var newSection = {
                    "class": newCourse,
                    professors: [],
                    section_number: section.sn
                };
                newCourse.sections.push(newSection);
                sectionList.push(newSection);
                section.p.forEach(function (professor) {
                    // @ts-ignore
                    if (professor.fn != undefined && professor.ln != undefined) {
                        var profExists_1 = false;
                        var preExistingProf_1;
                        professorList.forEach(function (existingProfessor) {
                            if (!profExists_1 &&
                                // @ts-ignore
                                existingProfessor.firstName == professor.fn &&
                                // @ts-ignore
                                existingProfessor.lastName == professor.ln) {
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
                        }
                        else {
                            var newProf = {
                                classes: [newCourse],
                                // @ts-ignore
                                firstName: professor.fn,
                                // @ts-ignore
                                lastName: professor.ln
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
nodeFetch["default"]('https://catfact.ninja/fact', { method: 'GET' })
    // @ts-ignore
    .then(function (response) { return response.json(); })
    // @ts-ignore
    .then(function (data) {
    console.log(data);
    var graph = new graphology_1.DirectedGraph({
        allowSelfLoops: false
    });
    var numNodes = 0; //allows a unique name for each node
    var root = graph.addNode(numNodes++, {
        character: '',
        visited: false
    });
    // recursively add a string to the graph, character by character, returning the last node. Doesn't create duplicate nodes with the same character
    function addSearchQueryCharacter(node, characters, data) {
        characters = characters.toUpperCase();
        var preExisting = graph.findOutNeighbor(node, function (neighbor, attributes) { return attributes.character === characters[0]; });
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
                visited: false
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
            visited: false
        });
        graph.addEdge(node, newNode);
        return addSearchQueryCharacter(newNode, characters.slice(1), data);
    }
    //Add node in format: <prefix>[<number>| <number>[.<section>][ <professorLast>|(<professorFirst> <professorLast>)]]
    function addPrefixFirst(prefix, number, sectionNumber, profFirst, profLast) {
        var prefixNode = addSearchQueryCharacter(root, prefix, {
            prefix: prefix
        });
        var prefixSpaceNode = addSearchQueryCharacter(prefixNode, ' ');
        var classNodeFirstChar = addSearchQueryCharacter(prefixSpaceNode, number[0]);
        if (!graph.hasEdge(prefixNode, classNodeFirstChar)) {
            graph.addEdge(prefixNode, classNodeFirstChar);
        }
        var classNode = addSearchQueryCharacter(classNodeFirstChar, number.slice(1), {
            prefix: prefix,
            number: number
        });
        //<prefix>[<number>| <number>[ <professorLast>|(<professorFirst> <professorLast>)]]
        var professorFirstNameNode = addSearchQueryCharacter(classNode, ' ' + profFirst + ' ');
        var professorLastNameFirstCharNode = addSearchQueryCharacter(classNode, ' ' + profLast[0]);
        if (!graph.hasEdge(professorFirstNameNode, professorLastNameFirstCharNode)) {
            graph.addEdge(professorFirstNameNode, professorLastNameFirstCharNode);
        }
        addSearchQueryCharacter(professorLastNameFirstCharNode, profLast.slice(1), {
            prefix: prefix,
            number: number,
            professorName: profFirst + ' ' + profLast
        });
        //<prefix>[<number>| <number>[.<section>][ <professorLast>|(<professorFirst> <professorLast>)]]
        var sectionNode = addSearchQueryCharacter(classNode, '.' + sectionNumber, {
            prefix: prefix,
            number: number,
            sectionNumber: sectionNumber
        });
        var professorFirstNameNode1 = addSearchQueryCharacter(sectionNode, ' ' + profFirst + ' ');
        var professorLastNameFirstCharNode1 = addSearchQueryCharacter(sectionNode, ' ' + profLast[0]);
        if (!graph.hasEdge(professorFirstNameNode1, professorLastNameFirstCharNode1)) {
            graph.addEdge(professorFirstNameNode1, professorLastNameFirstCharNode1);
        }
        addSearchQueryCharacter(professorLastNameFirstCharNode1, profLast.slice(1), {
            prefix: prefix,
            number: number,
            sectionNumber: sectionNumber,
            professorName: profFirst + ' ' + profLast
        });
    }
    //Add nodes in format: (<professorLast> or <professorFirst> <professorLast>) (<prefix> <number> or <prefix><number>)
    function addProfFirst(prefix, number, sectionNumber, profFirst, profLast) {
        var professorFirstNameNode = addSearchQueryCharacter(root, profFirst + ' ');
        var professorLastNameFirstCharNode = addSearchQueryCharacter(root, profLast[0]);
        if (!graph.hasEdge(professorFirstNameNode, professorLastNameFirstCharNode)) {
            graph.addEdge(professorFirstNameNode, professorLastNameFirstCharNode);
        }
        var professorLastNameNode = addSearchQueryCharacter(professorLastNameFirstCharNode, profLast.slice(1), {
            professorName: profFirst + ' ' + profLast
        });
        var professorSpaceNode = addSearchQueryCharacter(professorLastNameNode, ' ');
        var prefixNode = addSearchQueryCharacter(professorSpaceNode, prefix);
        var prefixSpaceNode = addSearchQueryCharacter(prefixNode, ' ');
        var classNodeFirstChar = addSearchQueryCharacter(prefixSpaceNode, number[0]);
        if (!graph.hasEdge(prefixNode, classNodeFirstChar)) {
            graph.addEdge(prefixNode, classNodeFirstChar);
        }
        var classNode = addSearchQueryCharacter(classNodeFirstChar, number.slice(1), {
            prefix: prefix,
            number: number,
            professorName: profFirst + ' ' + profLast
        });
        addSearchQueryCharacter(classNode, '.' + sectionNumber, {
            prefix: prefix,
            number: number,
            sectionNumber: sectionNumber,
            professorName: profFirst + ' ' + profLast
        });
    }
    for (var prefixItr = 0; prefixItr < prefixList.length; prefixItr++) {
        //console.log(myPrefixes[prefixItr].value);
        for (var classItr = 0; classItr < prefixList[prefixItr].classes.length; classItr++) {
            for (var sectionItr = 0; sectionItr < prefixList[prefixItr].classes[classItr].sections.length; sectionItr++) {
                //console.log(myPrefixes[prefixItr].classes[classItr].number);
                for (var professorItr = 0; professorItr < prefixList[prefixItr].classes[classItr].sections[sectionItr].professors.length; professorItr++) {
                    //console.log(myPrefixes[prefixItr].classes[classItr].professors[professorItr].firstName + myPrefixes[prefixItr].classes[classItr].professors[professorItr].lastName);
                    addPrefixFirst(prefixList[prefixItr].value, prefixList[prefixItr].classes[classItr].number, prefixList[prefixItr].classes[classItr].sections[sectionItr].section_number, prefixList[prefixItr].classes[classItr].sections[sectionItr].professors[professorItr].firstName, prefixList[prefixItr].classes[classItr].sections[sectionItr].professors[professorItr].lastName);
                    addProfFirst(prefixList[prefixItr].value, prefixList[prefixItr].classes[classItr].number, prefixList[prefixItr].classes[classItr].sections[sectionItr].section_number, prefixList[prefixItr].classes[classItr].sections[sectionItr].professors[professorItr].firstName, prefixList[prefixItr].classes[classItr].sections[sectionItr].professors[professorItr].lastName);
                }
            }
        }
    }
    fs.writeFileSync('data/autocomplete_graph.json', JSON.stringify(graph["export"]()));
    console.log('Autocomplete graph generation done.');
});
