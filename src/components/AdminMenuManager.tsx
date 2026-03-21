import React, { useState } from 'react';
import { Settings, Edit, Trash2, CheckCircle, X, Plus } from 'lucide-react';

export function AdminMenuManager({ categories, menuItems, onAddCategory, onDeleteCategory, onUpdateCategory, onAddMenuItem, onDeleteMenuItem, onUpdateMenuItem }) {
  const [newCatName, setNewCatName] = useState('');
  const [newCatReq, setNewCatReq] = useState(true);
  const [newItemNames, setNewItemNames] = useState({});

  const [editingCatId, setEditingCatId] = useState(null);
  const [tempCatName, setTempCatName] = useState('');

  const [editingItemId, setEditingItemId] = useState(null);
  const [tempItemName, setTempItemName] = useState('');
  const [deletingCatId, setDeletingCatId] = useState(null);
  const [deletingItemId, setDeletingItemId] = useState(null);

  const saveEditCategory = (id) => {
    if (tempCatName.trim()) {
      onUpdateCategory(id, tempCatName.trim());
    }
    setEditingCatId(null);
  };

  const saveEditItem = (id) => {
    if (tempItemName.trim()) {
      onUpdateMenuItem(id, tempItemName.trim());
    }
    setEditingItemId(null);
  };

  return (
    <div className="animate-in fade-in duration-300">
      <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-slate-800">
        <Settings className="text-indigo-500" size={28}/> 
        จัดการหมวดหมู่และเมนู
      </h2>
      
      <div className="space-y-8">
        {categories.length === 0 && (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
            <p className="text-slate-500 font-medium">ยังไม่มีหมวดหมู่เมนู กรุณาเพิ่มหมวดหมู่ใหม่ด้านล่าง</p>
          </div>
        )}
        {categories.map(cat => {
          const items = menuItems.filter(m => m.categoryId === cat.id);
          return (
            <div key={cat.id} className="border border-slate-200 rounded-2xl p-5 md:p-6 bg-white shadow-sm hover:shadow-md transition-shadow relative group">
              <div className="flex justify-between items-center mb-5">
                {editingCatId === cat.id ? (
                  <div className="flex items-center gap-3 w-full mr-2">
                    <input 
                      type="text" 
                      className="border border-indigo-300 rounded-xl px-4 py-2.5 text-base flex-grow focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-indigo-700 bg-indigo-50/50 shadow-sm transition-all"
                      value={tempCatName}
                      onChange={(e) => setTempCatName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') saveEditCategory(cat.id); }}
                      autoFocus
                      maxLength={50}
                    />
                    <button onClick={() => saveEditCategory(cat.id)} className="text-emerald-600 hover:bg-emerald-100 p-2.5 rounded-xl bg-emerald-50 transition-colors"><CheckCircle size={20} /></button>
                    <button onClick={() => setEditingCatId(null)} className="text-slate-500 hover:bg-slate-200 p-2.5 rounded-xl bg-slate-100 transition-colors"><X size={20} /></button>
                  </div>
                ) : (
                  <>
                    <h3 className="font-bold text-xl flex items-center gap-3 text-slate-800">
                      {cat.name} 
                      {cat.isRequired && <span className="text-xs bg-rose-100 text-rose-700 px-3 py-1.5 rounded-full font-semibold tracking-wide">บังคับเลือก</span>}
                    </h3>
                    <div className="flex items-center gap-2">
                      {deletingCatId === cat.id ? (
                        <div className="flex items-center gap-2 bg-rose-50 p-1 rounded-xl border border-rose-100 animate-in slide-in-from-right-2">
                          <span className="text-xs font-bold text-rose-600 px-2">ลบ?</span>
                          <button 
                            onClick={() => { onDeleteCategory(cat.id); setDeletingCatId(null); }}
                            className="bg-rose-600 text-white p-2 rounded-lg hover:bg-rose-700 transition-colors"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button 
                            onClick={() => setDeletingCatId(null)}
                            className="bg-slate-200 text-slate-600 p-2 rounded-lg hover:bg-slate-300 transition-colors"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <button 
                            onClick={() => { setEditingCatId(cat.id); setTempCatName(cat.name); }} 
                            className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 p-2 rounded-xl transition-colors"
                            title="แก้ไขชื่อหมวดหมู่"
                          >
                            <Edit size={20} />
                          </button>
                          <button 
                            onClick={() => setDeletingCatId(cat.id)} 
                            className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-xl transition-colors"
                            title="ลบหมวดหมู่นี้"
                          >
                            <Trash2 size={20} />
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
              
              <ul className="space-y-3 mb-6">
                {items.length === 0 && <li className="text-base text-slate-400 italic bg-slate-50 p-4 rounded-xl text-center border border-dashed border-slate-200">ยังไม่มีเมนูในหมวดนี้</li>}
                {items.map(item => (
                  <li key={item.id} className="flex justify-between items-center bg-slate-50/50 hover:bg-slate-50 p-4 rounded-xl border border-slate-100 transition-colors group/item">
                    {editingItemId === item.id ? (
                      <div className="flex items-center gap-3 w-full">
                        <input 
                          type="text" 
                          className="border border-indigo-300 rounded-xl px-4 py-2 text-base flex-grow focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-indigo-700 shadow-sm transition-all"
                          value={tempItemName}
                          onChange={(e) => setTempItemName(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') saveEditItem(item.id); }}
                          autoFocus
                          maxLength={50}
                        />
                        <button onClick={() => saveEditItem(item.id)} className="text-emerald-600 hover:bg-emerald-100 p-2 rounded-xl bg-emerald-50 transition-colors"><CheckCircle size={20} /></button>
                        <button onClick={() => setEditingItemId(null)} className="text-slate-500 hover:bg-slate-200 p-2 rounded-xl bg-slate-100 transition-colors"><X size={20} /></button>
                      </div>
                    ) : (
                      <>
                        <span className="text-base font-medium text-slate-700">{item.name}</span>
                        <div className="flex items-center gap-2">
                          {deletingItemId === item.id ? (
                            <div className="flex items-center gap-2 bg-rose-50 p-1 rounded-lg border border-rose-100 animate-in slide-in-from-right-1">
                              <button 
                                onClick={() => { onDeleteMenuItem(item.id); setDeletingItemId(null); }}
                                className="bg-rose-600 text-white p-1.5 rounded-md hover:bg-rose-700 transition-colors"
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button 
                                onClick={() => setDeletingItemId(null)}
                                className="bg-slate-200 text-slate-600 p-1.5 rounded-md hover:bg-slate-300 transition-colors"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => { setEditingItemId(item.id); setTempItemName(item.name); }}
                                className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-colors"
                                title="แก้ไขชื่อเมนู"
                              >
                                <Edit size={18} />
                              </button>
                              <button 
                                onClick={() => setDeletingItemId(item.id)} 
                                className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition-colors" 
                                title="ลบเมนูนี้"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-3 mt-4 pt-4 border-t border-slate-100">
                <input 
                  type="text" placeholder="ชื่อเมนูใหม่..." className="border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-base flex-grow w-full focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  value={newItemNames[cat.id] || ''}
                  onChange={e => setNewItemNames({...newItemNames, [cat.id]: e.target.value})}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const name = (newItemNames[cat.id] || '').trim();
                      if (name) {
                        onAddMenuItem(cat.id, name);
                        setNewItemNames({...newItemNames, [cat.id]: ''});
                      }
                    }
                  }}
                  maxLength={50}
                />
                <button 
                  onClick={() => {
                    const name = (newItemNames[cat.id] || '').trim();
                    if (name) {
                      onAddMenuItem(cat.id, name);
                      setNewItemNames({...newItemNames, [cat.id]: ''});
                    }
                  }}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-base font-medium hover:bg-indigo-700 flex justify-center items-center gap-2 w-full sm:w-auto whitespace-nowrap shadow-sm hover:shadow transition-all"
                >
                  <Plus size={20}/> เพิ่มเมนู
                </button>
              </div>
            </div>
          );
        })}

        {/* Add Category */}
        <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center bg-slate-50/50 hover:bg-slate-50 transition-colors mt-8">
          <input 
            type="text" placeholder="ชื่อหมวดหมู่ใหม่..." className="border border-slate-200 bg-white rounded-xl px-4 py-3 text-base flex-grow w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
            value={newCatName} onChange={e => setNewCatName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const name = newCatName.trim();
                if (name) {
                  onAddCategory(name, newCatReq);
                  setNewCatName('');
                }
              }
            }}
            maxLength={50}
          />
          <div className="flex items-center justify-between w-full sm:w-auto gap-6">
            <label className="flex items-center gap-3 text-base font-medium text-slate-700 cursor-pointer whitespace-nowrap select-none">
              <input type="checkbox" className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 transition-colors" checked={newCatReq} onChange={e => setNewCatReq(e.target.checked)} />
              บังคับเลือก
            </label>
            <button 
              onClick={() => { 
                const name = newCatName.trim();
                if (name) {
                  onAddCategory(name, newCatReq);
                  setNewCatName('');
                }
              }}
              className="bg-slate-800 text-white px-6 py-3 rounded-xl text-base font-medium hover:bg-slate-700 whitespace-nowrap shadow-sm hover:shadow transition-all"
            >
              สร้างหมวด
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
