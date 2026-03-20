import React, { useState } from 'react';
import { Users, Plus, CheckCircle, AlertCircle, ChevronUp, ChevronDown, Trash2, Edit, X } from 'lucide-react';

export function AdminUserManager({ participants, selections, onAddParticipant, onDeleteParticipant, onMoveParticipant, onUpdateParticipant }) {
  const [newName, setNewName] = useState('');
  const [editingParticipantId, setEditingParticipantId] = useState(null);
  const [editingName, setEditingName] = useState('');

  const handleSaveEdit = (id) => {
    if (editingName.trim()) {
      onUpdateParticipant(id, editingName);
      setEditingParticipantId(null);
    }
  };

  return (
    <div className="animate-in fade-in duration-300">
      <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-slate-800">
        <Users className="text-indigo-500" size={28}/> 
        รายชื่อสำหรับเลือกอาหาร
      </h2>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
        <input 
          type="text" placeholder="เพิ่มชื่อ-นามสกุล..." className="border border-slate-200 bg-white rounded-xl px-4 py-3 flex-grow w-full text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
          value={newName} onChange={e => setNewName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { onAddParticipant(newName); setNewName(''); } }}
          maxLength={50}
        />
        <button 
          onClick={() => { onAddParticipant(newName); setNewName(''); }}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 flex justify-center items-center gap-2 w-full sm:w-auto whitespace-nowrap shadow-sm hover:shadow transition-all text-base"
        >
          <Plus size={20}/> เพิ่มรายชื่อ
        </button>
      </div>

      <div className="border border-slate-200 rounded-2xl overflow-x-auto shadow-sm bg-white">
        <table className="w-full text-left text-base min-w-[600px]">
          <thead className="bg-slate-50/80 border-b border-slate-200">
            <tr>
              <th className="p-5 w-20 text-center font-semibold text-slate-600">ลำดับ</th>
              <th className="p-5 font-semibold text-slate-600">ชื่อ - สกุล</th>
              <th className="p-5 w-48 font-semibold text-slate-600">สถานะ</th>
              <th className="p-5 w-48 text-center font-semibold text-slate-600">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {participants.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500 font-medium">
                  ยังไม่มีรายชื่อผู้เข้าร่วม กรุณาเพิ่มรายชื่อใหม่
                </td>
              </tr>
            ) : participants.map((p, idx) => {
              const hasSelected = selections.some(s => s.participantId === p.id);
              const isEditing = editingParticipantId === p.id;
              
              return (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-5 text-slate-400 text-center font-medium">{idx + 1}</td>
                  <td className="p-5 font-medium text-slate-800">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          className="border border-indigo-200 rounded-lg px-3 py-2 text-sm flex-grow focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium text-indigo-700 bg-white shadow-sm transition-all"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit(p.id); }}
                          autoFocus
                          maxLength={50}
                        />
                        <button onClick={() => handleSaveEdit(p.id)} className="text-emerald-600 hover:bg-emerald-100 p-1.5 rounded-lg bg-emerald-50 transition-colors">
                          <CheckCircle size={18} />
                        </button>
                        <button onClick={() => setEditingParticipantId(null)} className="text-slate-500 hover:bg-slate-200 p-1.5 rounded-lg bg-slate-100 transition-colors">
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span>{p.name}</span>
                        <button 
                          onClick={() => { setEditingParticipantId(p.id); setEditingName(p.name); }}
                          className="text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-indigo-50"
                          title="แก้ไขชื่อ"
                        >
                          <Edit size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="p-5">
                    {hasSelected 
                      ? <span className="inline-flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full text-sm font-semibold tracking-wide"><CheckCircle size={16} className="text-emerald-500"/> เลือกแล้ว</span>
                      : <span className="inline-flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-full text-sm font-semibold tracking-wide"><AlertCircle size={16} className="text-amber-500"/> รอการเลือก</span>
                    }
                  </td>
                  <td className="p-5 text-center flex items-center justify-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onMoveParticipant(idx, 'up')} 
                      disabled={idx === 0}
                      className={`p-2 rounded-xl transition-colors ${idx === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:bg-slate-100 hover:text-indigo-600'}`}
                      title="เลื่อนขึ้น"
                    >
                      <ChevronUp size={20} />
                    </button>
                    <button 
                      onClick={() => onMoveParticipant(idx, 'down')} 
                      disabled={idx === participants.length - 1}
                      className={`p-2 rounded-xl transition-colors ${idx === participants.length - 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:bg-slate-100 hover:text-indigo-600'}`}
                      title="เลื่อนลง"
                    >
                      <ChevronDown size={20} />
                    </button>
                    <div className="w-px h-6 bg-slate-200 mx-2"></div>
                    <button 
                      onClick={() => onDeleteParticipant(p.id)} 
                      className="text-slate-400 hover:bg-rose-50 hover:text-rose-600 p-2 rounded-xl transition-colors"
                      title="ลบรายชื่อ"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
