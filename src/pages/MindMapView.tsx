import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState, addEdge, Connection, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { CustomNode } from '../components/CustomNode';
import { ArrowLeft, BookOpen, MessageSquare } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../utils/firestore';

const nodeTypes = {
  customNode: CustomNode,
};

export const MindMapView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [mapData, setMapData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !user) return;

    const fetchMap = async () => {
      try {
        const docRef = doc(db, 'mindmaps', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setMapData(data);
          
          if (data.nodes) {
            setNodes(JSON.parse(data.nodes));
          }
          if (data.edges) {
            setEdges(JSON.parse(data.edges));
          }
        } else {
          console.error("No such document!");
          navigate('/mindmaps');
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `mindmaps/${id}`);
      } finally {
        setLoading(false);
      }
    };

    fetchMap();
  }, [id, user, navigate, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      <header className="p-4 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between z-10">
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
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(`/practice/generate/${id}`)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-xl transition-colors font-medium text-sm border border-emerald-500/30"
          >
            <BookOpen size={16} />
            Generate Exercises
          </button>
          <button 
            onClick={() => navigate(`/dialogues/generate/${id}`)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-xl transition-colors font-medium text-sm border border-blue-500/30"
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
