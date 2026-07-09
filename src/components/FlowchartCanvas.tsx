import React, { useRef, useEffect, useState } from 'react'
import { Flowchart } from '../types'
import FlowNode from './FlowNode'
import './FlowchartCanvas.css'

interface FlowchartCanvasProps {
  flowchart: Flowchart
  onNodeClick: (nodeId: string) => void
  selectedNodeId?: string
  onNodeMove: (nodeId: string, x: number, y: number) => void
  isDragging: boolean
  draggingNodeId?: string
  setDraggingNodeId: (id?: string) => void
}

const FlowchartCanvas: React.FC<FlowchartCanvasProps> = ({
  flowchart,
  onNodeClick,
  selectedNodeId,
  onNodeMove,
  isDragging,
  draggingNodeId,
  setDraggingNodeId,
}) => {
  const canvasRef = useRef<SVGSVGElement>(null)
  const [scale, setScale] = useState(1)
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setScale(prev => Math.max(0.5, Math.min(3, prev * delta)))
  }

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isDragging && draggingNodeId && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left - panX) / scale
      const y = (e.clientY - rect.top - panY) / scale
      onNodeMove(draggingNodeId, x, y)
    }
  }

  const drawConnection = (fromNode: any, toNodeId?: string) => {
    if (!toNodeId) return null
    const toNode = flowchart.nodes.find(n => n.id === toNodeId)
    if (!toNode) return null

    const x1 = fromNode.x + 100
    const y1 = fromNode.y + 60
    const x2 = toNode.x
    const y2 = toNode.y + 30

    const midX = (x1 + x2) / 2
    const midY = (y1 + y2) / 2

    return (
      <g key={`connection-${fromNode.id}-${toNodeId}`}>
        <path
          d={`M ${x1} ${y1} Q ${midX} ${midY - 20} ${x2} ${y2}`}
          stroke="#666"
          strokeWidth="2"
          fill="none"
          markerEnd="url(#arrowhead)"
        />
      </g>
    )
  }

  return (
    <div className="flowchart-canvas-container">
      <svg
        ref={canvasRef}
        className="flowchart-canvas"
        onWheel={handleWheel}
        onMouseMove={handleMouseMove}
        onMouseUp={() => setDraggingNodeId(undefined)}
        onMouseLeave={() => setDraggingNodeId(undefined)}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#666" />
          </marker>
        </defs>
        <g style={{ transform: `translate(${panX}px, ${panY}px) scale(${scale})` }}>
          {/* Draw connections */}
          {flowchart.nodes.map(node => (
            <React.Fragment key={`connections-${node.id}`}>
              {node.yesNextId && drawConnection(node, node.yesNextId)}
              {node.noNextId && drawConnection(node, node.noNextId)}
            </React.Fragment>
          ))}

          {/* Draw nodes */}
          {flowchart.nodes.map(node => (
            <FlowNode
              key={node.id}
              node={node}
              isSelected={selectedNodeId === node.id}
              onClick={() => onNodeClick(node.id)}
              onDragStart={() => setDraggingNodeId(node.id)}
            />
          ))}
        </g>
      </svg>
      <div className="canvas-info">
        スケール: {(scale * 100).toFixed(0)}%
      </div>
    </div>
  )
}

export default FlowchartCanvas
