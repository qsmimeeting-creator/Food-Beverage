import React, { useState, useEffect, useMemo, useRef } from 'react';
import { User, Search, Info, ClipboardList, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function UserPortal({ session, categories, menuItems, participants, selections, currentUserId, setCurrentUserId, onSaveSelection }) {
  const [formData, setFormData] = useState({});
  const [generalNote, setGeneralNote] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const rowRefs = useRef({});

  const currentUser = participants.find(p => p.id === currentUserId);

  useEffect(() => {
    if (currentUserId) {
      const userSelections = selections.filter(s => s.participantId === currentUserId);
      const newFormData = {};
      const newNotes = [];
      
      userSelections.forEach(s => {
        newFormData[s.categoryId] = s.menuItemId;
        if (s.note) newNotes.push(s.note);
      });
      
      setFormData(newFormData);
      setGeneralNote(newNotes.join(', '));
      setIsSubmitted(userSelections.length > 0);
    } else {
      setFormData({});
      setGeneralNote('');
      setIsSubmitted(false);
    }
  }, [currentUserId, selections]); 

  const handleCellClick = (categoryId, menuItemId) => {
    if (!currentUserId) {
      toast.error('กรุณาเลือกชื่อของท่านก่อนทำการเลือกอาหาร');
      return;
    }
    if (isSubmitted) {
      return;
    }

    setFormData(prev => ({
      ...prev,
      [categoryId]: prev[categoryId] === menuItemId ? null : menuItemId
    }));
  };

  const handleSelectUser = (id, name) => {
    setCurrentUserId(id);
    setSearchQuery(name);
    setIsDropdownOpen(false);
    
    setTimeout(() => {
      rowRefs.current[id]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'start'
      });
    }, 100);
  };

  const handleSubmit = () => {
    if (!currentUserId) {
      toast.error('กรุณาเลือกชื่อของท่านก่อนทำการบันทึกข้อมูล');
      return;
    }

    const missingRequired = categories.filter(c => c.isRequired && !formData[c.id]);
    if (missingRequired.length > 0) {
      toast.error(`กรุณาเลือก ${missingRequired.map(c => c.name).join(', ')} ให้ครบถ้วน`);
      return;
    }

    const newSelections = Object.entries(formData)
      .filter(([_, menuItemId]) => menuItemId)
      .map(([catId, menuItemId], index) => ({
        id: Date.now().toString() + Math.random(),
        participantId: currentUserId,
        categoryId: catId,
        menuItemId: menuItemId,
        note: index === 0 ? generalNote : ''
    }));

    onSaveSelection(currentUserId, newSelections);
    setIsSubmitted(true);
    toast.success('บันทึกข้อมูลสำเร็จ! ข้อมูลของคุณถูกส่งเข้าระบบเรียบร้อยแล้ว');
  };

  const totals = useMemo(() => {
    const counts = {};
    menuItems.forEach(m => counts[m.id] = 0);
    
    selections.forEach(s => {
      if (s.participantId !== currentUserId && counts[s.menuItemId] !== undefined) {
        counts[s.menuItemId]++;
      }
    });

    Object.values(formData).forEach(menuItemId => {
      if (menuItemId && typeof menuItemId === 'string' && counts[menuItemId] !== undefined) {
        counts[menuItemId]++;
      }
    });

    return counts;
  }, [menuItems, selections, currentUserId, formData]);

  const filteredParticipants = useMemo(() => {
    if (!searchQuery) return participants;
    return participants.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [participants, searchQuery]);

  return (
    <div className="max-w-[98%] xl:max-w-[1600px] mx-auto w-full mt-4 animate-in fade-in duration-500">
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100/50 rounded-3xl p-6 md:p-8 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between shadow-sm gap-6 relative z-40">
        <div className="flex items-center gap-5 w-full md:w-auto">
          <div className="bg-white p-4 rounded-2xl text-indigo-600 shadow-sm hidden sm:block border border-indigo-100"><User size={28} /></div>
          <div className="w-full">
            <div className="text-sm text-indigo-600 font-bold uppercase tracking-widest mb-3">รายชื่อสำหรับเลือกอาหาร</div>
            
            <div className="relative w-full md:w-[400px]">
              <div className="relative group">
                <input 
                  type="text"
                  className="block w-full rounded-2xl border-indigo-200/60 shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 text-lg font-medium p-4 pl-12 bg-white/80 backdrop-blur-sm border transition-all hover:bg-white"
                  placeholder="ค้นหาหรือเลือกชื่อของท่าน..."
                  value={isDropdownOpen ? searchQuery : (currentUser?.name || '')}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (!isDropdownOpen) setIsDropdownOpen(true);
                  }}
                  onFocus={() => {
                    setIsDropdownOpen(true);
                    setSearchQuery(''); 
                  }}
                  onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                />
                <Search size={22} className="absolute left-4 top-4 text-indigo-400 group-hover:text-indigo-500 transition-colors" />
              </div>
              {isDropdownOpen && (
                <ul className="absolute mt-3 w-full bg-white/95 backdrop-blur-md border border-slate-100 shadow-2xl max-h-72 rounded-2xl overflow-auto text-base z-50 divide-y divide-slate-50">
                  {filteredParticipants.length > 0 ? (
                    filteredParticipants.map(p => (
                      <li 
                        key={p.id}
                        className={`px-6 py-4 cursor-pointer transition-all duration-200 ${currentUserId === p.id ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50 text-slate-700 hover:pl-8'}`}
                        onClick={() => handleSelectUser(p.id, p.name)}
                      >
                        {p.name}
                      </li>
                    ))
                  ) : (
                    <li className="px-6 py-5 text-slate-400 italic text-center">ไม่พบรายชื่อที่ค้นหา</li>
                  )}
                </ul>
              )}
            </div>

          </div>
        </div>
        <div className="text-sm md:text-base text-indigo-800 bg-white/60 backdrop-blur px-5 py-4 rounded-2xl font-medium flex items-center gap-3 w-full md:w-auto justify-center shadow-sm border border-indigo-100/50">
          <Info size={22} className="flex-shrink-0 text-indigo-500" /> 
          <span>เลือกเมนูอาหารของคุณแล้ว อย่าลืมกดปุ่มบันทึกข้อมูลด้านล่างนี้</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden relative z-10">
        <div className="p-6 md:p-8 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
          <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 hidden sm:block">
            <ClipboardList className="text-indigo-600" size={28} />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">เลือกอาหาร</h2>
        </div>

        <div className="p-6 md:p-8 bg-slate-50/30 md:bg-white">
          <div className="md:hidden space-y-6 pb-4">
            {categories.map(cat => {
              const catItems = menuItems.filter(m => m.categoryId === cat.id);
              if (catItems.length === 0) return null;
              
              return (
                <div key={cat.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="bg-slate-50/80 p-5 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 text-xl">{cat.name}</h3>
                    {cat.isRequired && <span className="text-xs bg-rose-50 text-rose-600 border border-rose-100 px-3 py-1.5 rounded-full font-bold tracking-wide">บังคับเลือก</span>}
                  </div>
                  <div className="p-4 space-y-3">
                    {catItems.map(item => {
                      const isSelected = formData[cat.id] === item.id;
                      return (
                        <div 
                          key={item.id}
                          onClick={() => handleCellClick(cat.id, item.id)}
                          className={`p-4 rounded-2xl flex items-center gap-4 transition-all duration-200 ${!isSubmitted ? 'cursor-pointer hover:bg-slate-50 active:scale-[0.98]' : 'cursor-default opacity-80'} border-2 ${isSelected ? 'bg-indigo-50/50 border-indigo-400 shadow-sm' : 'bg-transparent border-transparent hover:border-slate-200'}`}
                        >
                          <div className={`w-7 h-7 rounded-full border-2 flex flex-shrink-0 items-center justify-center transition-all duration-300 ${isSelected ? 'border-emerald-500 bg-emerald-50 scale-110' : 'border-slate-300 bg-white'}`}>
                            {isSelected && <CheckCircle className="text-emerald-500" size={18} strokeWidth={3} />}
                          </div>
                          <span className={`text-lg ${isSelected ? 'font-bold text-indigo-900' : 'text-slate-700'}`}>{item.name}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              );
            })}
            
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mt-8">
              <div className="bg-slate-50/80 p-5 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 text-xl">หมายเหตุรวม (ถ้ามี)</h3>
              </div>
              <div className="p-5">
                <input 
                  type="text" 
                  className="w-full border-slate-200 rounded-2xl px-5 py-4 text-lg focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 border bg-slate-50/50 shadow-sm disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-all"
                  placeholder="เช่น หวานน้อย, ไม่ใส่ผักชี..."
                  value={generalNote}
                  onChange={(e) => setGeneralNote(e.target.value)}
                  disabled={!currentUserId || isSubmitted}
                />
              </div>
            </div>
          </div>

          <div className="hidden md:block overflow-auto w-full border border-slate-200 rounded-2xl max-h-[65vh] shadow-sm bg-white relative">
            <table className="w-full text-base text-left whitespace-nowrap border-collapse">
              <thead>
                <tr className="bg-slate-50/80 h-16">
                  <th className="p-5 border-b border-r border-slate-200 font-bold w-56 text-slate-700 sticky left-0 top-0 z-40 bg-slate-100/95 backdrop-blur shadow-[2px_2px_5px_-2px_rgba(0,0,0,0.05)]">
                    รายชื่อ
                  </th>
                  {categories.map(cat => {
                    const catItems = menuItems.filter(m => m.categoryId === cat.id);
                    if (catItems.length === 0) return null;
                    return (
                      <th key={cat.id} colSpan={catItems.length} className="p-5 border-b border-r border-slate-200 text-center font-bold text-slate-700 sticky top-0 z-30 bg-slate-50/95 backdrop-blur">
                        {cat.name} {cat.isRequired && <span className="text-rose-500 ml-1">*</span>}
                      </th>
                    )
                  })}
                  <th className="p-5 border-b border-slate-200 font-bold text-slate-700 min-w-[250px] sticky top-0 z-30 bg-slate-50/95 backdrop-blur text-center">
                    หมายเหตุรวม
                  </th>
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
                  const isMe = p.id === currentUserId;
                  const userSelections = selections.filter(s => s.participantId === p.id);
                  const userNotes = userSelections.filter(s => s.note).map(s => s.note).join(', ');
                  
                  return (
                    <tr 
                      key={p.id} 
                      ref={el => rowRefs.current[p.id] = el}
                      className={`transition-colors group ${isMe ? 'bg-indigo-50/30' : 'hover:bg-indigo-50/30'}`}
                    >
                      <td 
                        className={`p-5 border-r border-slate-100 font-medium text-slate-700 cursor-pointer sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] truncate max-w-[200px] md:max-w-xs transition-colors ${isMe ? 'bg-indigo-50/80 border-l-4 border-l-indigo-500' : 'bg-white group-hover:bg-indigo-50/30'}`}
                        onClick={() => handleSelectUser(p.id, p.name)}
                        title="คลิกเพื่อสลับผู้ใช้งาน"
                      >
                        <div className="inline-block align-middle">{p.name}</div>
                        {isMe && <span className="text-indigo-600 text-xs ml-2 font-bold bg-indigo-100/50 px-2 py-1 rounded-md">(คุณ)</span>}
                      </td>
                      
                      {categories.map(cat => {
                        const catItems = menuItems.filter(m => m.categoryId === cat.id);
                        return catItems.map(item => {
                          const isSelected = isMe 
                            ? formData[cat.id] === item.id 
                            : userSelections.some(s => s.menuItemId === item.id);
                            
                          return (
                            <td 
                              key={item.id} 
                              className={`p-4 border-r border-slate-100 text-center z-10 relative transition-all duration-200 ${isMe && !isSubmitted ? 'cursor-pointer hover:bg-indigo-50/50' : ''} ${isMe && isSubmitted ? 'cursor-not-allowed' : ''} ${isSelected ? 'bg-emerald-50/50' : (isMe ? '' : 'group-hover:bg-indigo-50/10')}`}
                              onClick={() => isMe ? handleCellClick(cat.id, item.id) : null}
                            >
                              {isSelected ? (
                                <div className="flex justify-center items-center h-full min-h-[36px] scale-110 transition-transform">
                                  <CheckCircle className={isMe && isSubmitted ? 'text-emerald-400 drop-shadow-sm' : 'text-emerald-500 drop-shadow-sm'} size={24} strokeWidth={2.5} />
                                </div>
                              ) : (
                                <div className={`flex justify-center items-center h-full min-h-[36px] transition-all ${isMe && !isSubmitted ? 'text-slate-200 opacity-0 hover:opacity-100 scale-90 hover:scale-100' : 'text-transparent'}`}>
                                  {isMe && !isSubmitted ? <CheckCircle size={24} strokeWidth={2} /> : '-'}
                                </div>
                              )}
                            </td>
                          )
                        });
                      })}
                      
                      <td className={`p-3 border-slate-100 text-slate-600 text-sm z-10 relative transition-colors ${isMe ? 'bg-indigo-50/30' : 'bg-white group-hover:bg-indigo-50/30'}`}>
                        {isMe ? (
                          <input 
                            type="text" 
                            className="w-full min-w-[150px] border-transparent hover:border-slate-300 focus:border-indigo-500 rounded-lg px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-indigo-500 transition-all text-slate-700 shadow-sm focus:shadow disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed disabled:hover:border-transparent disabled:shadow-none"
                            placeholder="เพิ่มหมายเหตุ..."
                            value={generalNote}
                            onChange={(e) => setGeneralNote(e.target.value)}
                            disabled={isSubmitted}
                            maxLength={100}
                          />
                        ) : (
                          <div className="w-full min-w-[150px] px-4 py-2.5 text-sm text-slate-500 truncate">
                            {userNotes || <span className="text-slate-300">-</span>}
                          </div>
                        )}
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
          </div>
          
        </div>
      </div>

      <div className="mt-10 flex justify-end">
        <button 
          onClick={handleSubmit}
          disabled={!currentUserId || isSubmitted}
          className={`w-full md:w-auto text-white px-12 py-5 rounded-2xl font-bold shadow-lg transition-all duration-300 flex items-center justify-center gap-4 text-xl 
          ${!currentUserId ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none' : 
            isSubmitted ? 'bg-emerald-500 cursor-not-allowed shadow-emerald-500/20' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/30 hover:shadow-xl transform hover:-translate-y-1'}`}
        >
          <CheckCircle size={28} strokeWidth={2.5} /> 
          {isSubmitted 
            ? `บันทึกข้อมูลของ ${currentUser?.name} เรียบร้อยแล้ว` 
            : `บันทึกข้อมูล ${currentUser?.name ? `ของ ${currentUser.name}` : ''}`}
        </button>
      </div>

    </div>
  );
}
