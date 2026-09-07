import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { CAMPUS_OVERVIEW, DEFAULT_DEPARTMENTS, DEFAULT_GALLERY } from "@shared/campus";
import type { CampusBuilding, CampusNews, DepartmentProfile, Floor, GalleryImage } from "@shared/campus";
import { ArrowLeft, Building2, Check, FilePlus2, ImagePlus, LogIn, MapPin, Newspaper, Save, ShieldAlert, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { AdminMobileBar, DashboardWithCollapsibleSidebar, type AdminSection } from "@/components/ui/dashboard-with-collapsible-sidebar";
import { MyMapsImport } from "@/components/MyMapsImport";

type BuildingForm = {
  id: string;
  name: string;
  shortName: string;
  category: "วิชาการ" | "ปฏิบัติการ" | "บริการ" | "กิจกรรม";
  description: string;
  floors: number;
  latitude: number;
  longitude: number;
  floorDetails: Floor[];
  departments: DepartmentProfile[];
  gallery: GalleryImage[];
};

type NewsForm = {
  id: string;
  tag: string;
  title: string;
  excerpt: string;
  dateLabel: string;
  timeLabel: string;
  accent: string;
  published: number;
};

const emptyBuilding: BuildingForm = {
  id: "",
  name: "",
  shortName: "",
  category: "บริการ",
  description: "",
  floors: 1,
  latitude: CAMPUS_OVERVIEW.mapCenter.lat,
  longitude: CAMPUS_OVERVIEW.mapCenter.lng,
  floorDetails: [{ level: 1, label: "ชั้น 1", rooms: [] }],
  departments: [],
  gallery: DEFAULT_GALLERY,
};

const emptyNews: NewsForm = {
  id: "",
  tag: "ข่าววิทยาลัย",
  title: "",
  excerpt: "",
  dateLabel: "",
  timeLabel: "ประกาศล่าสุด",
  accent: "#3c8f8d",
  published: 1,
};

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9ก-๙]+/g, "-").replace(/(^-|-$)/g, "") || `item-${Date.now()}`;
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string | number; onChange: (value: string) => void; placeholder?: string; type?: string }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-extrabold text-[var(--ink)]">{label}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-10 w-full rounded-xl border border-[var(--border)] bg-white px-3 text-sm outline-none transition-colors focus:border-[var(--aqua)]" /></label>;
}

function TextArea({ label, value, onChange, rows = 4, hint }: { label: string; value: string; onChange: (value: string) => void; rows?: number; hint?: string }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-extrabold text-[var(--ink)]">{label}</span><textarea rows={rows} value={value} onChange={(event) => onChange(event.target.value)} className="w-full resize-y rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm leading-6 outline-none transition-colors focus:border-[var(--aqua)]" />{hint && <span className="mt-1 block text-[10px] text-[var(--muted-foreground)]">{hint}</span>}</label>;
}

function JsonEditor({ label, value, onChange, hint }: { label: string; value: unknown; onChange: (value: unknown[]) => void; hint: string }) {
  const [text, setText] = useState(JSON.stringify(value, null, 2));
  useEffect(() => setText(JSON.stringify(value, null, 2)), [value]);
  return <label className="block"><span className="mb-1.5 block text-xs font-extrabold text-[var(--ink)]">{label}</span><textarea rows={7} value={text} onChange={(event) => { setText(event.target.value); try { const parsed = JSON.parse(event.target.value); if (Array.isArray(parsed)) onChange(parsed); } catch {} }} className="w-full resize-y rounded-xl border border-[var(--border)] bg-[#f8faf8] px-3 py-2.5 font-mono text-[11px] leading-5 outline-none transition-colors focus:border-[var(--aqua)]" /><span className="mt-1 block text-[10px] text-[var(--muted-foreground)]">{hint}</span></label>;
}

