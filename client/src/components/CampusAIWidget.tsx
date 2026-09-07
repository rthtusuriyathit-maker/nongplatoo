import { AIChatBox, type Message } from "@/components/AIChatBox";
import { extractCampusAIReply } from "@shared/ai";
import { MessageCircle, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const AI_ENDPOINT = import.meta.env.VITE_CAMPUS_AI_URL as string | undefined;

const welcomeMessage: Message = {
  role: "assistant",
  content: "สวัสดีครับ ผม PLato Guide AI\n\nตอนนี้ผมช่วยแนะนำอาคาร สาขาวิชา และข้อมูลการเดินทางภายในวิทยาลัยได้ เมื่อเชื่อมต่อ AI endpoint จริงแล้วจะตอบคำถามได้ละเอียดมากขึ้นครับ",
};

const suggestedPrompts = [
  "อาคารช่างยนต์อยู่ตรงไหน?",
  "มีสาขาวิชาอะไรบ้าง?",
  "ช่วยแนะนำวิธีเดินทางไปห้องสมุด",
];

export function CampusAIWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [loading, setLoading] = useState(false);

  const onSendMessage = async (content: string) => {
    const nextMessages: Message[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setLoading(true);

    try {
      if (!AI_ENDPOINT) {
        await new Promise((resolve) => window.setTimeout(resolve, 550));
        setMessages((current) => [...current, {
          role: "assistant",
          content: "โหมดเตรียมเชื่อมต่อพร้อมใช้งานแล้วครับ\n\nเมื่อมี AI URL แล้ว สามารถตั้งค่า `VITE_CAMPUS_AI_URL` เพื่อให้ผมตอบคำถามจริงเกี่ยวกับวิทยาลัยได้ทันที",
        }]);
        return;
      }

      const response = await fetch(AI_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      if (!response.ok) throw new Error(`AI endpoint returned ${response.status}`);
      const contentType = response.headers.get("content-type") ?? "";
      const payload = contentType.includes("application/json") ? await response.json() : await response.text();
      setMessages((current) => [...current, { role: "assistant", content: extractCampusAIReply(payload) }]);
    } catch (error) {
      console.error("[PLato AI] request failed", error);
      toast.error("เชื่อมต่อ AI ไม่สำเร็จ กรุณาตรวจสอบ URL อีกครั้ง");
      setMessages((current) => [...current, { role: "assistant", content: "ขออภัยครับ ตอนนี้ยังเชื่อมต่อผู้ช่วย AI ไม่ได้ ลองใหม่อีกครั้งภายหลังนะครับ" }]);
    } finally {
      setLoading(false);
    }
  };

  return <>
    {open && <div className="fixed bottom-24 right-4 z-[60] w-[min(410px,calc(100vw-2rem))] overflow-hidden rounded-[24px] border border-[var(--border)] bg-white shadow-[0_22px_70px_rgba(16,41,58,0.25)] sm:right-6"><div className="flex items-center justify-between bg-[var(--ink)] px-4 py-3 text-white"><div className="flex items-center gap-2.5"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--aqua)] text-[var(--ink)]"><Sparkles size={15} /></span><div><p className="text-sm font-extrabold">PLato Guide AI</p><p className="text-[10px] font-medium text-white/60">ถามเรื่องอาคารและวิทยาลัยฯ ได้เลย</p></div></div><button type="button" onClick={() => setOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white" aria-label="ปิดแชต"><X size={16} /></button></div><AIChatBox messages={messages} onSendMessage={onSendMessage} isLoading={loading} height="430px" placeholder="พิมพ์คำถามเกี่ยวกับวิทยาลัย..." emptyStateMessage="เริ่มถาม PLato Guide AI" suggestedPrompts={suggestedPrompts} className="rounded-none border-0 shadow-none" /></div>}
    <button type="button" onClick={() => setOpen((value) => !value)} className="fixed bottom-5 right-4 z-[60] flex h-14 items-center gap-2 rounded-full bg-[var(--ink)] px-4 text-white shadow-[0_14px_35px_rgba(16,41,58,0.3)] transition-all hover:-translate-y-1 sm:right-6" aria-label={open ? "ปิด PLato Guide AI" : "เปิด PLato Guide AI"}><span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[var(--aqua)] text-[var(--ink)]"><MessageCircle size={17} />{!open && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--ink)] bg-[#78d3a2]" />}</span><span className="hidden text-xs font-extrabold sm:inline">{open ? "ปิดแชต" : "ถาม PLato AI"}</span></button>
  </>;
}
