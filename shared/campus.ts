export type BuildingCategory = "วิชาการ" | "ปฏิบัติการ" | "บริการ" | "กิจกรรม";

export type Floor = {
  level: number;
  label: string;
  rooms: string[];
};

export type CampusBuilding = {
  id: string;
  name: string;
  shortName: string;
  category: BuildingCategory;
  description: string;
  floors: number;
  x: number;
  y: number;
  width: number;
  height: number;
  accent: string;
  floorsDetail: Floor[];
};

export type CampusNews = {
  id: string;
  tag: string;
  title: string;
  excerpt: string;
  date: string;
  time: string;
  accent: string;
};

export const CAMPUS_OVERVIEW = {
  name: "วิทยาลัยเทคนิคสมุทรสงคราม",
  shortName: "SMTC",
  address: "126 ถนนเอกชัย ตำบลแม่กลอง อำเภอเมืองสมุทรสงคราม",
  mapCenter: { lat: 13.4098, lng: 99.9991 },
  stats: [
    { value: "12", label: "อาคารและสถานที่" },
    { value: "9", label: "สาขาวิชา" },
    { value: "08:00–16:30", label: "เวลาทำการ" },
  ],
};

export const CAMPUS_BUILDINGS: CampusBuilding[] = [
  {
    id: "main",
    name: "อาคารอำนวยการ",
    shortName: "อาคารอำนวยการ",
    category: "บริการ",
    description: "ศูนย์กลางการติดต่อราชการ งานทะเบียน และบริการข้อมูลสำหรับนักเรียน นักศึกษาและผู้มาติดต่อ",
    floors: 3,
    x: 47,
    y: 34,
    width: 19,
    height: 17,
    accent: "#123b52",
    floorsDetail: [
      { level: 1, label: "ชั้น 1", rooms: ["ประชาสัมพันธ์", "งานสารบรรณ", "ห้องผู้อำนวยการ"] },
      { level: 2, label: "ชั้น 2", rooms: ["งานทะเบียน", "งานการเงิน", "ห้องประชุมเล็ก"] },
      { level: 3, label: "ชั้น 3", rooms: ["งานบุคลากร", "ห้องประชุมใหญ่", "งานแผนงาน"] },
    ],
  },
  {
    id: "mechanical",
    name: "อาคารช่างยนต์",
    shortName: "ช่างยนต์",
    category: "ปฏิบัติการ",
    description: "พื้นที่เรียนรู้และฝึกปฏิบัติด้านเครื่องยนต์ ระบบยานยนต์ และเทคโนโลยีรถไฟฟ้า",
    floors: 2,
    x: 16,
    y: 30,
    width: 19,
    height: 20,
    accent: "#eb8b67",
    floorsDetail: [
      { level: 1, label: "ชั้น 1", rooms: ["โรงฝึกเครื่องยนต์", "ห้องปฏิบัติการ EV", "คลังเครื่องมือ"] },
      { level: 2, label: "ชั้น 2", rooms: ["ห้องเรียนทฤษฎี", "ห้องพักครูช่างยนต์", "ห้องสื่อการเรียนรู้"] },
    ],
  },
  {
    id: "business",
    name: "อาคารพาณิชยกรรม",
    shortName: "พาณิชยกรรม",
    category: "วิชาการ",
    description: "แหล่งเรียนรู้ด้านธุรกิจดิจิทัล การบัญชี การตลาด และการจัดการสำนักงานสมัยใหม่",
    floors: 4,
    x: 72,
    y: 21,
    width: 17,
    height: 19,
    accent: "#3c8f8d",
    floorsDetail: [
      { level: 1, label: "ชั้น 1", rooms: ["ห้องปฏิบัติการสำนักงาน", "ศูนย์ฝึกธุรกิจจำลอง"] },
      { level: 2, label: "ชั้น 2", rooms: ["ห้องเรียนบัญชี", "ห้องปฏิบัติการการตลาด"] },
      { level: 3, label: "ชั้น 3", rooms: ["ห้องคอมพิวเตอร์ธุรกิจ", "สตูดิโอสื่อดิจิทัล"] },
      { level: 4, label: "ชั้น 4", rooms: ["ห้องประชุมสาขา", "ห้องพักครูพาณิชยกรรม"] },
    ],
  },
  {
    id: "industrial",
    name: "อาคารช่างอุตสาหกรรม",
    shortName: "ช่างอุตสาหกรรม",
    category: "ปฏิบัติการ",
    description: "เวิร์กช็อปและห้องปฏิบัติการสำหรับงานเชื่อม กลโรงงาน ไฟฟ้ากำลัง และระบบอัตโนมัติ",
    floors: 3,
    x: 67,
    y: 58,
    width: 23,
    height: 18,
    accent: "#bc7a3e",
    floorsDetail: [
      { level: 1, label: "ชั้น 1", rooms: ["โรงงานเชื่อมโลหะ", "โรงงานผลิตชิ้นส่วน", "ห้องเครื่องมือช่าง"] },
      { level: 2, label: "ชั้น 2", rooms: ["ห้อง PLC และระบบอัตโนมัติ", "ห้องไฟฟ้ากำลัง"] },
      { level: 3, label: "ชั้น 3", rooms: ["ห้องเขียนแบบ", "ห้องพักครูช่างอุตสาหกรรม"] },
    ],
  },
  {
    id: "library",
    name: "อาคารวิทยบริการและห้องสมุด",
    shortName: "ห้องสมุด",
    category: "บริการ",
    description: "พื้นที่อ่านหนังสือ ห้องสืบค้นดิจิทัล และมุมทำงานร่วมกันสำหรับการเรียนรู้ตลอดชีวิต",
    floors: 2,
    x: 28,
    y: 67,
    width: 22,
    height: 16,
    accent: "#5b7da9",
    floorsDetail: [
      { level: 1, label: "ชั้น 1", rooms: ["โถงบริการยืมคืน", "มุมอ่านหนังสือ", "ห้องสืบค้นออนไลน์"] },
      { level: 2, label: "ชั้น 2", rooms: ["ห้องทำงานกลุ่ม", "ห้องเรียนรู้ด้วยตนเอง", "ห้องประชุมย่อย"] },
    ],
  },
  {
    id: "student",
    name: "อาคารกิจการนักเรียน",
    shortName: "กิจการนักเรียน",
    category: "กิจกรรม",
    description: "ศูนย์กลางกิจกรรม ชมรม ทุนการศึกษา งานแนะแนว และพื้นที่สนับสนุนชีวิตนักศึกษา",
    floors: 2,
    x: 8,
    y: 63,
    width: 16,
    height: 17,
    accent: "#7e6aa8",
    floorsDetail: [
      { level: 1, label: "ชั้น 1", rooms: ["งานแนะแนว", "ห้องพยาบาล", "ห้องสภานักเรียน"] },
      { level: 2, label: "ชั้น 2", rooms: ["ห้องชมรม", "งานทุนการศึกษา", "ห้องกิจกรรมอเนกประสงค์"] },
    ],
  },
];