function BuildingEditor({ building, onClose, onSaved }: { building: CampusBuilding | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<BuildingForm>(() => building ? { id: building.id, name: building.name, shortName: building.shortName, category: building.category, description: building.description, floors: building.floors, latitude: building.latitude ?? CAMPUS_OVERVIEW.mapCenter.lat, longitude: building.longitude ?? CAMPUS_OVERVIEW.mapCenter.lng, floorDetails: building.floorsDetail, departments: building.departments ?? DEFAULT_DEPARTMENTS.filter((item) => item.floor <= building.floors), gallery: building.gallery ?? DEFAULT_GALLERY } : emptyBuilding);
  const save = trpc.campus.saveBuilding.useMutation({ onSuccess: () => { toast.success("บันทึกข้อมูลอาคารแล้ว"); onSaved(); }, onError: (error) => toast.error(error.message) });
  const isNew = !building;
  const setJson = (field: "floorDetails" | "departments" | "gallery", value: unknown[]) => setForm((current) => ({ ...current, [field]: value }));
  const submit = (event: React.FormEvent) => { event.preventDefault(); save.mutate({ ...form, id: form.id || slugify(form.name) }); };

  return <div className="fixed inset-0 z-[70] overflow-y-auto bg-[rgba(7,26,43,0.42)] p-3 backdrop-blur-sm sm:p-8"><div className="mx-auto max-w-4xl rounded-[24px] bg-[var(--background)] shadow-2xl"><div className="sticky top-0 z-10 flex items-center justify-between rounded-t-[24px] border-b border-[var(--border)] bg-white/95 px-5 py-4 backdrop-blur sm:px-7"><div><p className="text-[10px] font-extrabold tracking-[0.14em] text-[#398e89]">BUILDING EDITOR</p><h2 className="mt-1 text-xl font-extrabold text-[var(--ink)]">{isNew ? "เพิ่มอาคารใหม่" : `แก้ไข ${building.name}`}</h2></div><button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--muted)] text-[var(--ink)]"><X size={17} /></button></div><form onSubmit={submit} className="grid gap-5 p-5 sm:p-7"><div className="grid gap-4 sm:grid-cols-2"><Field label="ชื่ออาคาร" value={form.name} onChange={(value) => setForm({ ...form, name: value })} placeholder="เช่น อาคารช่างไฟฟ้า" /><Field label="ชื่อย่อที่แสดงบนแผนที่" value={form.shortName} onChange={(value) => setForm({ ...form, shortName: value })} placeholder="เช่น ช่างไฟฟ้า" /><label className="block"><span className="mb-1.5 block text-xs font-extrabold text-[var(--ink)]">ประเภทอาคาร</span><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as BuildingForm["category"] })} className="h-10 w-full rounded-xl border border-[var(--border)] bg-white px-3 text-sm outline-none focus:border-[var(--aqua)]"><option>วิชาการ</option><option>ปฏิบัติการ</option><option>บริการ</option><option>กิจกรรม</option></select></label><Field label="จำนวนชั้น" type="number" value={form.floors} onChange={(value) => setForm({ ...form, floors: Number(value) })} /><Field label="Latitude" value={form.latitude} onChange={(value) => setForm({ ...form, latitude: Number(value) })} /><Field label="Longitude" value={form.longitude} onChange={(value) => setForm({ ...form, longitude: Number(value) })} /></div><TextArea label="คำอธิบายอาคาร" value={form.description} onChange={(value) => setForm({ ...form, description: value })} rows={4} /><div className="grid gap-5 lg:grid-cols-2"><JsonEditor label="รายละเอียดแต่ละชั้น" value={form.floorDetails} onChange={(value) => setJson("floorDetails", value)} hint='รูปแบบ: [{"level":1,"label":"ชั้น 1","rooms":["ห้อง..." ]}]' /><JsonEditor label="สาขาวิชาในแต่ละชั้น" value={form.departments} onChange={(value) => setJson("departments", value)} hint='ระบุ floor, name, code, description, skills และ careers' /></div><JsonEditor label="Gallery ของอาคาร" value={form.gallery} onChange={(value) => setJson("gallery", value)} hint='url ต้องเป็น https:// หรือ /manus-storage/...' /><div className="flex flex-col-reverse justify-end gap-2 border-t border-[var(--border)] pt-5 sm:flex-row"><button type="button" onClick={onClose} className="h-11 rounded-full border border-[var(--border)] bg-white px-5 text-sm font-bold text-[var(--ink)]">ยกเลิก</button><button disabled={save.isPending} type="submit" className="flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--ink)] px-5 text-sm font-bold text-white disabled:opacity-60"><Save size={16} /> {save.isPending ? "กำลังบันทึก..." : "บันทึกข้อมูลอาคาร"}</button></div></form></div></div>;
}

