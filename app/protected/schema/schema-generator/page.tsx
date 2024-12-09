'use client';

import React, { useState, useCallback } from 'react';
import ReactFlow, { 
  Controls, 
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  BaseEdge,
  getBezierPath,
} from 'reactflow';
import 'reactflow/dist/style.css';
import HydraulicSymbol from './HydraulicSymbol';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Save, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  Move, 
  Trash2,
  RotateCw
} from 'lucide-react';

// Symboles hydrauliques
const HydraulicSymbols = {
    Pump: () => (
      <svg viewBox="0 0 100 100" className="w-12 h-12">
        <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M20 50 L80 50" stroke="currentColor" strokeWidth="2" />
        <path d="M50 20 L50 80" stroke="currentColor" strokeWidth="2" />
        <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M35 50 L65 50 L50 35 Z" fill="currentColor" />
      </svg>
    ),
    Valve: () => (
      <svg viewBox="0 0 100 100" className="w-12 h-12">
        <path d="M20 35 L80 65 M20 65 L80 35" stroke="currentColor" strokeWidth="2" fill="none" />
        <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    Tank: () => (
      <svg viewBox="0 0 100 100" className="w-12 h-12">
        <path d="M30 20 L70 20 L70 80 L30 80 Z" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M30 20 C 30 10, 70 10, 70 20" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M30 80 C 30 90, 70 90, 70 80" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    Sensor: () => (
      <svg viewBox="0 0 100 100" className="w-12 h-12">
        <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M50 30 L50 70 M40 50 L60 50" stroke="currentColor" strokeWidth="2" />
        <path d="M30 30 L70 70" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    SmartPack: () => (
      <svg viewBox="0 0 100 100" className="w-12 h-12">
        <rect x="20" y="30" width="60" height="40" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M20 40 L80 40 M20 50 L80 50 M20 60 L80 60" stroke="currentColor" strokeWidth="2" fill="none" />
      </svg>
    ),
    Collector: () => (
      <svg viewBox="0 0 100 100" className="w-12 h-12">
        <rect x="40" y="20" width="20" height="60" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M20 35 L40 35 M20 50 L40 50 M20 65 L40 65" stroke="currentColor" strokeWidth="2" />
        <path d="M60 35 L80 35 M60 50 L80 50 M60 65 L80 65" stroke="currentColor" strokeWidth="2" />
      </svg>
    )
  };
  
  // Composant Edge personnalisé
  const CustomEdge = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    data,
    sourceHandleId,
    targetHandleId,
  }) => {
    const [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });
  
    const isDepart = sourceHandleId?.includes('depart') || sourceHandleId?.includes('source');
    const baseColor = isDepart ? '#ff0000' : '#0000ff';
  
    return (
      <>
        <BaseEdge path={edgePath} style={{
          strokeWidth: 6,
          stroke: baseColor,
        }} />
        <path
          className="flow-path"
          d={edgePath}
          style={{
            fill: 'none',
            stroke: 'white',
            strokeWidth: 2,
            strokeDasharray: '5 10',
            strokeOpacity: 0.5,
            animation: 'flow 1s linear infinite',
          }}
        />
        <style jsx global>{`
          @keyframes flow {
            0% {
              stroke-dashoffset: 15;
            }
            100% {
              stroke-dashoffset: 0;
            }
          }
        `}</style>
      </>
    );
  };
  
  const Nodes = {
    SmartPack4: ({ data }) => (
      <div className="bg-white p-4 rounded-lg border-2 border-gray-300 shadow-lg w-60">
        <div className="text-center font-bold mb-2">SmartPack4</div>
        <div className="flex justify-center mb-2">
          <HydraulicSymbols.SmartPack />
        </div>
        <Handle
          type="target"
          position={Position.Right}
          id="capteur-rouge"
          style={{ top: '30%', background: '#ff0000', width: '12px', height: '12px' }}
        />
        <Handle
          type="target"
          position={Position.Right}
          id="capteur-bleu"
          style={{ top: '70%', background: '#0000ff', width: '12px', height: '12px' }}
        />
        <Handle
          type="target"
          position={Position.Left}
          id="plancher-rouge"
          style={{ top: '30%', background: '#ff0000', width: '12px', height: '12px' }}
        />
        <Handle
          type="target"
          position={Position.Left}
          id="plancher-bleu"
          style={{ top: '70%', background: '#0000ff', width: '12px', height: '12px' }}
        />
      </div>
    ),
  
    Collector: ({ data }) => {
      const nbPorts = 6;
      const spacing = 100 / (nbPorts + 1);
  
      return (
        <div className="bg-white p-4 rounded-lg border-2 border-gray-300 shadow-lg" style={{ width: '120px', height: '300px' }}>
          <div className="text-center font-bold mb-2">Collecteur</div>
          <div className="flex justify-center mb-2">
            <HydraulicSymbols.Collector />
          </div>
          <Handle
            type="target"
            position={Position.Left}
            id="main-rouge"
            style={{ top: '30%', background: '#ff0000', width: '12px', height: '12px' }}
          />
          <Handle
            type="target"
            position={Position.Left}
            id="main-bleu"
            style={{ top: '70%', background: '#0000ff', width: '12px', height: '12px' }}
          />
          {Array.from({ length: nbPorts }).map((_, i) => (
            <React.Fragment key={i}>
              <Handle
                type="source"
                position={Position.Right}
                id={`sortie-rouge-${i}`}
                style={{ 
                  top: `${spacing * (i + 1)}%`,
                  background: '#ff0000',
                  width: '10px',
                  height: '10px'
                }}
              />
              <Handle
                type="source"
                position={Position.Right}
                id={`sortie-bleu-${i}`}
                style={{ 
                  top: `${spacing * (i + 1) + 10}%`,
                  background: '#0000ff',
                  width: '10px',
                  height: '10px'
                }}
              />
            </React.Fragment>
          ))}
        </div>
      );
    },
  
    Sensor: ({ data }) => (
      <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm w-32">
        <div className="flex justify-center mb-2">
          <HydraulicSymbols.Sensor />
        </div>
        <Handle
          type="target"
          position={Position.Left}
          id="capteur-rouge"
          style={{ background: '#ff0000', width: '10px', height: '10px' }}
        />
        <Handle
          type="target"
          position={Position.Right}
          id="capteur-bleu"
          style={{ background: '#0000ff', width: '10px', height: '10px' }}
        />
        <div className="text-xs mt-1 font-semibold text-center">Capteur</div>
      </div>
    ),
  
    Valve: ({ data }) => {
      const [position, setPosition] = useState(0);
      const positions = ['→', '↓', '×'];
  
      const rotateValve = () => {
        setPosition((prev) => (prev + 1) % 3);
      };
  
      return (
        <div className="relative bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex justify-center mb-2">
            <HydraulicSymbols.Valve />
          </div>
          {position === 0 && (
            <>
              <Handle 
                type="target"
                position={Position.Left}
                id="valve-rouge-gauche"
                style={{ top: '30%', background: '#ff0000', width: '10px', height: '10px' }}
              />
              <Handle 
                type="source"
                position={Position.Right}
                id="valve-rouge-droite"
                style={{ top: '30%', background: '#ff0000', width: '10px', height: '10px' }}
              />
              <Handle 
                type="target"
                position={Position.Left}
                id="valve-bleu-gauche"
                style={{ top: '70%', background: '#0000ff', width: '10px', height: '10px' }}
              />
              <Handle 
                type="source"
                position={Position.Right}
                id="valve-bleu-droite"
                style={{ top: '70%', background: '#0000ff', width: '10px', height: '10px' }}
              />
            </>
          )}
          {position === 1 && (
            <>
              <Handle 
                type="target"
                position={Position.Top}
                id="valve-rouge-haut"
                style={{ left: '30%', background: '#ff0000', width: '10px', height: '10px' }}
              />
              <Handle 
                type="source"
                position={Position.Bottom}
                id="valve-rouge-bas"
                style={{ left: '30%', background: '#ff0000', width: '10px', height: '10px' }}
              />
              <Handle 
                type="target"
                position={Position.Top}
                id="valve-bleu-haut"
                style={{ left: '70%', background: '#0000ff', width: '10px', height: '10px' }}
              />
              <Handle 
                type="source"
                position={Position.Bottom}
                id="valve-bleu-bas"
                style={{ left: '70%', background: '#0000ff', width: '10px', height: '10px' }}
              />
            </>
          )}
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold">{positions[position]}</span>
            <Button 
              variant="ghost" 
              size="icon"
              className="mt-1"
              onClick={rotateValve}
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      );
    },
  
    Tank: ({ data }) => (
      <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex justify-center mb-2">
          <HydraulicSymbols.Tank />
        </div>
        <Handle 
          type="target" 
          position={Position.Top}
          id="tank-rouge-haut"
          style={{ background: '#ff0000', width: '10px', height: '10px' }}
        />
        <Handle 
          type="source" 
          position={Position.Bottom}
          id="tank-bleu-bas"
          style={{ background: '#0000ff', width: '10px', height: '10px' }}
        />
        <div className="text-xs mt-1 text-center">Ballon</div>
      </div>
    ),
  
    Pump: ({ data }) => (
      <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex justify-center mb-2">
          <HydraulicSymbols.Pump />
        </div>
        <Handle 
          type="target" 
          position={Position.Top}
          id="pump-rouge-haut"
          style={{ background: '#ff0000', width: '10px', height: '10px' }}
        />
        <Handle 
          type="source" 
          position={Position.Bottom}
          id="pump-bleu-bas"
          style={{ background: '#0000ff', width: '10px', height: '10px' }}
        />
        <div className="text-xs mt-1 text-center">Circulateur</div>
      </div>
    )
  };
  
  // [Le reste du code reste identique: nodeTypes, edgeTypes, Sidebar, et SchemaGenerator]
  const nodeTypes = {
    smartpack4: Nodes.SmartPack4,
    valve: Nodes.Valve,
    tank: Nodes.Tank,
    pump: Nodes.Pump,
    collector: Nodes.Collector,
    sensor: Nodes.Sensor,
  };
  
  const edgeTypes = {
    custom: CustomEdge,
  };

