import React, { useState, useEffect, useMemo } from 'react';
import { ClipboardList, CheckCircle, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';

function AdminNoteInput({ initialNote, onSave }) {
  const [note, setNote] = useState(initialNote);
  
  useEffect(() => {
    setNote(initialNote);
  }, [initialNote]);

  return (
    <input 
      type="text" 
      className="w-full min-w-[150px] border-transparent hover:border-slate-300 focus:border-indigo-500 rounded-lg px-4 py-2.5 text-sm bg-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all text-slate-700 shadow-sm focus:shadow"
      placeholder="เพิ่มหมายเหตุ..."
      value={note}
      onChange={(e) => setNote(e.target.value)}
      onBlur={() => {
        if (note !== initialNote) {
          onSave(note);
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.target.blur();
        }
      }}
    />
  );
}

export function AdminSummary({ categories, menuItems, participants, selections, onSaveSelection, onBulkSaveSelections }) {
  const [localSelections, setLocalSelections] = useState(selections);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (!isDirty) {
      setLocalSelections(selections);
    }
  }, [selections, isDirty]);

  const totals = useMemo(() => {
    const counts = {};
    menuItems.forEach(m => counts[m.id] = 0);
    localSelections.forEach(s => {
      if (counts[s.menuItemId] !== undefined) counts[s.menuItemId]++;
    });
    return counts;
  }, [menuItems, localSelections]);

  const handleCellClick = (participantId, categoryId, menuItemId) => {
    const userSelections = localSelections.filter(s => s.participantId === participantId);
    const currentNote = userSelections.find(s => s.note)?.note || '';
    
    let newUserSelections = [...userSelections];
    const existingIdx = newUserSelections.findIndex(s => s.categoryId === categoryId);
    
    if (existingIdx >= 0) {
      if (newUserSelections[existingIdx].menuItemId === menuItemId) {
        newUserSelections.splice(existingIdx, 1);
      } else {
        newUserSelections[existingIdx] = { ...newUserSelections[existingIdx], menuItemId };
      }
    } else {
      newUserSelections.push({
        id: Date.now().toString() + Math.random(),
        participantId,
        categoryId,
        menuItemId,
        note: ''
      });
    }
    
    newUserSelections = newUserSelections.map((s, index) => ({...s, note: index === 0 ? currentNote : ''}));
    
    setLocalSelections(prev => {
      const filtered = prev.filter(s => s.participantId !== participantId);
      return [...filtered, ...newUserSelections];
    });
    setIsDirty(true);
  };

  const handleNoteSave = (participantId, noteVal) => {
    const userSelections = localSelections.filter(s => s.participantId === participantId);
    if (userSelections.length === 0) return;
    
    const newUserSelections = userSelections.map((s, index) => ({...s, note: index === 0 ? noteVal : ''}));
    setLocalSelections(prev => {
      const filtered = prev.filter(s => s.participantId !== participantId);
      return [...filtered, ...newUserSelections];
    });
    setIsDirty(true);
  };

  const handleSaveChanges = () => {
    onBulkSaveSelections(localSelections);
    setIsDirty(false);
    toast.success('บันทึกการแก้ไขข้อมูลเรียบร้อยแล้ว!');
  };

  const handleDiscardChanges = () => {
    setLocalSelections(selections);
    setIsDirty(false);
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold flex items-center gap-3 text-slate-800">
            <ClipboardList className="text-indigo-500" size={28}/> 
            สรุปผล
          </h2>
          {isDirty && (
            <span className="text-sm bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full font-bold animate-pulse shadow-sm border border-amber-200">มีข้อมูลแก้ไข</span>
          )}
        </div>
        
        {isDirty ? (
          <div className="flex gap-3 w-full md:w-auto">
            <button onClick={handleDiscardChanges} className="flex-1 md:flex-none px-6 py-3 text-base font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all shadow-sm hover:shadow">ยกเลิก</button>
            <button onClick={handleSaveChanges} className="flex-1 md:flex-none px-8 py-3 text-base font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex justify-center items-center gap-2 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5">
              <CheckCircle size={20} /> บันทึกการแก้ไข
            </button>
          </div>
        ) : (
          <div className="text-sm text-indigo-700 bg-indigo-50/80 border border-indigo-100 px-5 py-3 rounded-xl flex items-center gap-3 font-medium w-full md:w-auto justify-center shadow-sm">
            <Info size={18} className="flex-shrink-0 text-indigo-500" /> Admin สามารถคลิกแก้ไขตารางและกดบันทึกได้
          </div>
        )}
      </div>
      
      <div className="overflow-auto border border-slate-200 rounded-2xl shadow-sm max-h-[65vh] bg-white">
        {participants.length === 0 || menuItems.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="bg-slate-50 p-4 rounded-full mb-4">
              <ClipboardList className="text-slate-300" size={48} />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">ยังไม่มีข้อมูลสรุปผล</h3>
            <p className="text-slate-500">กรุณาเพิ่มหมวดหมู่ เมนู และรายชื่อผู้เข้าร่วมก่อน</p>
          </div>
        ) : (
          <table className="w-full text-base text-left whitespace-nowrap border-collapse">
            <thead>
              <tr className="bg-slate-50/80 h-16">
                <th className="p-5 border-b border-r border-slate-200 font-bold w-56 text-slate-700 sticky left-0 top-0 z-40 bg-slate-100/95 backdrop-blur shadow-[2px_2px_5px_-2px_rgba(0,0,0,0.05)]">รายชื่อ</th>
              {categories.map(cat => {
                const catItems = menuItems.filter(m => m.categoryId === cat.id);
                if (catItems.length === 0) return null;
                return (
                  <th key={cat.id} colSpan={catItems.length} className="p-5 border-b border-r border-slate-200 text-center font-bold text-slate-700 sticky top-0 z-30 bg-slate-50/95 backdrop-blur">
                    {cat.name}
                  </th>
                )
              })}
              <th className="p-5 border-b border-slate-200 font-bold text-slate-700 min-w-[250px] sticky top-0 z-30 bg-slate-50/95 backdrop-blur text-center">หมายเหตุรวม</th>
            </tr>
            <tr className="bg-white text-sm text-slate-500 h-14">
              <th className="p-4 border-b border-r border-slate-100 sticky left-0 top-16 z-40 bg-white/95 backdrop-blur shadow-[2px_2px_5px_-2px_rgba(0,0,0,0.05)]"></th>
              {categories.map(cat => {
                const catItems = menuItems.filter(m => m.categoryId === cat.id);
                return catItems.map(item => (
                  <th key={item.id} className="p-4 border-b border-r border-slate-100 text-center font-medium min-w-[140px] whitespace-normal sticky top-16 z-30 bg-white/95 backdrop-blur leading-relaxed">
                    {item.name}
                  </th>
                ))
              })}
              <th className="p-4 border-b border-slate-100 sticky top-16 z-30 bg-white/95 backdrop-blur"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {participants.map(p => {
              const userSelections = localSelections.filter(s => s.participantId === p.id);
              const userNotes = userSelections.filter(s => s.note).map(s => s.note).join(', ');
              
              return (
                <tr key={p.id} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="p-5 border-r border-slate-100 font-medium text-slate-700 sticky left-0 bg-white group-hover:bg-indigo-50/30 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] truncate max-w-[200px] md:max-w-xs transition-colors" title={p.name}>{p.name}</td>
                  
                  {categories.map(cat => {
                    const catItems = menuItems.filter(m => m.categoryId === cat.id);
                    return catItems.map(item => {
                      const isSelected = userSelections.some(s => s.menuItemId === item.id);
                      return (
                        <td 
                          key={item.id} 
                          onClick={() => handleCellClick(p.id, cat.id, item.id)}
                          className={`p-4 border-r border-slate-100 text-center z-10 relative cursor-pointer transition-all duration-200 ${isSelected ? 'bg-emerald-50/50' : 'hover:bg-indigo-50/50'}`}
                        >
                          {isSelected ? (
                            <div className="flex justify-center items-center h-full min-h-[36px] scale-110 transition-transform">
                              <CheckCircle className="text-emerald-500 drop-shadow-sm" size={24} strokeWidth={2.5} />
                            </div>
                          ) : (
                            <div className="text-slate-200 opacity-0 hover:opacity-100 flex justify-center items-center h-full min-h-[36px] scale-90 hover:scale-100 transition-all">
                              <CheckCircle size={24} strokeWidth={2} />
                            </div>
                          )}
                        </td>
                      )
                    });
                  })}
                  
                  <td className="p-3 border-slate-100 text-slate-600 text-sm z-10 relative bg-white group-hover:bg-indigo-50/30 transition-colors">
                    <AdminNoteInput 
                      initialNote={userNotes} 
                      onSave={(val) => handleNoteSave(p.id, val)} 
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
            <tfoot className="font-bold border-t-2 border-indigo-200 text-indigo-900 sticky bottom-0 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              <tr className="bg-indigo-50/95 backdrop-blur h-16">
                <td className="p-5 border-r border-indigo-100 sticky left-0 bottom-0 z-50 bg-indigo-100/95 backdrop-blur shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] text-lg">รวมยอดสั่ง</td>
                {categories.map(cat => {
                  const catItems = menuItems.filter(m => m.categoryId === cat.id);
                  return catItems.map(item => (
                    <td key={item.id} className="p-5 border-r border-indigo-100 text-center text-2xl z-40 relative bg-indigo-50/95 backdrop-blur text-indigo-700">
                      {totals[item.id] > 0 ? totals[item.id] : <span className="text-indigo-300/50">-</span>}
                    </td>
                  ))
                })}
                <td className="p-5 bg-indigo-50/95 backdrop-blur z-40 relative"></td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
}
