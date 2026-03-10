import React, { useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState, addEdge, Connection, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useAuth } from '../contexts/AuthContext';
import { CustomNode } from '../components/CustomNode';
import { ArrowLeft, BookOpen, MessageSquare } from 'lucide-react';
import { useMindMap } from '../hooks/useMindMap';
import { LoadingSpinner } from '../components/LoadingSpinner';

const nodeTypes = {
  customNode: CustomNode,
};

export const MindMapView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { mapData, loading, error } = useMindMap(id, user?.uid);

  useEffect(() => {
    if (error) {
      console.error(error);
      navigate('/mindmaps');
    }
  }, [error, navigate]);

  useEffect(() => {
    if (mapData) {
      if (mapData.nodes) {
        setNodes(JSON.parse(mapData.nodes));
      }
      if (mapData.edges) {
        setEdges(JSON.parse(mapData.edges));
      }
    }
  }, [mapData, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      <header className="p-4 border-b border-zinc-800 bg-zinc-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white capitalize">{mapData?.topic}</h1>
            <p className="text-xs text-zinc-400 font-medium">Level {mapData?.level}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <button 
            onClick={() => navigate(`/practice/generate/${id}`)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-xl transition-colors font-medium text-sm border border-emerald-500/30 whitespace-nowrap"
          >
            <BookOpen size={16} />
            Generate Exercises
          </button>
          <button 
            onClick={() => navigate(`/dialogues/generate/${id}`)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-xl transition-colors font-medium text-sm border border-blue-500/30 whitespace-nowrap"
          >
            <MessageSquare size={16} />
            Generate Dialogue
          </button>
        </div>
      </header>

      <div className="flex-1 w-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          className="bg-zinc-950"
          colorMode="dark"
        >
          <Controls className="bg-zinc-900 border-zinc-800 fill-zinc-400" />
          <MiniMap 
            nodeColor="#6b21a8" 
            maskColor="rgba(9, 9, 11, 0.8)" 
            className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden" 
          />
          <Background color="#27272a" gap={16} />
        </ReactFlow>
      </div>
    </div>
  );
};
