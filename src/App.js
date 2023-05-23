import { useCallback, useState, useRef } from 'react';
import ReactFlow, {addEdge,applyEdgeChanges,applyNodeChanges,Background,MarkerType,
} from 'react-flow-renderer';

import initialNodes from './nodes.jsx';
import initialEdges from './edges.jsx';
import { v4 as uuidv4 } from 'uuid';


const rfStyle = {
  backgroundColor: '#00E6D1',
};

let newstates = new Set('A');


function Flow() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [nodesDeterministico, setNodesDeterministico] = useState([]);
  const [edgesDeterministico, setEdgesDeterministico] = useState([]);

  const actualizarEntradas = (event, entrada, currentState) =>{

    if(event.key === 'Enter'){
      var newnodes = [];
      var position = 0;
      var newedges = [];
      let value =  event.target.value;

      states.map(state => {
         newnodes = [...newnodes,
          {
           id: state,
           data: {label: state},
           position: {x: position, y:10}
         }
        ]
        position += 190;

      })

      newedges = [...edges, value.split(',')
      .flatMap(valueNoD => [
        {
          id: currentState.concat('-').concat(valueNoD).concat(uuidv4()),
          source: currentState,
          target: valueNoD,
          label: entrada,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#00E6D1',
          }
        }])].flatMap(edge => edge);

      setNodes(newnodes);
      setEdges(newedges);
      position = 0;
    }
  }

  const convertirNoDeterministico = () =>{
    let statesConverted = [];
    do{
      statesConverted = Array.from(newstates).flatMap(newstate => newstate.length > 1?
      [Array.from(new Set(newstate.split('')
      .flatMap(state => edges
                .filter(edge => edge.source === state && edge.label === '0')
                .map(edge => edge.target))))
      .sort()
      .reduce((previewEdge, currentEdge) => previewEdge.concat(currentEdge), "")
      , 
      Array.from(new Set(newstate.split('')
      .flatMap(state => edges
        .filter(edge => edge.source === state && edge.label === '1')
        .map(edge => edge.target))))
      .sort()
      .reduce((previewEdge, currentEdge) => previewEdge.concat(currentEdge), "")
    ]
        //Se busca el nodo a convertit
    : [edges.filter(edge => edge.source === newstate && edge.label === '0')
        .map(edge => edge.target)
        .reduce((previewEdge, currentEdge) => previewEdge.concat(currentEdge), "")
        , 
        edges.filter(edge => edge.source === newstate && edge.label === '1')
        .map(edge => edge.target)
        .reduce((previewEdge, currentEdge) => previewEdge.concat(currentEdge), "")])

      newstates = new Set(['A', statesConverted].flatMap(state => state));

    }while(Array.from(newstates).length * 2 !== statesConverted.length)
// caminos que no lleven a ningun lado colocar error
    statesConverted = statesConverted.map(stateConverted => stateConverted.length > 0? stateConverted: "ERROR");

    console.log(Array.from(newstates));
    console.log(statesConverted);

    newstates = Array.from(newstates)
    .map(newstate => newstate.replace(",", ""))
    .map(newstate => newstate.length > 0? newstate: "ERROR")
    .flatMap((newstate, index) => [{
      id: newstate,
      data: {label: newstate},
      position: {x: index * 190, y: 90}
  }]);

  const newedges = newstates.map((state,index) => [{
    id: state.id.concat('-').concat(statesConverted[index*2]).concat(uuidv4()),
    source: state.id,
    target: statesConverted[index*2],
    label: '0',
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#FF0072',
    }
  },
  {
    id: state.id.concat('-').concat(statesConverted[index*2+1]).concat(uuidv4()),
    source: state.id,
    target: statesConverted[index*2+1],
    label: '1',
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#FF0072',
    }
  }
]);
    setNodesDeterministico(newstates);
    setEdgesDeterministico(newedges);
  }

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );
  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  const onNodesDChange = useCallback(
    (changes) => setNodesDeterministico((nds) => applyNodeChanges(changes, nds)),
    [setNodesDeterministico]
  );
  const onEdgesDChange = useCallback(
    (changes) => setEdgesDeterministico((eds) => applyEdgeChanges(changes, eds)),
    [setEdgesDeterministico]
  );
  const onConnectD = useCallback(
    (connection) => setEdgesDeterministico((eds) => addEdge(connection, eds)),
    [setEdgesDeterministico]
  );
    //Aqui se agregan o se quitan los nodos
  const states = ['A','B', 'C','D']
// devuelve el div de los mapas
  return (
    <div style={{ height: 300 }}>
      <table class="tabla">
        <tr>
          <th>nodes</th>
          <th>0</th>
          <th>1</th>

        </tr>

        {
          states
          .map(state => {
            return(
            <tr>
              <td>{state}</td>
              <td><input type="text" onKeyDown={(e) => actualizarEntradas(e, "0", state)} /></td>
              <td><input type="text" onKeyDown={(e) => actualizarEntradas(e, "1", state)} /></td>
            </tr>)
          })
            
        }
      </table>
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      fitView
      style={rfStyle}
      attributionPosition="top-right"
    >
      <Background />
    </ReactFlow>

    <button onClick={convertirNoDeterministico}>Convertir a deterministico</button>

    <table class="tabla">
        <tr>
          <th>nodes</th>
          <th>0</th>
          <th>1</th>

        </tr>

        {
          edgesDeterministico
          .map((tuplaEdge, index) => {
            return(
            <tr>
              <td>{nodesDeterministico[index].id}</td>
              {tuplaEdge.map(edge => <td>{edge.target}</td>)}
            </tr>)
          })
            
        }
      </table>

      <ReactFlow
      nodes={nodesDeterministico}
      edges={edgesDeterministico.flatMap(edge => edge)}
      onNodesChange={onNodesDChange}
      onEdgesChange={onEdgesDChange}
      onConnect={onConnectD}
      fitView
      style={rfStyle}
      attributionPosition="top-right"
    >
      <Background />
    </ReactFlow>

    </div>
  );
}

export default Flow;
