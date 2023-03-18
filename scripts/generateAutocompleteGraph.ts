/*
RUN ON CHANGE:
"tsc scripts/generateAutocompleteGraph.ts"
run to compile to .js file that can be run at predev and prebuild
*/
const fs = require('fs');
import { DirectedGraph } from 'graphology';
const nodeFetch = require('node-fetch');

type SearchQuery = {
  prefix?: string;
  number?: number;
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
  number: number;
  professors: Professor[];
};

type Professor = {
  classes: Class[];
  firstName: string;
  lastName: string;
};

let myProfessors: Professor[] = [
  { classes: [], firstName: 'arcs', lastName: 'test' },
  { classes: [], firstName: 'csre', lastName: 'acse' },
];

let myPrefixes: Prefix[] = [
  { classes: [], professors: myProfessors, value: 'CS' },
  { classes: [], professors: [], value: 'ECS' },
  { classes: [], professors: [], value: 'CE' },
];

let myClasses: Class[] = [
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
      number: number,
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
      number: number,
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

    for (let i = 0; i < myPrefixes.length; i++) {
      //console.log(myPrefixes[i].value);
      for (let j = 0; j < myPrefixes[i].classes.length; j++) {
        //console.log(myPrefixes[i].classes[j].number);
        for (let k = 0; k < myPrefixes[i].classes[j].professors.length; k++) {
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
      JSON.stringify(graph.export()),
    );

    console.log(
      `Generated a ${
        process.env.VERCEL_ENV === 'production' ? 'crawlable' : 'non-crawlable'
      } public/robots.txt`,
    );
  });
