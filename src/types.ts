export type NodeType = 'start' | 'decision' | 'action' | 'end'

export interface FlowNode {
  id: string
  type: NodeType
  text: string
  yesNextId?: string
  noNextId?: string
  x: number
  y: number
}

export interface Flowchart {
  id: string
  name: string
  nodes: FlowNode[]
  startNodeId: string
}
