import React, { useState, useEffect, useMemo, useRef } from 'react';
import { FileText, Printer } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function PrintPreview({ session, categories, menuItems, participants, selections, onClose }) {
  const [printTitle, setPrintTitle] = useState('สรุปรายการสั่งอาหารและเครื่องดื่ม');
  const [printSubtitle, setPrintSubtitle] = useState(`รอบ: ${session.title}`);
  const printRef = useRef(null);

  const [colWidths, setColWidths] = useState({});
  const [isResizing, setIsResizing] = useState(false);
  const resizingRef = useRef(null);

  const handlePrint = () => {
    window.print();
    if (window.self !== window.top) {
      toast('หากหน้าต่างพิมพ์ไม่ปรากฏ กรุณากดปุ่ม "Open in new tab" (เปิดในหน้าต่างใหม่) ที่มุมขวาบนเพื่อสั่งพิมพ์', {
        icon: '💡',
        duration: 6000,
      });
    }
  };

  const startResize = (e, id) => {
    e.stopPropagation();
    const th = e.target.closest('th');
    if (!th) return;
    
    const pageX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
    
    resizingRef.current = {
      id,
      startX: pageX,
      startWidth: th.getBoundingClientRect().width
    };
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!resizingRef.current) return;
      if (e.type === 'touchmove' && e.cancelable) {
        e.preventDefault();
      }
      const pageX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
      const { id, startX, startWidth } = resizingRef.current;
      const diff = pageX - startX;
      const newWidth = Math.max(20, startWidth + diff);
      setColWidths(prev => ({ ...prev, [id]: newWidth }));
    };

    const handleMouseUp = () => {
      resizingRef.current = null;
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isResizing]);

  const Resizer = ({ id }) => (
    <div
      className="absolute right-[-5px] top-0 bottom-0 w-[10px] cursor-col-resize hover:bg-indigo-500/50 active:bg-indigo-500 z-20 print:hidden touch-none"
      onMouseDown={(e) => startResize(e, id)}
      onTouchStart={(e) => startResize(e, id)}
    />
  );

  const totals = useMemo(() => {
    const counts = {};
    menuItems.forEach(m => counts[m.id] = 0);
    selections.forEach(s => {
      if (counts[s.menuItemId] !== undefined) counts[s.menuItemId]++;
    });
    return counts;
  }, [menuItems, selections]);

  useEffect(() => {
    setPrintSubtitle(`รอบ: ${session.title}`);
  }, [session.title]);

  return (
    <div className="min-h-screen bg-slate-200 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto mb-6 flex flex-col sm:flex-row justify-between items-center bg-white p-5 rounded-2xl shadow-sm print:hidden gap-4 border border-slate-100">
        <div className="text-slate-700 flex items-center gap-3 font-medium text-base">
          <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
            <FileText size={24} /> 
          </div>
          โหมดแสดงตัวอย่างก่อนพิมพ์ 
          <span className="text-sm text-slate-400 ml-2 font-normal bg-slate-50 px-3 py-1 rounded-full border border-slate-100">(คลิกเพื่อแก้ไขหัวข้อได้)</span>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button onClick={onClose} className="flex-1 sm:flex-none px-6 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 text-base font-semibold text-slate-600 transition-all shadow-sm hover:shadow">กลับ</button>
          <button onClick={handlePrint} className="flex-1 sm:flex-none px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-base font-semibold flex justify-center items-center gap-2 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5">
            <Printer size={20} /> สั่งพิมพ์
          </button>
        </div>
      </div>

      <div ref={printRef} className="max-w-5xl mx-auto bg-white p-8 md:p-12 shadow-xl print:shadow-none print:p-0 overflow-x-auto rounded-xl print:rounded-none">
        <div className="text-center mb-8">
          <input 
            type="text" 
            className="text-xl md:text-2xl font-bold text-slate-900 mb-2 text-center w-full border-transparent hover:border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 py-2 print:border-none print:p-0 bg-transparent transition-all print:text-xl"
            value={printTitle}
            onChange={(e) => setPrintTitle(e.target.value)}
          />
          <input 
            type="text" 
            className="text-base md:text-lg text-slate-600 text-center w-full border-transparent hover:border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 py-2 print:border-none print:p-0 bg-transparent transition-all print:text-base"
            value={printSubtitle}
            onChange={(e) => setPrintSubtitle(e.target.value)}
          />
        </div>

        <table className="table-fixed w-max min-w-full text-xs sm:text-sm border-collapse border border-slate-800 print:w-full print:min-w-0 print:text-[11px] print:leading-tight">
          <colgroup>
            <col style={{ width: colWidths['col-no'] || '40px' }} />
            <col style={{ width: colWidths['col-name'] || '150px' }} />
            {categories.map(cat => {
              const catItems = menuItems.filter(m => m.categoryId === cat.id);
              return catItems.map(item => (
                <col key={item.id} style={{ width: colWidths[`col-item-${item.id}`] || '70px' }} />
              ))
            })}
            <col style={{ width: colWidths['col-note'] || 'auto' }} />
          </colgroup>
          <thead>
            <tr className="bg-slate-100">
              <th className="relative border border-slate-800 p-1.5 sm:p-2 text-center font-bold print:p-1 overflow-hidden">
                ที่
                <Resizer id="col-no" />
              </th>
              <th className="relative border border-slate-800 p-1.5 sm:p-2 text-left font-bold whitespace-nowrap print:p-1 overflow-hidden">
                รายชื่อ
                <Resizer id="col-name" />
              </th>
              {categories.map(cat => {
                const catItems = menuItems.filter(m => m.categoryId === cat.id);
                if (catItems.length === 0) return null;
                return (
                  <th key={cat.id} colSpan={catItems.length} className="border border-slate-800 p-1.5 sm:p-2 text-center font-bold print:p-1 overflow-hidden text-ellipsis whitespace-nowrap">
                    {cat.name}
                  </th>
                )
              })}
              <th className="relative border border-slate-800 p-1.5 sm:p-2 text-left font-bold print:p-1 overflow-hidden">
                หมายเหตุ
                <Resizer id="col-note" />
              </th>
            </tr>
            <tr className="bg-slate-50 text-[10px] sm:text-xs">
              <th className="border border-slate-800 p-1 sm:p-1.5 print:p-0.5"></th>
              <th className="border border-slate-800 p-1 sm:p-1.5 print:p-0.5"></th>
              {categories.map(cat => {
                const catItems = menuItems.filter(m => m.categoryId === cat.id);
                return catItems.map(item => (
                  <th key={item.id} className="relative border border-slate-800 p-1 sm:p-1.5 px-1 text-center font-medium leading-tight print:text-[10px] print:p-1 align-top overflow-hidden">
                    <div className="whitespace-normal break-words mx-auto line-clamp-3 max-h-[3.6em]">
                      {item.name}
                    </div>
                    <Resizer id={`col-item-${item.id}`} />
                  </th>
                ))
              })}
              <th className="border border-slate-800 p-1 sm:p-1.5 print:p-0.5"></th>
            </tr>
          </thead>
          <tbody>
            {participants.map((p, index) => {
              const userSelections = selections.filter(s => s.participantId === p.id);
              const userNotes = userSelections.filter(s => s.note).map(s => s.note).join(', ');
              
              return (
                <tr key={p.id} className="print:break-inside-avoid">
                  <td className="border border-slate-800 p-1 sm:p-1.5 text-center text-slate-600 print:text-black print:p-0.5 overflow-hidden">{index + 1}</td>
                  <td className="border border-slate-800 p-1 sm:p-1.5 font-medium whitespace-nowrap text-ellipsis overflow-hidden print:p-1">{p.name}</td>
                  {categories.map(cat => {
                    const catItems = menuItems.filter(m => m.categoryId === cat.id);
                    return catItems.map(item => {
                      const isSelected = userSelections.some(s => s.menuItemId === item.id);
                      return (
                        <td key={item.id} className="border border-slate-800 p-1 sm:p-1.5 text-center font-bold text-sm sm:text-base print:text-sm print:p-0.5 overflow-hidden">
                          {isSelected ? '✓' : ''}
                        </td>
                      )
                    });
                  })}
                  <td className="border border-slate-800 p-1 sm:p-1.5 text-[10px] sm:text-xs text-slate-600 print:text-black break-words whitespace-normal print:p-1 overflow-hidden">{userNotes}</td>
                </tr>
              )
            })}
          </tbody>
          <tfoot className="font-bold bg-slate-100 print:break-inside-avoid">
            <tr>
              <td colSpan="2" className="border border-slate-800 p-2 sm:p-3 text-right pr-4 text-sm sm:text-base print:p-1 print:text-xs">รวมทั้งหมด</td>
              {categories.map(cat => {
                const catItems = menuItems.filter(m => m.categoryId === cat.id);
                return catItems.map(item => (
                  <td key={item.id} className="border border-slate-800 p-2 sm:p-3 text-center text-base sm:text-lg print:p-1 print:text-sm">
                    {totals[item.id] > 0 ? totals[item.id] : ''}
                  </td>
                ))
              })}
              <td className="border border-slate-800 p-2 sm:p-3 print:p-1"></td>
            </tr>
          </tfoot>
        </table>

        <div className="mt-10 pt-6 border-t-2 border-slate-200 flex justify-between text-xs md:text-sm text-slate-500 print:text-black">
          <div>ผู้พิมพ์: .......................................................</div>
          <div>วันที่พิมพ์: {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
      </div>
    </div>
  );
}
