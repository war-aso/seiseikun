import React, { useState } from 'react'
import { FlowNode } from '../types'
import { Trash2, Plus } from 'lucide-react'
import './NodeEditor.css'

interface NodeEditorProps {
  node: FlowNode
  onUpdate: (updates: Partial<FlowNode>) => void
  onDelete: () => void
  onAddNode: (type: string, branchType?: 'yes' | 'no') => void
  linkedNodes: { yes?: FlowNode; no?: FlowNode }
}

const NodeEditor: React.FC<NodeEditorProps> = ({
  node,
  onUpdate,
  onDelete,
  onAddNode,
  linkedNodes,
}) => {
  const [text, setText] = useState(node.text)

  const handleTextChange = (value: string) => {
    setText(value)
    onUpdate({ text: value })
  }

  return (
    <div className="node-editor">
      <div className="editor-header">
        <h3>ノード編集</h3>
        <button
          className="btn-delete"
          onClick={onDelete}
          title="このノードを削除"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="editor-section">
        <label>ノードタイプ</label>
        <div className="node-type">{node.type}</div>
      </div>

      <div className="editor-section">
        <label htmlFor="node-text">テキスト</label>
        <textarea
          id="node-text"
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="ノードのテキストを入力してください"
          rows={4}
        />
      </div>

      {node.type === 'decision' && (
        <div className="branches-section">
          <h4>分岐設定</h4>

          <div className="branch-item">
            <div className="branch-label yes">YES</div>
            {linkedNodes.yes ? (
              <div className="linked-node">
                <span>{linkedNodes.yes.text}</span>
              </div>
            ) : (
              <button
                className="btn-add-branch"
                onClick={() => onAddNode('action', 'yes')}
              >
                <Plus size={16} /> YESのノードを追加
              </button>
            )}
          </div>

          <div className="branch-item">
            <div className="branch-label no">NO</div>
            {linkedNodes.no ? (
              <div className="linked-node">
                <span>{linkedNodes.no.text}</span>
              </div>
            ) : (
              <button
                className="btn-add-branch"
                onClick={() => onAddNode('action', 'no')}
              >
                <Plus size={16} /> NOのノードを追加
              </button>
            )}
          </div>
        </div>
      )}

      {node.type !== 'end' && node.type !== 'decision' && (
        <div className="add-node-section">
          <button
            className="btn-add-node"
            onClick={() => onAddNode('decision')}
          >
            <Plus size={16} /> 判断分岐を追加
          </button>
          <button
            className="btn-add-node"
            onClick={() => onAddNode('action')}
          >
            <Plus size={16} /> アクションノードを追加
          </button>
          <button
            className="btn-add-node"
            onClick={() => onAddNode('end')}
          >
            <Plus size={16} /> 終了を追加
          </button>
        </div>
      )}
    </div>
  )
}

export default NodeEditor