export const CAMPUS_NEWS: CampusNews[] = [
  {
    id: "open-house-2026",
    tag: "กิจกรรมเด่น",
    title: "เปิดบ้านช่างพันธุ์ใหม่ 2026",
    excerpt: "ชวนคุณครู นักเรียน และผู้ปกครองมาสัมผัสห้องปฏิบัติการจริง พร้อมเวิร์กช็อปจากทุกสาขา",
    date: "18 ก.ย. 2569",
    time: "09:00–15:30 น.",
    accent: "#eb8b67",
  },
  {
    id: "enrollment-2026",
    tag: "รับสมัคร",
    title: "กำหนดการรับสมัครนักเรียนใหม่ รอบโควตา",
    excerpt: "เตรียมเอกสารให้พร้อม แล้วมาสมัครด้วยตัวเองที่อาคารอำนวยการ หรือดูรายละเอียดออนไลน์",
    date: "วันนี้ – 30 ก.ย. 2569",
    time: "ประกาศล่าสุด",
    accent: "#3c8f8d",
  },
  {
    id: "skills-competition",
    tag: "ข่าววิทยาลัย",
    title: "ทีมช่างยนต์คว้ารางวัลทักษะระดับจังหวัด",
    excerpt: "ขอแสดงความยินดีกับนักเรียนตัวแทนวิทยาลัยฯ ที่สร้างผลงานโดดเด่นในการแข่งขันทักษะวิชาชีพ",
    date: "05 ก.ย. 2569",
    time: "อ่าน 128 ครั้ง",
    accent: "#bc7a3e",
  },
];
