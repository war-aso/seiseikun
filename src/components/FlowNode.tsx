import React from 'react'
import { FlowNode as FlowNodeType } from '../types'
import './FlowNode.css'

interface FlowNodeProps {
  node: FlowNodeType
  isSelected: boolean
  onClick: () => void
  onDragStart: () => void
}

const FlowNode: React.FC<FlowNodeProps> = ({
  node,
  isSelected,
  onClick,
  onDragStart,
}) => {
  const getNodeColor = (type: string) => {
    switch (type) {
      case 'start':
      case 'end':
        return '#4CAF50'
      case 'decision':
        return '#2196F3'
      case 'action':
        return '#FF9800'
      default:
        return '#999'
    }
  }

  const getNodeShape = (type: string) => {
    if (type === 'decision') {
      return 'polygon'
    }
    return 'rect'
  }

  const color = getNodeColor(node.type)
  const className = `flow-node ${isSelected ? 'selected' : ''} ${node.type}`

  if (node.type === 'decision') {
    return (
      <g
        className={className}
        onClick={onClick}
        onMouseDown={onDragStart}
      >
        <polygon
          points={`${node.x + 100},${node.y} ${node.x + 200},${node.y + 60} ${node.x + 100},${node.y + 120} ${node.x},${node.y + 60}`}
          fill={color}
          stroke={isSelected ? '#000' : '#333'}
          strokeWidth={isSelected ? 3 : 2}
        />
        <text
          x={node.x + 100}
          y={node.y + 65}
          textAnchor="middle"
          dominantBaseline="middle"
          className="node-text"
        >
          {node.text}
        </text>
      </g>
    )
  }

  return (
    <g
      className={className}
      onClick={onClick}
      onMouseDown={onDragStart}
    >
      <rect
        x={node.x}
        y={node.y}
        width="200"
        height="120"
        rx="8"
        fill={color}
        stroke={isSelected ? '#000' : '#333'}
        strokeWidth={isSelected ? 3 : 2}
      />
      <text
        x={node.x + 100}
        y={node.y + 60}
        textAnchor="middle"
        dominantBaseline="middle"
        className="node-text"
      >
        {node.text}
      </text>

      {node.type === 'decision' && (
        <>
          <text x={node.x + 110} y={node.y + 80} className="branch-label yes">
            YES
          </text>
          <text x={node.x + 90} y={node.y + 80} className="branch-label no">
            NO
          </text>
        </>
      )}
    </g>
  )
}

export default FlowNode
