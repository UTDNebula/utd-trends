/*
RUN ON CHANGE:
"tsc scripts/generateAutocompleteGraph.ts"
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
  character: string;
  data?: SearchQuery;
  visited: boolean;
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
              // @ts-ignore
              if (
                !profExists &&
                existingProfessor.firstName == professor.fn &&
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
              // @ts-ignore
              let newProf: Professor = {
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
      character: '',
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
        (neighbor, attributes) => attributes.character === characters[0],
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
          character: characters[0],
          visited: false,
        };
        if (typeof data !== 'undefined') {
          newData.data = data;
        }
        const newNode = graph.addNode(numNodes++, newData);
        graph.addEdge(node, newNode);
        return newNode;
      }
      //console.log('new: ', characters[0]);
      const newNode = graph.addNode(numNodes++, {
        character: characters[0],
        visited: false,
      });
      graph.addEdge(node, newNode);
      return addSearchQueryCharacter(newNode, characters.slice(1), data);
    }

    //Add node in format: (<prefix> <number> or <prefix><number>) (<professorLast> or <professorFirst> <professorLast>)
    function addPrefixFirst(
      prefix: string,
      number: string,
      profFirst: string,
      profLast: string,
    ) {
      const prefixNode = addSearchQueryCharacter(root, prefix, {
        prefix: prefix,
      });
      const prefixSpaceNode = addSearchQueryCharacter(prefixNode, ' ');
      const classNodeFirstChar = addSearchQueryCharacter(
        prefixSpaceNode,
        number.toString()[0],
      );
      if (!graph.hasEdge(prefixNode, classNodeFirstChar)) {
        graph.addEdge(prefixNode, classNodeFirstChar);
      }
      const classNode = addSearchQueryCharacter(
        classNodeFirstChar,
        number.toString().slice(1),
        {
          prefix: prefix,
          number: number,
        },
      );
      const classSpaceNode = addSearchQueryCharacter(classNode, ' ');

      const professorFirstNameNode = addSearchQueryCharacter(
        classSpaceNode,
        profFirst + ' ',
      );
      const professorLastNameFirstCharNode = addSearchQueryCharacter(
        classSpaceNode,
        profLast[0],
      );
      if (
        !graph.hasEdge(professorFirstNameNode, professorLastNameFirstCharNode)
      ) {
        graph.addEdge(professorFirstNameNode, professorLastNameFirstCharNode);
      }
      const professorLastNameNode = addSearchQueryCharacter(
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
    function addProfFirst(
      prefix: string,
      number: string,
      profFirst: string,
      profLast: string,
    ) {
      const professorFirstNameNode = addSearchQueryCharacter(
        root,
        profFirst + ' ',
      );
      const professorLastNameFirstCharNode = addSearchQueryCharacter(
        root,
        profLast[0],
      );
      if (
        !graph.hasEdge(professorFirstNameNode, professorLastNameFirstCharNode)
      ) {
        graph.addEdge(professorFirstNameNode, professorLastNameFirstCharNode);
      }
      const professorLastNameNode = addSearchQueryCharacter(
        professorLastNameFirstCharNode,
        profLast.slice(1),
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
      const classNodeFirstChar = addSearchQueryCharacter(
        prefixSpaceNode,
        number.toString()[0],
      );
      if (!graph.hasEdge(prefixNode, classNodeFirstChar)) {
        graph.addEdge(prefixNode, classNodeFirstChar);
      }
      const classNode = addSearchQueryCharacter(
        classNodeFirstChar,
        number.toString().slice(1),
        {
          prefix: prefix,
          number: number,
          professorName: profFirst + ' ' + profLast,
        },
      );
    }

    for (let i = 0; i < prefixList.length; i++) {
      //console.log(myPrefixes[i].value);
      for (let j = 0; j < prefixList[i].classes.length; j++) {
        //console.log(myPrefixes[i].classes[j].number);
        for (let k = 0; k < prefixList[i].classes[j].professors.length; k++) {
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
      JSON.stringify(graph.export()),
    );

    console.log(
      `Generated a ${
        process.env.VERCEL_ENV === 'production' ? 'crawlable' : 'non-crawlable'
      } public/robots.txt`,
    );
  });
