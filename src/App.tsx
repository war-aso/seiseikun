import React, { useState, useEffect } from 'react'
import { Flowchart, FlowNode as FlowNodeType } from './types'
import {
  createFlowchart,
  createNode,
  updateNode as updateNodeUtil,
  deleteNode as deleteNodeUtil,
  saveToLocalStorage,
  loadFromLocalStorage,
  generateId,
} from './utils'
import FlowchartCanvas from './components/FlowchartCanvas'
import NodeEditor from './components/NodeEditor'
import { Download, Upload, Plus, Save } from 'lucide-react'
import './App.css'

function App() {
  const [flowchart, setFlowchart] = useState<Flowchart | null>(null)
  const [selectedNodeId, setSelectedNodeId] = useState<string>('')
  const [draggingNodeId, setDraggingNodeId] = useState<string>()
  const [flowchartName, setFlowchartName] = useState('商談フロー')

  useEffect(() => {
    const saved = loadFromLocalStorage('flowchart_current')
    if (saved) {
      setFlowchart(saved)
      setFlowchartName(saved.name)
      if (saved.nodes.length > 0) {
        setSelectedNodeId(saved.nodes[0].id)
      }
    } else {
      const newFlowchart = createFlowchart('商談フロー')
      setFlowchart(newFlowchart)
      setFlowchartName(newFlowchart.name)
      setSelectedNodeId(newFlowchart.startNodeId)
    }
  }, [])

  const handleNodeClick = (nodeId: string) => {
    setSelectedNodeId(nodeId)
  }

  const handleNodeMove = (nodeId: string, x: number, y: number) => {
    if (!flowchart) return
    const newFlowchart = updateNodeUtil(flowchart, nodeId, { x, y })
    setFlowchart(newFlowchart)
  }

  const handleNodeUpdate = (updates: Partial<FlowNodeType>) => {
    if (!flowchart || !selectedNodeId) return
    const newFlowchart = updateNodeUtil(flowchart, selectedNodeId, updates)
    setFlowchart(newFlowchart)
  }

  const handleNodeDelete = () => {
    if (!flowchart || !selectedNodeId) return
    const newFlowchart = deleteNodeUtil(flowchart, selectedNodeId)
    setFlowchart(newFlowchart)
    setSelectedNodeId(newFlowchart.nodes[0]?.id || '')
  }

  const handleAddNode = (type: string, branchType?: 'yes' | 'no') => {
    if (!flowchart || !selectedNodeId) return

    const selectedNode = flowchart.nodes.find(n => n.id === selectedNodeId)
    if (!selectedNode) return

    const newNode = createNode(
      type as any,
      selectedNode.x + 250,
      selectedNode.y + (branchType === 'no' ? 120 : -120),
      `新しい${type === 'decision' ? '判断' : type === 'action' ? 'アクション' : '終了'}ノード`
    )

    const updatedFlowchart = {
      ...flowchart,
      nodes: [...flowchart.nodes, newNode],
    }

    if (branchType && selectedNode.type === 'decision') {
      updatedFlowchart.nodes = updatedFlowchart.nodes.map(n =>
        n.id === selectedNodeId
          ? {
              ...n,
              [branchType === 'yes' ? 'yesNextId' : 'noNextId']: newNode.id,
            }
          : n
      )
    }

    setFlowchart(updatedFlowchart)
    setSelectedNodeId(newNode.id)
  }

  const getLinkedNodes = () => {
    if (!flowchart || !selectedNodeId) return { yes: undefined, no: undefined }
    const selectedNode = flowchart.nodes.find(n => n.id === selectedNodeId)
    if (!selectedNode) return { yes: undefined, no: undefined }

    return {
      yes: selectedNode.yesNextId
        ? flowchart.nodes.find(n => n.id === selectedNode.yesNextId)
        : undefined,
      no: selectedNode.noNextId
        ? flowchart.nodes.find(n => n.id === selectedNode.noNextId)
        : undefined,
    }
  }

  const handleNewFlowchart = () => {
    const newName = prompt('フローチャート名を入力してください:', 'My Flowchart')
    if (newName) {
      const newFlowchart = createFlowchart(newName)
      setFlowchart(newFlowchart)
      setFlowchartName(newName)
      setSelectedNodeId(newFlowchart.startNodeId)
    }
  }

  const handleSave = () => {
    if (!flowchart) return
    const updated = { ...flowchart, name: flowchartName }
    setFlowchart(updated)
    saveToLocalStorage('flowchart_current', updated)
    alert('フローチャートを保存しました！')
  }

  const handleExport = () => {
    if (!flowchart) return
    const json = JSON.stringify(flowchart, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${flowchartName}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string)
        setFlowchart(imported)
        setFlowchartName(imported.name)
        setSelectedNodeId(imported.nodes[0]?.id || '')
      } catch (error) {
        alert('ファイルの形式が正しくありません')
      }
    }
    reader.readAsText(file)
  }

  const selectedNode = flowchart?.nodes.find(n => n.id === selectedNodeId)

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1>商談フローチャート ビルダー</h1>
          <input
            type="text"
            value={flowchartName}
            onChange={(e) => setFlowchartName(e.target.value)}
            className="flowchart-name-input"
            placeholder="フローチャート名"
          />
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={handleNewFlowchart}>
            <Plus size={18} /> 新規作成
          </button>
          <button className="btn-secondary" onClick={handleSave}>
            <Save size={18} /> 保存
          </button>
          <button className="btn-secondary" onClick={handleExport}>
            <Download size={18} /> エクスポート
          </button>
          <label className="btn-secondary" style={{ cursor: 'pointer' }}>
            <Upload size={18} /> インポート
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </header>

      <div className="app-content">
        {flowchart && (
          <>
            <FlowchartCanvas
              flowchart={flowchart}
              onNodeClick={handleNodeClick}
              selectedNodeId={selectedNodeId}
              onNodeMove={handleNodeMove}
              isDragging={!!draggingNodeId}
              draggingNodeId={draggingNodeId}
              setDraggingNodeId={setDraggingNodeId}
            />
            <aside className="sidebar">
              {selectedNode && (
                <NodeEditor
                  node={selectedNode}
                  onUpdate={handleNodeUpdate}
                  onDelete={handleNodeDelete}
                  onAddNode={handleAddNode}
                  linkedNodes={getLinkedNodes()}
                />
              )}
            </aside>
          </>
        )}
      </div>
    </div>
  )
}

export default App
