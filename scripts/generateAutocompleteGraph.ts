/*
RUN ON CHANGE:
"tsc scripts/generateAutocompleteGraph.ts --resolveJsonModule"
run to compile to .js file that can be run at predev and prebuild
*/
const fs = require('fs');
import { DirectedGraph } from 'graphology';
const nodeFetch = require('node-fetch');
import * as aggregatedData from '../data/autocomplete-min.json';

type SearchQuery = {
  prefix?: string;
  number?: string;
  professorName?: string;
  sectionNumber?: string;
};

type NodeAttributes = {
  c: string;
  d?: SearchQuery;
  visited?: boolean;
};

type Prefix = {
  classes: Class[];
  professors: Professor[];
  value: string;
};

type Class = {
  prefix: Prefix;
  number: string;
  professors: Professor[];
  sections: Section[];
};

type Professor = {
  classes: Class[];
  firstName: string;
  lastName: string;
};

type Section = {
  class: Class;
  professors: Professor[];
  section_number: string;
};

const prefixList: Prefix[] = [];
const classList: Class[] = [];
const professorList: Professor[] = [];
const sectionList: Section[] = [];

aggregatedData.data.forEach((prefix) => {
  let newPrefix: Prefix = {
    classes: [],
    professors: [],
    value: prefix.sp,
  };
  prefixList.push(newPrefix);
  prefix.cns.forEach((course) => {
    let newCourse: Class = {
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
    course.ass.forEach((session) => {
      session.s.forEach((section) => {
        let newSection: Section = {
          class: newCourse,
          professors: [],
          section_number: section.sn,
        };
        newCourse.sections.push(newSection);
        sectionList.push(newSection);
        section.p.forEach((professor) => {
          // @ts-ignore
          if (professor.fn != undefined && professor.ln != undefined) {
            let profExists = false;
            let preExistingProf: Professor;
            professorList.forEach((existingProfessor) => {
              if (
                !profExists &&
                // @ts-ignore
                existingProfessor.firstName == professor.fn &&
                // @ts-ignore
                existingProfessor.lastName == professor.ln
              ) {
                profExists = true;
                preExistingProf = existingProfessor;
              }
            });
            if (profExists) {
              // @ts-ignore
              if (!preExistingProf.classes.includes(newCourse)) {
                // @ts-ignore
                preExistingProf.classes.push(newCourse);
              }
              // @ts-ignore
              newSection.professors.push(preExistingProf);
              // @ts-ignore
              if (!newCourse.professors.includes(preExistingProf)) {
                // @ts-ignore
                newCourse.professors.push(preExistingProf);
              }
              // @ts-ignore
              if (!newPrefix.professors.includes(preExistingProf)) {
                // @ts-ignore
                newPrefix.professors.push(preExistingProf);
              }
            } else {
              let newProf: Professor = {
                classes: [newCourse],
                // @ts-ignore
                firstName: professor.fn,
                // @ts-ignore
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

nodeFetch
  .default('https://catfact.ninja/fact', { method: 'GET' })
  // @ts-ignore
  .then((response) => response.json())
  // @ts-ignore
  .then((data) => {
    console.log(data);

    const graph: DirectedGraph<NodeAttributes> = new DirectedGraph({
      allowSelfLoops: false,
    });
    let numNodes = 0; //allows a unique name for each node
    const root = graph.addNode(numNodes++, {
      c: '',
      visited: false,
    });

    // recursively add a string to the graph, character by character, returning the last node. Doesn't create duplicate nodes with the same character
    function addSearchQueryCharacter(
      node: string,
      characters: string,
      data?: SearchQuery,
    ): string {
      characters = characters.toUpperCase();
      let preExisting = graph.findOutNeighbor(
        node,
        (neighbor, attributes) => attributes.c === characters[0],
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
        let newData: NodeAttributes = {
          c: characters[0],
          visited: false,
        };
        if (typeof data !== 'undefined') {
          newData.d = data;
        }
        const newNode = graph.addNode(numNodes++, newData);
        graph.addEdge(node, newNode);
        return newNode;
      }
      //console.log('new: ', characters[0]);
      const newNode = graph.addNode(numNodes++, {
        c: characters[0],
        visited: false,
      });
      graph.addEdge(node, newNode);
      return addSearchQueryCharacter(newNode, characters.slice(1), data);
    }

    function addWithParents(
      nodes: string[],
      characters: string,
      data?: SearchQuery,
    ) {
      const nodeFirstChar = addSearchQueryCharacter(
        nodes.pop() as string,
        characters[0],
        characters.length > 1 ? undefined : data,
      );
      while (nodes.length) {
        const nextParent = nodes.pop();
        if (!graph.hasEdge(nextParent, nodeFirstChar)) {
          graph.addEdge(nextParent, nodeFirstChar);
        }
      }
      if (characters.length > 1) {
        return addSearchQueryCharacter(
          nodeFirstChar,
          characters.slice(1),
          data,
        );
      }
      return nodeFirstChar;
    }

    //Add node in format: <prefix>[<number>| <number>[.<section>][ <professorLast>|(<professorFirst> <professorLast>)]]
    //and: (<number>|<number> )[<prefix>][.<section>][ <professorLast>|(<professorFirst> <professorLast>)]
    function addPrefixFirst(
      prefix: string,
      number: string,
      sectionNumber: string,
      profFirst: string,
      profLast: string,
    ) {
      //<prefix>[<number>| <number>
      const prefixNode = addSearchQueryCharacter(root, prefix, {
        prefix: prefix,
      });
      const prefixSpaceNode = addSearchQueryCharacter(prefixNode, ' ');
      const classNode = addWithParents([prefixNode, prefixSpaceNode], number, {
        prefix: prefix,
        number: number,
      });

      //(<number>|<number> )<prefix>
      const classNode2 = addSearchQueryCharacter(root, number);
      const classSpaceNode = addSearchQueryCharacter(classNode2, ' ');
      const prefixNode2 = addWithParents([classNode2, classSpaceNode], prefix, {
        prefix: prefix,
        number: number,
      });

      //...[ <professorLast>|(<professorFirst> <professorLast>)]]
      const professorFirstNameNode = addWithParents(
        [classNode, classNode2, prefixNode2],
        ' ' + profFirst + ' ',
      );
      const professorLastNameNode = addWithParents(
        [classNode, classNode2, prefixNode2, professorFirstNameNode],
        ' ' + profLast,
        {
          prefix: prefix,
          number: number,
          professorName: profFirst + ' ' + profLast,
        },
      );

      if (sectionNumber === 'HON') {
        //...[.<section>][ <professorLast>|(<professorFirst> <professorLast>)]]
        const sectionNode = addWithParents(
          [classNode, prefixNode2],
          '.' + sectionNumber,
          {
            prefix: prefix,
            number: number,
            sectionNumber: sectionNumber,
          },
        );
        const professorFirstNameNode2 = addSearchQueryCharacter(
          sectionNode,
          ' ' + profFirst + ' ',
        );
        const professorLastNameNode2 = addWithParents(
          [sectionNode, professorFirstNameNode2],
          ' ' + profLast,
          {
            prefix: prefix,
            number: number,
            sectionNumber: sectionNumber,
            professorName: profFirst + ' ' + profLast,
          },
        );
      }
    }

    //Add nodes in format: (<professorLast>|<professorFirst> <professorLast>) ((<prefix> <number>|<prefix><number>)|(<number><prefix> |<number><prefix>))
    function addProfFirst(
      prefix: string,
      number: string,
      sectionNumber: string,
      profFirst: string,
      profLast: string,
    ) {
      const professorFirstNameNode = addSearchQueryCharacter(
        root,
        profFirst + ' ',
      );
      const professorLastNameNode = addWithParents(
        [root, professorFirstNameNode],
        profLast,
        {
          professorName: profFirst + ' ' + profLast,
        },
      );
      const professorSpaceNode = addSearchQueryCharacter(
        professorLastNameNode,
        ' ',
      );

      const prefixNode = addSearchQueryCharacter(professorSpaceNode, prefix);
      const prefixSpaceNode = addSearchQueryCharacter(prefixNode, ' ');
      const classNode = addWithParents([prefixNode, prefixSpaceNode], number, {
        prefix: prefix,
        number: number,
        professorName: profFirst + ' ' + profLast,
      });

      const classNode2 = addSearchQueryCharacter(professorSpaceNode, number);
      const classSpaceNode = addSearchQueryCharacter(classNode2, ' ');
      const prefixNode2 = addWithParents([classNode2, classSpaceNode], prefix, {
        prefix: prefix,
        number: number,
        professorName: profFirst + ' ' + profLast,
      });

      if (sectionNumber === 'HON') {
        addWithParents([classNode, classNode2], '.' + sectionNumber, {
          prefix: prefix,
          number: number,
          sectionNumber: sectionNumber,
          professorName: profFirst + ' ' + profLast,
        });
      }
    }

    for (let prefixItr = 0; prefixItr < prefixList.length; prefixItr++) {
      //console.log(myPrefixes[prefixItr].value);
      for (
        let classItr = 0;
        classItr < prefixList[prefixItr].classes.length;
        classItr++
      ) {
        for (
          let sectionItr = 0;
          sectionItr < prefixList[prefixItr].classes[classItr].sections.length;
          sectionItr++
        ) {
          //console.log(myPrefixes[prefixItr].classes[classItr].number);
          for (
            let professorItr = 0;
            professorItr <
            prefixList[prefixItr].classes[classItr].sections[sectionItr]
              .professors.length;
            professorItr++
          ) {
            //console.log(myPrefixes[prefixItr].classes[classItr].professors[professorItr].firstName + myPrefixes[prefixItr].classes[classItr].professors[professorItr].lastName);
            addPrefixFirst(
              prefixList[prefixItr].value,
              prefixList[prefixItr].classes[classItr].number,
              prefixList[prefixItr].classes[classItr].sections[sectionItr]
                .section_number,
              prefixList[prefixItr].classes[classItr].sections[sectionItr]
                .professors[professorItr].firstName,
              prefixList[prefixItr].classes[classItr].sections[sectionItr]
                .professors[professorItr].lastName,
            );
            addProfFirst(
              prefixList[prefixItr].value,
              prefixList[prefixItr].classes[classItr].number,
              prefixList[prefixItr].classes[classItr].sections[sectionItr]
                .section_number,
              prefixList[prefixItr].classes[classItr].sections[sectionItr]
                .professors[professorItr].firstName,
              prefixList[prefixItr].classes[classItr].sections[sectionItr]
                .professors[professorItr].lastName,
            );
          }
        }
      }
    }

    //Radix tree: reduces graph size by compressing chains of nodes each with only one child to a single node with a character value of several characters.
    function checkForSingleChild(parent: string) {
      if (graph.getNodeAttribute(parent, 'visited')) {
        return;
      }
      //console.log(parent, graph.getNodeAttribute(parent, 'c'));
      if (graph.outDegree(parent) > 1 || graph.hasNodeAttribute(parent, 'd')) {
        /*if (graph.hasNodeAttribute(parent, 'd')) {
          console.log('  has data, children:', graph.outDegree(parent));
        } else {
          console.log('  has children:', graph.outDegree(parent));
        }*/
        graph.setNodeAttribute(parent, 'visited', true);
        graph.forEachOutNeighbor(parent, (child) => {
          //console.log('    child', graph.getNodeAttribute(parent, 'c'), graph.getNodeAttribute(child, 'c'))
          checkForSingleChild(child);
        });
        return;
      }
      //one child, no data
      graph.forEachOutNeighbor(parent, (singleChild, attributes) => {
        //will only return once
        if (graph.inDegree(singleChild) > 1) {
          //skip, should already be called on
          //console.log('  child has parents', attributes.c);
          graph.setNodeAttribute(parent, 'visited', true);
          checkForSingleChild(singleChild); //move on
        } else {
          //one child, no data, child has one parent: merge
          //console.log('  single');
          graph.updateNodeAttribute(parent, 'c', (n) => n + attributes.c);
          graph.forEachOutNeighbor(singleChild, (grandchild) => {
            graph.dropEdge(singleChild, grandchild);
            if (!graph.hasEdge(parent, grandchild) && parent !== grandchild) {
              graph.addEdge(parent, grandchild);
            }
          });
          graph.dropNode(singleChild);
          if (typeof attributes.d !== 'undefined') {
            graph.setNodeAttribute(parent, 'd', attributes.d);
            graph.setNodeAttribute(parent, 'visited', true);
            graph.forEachOutNeighbor(parent, (child) =>
              checkForSingleChild(child),
            );
          } else {
            checkForSingleChild(parent);
          }
        }
      });
    }
    checkForSingleChild(root);

    graph.forEachNode((node) => graph.removeNodeAttribute(node, 'visited'));

    fs.writeFileSync(
      'data/autocomplete_graph.json',
      JSON.stringify(graph.export()),
    );

    console.log('Autocomplete graph generation done.');
  });