function NewsEditor({ news, onClose, onSaved }: { news: CampusNews | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<NewsForm>(() => news ? { id: news.id, tag: news.tag, title: news.title, excerpt: news.excerpt, dateLabel: news.date, timeLabel: news.time, accent: news.accent, published: 1 } : emptyNews);
  const save = trpc.campus.saveNews.useMutation({ onSuccess: () => { toast.success("บันทึกข่าวสารแล้ว"); onSaved(); }, onError: (error) => toast.error(error.message) });
  const submit = (event: React.FormEvent) => { event.preventDefault(); save.mutate({ ...form, id: form.id || slugify(form.title) }); };
  return <div className="fixed inset-0 z-[70] overflow-y-auto bg-[rgba(7,26,43,0.42)] p-3 backdrop-blur-sm sm:p-8"><div className="mx-auto max-w-2xl rounded-[24px] bg-[var(--background)] shadow-2xl"><div className="flex items-center justify-between rounded-t-[24px] border-b border-[var(--border)] bg-white px-5 py-4 sm:px-7"><div><p className="text-[10px] font-extrabold tracking-[0.14em] text-[#398e89]">NEWS EDITOR</p><h2 className="mt-1 text-xl font-extrabold text-[var(--ink)]">{news ? "แก้ไขข่าวสาร" : "เพิ่มข่าวสารใหม่"}</h2></div><button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--muted)] text-[var(--ink)]"><X size={17} /></button></div><form onSubmit={submit} className="grid gap-4 p-5 sm:p-7"><div className="grid gap-4 sm:grid-cols-2"><Field label="หมวดข่าว" value={form.tag} onChange={(value) => setForm({ ...form, tag: value })} /><Field label="วันที่แสดง" value={form.dateLabel} onChange={(value) => setForm({ ...form, dateLabel: value })} /><Field label="สี accent" value={form.accent} onChange={(value) => setForm({ ...form, accent: value })} /><Field label="ข้อมูลเวลา/สถิติ" value={form.timeLabel} onChange={(value) => setForm({ ...form, timeLabel: value })} /></div><Field label="หัวข้อข่าว" value={form.title} onChange={(value) => setForm({ ...form, title: value })} /><TextArea label="เนื้อหาย่อ" value={form.excerpt} onChange={(value) => setForm({ ...form, excerpt: value })} rows={6} /><label className="flex items-center gap-2 text-sm font-bold text-[var(--ink)]"><input type="checkbox" checked={form.published === 1} onChange={(event) => setForm({ ...form, published: event.target.checked ? 1 : 0 })} className="h-4 w-4 accent-[#398e89]" /> แสดงข่าวนี้บนเว็บไซต์</label><div className="flex flex-col-reverse justify-end gap-2 border-t border-[var(--border)] pt-5 sm:flex-row"><button type="button" onClick={onClose} className="h-11 rounded-full border border-[var(--border)] bg-white px-5 text-sm font-bold text-[var(--ink)]">ยกเลิก</button><button disabled={save.isPending} type="submit" className="flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--ink)] px-5 text-sm font-bold text-white disabled:opacity-60"><Save size={16} /> {save.isPending ? "กำลังบันทึก..." : "บันทึกข่าวสาร"}</button></div></form></div></div>;
}

