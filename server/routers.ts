import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import {
  getCampusBuildings,
  getCampusNews,
  importCampusBuildings,
  removeCampusBuilding,
  removeCampusNews,
  saveCampusBuilding,
  saveCampusNews,
} from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";

const floorSchema = z.object({
  level: z.number().int().min(1),
  label: z.string().min(1),
  rooms: z.array(z.string()),
});

const departmentSchema = z.object({
  id: z.string().min(1),
  floor: z.number().int().min(1),
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string(),
  skills: z.array(z.string()),
  careers: z.array(z.string()),
  accent: z.string(),
});

const gallerySchema = z.object({
  id: z.string().min(1),
  url: z.string().min(1).refine((value) => value.startsWith("https://") || value.startsWith("/"), "Gallery URL must be https:// or a local storage path"),
  caption: z.string(),
  alt: z.string(),
});

const buildingInput = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  shortName: z.string().min(1),
  category: z.enum(["วิชาการ", "ปฏิบัติการ", "บริการ", "กิจกรรม"]),
  description: z.string().min(1),
  floors: z.number().int().min(1).max(30),
  latitude: z.number(),
  longitude: z.number(),
  floorDetails: z.array(floorSchema),
  departments: z.array(departmentSchema),
  gallery: z.array(gallerySchema),
});

const newsInput = z.object({
  id: z.string().min(1),
  tag: z.string().min(1),
  title: z.string().min(1),
  excerpt: z.string().min(1),
  dateLabel: z.string().min(1),
  timeLabel: z.string().min(1),
  accent: z.string().min(1),
  published: z.number().int().min(0).max(1),
});

const importedBuildingInput = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  shortName: z.string().min(1),
  description: z.string(),
  category: z.enum(["วิชาการ", "ปฏิบัติการ", "บริการ", "กิจกรรม"]),
  latitude: z.number().finite(),
  longitude: z.number().finite(),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  campus: router({
    buildings: publicProcedure.query(() => getCampusBuildings()),
    news: publicProcedure.query(() => getCampusNews()),
    askAI: publicProcedure.input(z.object({ question: z.string().min(1).max(500), history: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(2000) })).max(8).default([]) })).mutation(async ({ input }) => {
      const buildings = await getCampusBuildings();
      const context = buildings.slice(0, 30).map((building) => `${building.name} (${building.category}) พิกัด ${building.latitude},${building.longitude} จำนวน ${building.floors} ชั้น`).join("\n");
      const response = await invokeLLM({ messages: [
        { role: "system", content: `คุณคือ Nong Platoo Ontour AI ผู้ช่วยประชาสัมพันธ์วิทยาลัยเทคนิคสมุทรสงคราม ตอบภาษาไทยสุภาพ กระชับ เข้าใจง่ายสำหรับนักเรียน ผู้ปกครอง และผู้มาติดต่อ ห้ามแต่งข้อมูลที่ไม่มีในบริบท หากไม่ทราบให้บอกว่ารอข้อมูลจากวิทยาลัย และแนะนำให้ติดต่อเจ้าหน้าที่ ใช้บริบทอาคารดังนี้:\n${context}` },
        ...input.history,
        { role: "user", content: input.question },
      ] });
      const content = response.choices?.[0]?.message?.content;
      if (typeof content === "string") return { answer: content };
      if (Array.isArray(content)) return { answer: content.map((part) => typeof part === "string" ? part : part.type === "text" ? part.text : "").join("") };
      return { answer: "ขออภัยครับ ตอนนี้ยังไม่สามารถสร้างคำตอบได้ กรุณาลองใหม่อีกครั้ง" };
    }),
    adminBuildings: adminProcedure.query(() => getCampusBuildings()),
    adminNews: adminProcedure.query(() => getCampusNews()),
    importBuildings: adminProcedure.input(z.object({ items: z.array(importedBuildingInput).min(1).max(200) })).mutation(({ input }) => importCampusBuildings(input.items)),
    saveBuilding: adminProcedure.input(buildingInput).mutation(({ input }) => saveCampusBuilding(input)),
    deleteBuilding: adminProcedure.input(z.object({ id: z.string().min(1) })).mutation(({ input }) => removeCampusBuilding(input.id)),
    saveNews: adminProcedure.input(newsInput).mutation(({ input }) => saveCampusNews(input)),
    deleteNews: adminProcedure.input(z.object({ id: z.string().min(1) })).mutation(({ input }) => removeCampusNews(input.id)),
  }),
});

export type AppRouter = typeof appRouter;
