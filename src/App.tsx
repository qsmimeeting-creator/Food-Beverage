import React, { useState, useEffect } from 'react';
import { Coffee, Settings, LogOut, ClipboardList, Users, Printer, Edit, CheckCircle, X } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { AdminMenuManager } from './components/AdminMenuManager';
import { AdminUserManager } from './components/AdminUserManager';
import { AdminSummary } from './components/AdminSummary';
import { PrintPreview } from './components/PrintPreview';
import { UserPortal } from './components/UserPortal';
import { db } from './firebase';
import { collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';

// --- Mock Data (Used for initial seeding if DB is empty) ---
const initialSession = { id: 's1', title: 'สั่งอาหารมื้อเที่ยง', status: 'Open' };
const initialCategories = [
  { id: 'c1', sessionId: 's1', name: 'อาหารหลัก', isRequired: true },
  { id: 'c2', sessionId: 's1', name: 'เครื่องดื่ม', isRequired: false }
];
const initialMenuItems = [
  { id: 'm1', categoryId: 'c1', name: 'ข้าวกะเพราหมูสับไข่ดาว' },
  { id: 'm2', categoryId: 'c1', name: 'ข้าวผัดกุ้ง' },
  { id: 'm3', categoryId: 'c1', name: 'ก๋วยเตี๋ยวต้มยำ' },
  { id: 'm4', categoryId: 'c2', name: 'ชาไทยเย็น' },
  { id: 'm5', categoryId: 'c2', name: 'อเมริกาโน่เย็น' }
];
const initialParticipants = [
  { id: 'p1', sessionId: 's1', name: 'ศ.นพ.ธีระพงษ์ ตัณฑวิเชียร' },
  { id: 'p2', sessionId: 's1', name: 'พ.ญ.สุดา พันธุ์รินทร์' },
  { id: 'p3', sessionId: 's1', name: 'พ.ญ.ณัฐิยา อาทรชัยกุล' },
  { id: 'p4', sessionId: 's1', name: 'พ.ญ.ณัฐณิชา ตันติวัฒนาไพบูลย์' },
  { id: 'p5', sessionId: 's1', name: 'น.พ.อมรสิทธิ์ ชวะนะญาณ' },
  { id: 'p6', sessionId: 's1', name: 'นางฐานเพชร ตัณฑวิเชียร' },
  { id: 'p7', sessionId: 's1', name: 'นางสาวชนิตรา สุนทรวิภาต' },
  { id: 'p8', sessionId: 's1', name: 'นางสาวยุพดี เจริญสวัสดิ์' },
  { id: 'p9', sessionId: 's1', name: 'นายเดชา พวงใบดี' },
  { id: 'p10', sessionId: 's1', name: 'นางสาวปรรณ ชินรัตน์' },
  { id: 'p11', sessionId: 's1', name: 'นางสาวอภิชญา วัฒนเสถียร' },
  { id: 'p12', sessionId: 's1', name: 'นางชนานา เลิศศรีกิตติวัฒน์' },
  { id: 'p13', sessionId: 's1', name: 'นางสาวภูริตา เพชรบุญมี' },
  { id: 'p14', sessionId: 's1', name: 'นายธรรพ์ โสดา ปุตะติ' },
  { id: 'p15', sessionId: 's1', name: 'นางรุ่งรวี ศรีอักษร' },
  { id: 'p16', sessionId: 's1', name: 'นางสาวเกศกนก นิสูงเนิน' },
  { id: 'p17', sessionId: 's1', name: 'นางสาวทาริณี ศรีสุภา' },
  { id: 'p18', sessionId: 's1', name: 'นางสาวนรนารถ เปรมทอง' },
  { id: 'p19', sessionId: 's1', name: 'นาย ศตวรรษ รุจิธรรมรัตน์' },
  { id: 'p20', sessionId: 's1', name: 'ภญ.เสาวรส ไชยมาลา' },
  { id: 'p21', sessionId: 's1', name: 'นางปราณี ใจสำราญ' },
  { id: 'p22', sessionId: 's1', name: 'นายรัตน์ชัย ว่องไว' },
  { id: 'p23', sessionId: 's1', name: 'นางสาวนาฏอนงค์ ขำนิพัทธ์' },
  { id: 'p24', sessionId: 's1', name: 'นายวิชัย ศรีต่างคำ' },
  { id: 'p25', sessionId: 's1', name: 'นางสาวกุลจิรา ดิษแพ' },
  { id: 'p26', sessionId: 's1', name: 'นางสาววีรวรรณ บุนนาค' },
  { id: 'p27', sessionId: 's1', name: 'การเงิน 1' },
  { id: 'p28', sessionId: 's1', name: 'การเงิน 2' },
  { id: 'p29', sessionId: 's1', name: 'การเงิน 3' },
  { id: 'p30', sessionId: 's1', name: 'การเงิน 4' },
  { id: 'p31', sessionId: 's1', name: 'แม่บ้าน' }
];

function SidebarBtn({ active, onClick, icon, text }) {
  return (
    <button 
      onClick={onClick}
      className={`flex-shrink-0 md:w-full flex items-center gap-4 px-5 py-3.5 text-base font-semibold rounded-2xl transition-all duration-200 whitespace-nowrap ${
        active ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100/50' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-transparent'
      }`}
    >
      {icon} {text}
    </button>
  );
}

function AdminDashboard({ 
  session, categories, menuItems, participants, selections, 
  adminTab, setAdminTab, setIsPrintMode, onUpdateSession, onSaveSelection, onBulkSaveSelections,
  onAddCategory, onDeleteCategory, onUpdateCategory, onAddMenuItem, onDeleteMenuItem, onUpdateMenuItem, onAddParticipant, onDeleteParticipant, onMoveParticipant, onUpdateParticipant
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(session?.title || '');

  const handleSaveTitle = () => {
    if (tempTitle.trim()) {
      onUpdateSession({ title: tempTitle });
      setIsEditingTitle(false);
    }
  };

  if (!session) return null;

  return (
    <div className="flex flex-col md:flex-row gap-8 animate-in fade-in duration-500">
      <div className="w-full md:w-80 flex-shrink-0">
        <div className="bg-white rounded-3xl shadow-sm p-6 border border-slate-200/60 sticky top-24">
          <div className="mb-8 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">รอบปัจจุบัน</h2>
              {!isEditingTitle && (
                <button 
                  onClick={() => { setIsEditingTitle(true); setTempTitle(session.title); }} 
                  className="text-slate-400 hover:text-indigo-600 transition-colors p-2 hover:bg-indigo-50 rounded-xl"
                  title="แก้ไขชื่อรอบ"
                >
                  <Edit size={18} />
                </button>
              )}
            </div>
            
            {isEditingTitle ? (
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  className="border border-indigo-200 rounded-xl px-4 py-3 text-base flex-grow focus:outline-none focus:ring-4 focus:ring-indigo-500/20 font-bold text-indigo-700 bg-white w-full shadow-sm transition-all"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSaveTitle(); }}
                  autoFocus
                />
                <div className="flex flex-col gap-2">
                  <button onClick={handleSaveTitle} className="text-emerald-600 hover:bg-emerald-100 p-2 rounded-xl bg-emerald-50 transition-colors">
                    <CheckCircle size={20} />
                  </button>
                  <button onClick={() => setIsEditingTitle(false)} className="text-slate-500 hover:bg-slate-200 p-2 rounded-xl bg-slate-100 transition-colors">
                    <X size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="font-bold text-xl text-slate-800 leading-snug">{session.title}</div>
            )}
            
            <div className="text-sm flex items-center gap-2 mt-4 text-emerald-600 font-bold bg-emerald-50 w-fit px-3 py-1.5 rounded-full border border-emerald-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {session.status}
            </div>
          </div>
          
          <nav className="flex md:flex-col gap-3 overflow-x-auto pb-4 md:pb-0">
            <SidebarBtn active={adminTab === 'menu'} onClick={() => setAdminTab('menu')} icon={<Settings size={22} />} text="จัดการเมนู" />
            <SidebarBtn active={adminTab === 'users'} onClick={() => setAdminTab('users')} icon={<Users size={22} />} text="รายชื่อ" />
            <SidebarBtn active={adminTab === 'summary'} onClick={() => setAdminTab('summary')} icon={<ClipboardList size={22} />} text="สรุปผล" />
            <div className="h-px bg-slate-100 my-2 hidden md:block"></div>
            <button 
              onClick={() => setIsPrintMode(true)}
              className="md:w-full flex-shrink-0 flex items-center gap-4 px-5 py-4 text-base font-semibold rounded-2xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all bg-white border border-slate-200 shadow-sm hover:shadow whitespace-nowrap"
            >
              <Printer size={22} /> <span className="hidden md:inline">พิมพ์เอกสาร (Print)</span><span className="md:hidden">Print</span>
            </button>
          </nav>
        </div>
      </div>

      <div className="flex-grow bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6 md:p-10 min-h-[600px]">
        {adminTab === 'menu' && (
          <AdminMenuManager 
            categories={categories} menuItems={menuItems} 
            onAddCategory={onAddCategory} onDeleteCategory={onDeleteCategory} onUpdateCategory={onUpdateCategory} 
            onAddMenuItem={onAddMenuItem} onDeleteMenuItem={onDeleteMenuItem} onUpdateMenuItem={onUpdateMenuItem}
          />
        )}
        {adminTab === 'users' && (
          <AdminUserManager 
            participants={participants} selections={selections}
            onAddParticipant={onAddParticipant} onDeleteParticipant={onDeleteParticipant}
            onMoveParticipant={onMoveParticipant}
            onUpdateParticipant={onUpdateParticipant}
          />
        )}
        {adminTab === 'summary' && (
          <AdminSummary 
            categories={categories} menuItems={menuItems} participants={participants} selections={selections} onSaveSelection={onSaveSelection} onBulkSaveSelections={onBulkSaveSelections}
          />
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [role, setRole] = useState('user');
  const [currentUserId, setCurrentUserId] = useState(null);
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  
  const [session, setSession] = useState(null);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [selections, setSelections] = useState([]);

  const [adminTab, setAdminTab] = useState('menu');
  const [isPrintMode, setIsPrintMode] = useState(false);

  useEffect(() => {
    const unsubSession = onSnapshot(doc(db, 'sessions', 's1'), (docSnap) => {
      if (docSnap.exists()) {
        setSession({ id: docSnap.id, ...docSnap.data() });
      } else {
        // Seed initial data if not exists
        setDoc(doc(db, 'sessions', 's1'), { title: initialSession.title, status: initialSession.status });
        initialCategories.forEach((c, i) => setDoc(doc(db, 'categories', c.id), { sessionId: c.sessionId, name: c.name, isRequired: c.isRequired, createdAt: Date.now() + i }));
        initialMenuItems.forEach((m, i) => setDoc(doc(db, 'menuItems', m.id), { categoryId: m.categoryId, name: m.name, createdAt: Date.now() + i }));
        initialParticipants.forEach((p, i) => setDoc(doc(db, 'participants', p.id), { sessionId: p.sessionId, name: p.name, order: i }));
      }
    });

    const unsubCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
      const cats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      cats.sort((a: any, b: any) => (a.createdAt || 0) - (b.createdAt || 0));
      setCategories(cats);
    });

    const unsubMenuItems = onSnapshot(collection(db, 'menuItems'), (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      items.sort((a: any, b: any) => (a.createdAt || 0) - (b.createdAt || 0));
      setMenuItems(items);
    });

    const unsubParticipants = onSnapshot(collection(db, 'participants'), (snapshot) => {
      const parts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      parts.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
      setParticipants(parts);
    });

    const unsubSelections = onSnapshot(collection(db, 'selections'), (snapshot) => {
      setSelections(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubSession();
      unsubCategories();
      unsubMenuItems();
      unsubParticipants();
      unsubSelections();
    };
  }, []);

  const handleUpdateSession = async (updates) => {
    await updateDoc(doc(db, 'sessions', 's1'), updates);
  };

  const handleSaveSelection = async (participantId, newSelections) => {
    const batch = writeBatch(db);
    
    // Delete old selections for this participant
    const oldSelections = selections.filter(s => s.participantId === participantId);
    oldSelections.forEach(s => {
      batch.delete(doc(db, 'selections', s.id));
    });

    // Add new selections
    newSelections.forEach(s => {
      batch.set(doc(db, 'selections', s.id), {
        participantId: s.participantId,
        categoryId: s.categoryId,
        menuItemId: s.menuItemId,
        note: s.note || ''
      });
    });

    await batch.commit();
  };

  const handleBulkSaveSelections = async (newAllSelections) => {
    const batch = writeBatch(db);
    
    // Delete all old selections
    selections.forEach(s => {
      batch.delete(doc(db, 'selections', s.id));
    });

    // Add new selections
    newAllSelections.forEach(s => {
      batch.set(doc(db, 'selections', s.id), {
        participantId: s.participantId,
        categoryId: s.categoryId,
        menuItemId: s.menuItemId,
        note: s.note || ''
      });
    });

    await batch.commit();
  };

  const handleAddCategory = async (name, isRequired) => {
    if (!name) return;
    const newId = Date.now().toString();
    await setDoc(doc(db, 'categories', newId), { sessionId: 's1', name, isRequired, createdAt: Date.now() });
  };

  const handleDeleteCategory = async (id) => {
    try {
      const batch = writeBatch(db);
      batch.delete(doc(db, 'categories', id));
      
      menuItems.filter(m => m.categoryId === id).forEach(m => {
        batch.delete(doc(db, 'menuItems', m.id));
      });
      
      selections.filter(s => s.categoryId === id).forEach(s => {
        batch.delete(doc(db, 'selections', s.id));
      });

      await batch.commit();
      toast.success('ลบหมวดหมู่เรียบร้อยแล้ว');
    } catch (error) {
      console.error('Delete category error:', error);
      toast.error('ไม่สามารถลบหมวดหมู่ได้');
    }
  };

  const handleUpdateCategory = async (id, newName) => {
    await updateDoc(doc(db, 'categories', id), { name: newName });
  };

  const handleAddMenuItem = async (categoryId, name) => {
    if (!name) return;
    const newId = Date.now().toString();
    await setDoc(doc(db, 'menuItems', newId), { categoryId, name, createdAt: Date.now() });
  };

  const handleDeleteMenuItem = async (id) => {
    try {
      await deleteDoc(doc(db, 'menuItems', id));
      toast.success('ลบเมนูเรียบร้อยแล้ว');
    } catch (error) {
      console.error('Delete menu item error:', error);
      toast.error('ไม่สามารถลบเมนูได้');
    }
  };

  const handleUpdateMenuItem = async (id, newName) => {
    await updateDoc(doc(db, 'menuItems', id), { name: newName });
  };

  const handleAddParticipant = async (name) => {
    if (!name) return;
    const newId = Date.now().toString();
    await setDoc(doc(db, 'participants', newId), { sessionId: 's1', name, order: participants.length });
  };

  const handleDeleteParticipant = async (id) => {
    await deleteDoc(doc(db, 'participants', id));
  };

  const handleMoveParticipant = async (index, direction) => {
    const newParticipants = [...participants];
    if (direction === 'up' && index > 0) {
      [newParticipants[index - 1], newParticipants[index]] = [newParticipants[index], newParticipants[index - 1]];
    } else if (direction === 'down' && index < newParticipants.length - 1) {
      [newParticipants[index + 1], newParticipants[index]] = [newParticipants[index], newParticipants[index + 1]];
    }
    
    const batch = writeBatch(db);
    newParticipants.forEach((p, i) => {
      batch.update(doc(db, 'participants', p.id), { order: i });
    });
    await batch.commit();
  };

  const handleUpdateParticipant = async (id, newName) => {
    await updateDoc(doc(db, 'participants', id), { name: newName });
  };

  const handleAdminLogin = () => {
    const correctPassword = import.meta.env.VITE_ADMIN_PASSWORD || '1234';
    if (adminPassword === correctPassword) {
      setRole('admin');
      setShowAuthModal(false);
      setAdminPassword('');
      toast.success('เข้าสู่ระบบผู้ดูแลสำเร็จ');
    } else {
      toast.error('รหัสผ่านไม่ถูกต้อง!');
    }
  };

  if (isPrintMode) {
    return (
      <PrintPreview 
        session={session}
        categories={categories}
        menuItems={menuItems}
        participants={participants}
        selections={selections}
        onClose={() => setIsPrintMode(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans pb-12 selection:bg-indigo-100 selection:text-indigo-900">
      <Toaster position="top-center" toastOptions={{ duration: 3000, style: { borderRadius: '16px', fontWeight: '500' } }} />
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 p-4 shadow-sm flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4 font-bold text-xl md:text-2xl text-slate-800 tracking-tight">
          <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-sm shadow-indigo-200">
            <Coffee size={24} />
          </div>
          <span className="truncate max-w-[200px] sm:max-w-xs bg-gradient-to-r from-indigo-700 to-blue-600 bg-clip-text text-transparent">Food & Bev</span>
        </div>
        <div className="flex items-center gap-3">
          {role === 'admin' ? (
            <button 
              onClick={() => { setRole('user'); setCurrentUserId(null); }}
              className="px-5 py-2.5 rounded-xl text-sm md:text-base font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-all flex items-center gap-2 shadow-sm"
            >
              <LogOut size={18} /> <span className="hidden sm:inline">ออกจากโหมด Admin</span>
            </button>
          ) : (
            <button 
              onClick={() => setShowAuthModal(true)}
              className="p-3 rounded-xl text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
              title="เข้าสู่ระบบผู้ดูแล (Admin)"
            >
              <Settings size={24} />
            </button>
          )}
        </div>
      </nav>

      {showAuthModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 w-full max-w-md border border-slate-100 transform transition-all scale-100">
            <h3 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-4">
              <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600">
                <Settings size={28} />
              </div>
              ยืนยันตัวตน (Admin)
            </h3>
            <p className="text-base text-slate-500 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-100">กรุณาใส่รหัสผ่านเพื่อเข้าสู่ระบบผู้ดูแล</p>
            <input
              type="password"
              placeholder="ใส่รหัสผ่าน..."
              className="w-full border-slate-200 rounded-2xl px-5 py-4 mb-8 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 border bg-slate-50/50 text-lg transition-all shadow-sm"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAdminLogin(); }}
              autoFocus
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={() => { setShowAuthModal(false); setAdminPassword(''); }}
                className="px-6 py-3 rounded-xl text-slate-500 hover:bg-slate-100 font-bold text-base transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleAdminLogin}
                className="px-8 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 font-bold text-base transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
              >
                เข้าสู่ระบบ
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto p-4 md:p-8 mt-4">
        {role === 'admin' ? (
          <AdminDashboard 
            session={session}
            categories={categories}
            menuItems={menuItems}
            participants={participants}
            selections={selections}
            adminTab={adminTab}
            setAdminTab={setAdminTab}
            setIsPrintMode={setIsPrintMode}
            onUpdateSession={handleUpdateSession}
            onSaveSelection={handleSaveSelection}
            onBulkSaveSelections={handleBulkSaveSelections}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
            onUpdateCategory={handleUpdateCategory}
            onAddMenuItem={handleAddMenuItem}
            onDeleteMenuItem={handleDeleteMenuItem}
            onUpdateMenuItem={handleUpdateMenuItem}
            onAddParticipant={handleAddParticipant}
            onDeleteParticipant={handleDeleteParticipant}
            onMoveParticipant={handleMoveParticipant}
            onUpdateParticipant={handleUpdateParticipant}
          />
        ) : (
          <UserPortal 
            session={session}
            categories={categories}
            menuItems={menuItems}
            participants={participants}
            selections={selections}
            currentUserId={currentUserId}
            setCurrentUserId={setCurrentUserId}
            onSaveSelection={handleSaveSelection}
          />
        )}
      </main>
    </div>
  );
}