export default function Admin() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [section, setSection] = useState<AdminSection>("dashboard");
  const tab = section === "news" ? "news" : "buildings";
  const setTab = (value: "buildings" | "news") => setSection(value);
  const [buildingEditor, setBuildingEditor] = useState<CampusBuilding | null | undefined>(undefined);
  const [newsEditor, setNewsEditor] = useState<CampusNews | null | undefined>(undefined);
  const isAdmin = Boolean(isAuthenticated && user?.role === "admin");
  const buildingsQuery = trpc.campus.adminBuildings.useQuery(undefined, { enabled: isAdmin });
  const newsQuery = trpc.campus.adminNews.useQuery(undefined, { enabled: isAdmin });
  const utils = trpc.useUtils();
  const deleteBuilding = trpc.campus.deleteBuilding.useMutation({ onSuccess: async () => { toast.success("ลบอาคารแล้ว"); await utils.campus.adminBuildings.invalidate(); await utils.campus.buildings.invalidate(); }, onError: (error) => toast.error(error.message) });
  const deleteNews = trpc.campus.deleteNews.useMutation({ onSuccess: async () => { toast.success("ลบข่าวสารแล้ว"); await utils.campus.adminNews.invalidate(); await utils.campus.news.invalidate(); }, onError: (error) => toast.error(error.message) });
  const buildings = buildingsQuery.data ?? [];
  const news = newsQuery.data ?? [];
  const isEditorOpen = buildingEditor !== undefined || newsEditor !== undefined;

  const refreshBuildings = async () => { setBuildingEditor(undefined); await utils.campus.adminBuildings.invalidate(); await utils.campus.buildings.invalidate(); };
  const refreshNews = async () => { setNewsEditor(undefined); await utils.campus.adminNews.invalidate(); await utils.campus.news.invalidate(); };
  const confirmDelete = (kind: "building" | "news", id: string, label: string) => { if (window.confirm(`ต้องการลบ ${label} ใช่หรือไม่?`)) { if (kind === "building") deleteBuilding.mutate({ id }); else deleteNews.mutate({ id }); } };

  if (loading) return <div className="min-h-screen bg-[var(--background)] p-8 text-center text-sm text-[var(--muted-foreground)]">กำลังตรวจสอบสิทธิ์...</div>;
  if (!isAuthenticated) return <div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-5"><div className="w-full max-w-md rounded-[28px] bg-white p-8 text-center shadow-xl ring-1 ring-[var(--border)]"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--ink)] text-white"><ShieldAlert size={24} /></div><h1 className="mt-5 text-2xl font-extrabold text-[var(--ink)]">พื้นที่สำหรับผู้ดูแล</h1><p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">เข้าสู่ระบบด้วยบัญชีผู้ดูแลเพื่อจัดการข่าวสาร อาคาร และข้อมูลสาขาวิชา</p><button type="button" onClick={() => startLogin()} className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[var(--ink)] text-sm font-bold text-white"><LogIn size={16} /> เข้าสู่ระบบ</button><Link href="/" className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#287c78]"><ArrowLeft size={14} /> กลับหน้าเว็บไซต์</Link></div></div>;
  if (!isAdmin) return <div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-5"><div className="w-full max-w-md rounded-[28px] bg-white p-8 text-center shadow-xl ring-1 ring-[var(--border)]"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff1eb] text-[#c46242]"><ShieldAlert size={24} /></div><h1 className="mt-5 text-2xl font-extrabold text-[var(--ink)]">ไม่มีสิทธิ์เข้าถึง</h1><p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">บัญชีนี้ยังไม่ได้รับสิทธิ์ผู้ดูแลระบบ กรุณาติดต่อเจ้าของระบบ</p><button type="button" onClick={() => logout()} className="mt-6 h-11 rounded-full bg-[var(--ink)] px-6 text-sm font-bold text-white">ออกจากระบบ</button></div></div>;

  return <div className="min-h-screen bg-[var(--background)] text-[var(--ink)]">{isEditorOpen && (buildingEditor !== undefined ? <BuildingEditor building={buildingEditor} onClose={() => setBuildingEditor(undefined)} onSaved={refreshBuildings} /> : newsEditor !== undefined ? <NewsEditor news={newsEditor} onClose={() => setNewsEditor(undefined)} onSaved={refreshNews} /> : null)}<div className="flex min-h-screen"><DashboardWithCollapsibleSidebar activeSection={section} onSectionChange={setSection} buildingCount={buildings.length} newsCount={news.length} userName={user?.name} onLogout={() => logout()} /><div className="min-w-0 flex-1"><AdminMobileBar activeSection={section} onSectionChange={setSection} onLogout={() => logout()} /><header className="nav-glass sticky top-0 z-40"><div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12"><Link href="/" className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--ink)] text-xs font-bold text-white">SM</div><div><p className="font-display text-sm font-bold">PLato Admin</p><p className="text-[10px] text-[var(--muted-foreground)]">จัดการข้อมูลวิทยาลัยฯ</p></div></Link><div className="flex items-center gap-3"><span className="hidden text-xs font-bold text-[var(--muted-foreground)] sm:block">{user?.name ?? "ผู้ดูแลระบบ"}</span><button type="button" onClick={() => logout()} className="rounded-full border border-[var(--border)] bg-white px-3 py-2 text-[11px] font-bold">ออกจากระบบ</button></div></div></header><main className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12 lg:py-12"><div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-extrabold tracking-[0.16em] text-[#398e89]">ADMIN PANEL / CONTENT CONTROL</p><h1 className="mt-2 text-3xl font-extrabold tracking-[-0.05em] sm:text-4xl">จัดการข้อมูล PLato Guide</h1><p className="mt-3 max-w-[620px] text-sm leading-7 text-[var(--muted-foreground)]">เพิ่ม แก้ไข หรือลบข้อมูลที่จะเผยแพร่บนหน้าแผนที่ โดยข้อมูลสาขาวิชาและ gallery จัดเก็บแยกตามอาคารได้</p></div><Link href="/" className="flex items-center gap-2 text-sm font-extrabold text-[#287c78]"><ArrowLeft size={15} /> ดูหน้าเว็บไซต์</Link></div>{section === "import" ? <MyMapsImport onImported={refreshBuildings} /> : section === "dashboard" ? <section className="grid gap-5 lg:grid-cols-[1.35fr_1fr]"> <div className="rounded-[24px] bg-[var(--ink)] p-6 text-white shadow-sm sm:p-8"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8ed8d0]">PLATO GUIDE / CONTENT CONTROL</p><h2 className="mt-3 max-w-xl text-3xl font-black tracking-[-0.06em] sm:text-4xl">ศูนย์ควบคุมข้อมูลวิทยาลัย</h2><p className="mt-4 max-w-xl text-sm leading-7 text-white/65">จัดการตำแหน่งอาคาร ข่าวสาร และข้อมูลสาขาวิชาได้จากพื้นที่เดียว พร้อมดูภาพรวมความพร้อมของเนื้อหาบนเว็บไซต์ PLato Guide</p><div className="mt-7 flex flex-wrap gap-2"><button type="button" onClick={() => setSection("buildings")} className="rounded-full bg-[#8ed8d0] px-4 py-2.5 text-xs font-black text-[var(--ink)]">จัดการอาคาร</button><button type="button" onClick={() => setSection("news")} className="rounded-full border border-white/20 px-4 py-2.5 text-xs font-black text-white">จัดการข่าวสาร</button></div></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1"><button type="button" onClick={() => setSection("buildings")} className="flex items-center justify-between rounded-[20px] bg-white p-5 text-left shadow-sm ring-1 ring-[var(--border)] transition-transform hover:-translate-y-0.5"><span><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f3f1] text-[#287c78]"><Building2 size={18} /></span><span className="mt-4 block text-3xl font-black text-[var(--ink)]">{buildings.length}</span><span className="mt-1 block text-xs font-bold text-[var(--muted-foreground)]">อาคารที่จัดการอยู่</span></span><ArrowLeft className="rotate-180 text-[#398e89]" size={17} /></button><button type="button" onClick={() => setSection("news")} className="flex items-center justify-between rounded-[20px] bg-white p-5 text-left shadow-sm ring-1 ring-[var(--border)] transition-transform hover:-translate-y-0.5"><span><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff1eb] text-[#c46242]"><Newspaper size={18} /></span><span className="mt-4 block text-3xl font-black text-[var(--ink)]">{news.length}</span><span className="mt-1 block text-xs font-bold text-[var(--muted-foreground)]">ข่าวสารทั้งหมด</span></span><ArrowLeft className="rotate-180 text-[#eb8b67]" size={17} /></button></div></section> : <><div className="mb-5 flex gap-2 rounded-2xl bg-white p-1.5 shadow-sm ring-1 ring-[var(--border)] md:w-fit"><button type="button" onClick={() => setTab("buildings")} className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold ${tab === "buildings" ? "bg-[var(--ink)] text-white" : "text-[var(--muted-foreground)]"}`}><Building2 size={16} /> อาคารและสาขา</button><button type="button" onClick={() => setTab("news")} className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold ${tab === "news" ? "bg-[var(--ink)] text-white" : "text-[var(--muted-foreground)]"}`}><Newspaper size={16} /> ข่าวสาร</button></div>{tab === "buildings" ? <section className="rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-[var(--border)] sm:p-7"><div className="mb-5 flex items-center justify-between gap-3"><div><h2 className="text-xl font-extrabold">อาคารทั้งหมด</h2><p className="mt-1 text-xs text-[var(--muted-foreground)]">{buildings.length} รายการ · คลิกแก้ไขเพื่อจัดการชั้น สาขา และ gallery</p></div><button type="button" onClick={() => setBuildingEditor(null)} className="flex h-10 items-center gap-2 rounded-full bg-[var(--ink)] px-4 text-xs font-bold text-white"><FilePlus2 size={15} /> เพิ่มอาคาร</button></div><div className="grid gap-3">{buildings.map((building) => <div key={building.id} className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex min-w-0 items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--secondary)] text-[var(--secondary-foreground)]"><Building2 size={18} /></div><div className="min-w-0"><h3 className="truncate text-sm font-extrabold">{building.name}</h3><p className="mt-1 flex items-center gap-2 text-[11px] text-[var(--muted-foreground)]"><MapPin size={12} /> {building.category} · {building.floors} ชั้น · {building.departments?.length ?? 0} สาขา · {building.gallery?.length ?? 0} รูป</p></div></div><div className="flex shrink-0 gap-2"><button type="button" onClick={() => setBuildingEditor(building)} className="flex h-9 items-center gap-1.5 rounded-full border border-[var(--border)] px-3 text-xs font-bold"><Check size={14} /> แก้ไข</button><button type="button" onClick={() => confirmDelete("building", building.id, building.name)} className="flex h-9 items-center gap-1.5 rounded-full bg-[#fff1eb] px-3 text-xs font-bold text-[#c46242]"><Trash2 size={14} /> ลบ</button></div></div>)}</div></section> : <section className="rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-[var(--border)] sm:p-7"><div className="mb-5 flex items-center justify-between gap-3"><div><h2 className="text-xl font-extrabold">ข่าวสารทั้งหมด</h2><p className="mt-1 text-xs text-[var(--muted-foreground)]">{news.length} รายการ · ข่าวที่ปิดการเผยแพร่จะไม่แสดงบนหน้าเว็บไซต์</p></div><button type="button" onClick={() => setNewsEditor(null)} className="flex h-10 items-center gap-2 rounded-full bg-[var(--ink)] px-4 text-xs font-bold text-white"><FilePlus2 size={15} /> เพิ่มข่าว</button></div><div className="grid gap-3">{news.map((item) => <div key={item.id} className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] p-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="flex items-center gap-2"><span className="rounded-full px-2 py-1 text-[10px] font-extrabold" style={{ color: item.accent, backgroundColor: `${item.accent}18` }}>{item.tag}</span><span className="text-[11px] text-[var(--muted-foreground)]">{item.date}</span></div><h3 className="mt-2 truncate text-sm font-extrabold">{item.title}</h3><p className="mt-1 line-clamp-1 text-xs text-[var(--muted-foreground)]">{item.excerpt}</p></div><div className="flex shrink-0 gap-2"><button type="button" onClick={() => setNewsEditor(item)} className="flex h-9 items-center gap-1.5 rounded-full border border-[var(--border)] px-3 text-xs font-bold"><Check size={14} /> แก้ไข</button><button type="button" onClick={() => confirmDelete("news", item.id, item.title)} className="flex h-9 items-center gap-1.5 rounded-full bg-[#fff1eb] px-3 text-xs font-bold text-[#c46242]"><Trash2 size={14} /> ลบ</button></div></div>)}</div></section>}</>}</main></div></div></div>;
}
