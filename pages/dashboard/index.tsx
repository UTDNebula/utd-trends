import { Card } from '@mui/material';
import type { NextPage, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Carousel from '../../components/common/Carousel/carousel';
import { GraphChoice } from '../../components/graph/GraphChoice/GraphChoice';
import TopMenu from '../../components/navigation/topMenu/topMenu';
import { ExpandableSearchGrid } from '../../components/common/ExpandableSearchGrid/expandableSearchGrid';
import { DirectedGraph } from 'graphology';

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

type GraphNode = {
  key: string;
  attributes: NodeAttributes;
};
type GraphEdge = {
  key: string;
  source: string;
  target: string;
};
type Props = {
  autocompleteGraph: {
    attributes: {
      name?: string;
    };
    options: {
      allowSelfLoops: boolean;
      multi: boolean;
      type: any;
    };
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
};

export const Dashboard: NextPage<Props> = ({ autocompleteGraph }) => {
  const graph: DirectedGraph<NodeAttributes> = new DirectedGraph({
    allowSelfLoops: false,
  });
  graph.import(autocompleteGraph);
  const root = '0';
  type QueueItem = {
    node: string;
    characters?: string;
    toNext: boolean;
  };

  function bfsToNextData(queue: QueueItem[]) {
    const queueItem = queue.shift();
    //console.log(graph.getNodeAttribute(queueItem?.node, 'character'));
    if (graph.getNodeAttribute(queueItem?.node, 'visited')) {
      return;
    }
    graph.setNodeAttribute(queueItem?.node, 'visited', true);
    const data = graph.getNodeAttribute(queueItem?.node, 'data');
    if (typeof data !== 'undefined') {
      return data;
    } else {
      graph.forEachOutNeighbor(queueItem?.node, (neighbor) => {
        queue.push({
          node: neighbor,
          toNext: true,
        });
      });
    }
    return;
  }

  function bfsRecursion(queue: QueueItem[]) {
    const queueItem = queue.shift();
    if (
      queueItem?.characters?.[0] ===
      graph.getNodeAttribute(queueItem?.node, 'character')
    ) {
      //match
      //console.log('match: ', queueItem?.characters, queueItem?.characters?.length === 1);
      if (queueItem?.characters?.length === 1) {
        //last character
        graph.forEachOutNeighbor(queueItem?.node, (neighbor) => {
          //console.log('toNext: ', graph.getNodeAttribute(neighbor, 'character'));
          queue.push({
            node: neighbor,
            toNext: true,
          });
        });
        const data = graph.getNodeAttribute(queueItem?.node, 'data');
        if (typeof data !== 'undefined') {
          //has data
          return data;
        }
      } else {
        graph.forEachOutNeighbor(queueItem?.node, (neighbor) => {
          //console.log('queue: ', graph.getNodeAttribute(neighbor, 'character'));
          queue.push({
            node: neighbor,
            characters: queueItem?.characters?.slice(1),
            toNext: false,
          });
        });
      }
    }
  }

  type bfsReturn = SearchQuery | undefined;

  function bfs(node: string, characters: string) {
    graph.updateEachNodeAttributes((node, attr) => {
      return {
        ...attr,
        visited: false,
      };
    });
    let queue: QueueItem[] = [];
    graph.forEachOutNeighbor(node, (neighbor) => {
      queue.push({
        node: neighbor,
        characters: characters,
        toNext: false,
      });
    });
    let results: SearchQuery[] = [];
    while (queue.length) {
      let response: bfsReturn;
      if (queue[0].toNext) {
        response = bfsToNextData(queue);
      } else {
        response = bfsRecursion(queue);
      }
      if (typeof response !== 'undefined') {
        results.push(response);
      }
    }
    return results;
  }

  function searchAutocomplete(query: string) {
    return bfs(root, query);
  }

  type datType = {
    name: string;
    data: number[];
  };
  const [dat, setDat] = useState<datType[]>([]);
  const [GPAdat, setGPADat] = useState<datType[]>([]);
  const [averageDat, setAverageDat] = useState<datType[]>([]);
  const [stdevDat, setStdevDat] = useState<datType[]>([]);
  function round(val: number) {
    return Math.round((val + Number.EPSILON) * 100) / 100;
  }
  const router = useRouter();
  const [state, setState] = useState('loading');

  useEffect(() => {
    fetch('/api/ratemyprofessorScraper?professors=Greg%20Ozbirn,John%20Cole', {
      method: 'GET',
    })
      .then((response) => response.json())
      .then((data) => console.log(data));
  });

  function searchTermsChange(searchTerms: SearchQuery[]) {
    //called from expandableSearchGrid when data being compared is changed
    console.log('Index search terms: ', searchTerms);
    /*if (searchTerms.length === 0) {
      setState('loading');
    }*/
    Promise.all(
      searchTerms.map((searchTerm: SearchQuery) => {
        let apiRoute = '';
        if (
          'prefix' in searchTerm &&
          typeof searchTerm.prefix === 'string' &&
          'number' in searchTerm &&
          typeof searchTerm.number === 'number' &&
          'professorName' in searchTerm &&
          typeof searchTerm.professorName === 'string' &&
          'section' in searchTerm &&
          typeof searchTerm.sectionNumber === 'string'
        ) {
          //section
          apiRoute = 'section';
        } /*else if (
          'prefix' in searchTerm &&
          typeof searchTerm.prefix === 'string' &&
          'number' in searchTerm &&
          typeof searchTerm.number === 'number' &&
          'professorName' in searchTerm &&
          typeof searchTerm.professorName === 'string'
        ) { //course+professor
          apiRoute = '';
        }*/ else if (
          'prefix' in searchTerm &&
          typeof searchTerm.prefix === 'string' &&
          'number' in searchTerm &&
          typeof searchTerm.number === 'number'
        ) {
          //course
          apiRoute = 'course';
        } else if (
          'professorName' in searchTerm &&
          typeof searchTerm.professorName === 'string'
        ) {
          //professor
          apiRoute = 'professor';
        }
        console.log('apiRoute', apiRoute, typeof searchTerm.number);
        return fetch(
          '/api/nebulaAPI/' +
            apiRoute +
            '?' +
            Object.keys(searchTerm)
              .map(
                (key) =>
                  key +
                  '=' +
                  encodeURIComponent(
                    String(searchTerm[key as keyof SearchQuery]),
                  ),
              )
              .join('&'),
          {
            method: 'GET',
            headers: {
              Accept: 'application/json',
            },
          },
        ).then((response) => response.json());
      }),
    )
      .then((responses) => {
        console.log('data from grid: ', responses);
      })
      .catch((error) => {
        setState('error');
        console.error('Nebula API Error', error);
      });
  }

  useEffect(() => {
    setState('loading');
    if (!router.isReady) return;
    if (
      'sections' in router.query &&
      typeof router.query.sections === 'string'
    ) {
      Promise.all(
        router.query.sections.split(',').map((section) =>
          fetch('/api/nebulaAPI/section?id=' + section, {
            method: 'GET',
            headers: {
              Accept: 'application/json',
            },
          }).then((response) => response.json()),
        ),
      )
        .then((responses) => {
          setDat(
            responses.map((data) => {
              let newDat: datType = {
                name: data.data.name,
                data: data.data.grade_distribution,
              };
              return newDat;
            }),
          );

          let newGPADat: datType[] = [];
          let newAverageDat: datType[] = [];
          let newStdevDat: datType[] = [];
          for (let i = 0; i < responses.length; i++) {
            const GPALookup = [
              4, 4, 3.67, 3.33, 3, 2.67, 2.33, 2, 1.67, 1.33, 1, 0.67, 0,
            ];
            let GPAGrades: number[] = [];
            for (
              let j = 0;
              j < responses[i].data.grade_distribution.length - 1;
              j++
            ) {
              GPAGrades = GPAGrades.concat(
                Array(responses[i].data.grade_distribution[j]).fill(
                  GPALookup[j],
                ),
              );
            }
            newGPADat.push({ name: responses[i].data.name, data: GPAGrades });
            const mean =
              GPAGrades.reduce((partialSum, a) => partialSum + a, 0) /
              GPAGrades.length;
            newAverageDat.push({
              name: responses[i].data.name,
              data: [round(mean)],
            });
            const stdev = Math.sqrt(
              GPAGrades.reduce(
                (partialSum, a) => partialSum + (a - mean) ** 2,
                0,
              ) / GPAGrades.length,
            );
            newStdevDat.push({
              name: responses[i].data.name,
              data: [round(stdev)],
            });
          }
          setGPADat(newGPADat);
          setAverageDat(newAverageDat);
          setStdevDat(newStdevDat);

          setState('success');
        })
        .catch((error) => {
          setState('error');
          console.error('Nebula API Error', error);
        });
    }
  }, [router.isReady, router.query, router.query.sections]);

  if (state === 'error' || state === 'loading') {
    return (
      <>
        <div className=" w-full bg-light h-full">
          <TopMenu />
          <ExpandableSearchGrid
            searchAutocomplete={searchAutocomplete}
            onChange={searchTermsChange}
          />
          <div className="w-full h-5/6 justify-center">
            <div className="w-full h-5/6 relative min-h-full">
              <Carousel>
                <div className="h-full m-4 ">
                  <Card className="h-96 p-4 m-4"></Card>
                </div>
                <div className="p-4 h-full">
                  <Card className="h-96 p-4 m-4"></Card>
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    <Card className="h-96 p-4 m-4"></Card>
                    <Card className="h-96 p-4 m-4"></Card>
                  </div>
                </div>
                <div className=" ">Hi</div>
              </Carousel>
            </div>
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      <div className=" w-full bg-light h-full">
        <TopMenu />
        <ExpandableSearchGrid
          searchAutocomplete={searchAutocomplete}
          onChange={searchTermsChange}
        />
        <div className="w-full h-5/6 justify-center">
          <div className="w-full h-5/6 relative min-h-full">
            <Carousel>
              <div className="h-full m-4 ">
                <Card className="h-96 p-4 m-4">
                  <GraphChoice
                    form="Bar"
                    title="Grades"
                    xaxisLabels={[
                      'A+',
                      'A',
                      'A-',
                      'B+',
                      'B',
                      'B-',
                      'C+',
                      'C',
                      'C-',
                      'D+',
                      'D',
                      'D-',
                      'F',
                      'W',
                    ]}
                    series={dat}
                  />
                </Card>
              </div>
              <div className="p-4 h-full">
                <Card className="h-96 p-4 m-4">
                  <GraphChoice
                    form="BoxWhisker"
                    title="GPA Box and Whisker"
                    xaxisLabels={[
                      'A+',
                      'A',
                      'A-',
                      'B+',
                      'B',
                      'B-',
                      'C+',
                      'C',
                      'C-',
                      'D+',
                      'D',
                      'D-',
                      'F',
                      'W',
                    ]}
                    series={GPAdat}
                  />
                </Card>
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <Card className="h-96 p-4 m-4">
                    <GraphChoice
                      form="Bar"
                      title="GPA Averages"
                      xaxisLabels={['Average']}
                      series={averageDat}
                    />
                  </Card>
                  <Card className="h-96 p-4 m-4">
                    <GraphChoice
                      form="Bar"
                      title="GPA Standard Deviations"
                      xaxisLabels={['Standard Deviation']}
                      series={stdevDat}
                    />
                  </Card>
                </div>
              </div>
              <div className=" ">Hi</div>
            </Carousel>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;

export const getStaticProps: GetStaticProps = async (context) => {
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

  const graph: DirectedGraph<NodeAttributes> = new DirectedGraph({
    allowSelfLoops: false,
  });
  let numNodes = 0; //allows a unique name for each node
  const root = graph.addNode(numNodes++, {
    character: '',
    visited: false,
  });

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

  //Add nodes in format: (<prefix> <number> or <prefix><number>) (<professorLast> or <professorFirst> <professorLast>)
  for (let i = 0; i < myPrefixes.length; i++) {
    //add all nodes
    //console.log(myPrefixes[i].value);
    const prefixNode = addSearchQueryCharacter(root, myPrefixes[i].value, {
      prefix: myPrefixes[i].value,
    });
    const prefixSpaceNode = addSearchQueryCharacter(prefixNode, ' ');
    for (let j = 0; j < myPrefixes[i].classes.length; j++) {
      //console.log(myPrefixes[i].classes[j].number);
      const classNode = addSearchQueryCharacter(
        prefixSpaceNode,
        myPrefixes[i].classes[j].number.toString(),
        {
          prefix: myPrefixes[i].value,
          number: myPrefixes[i].classes[j].number,
        },
      );
      const classSpaceNode = addSearchQueryCharacter(classNode, ' ');
      for (let k = 0; k < myPrefixes[i].classes[j].professors.length; k++) {
        //console.log(myPrefixes[i].classes[j].professors[k].firstName + myPrefixes[i].classes[j].professors[k].lastName);
        //class -> first name -> last name
        //class -> last name
        const professorFirstNameNode = addSearchQueryCharacter(
          classSpaceNode,
          myPrefixes[i].classes[j].professors[k].firstName + ' ',
        );
        const professorLastNameFirstCharNode = addSearchQueryCharacter(
          classSpaceNode,
          myPrefixes[i].classes[j].professors[k].lastName[0],
        );
        graph.addEdge(professorFirstNameNode, professorLastNameFirstCharNode);
        const professorLastNameNode = addSearchQueryCharacter(
          professorLastNameFirstCharNode,
          myPrefixes[i].classes[j].professors[k].lastName.slice(1),
          {
            prefix: myPrefixes[i].value,
            number: myPrefixes[i].classes[j].number,
            professorName:
              myPrefixes[i].classes[j].professors[k].firstName +
              ' ' +
              myPrefixes[i].classes[j].professors[k].lastName,
          },
        );
      }
    }
    graph.forEachOutNeighbor(prefixSpaceNode, (child) => {
      //support no space between prefix and number
      graph.addEdge(prefixNode, child);
    });
  }

  //Add nodes in format: (<professorLast> or <professorFirst> <professorLast>) (<prefix> <number> or <prefix><number>)
  for (let i = 0; i < myProfessors.length; i++) {
    //console.log(myProfessors[i].firstName + ' ' + myProfessors[i].lastName);
    //root -> first name -> last name
    //root -> last name
    const professorFirstNameNode = addSearchQueryCharacter(
      root,
      myProfessors[i].firstName + ' ',
    );
    const professorLastNameFirstCharNode = addSearchQueryCharacter(
      root,
      myProfessors[i].lastName[0],
    );
    graph.addEdge(professorFirstNameNode, professorLastNameFirstCharNode);
    const professorLastNameNode = addSearchQueryCharacter(
      professorLastNameFirstCharNode,
      myProfessors[i].lastName.slice(1) + ' ',
      {
        professorName:
          myProfessors[i].firstName + ' ' + myProfessors[i].lastName,
      },
    );
    for (let j = 0; j < myProfessors[i].classes.length; j++) {
      //console.log(myProfessors[i].classes[j].prefix.value + ' ' + myProfessors[i].classes[j].number);
      const prefixNode = addSearchQueryCharacter(
        professorLastNameNode,
        myProfessors[i].classes[j].prefix.value,
      );
      const prefixSpaceNode = addSearchQueryCharacter(prefixNode, ' ');
      const classNodeFirstChar = addSearchQueryCharacter(
        prefixSpaceNode,
        myProfessors[i].classes[j].number.toString()[0],
      );
      graph.addEdge(prefixNode, classNodeFirstChar);
      const classNode = addSearchQueryCharacter(
        classNodeFirstChar,
        myProfessors[i].classes[j].number.toString().slice(1),
        {
          prefix: myProfessors[i].classes[j].prefix.value,
          number: myProfessors[i].classes[j].number,
          professorName:
            myProfessors[i].firstName + ' ' + myProfessors[i].lastName,
        },
      );
    }
  }
  return {
    props: { autocompleteGraph: graph.export() },
  };
};