const Sidebar = () => {
    const componentsList = [
      { id: 'smartpack4', name: 'SmartPack4', icon: '🔥' },
      { id: 'collector', name: 'Collecteur', icon: '🔌' },
      { id: 'sensor', name: 'Capteur', icon: '📡' },
      { id: 'tank', name: 'Ballon', icon: '💧' },
      { id: 'pump', name: 'Circulateur', icon: '⚡' },
      { id: 'valve', name: 'Vanne', icon: '🔧' },
    ];

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4">
      <h3 className="text-lg font-semibold mb-4">Composants</h3>
      <div className="space-y-2">
        {componentsList.map((component) => (
          <div
            key={component.id}
            draggable
            onDragStart={(event) => onDragStart(event, component.id)}
            className="flex items-center p-3 bg-gray-50 rounded-lg cursor-move hover:bg-gray-100 transition-colors"
          >
            <span className="mr-2 text-2xl">{component.icon}</span>
            <span className="text-sm">{component.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const SchemaGenerator = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const onConnect = useCallback(
    (params) => {
      const edge = {
        ...params,
        type: 'custom',
      };
      
      // Détermine la couleur en fonction des IDs des handles
      const isRouge = params.sourceHandle?.includes('rouge') || params.targetHandle?.includes('rouge');
      edge.style = { stroke: isRouge ? '#ff0000' : '#0000ff' };
      
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      if (!reactFlowInstance) return;

      const type = event.dataTransfer.getData('application/reactflow');
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { label: `${type} node` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const onSave = useCallback(() => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      localStorage.setItem('hydraulicSchema', JSON.stringify(flow));
    }
  }, [reactFlowInstance]);

  const onRestore = useCallback(() => {
    const restoreFlow = async () => {
      const flow = JSON.parse(localStorage.getItem('hydraulicSchema'));
      if (flow) {
        setNodes(flow.nodes || []);
        setEdges(flow.edges || []);
      }
    };
    restoreFlow();
  }, [setNodes, setEdges]);

  const onDelete = useCallback(() => {
    setNodes([]);
    setEdges([]);
  }, [setNodes, setEdges]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <div className="h-16 bg-white border-b border-gray-200 px-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Move className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <ZoomIn className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <ZoomOut className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="text-red-500" onClick={onDelete}>
              <Trash2 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onSave}>
              <Save className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onRestore}>
              <Download className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
};

export default SchemaGenerator;