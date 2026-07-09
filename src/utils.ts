import { FlowNode, Flowchart, NodeType } from './types'

export function generateId(): string {
  return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function createNode(type: NodeType, x: number, y: number, text: string = ''): FlowNode {
  return {
    id: generateId(),
    type,
    text,
    x,
    y,
  }
}

export function createFlowchart(name: string = 'New Flowchart'): Flowchart {
  const startNode = createNode('start', 100, 100, 'スタート')
  return {
    id: generateId(),
    name,
    nodes: [startNode],
    startNodeId: startNode.id,
  }
}

export function exportFlowchart(flowchart: Flowchart): string {
  return JSON.stringify(flowchart, null, 2)
}

export function importFlowchart(json: string): Flowchart {
  return JSON.parse(json)
}

export function getNodeById(flowchart: Flowchart, id: string): FlowNode | undefined {
  return flowchart.nodes.find(node => node.id === id)
}

export function updateNode(flowchart: Flowchart, nodeId: string, updates: Partial<FlowNode>): Flowchart {
  return {
    ...flowchart,
    nodes: flowchart.nodes.map(node =>
      node.id === nodeId ? { ...node, ...updates } : node
    ),
  }
}

export function deleteNode(flowchart: Flowchart, nodeId: string): Flowchart {
  const nodes = flowchart.nodes.filter(node => node.id !== nodeId)
  const newNodes = nodes.map(node => ({
    ...node,
    yesNextId: node.yesNextId === nodeId ? undefined : node.yesNextId,
    noNextId: node.noNextId === nodeId ? undefined : node.noNextId,
  }))
  return {
    ...flowchart,
    nodes: newNodes,
  }
}

export function saveToLocalStorage(key: string, flowchart: Flowchart): void {
  localStorage.setItem(key, exportFlowchart(flowchart))
}

export function loadFromLocalStorage(key: string): Flowchart | null {
  const data = localStorage.getItem(key)
  if (!data) return null
  try {
    return importFlowchart(data)
  } catch {
    return null
  }
}
