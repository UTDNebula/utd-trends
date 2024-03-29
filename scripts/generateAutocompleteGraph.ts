/*
Build the autocomplete radix tree
Run on `npm run dev` and `npm run build`
Documentation: https://nebula-labs.atlassian.net/wiki/spaces/TRENDS/pages/67993601/Autocomplete+Documentation
*/
import * as fs from 'fs';
import { DirectedGraph } from 'graphology';
import * as aggregatedData from '../data/autocomplete_data.json';
import SearchQuery from '../modules/SearchQuery/SearchQuery';

type NodeAttributes = {
  c: string;
  d?: SearchQuery;
  visited?: boolean;
};

fetch('https://catfact.ninja/fact', { method: 'GET' })
  .then((response) => response.json())
  .then((data) => {
    console.log(data);

    const graph: DirectedGraph<NodeAttributes> = new DirectedGraph({
      allowSelfLoops: false,
    });
    let numNodes = 0; //allows a unique name for each node
    let numEdges = 0;
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
        (neighbor: string, attributes: NodeAttributes) =>
          attributes?.c === characters[0],
      );
      if (typeof preExisting === 'string') {
        if (characters.length <= 1) {
          if (typeof data !== 'undefined') {
            graph.setNodeAttribute(preExisting, 'd', data);
          }
          return preExisting;
        }
        return addSearchQueryCharacter(preExisting, characters.slice(1), data);
      }
      if (characters.length <= 1) {
        let newData: NodeAttributes = {
          c: characters[0],
          visited: false,
        };
        if (typeof data !== 'undefined') {
          newData.d = data;
        }
        const newNode = graph.addNode(numNodes++, newData);
        graph.addEdgeWithKey(numEdges++, node, newNode);
        return newNode;
      }
      const newNode = graph.addNode(numNodes++, {
        c: characters[0],
        visited: false,
      });
      graph.addEdgeWithKey(numEdges++, node, newNode);
      return addSearchQueryCharacter(newNode, characters.slice(1), data);
    }

    // add a string to the graph with multiple parents pointing to its first character
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
          graph.addEdgeWithKey(numEdges++, nextParent, nodeFirstChar);
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
    //and: (<number>|<number> )<prefix>[.<section>][ <professorLast>|(<professorFirst> <professorLast>)]
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
        [classNode, prefixNode2, classNode2],
        ' ' + profFirst + ' ',
      );
      const professorLastNameNode = addWithParents(
        [classNode, prefixNode2, classNode2, professorFirstNameNode],
        ' ' + profLast,
        {
          prefix: prefix,
          number: number,
          profFirst: profFirst,
          profLast: profLast,
        },
      );

      if (sectionNumber === 'HON') {
        //...[.<section>][ <professorLast>|(<professorFirst> <professorLast>)]]
        const sectionNode = addWithParents(
          [classNode, prefixNode2, classNode2],
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
            profFirst: profFirst,
            profLast: profLast,
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
          profFirst: profFirst,
          profLast: profLast,
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
        profFirst: profFirst,
        profLast: profLast,
      });

      const classNode2 = addSearchQueryCharacter(professorSpaceNode, number);
      const classSpaceNode = addSearchQueryCharacter(classNode2, ' ');
      const prefixNode2 = addWithParents([classNode2, classSpaceNode], prefix, {
        prefix: prefix,
        number: number,
        profFirst: profFirst,
        profLast: profLast,
      });

      if (sectionNumber === 'HON') {
        addWithParents([classNode, classNode2], '.' + sectionNumber, {
          prefix: prefix,
          number: number,
          sectionNumber: sectionNumber,
          profFirst: profFirst,
          profLast: profLast,
        });
      }
    }

    for (
      let prefixItr = 0;
      prefixItr < aggregatedData.data.length;
      prefixItr++
    ) {
      const prefixData = aggregatedData.data[prefixItr];
      for (
        let courseNumberItr = 0;
        courseNumberItr < prefixData.course_numbers.length;
        courseNumberItr++
      ) {
        const courseNumberData = prefixData.course_numbers[courseNumberItr];
        for (
          let academicSessionItr = 0;
          academicSessionItr < courseNumberData.academic_sessions.length;
          academicSessionItr++
        ) {
          const academicSessionData =
            courseNumberData.academic_sessions[academicSessionItr];
          for (
            let sectionItr = 0;
            sectionItr < academicSessionData.sections.length;
            sectionItr++
          ) {
            const sectionData = academicSessionData.sections[sectionItr];
            for (
              let professorItr = 0;
              professorItr < sectionData.professors.length;
              professorItr++
            ) {
              const professorData = sectionData.professors[professorItr];
              if (
                'first_name' in professorData && //handle empty professor: {}
                'last_name' in professorData &&
                professorData.first_name !== '' && //handle blank name
                professorData.last_name !== ''
              ) {
                addPrefixFirst(
                  prefixData.subject_prefix,
                  courseNumberData.course_number,
                  sectionData.section_number,
                  professorData.first_name,
                  professorData.last_name,
                );
                addProfFirst(
                  prefixData.subject_prefix,
                  courseNumberData.course_number,
                  sectionData.section_number,
                  professorData.first_name,
                  professorData.last_name,
                );
              }
            }
          }
        }
      }
    }

    //Radix tree: reduces graph size by compressing chains of nodes each with only one child to a single node with a character value of several characters.
    function checkForSingleChild(parent: string) {
      if (graph.getNodeAttribute(parent, 'visited')) {
        return;
      }
      if (graph.outDegree(parent) > 1 || graph.hasNodeAttribute(parent, 'd')) {
        graph.setNodeAttribute(parent, 'visited', true);
        graph.forEachOutNeighbor(parent, (child: string) => {
          checkForSingleChild(child);
        });
        return;
      }
      //one child, no data
      graph.forEachOutNeighbor(
        parent,
        (singleChild: string, attributes: NodeAttributes) => {
          //will only return once
          if (graph.inDegree(singleChild) > 1) {
            //skip, should already be called on
            graph.setNodeAttribute(parent, 'visited', true);
            checkForSingleChild(singleChild); //move on
          } else {
            //one child, no data, child has one parent: merge
            graph.updateNodeAttribute(
              parent,
              'c',
              (n: string | undefined) => n + attributes.c,
            );
            graph.forEachOutNeighbor(singleChild, (grandchild: string) => {
              graph.dropEdge(singleChild, grandchild);
              if (!graph.hasEdge(parent, grandchild) && parent !== grandchild) {
                graph.addEdgeWithKey(numEdges++, parent, grandchild);
              }
            });
            graph.dropNode(singleChild);
            if (typeof attributes.d !== 'undefined') {
              graph.setNodeAttribute(parent, 'd', attributes.d);
              graph.setNodeAttribute(parent, 'visited', true);
              graph.forEachOutNeighbor(parent, (child: string) =>
                checkForSingleChild(child),
              );
            } else {
              checkForSingleChild(parent);
            }
          }
        },
      );
    }
    checkForSingleChild(root);

    graph.forEachNode((node: string) =>
      graph.removeNodeAttribute(node, 'visited'),
    );

    fs.writeFileSync(
      'data/autocomplete_graph.json',
      JSON.stringify(graph.export()),
    );

    console.log('Autocomplete graph generation done.');
  });
