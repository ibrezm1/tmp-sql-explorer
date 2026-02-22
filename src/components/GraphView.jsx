import React, { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Plus, Minus, Maximize } from 'lucide-react';

const GraphView = ({ tables, fks, onTableClick }) => {
    const [hoverNode, setHoverNode] = useState(null);
    const [highlightNodes, setHighlightNodes] = useState(new Set());
    const [highlightLinks, setHighlightLinks] = useState(new Set());
    const graphRef = useRef();

    const graphData = useMemo(() => {
        const nodes = tables.map(t => ({
            id: t.name,
            name: t.name,
            val: 2,
            color: '#4f46e5'
        }));

        const links = fks.map(fk => ({
            source: fk.ParentTable,
            target: fk.ReferencedTable,
            label: fk.ConstraintName
        })).filter(l =>
            tables.find(t => t.name === l.source) &&
            tables.find(t => t.name === l.target)
        );

        return { nodes, links };
    }, [tables, fks]);

    // Auto-center and fit graph on data change
    useEffect(() => {
        if (graphRef.current && graphData.nodes.length > 0) {
            // Small timeout to allow the force engine to stabilize slightly
            const timer = setTimeout(() => {
                graphRef.current.zoomToFit(400, 100);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [graphData]);

    const updateHighlight = (node) => {
        const newHighlightNodes = new Set();
        const newHighlightLinks = new Set();

        if (node) {
            newHighlightNodes.add(node.id);
            graphData.links.forEach(link => {
                const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                const targetId = typeof link.target === 'object' ? link.target.id : link.target;

                if (sourceId === node.id || targetId === node.id) {
                    newHighlightLinks.add(link);
                    newHighlightNodes.add(sourceId);
                    newHighlightNodes.add(targetId);
                }
            });
        }

        setHoverNode(node || null);
        setHighlightNodes(newHighlightNodes);
        setHighlightLinks(newHighlightLinks);
    };

    const handleZoomIn = useCallback(() => {
        if (graphRef.current) {
            const currentZoom = graphRef.current.zoom();
            graphRef.current.zoom(currentZoom * 1.5, 400);
        }
    }, []);

    const handleZoomOut = useCallback(() => {
        if (graphRef.current) {
            const currentZoom = graphRef.current.zoom();
            graphRef.current.zoom(currentZoom * 0.7, 400);
        }
    }, []);

    const handleZoomToFit = useCallback(() => {
        if (graphRef.current) {
            graphRef.current.zoomToFit(400, 50);
        }
    }, []);

    return (
        <div className="bg-white rounded-2xl border h-[calc(100vh-170px)] relative overflow-hidden">
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                <button onClick={handleZoomIn} className="bg-white hover:bg-slate-50 p-2 rounded-lg border shadow-sm text-slate-600 transition-colors" title="Zoom In"><Plus size={18} /></button>
                <button onClick={handleZoomOut} className="bg-white hover:bg-slate-50 p-2 rounded-lg border shadow-sm text-slate-600 transition-colors" title="Zoom Out"><Minus size={18} /></button>
                <button onClick={handleZoomToFit} className="bg-white hover:bg-slate-50 p-2 rounded-lg border shadow-sm text-slate-600 transition-colors" title="Fit to Screen"><Maximize size={18} /></button>
            </div>

            <ForceGraph2D
                ref={graphRef}
                graphData={graphData}
                nodeLabel="name"
                nodeColor={n => highlightNodes.has(n.id) ? '#4f46e5' : (hoverNode ? 'rgba(79, 70, 229, 0.1)' : '#4f46e5')}
                nodeRelSize={6}
                linkDirectionalArrowLength={3.5}
                linkDirectionalArrowRelPos={1}
                linkCurvature={0.25}
                onNodeClick={(node) => onTableClick(tables.find(t => t.name === node.id))}
                onNodeHover={updateHighlight}
                linkWidth={link => highlightLinks.has(link) ? 3 : 1.5}
                linkColor={link => highlightLinks.has(link) ? '#4f46e5' : (hoverNode ? 'rgba(203, 213, 225, 0.2)' : '#cbd5e1')}
                nodeCanvasObject={(node, ctx, globalScale) => {
                    const label = node.name;
                    const fontSize = 14 / globalScale;
                    ctx.font = `bold ${fontSize}px Inter, system-ui, sans-serif`;
                    const textWidth = ctx.measureText(label).width;
                    const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.5); // Increased padding

                    const isHighlighted = highlightNodes.has(node.id);
                    const opacity = hoverNode ? (isHighlighted ? 1 : 0.15) : 1;

                    // Draw rounded background tag
                    ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.95})`;
                    const x = node.x - bckgDimensions[0] / 2;
                    const y = node.y - bckgDimensions[1] / 2;
                    const w = bckgDimensions[0];
                    const h = bckgDimensions[1];
                    const r = h / 2; // Semi-circular ends

                    ctx.beginPath();
                    ctx.moveTo(x + r, y);
                    ctx.lineTo(x + w - r, y);
                    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
                    ctx.lineTo(x + w, y + h - r);
                    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
                    ctx.lineTo(x + r, y + h);
                    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
                    ctx.lineTo(x, y + r);
                    ctx.quadraticCurveTo(x, y, x + r, y);
                    ctx.closePath();
                    ctx.fill();

                    // Draw border for highlighted
                    if (isHighlighted) {
                        ctx.strokeStyle = '#4f46e5';
                        ctx.lineWidth = 2 / globalScale;
                        ctx.stroke();
                    }

                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = isHighlighted ? '#4f46e5' : `rgba(79, 70, 229, ${opacity})`;
                    ctx.fillText(label, node.x, node.y);

                    node.__bckgDimensions = bckgDimensions;
                }}
                nodePointerAreaPaint={(node, color, ctx) => {
                    ctx.fillStyle = color;
                    const bckgDimensions = node.__bckgDimensions;
                    if (bckgDimensions) {
                        ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);
                    }
                }}
            />
        </div>
    );
};

export default GraphView;
