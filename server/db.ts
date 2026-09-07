import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { CAMPUS_BUILDINGS, CAMPUS_NEWS, DEFAULT_DEPARTMENTS, DEFAULT_GALLERY } from "@shared/campus";
import { campusBuildings, campusNews, InsertUser, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  type TextField = (typeof textFields)[number];

  const assignNullable = (field: TextField) => {
    const value = user[field];
    if (value === undefined) return;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  };
  textFields.forEach(assignNullable);

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

function withBuildingFallbacks(building: (typeof CAMPUS_BUILDINGS)[number]) {
  return {
    ...building,
    departments: DEFAULT_DEPARTMENTS.filter((department) => department.floor <= building.floors),
    gallery: DEFAULT_GALLERY,
    latitude: building.latitude ?? 13.4098 + (building.y - 50) * 0.00035,
    longitude: building.longitude ?? 99.9991 + (building.x - 50) * 0.00045,
  };
}

export async function getCampusBuildings() {
  const db = await getDb();
  if (!db) return CAMPUS_BUILDINGS.map(withBuildingFallbacks);

  try {
    const rows = await db.select().from(campusBuildings);
    if (!rows.length) return CAMPUS_BUILDINGS.map(withBuildingFallbacks);

    return rows.map((row, index) => {
      const fallback = CAMPUS_BUILDINGS.find((item) => item.id === row.id);
      if (fallback) {
        return {
          ...fallback,
          name: row.name,
          shortName: row.shortName,
          category: row.category,
          description: row.description,
          floors: row.floors,
          floorsDetail: (row.floorDetails as typeof fallback.floorsDetail) ?? fallback.floorsDetail,
          latitude: Number(row.latitude),
          longitude: Number(row.longitude),
          departments: (row.departments as typeof DEFAULT_DEPARTMENTS) ?? DEFAULT_DEPARTMENTS.filter((department) => department.floor <= row.floors),
          gallery: (row.gallery as typeof DEFAULT_GALLERY) ?? DEFAULT_GALLERY,
        };
      }
      return {
        id: row.id,
        name: row.name,
        shortName: row.shortName,
        category: row.category,
        description: row.description,
        floors: row.floors,
        x: 18 + (index % 4) * 20,
        y: 22 + Math.floor(index / 4) * 25,
        width: 18,
        height: 18,
        accent: "#3c8f8d",
        floorsDetail: row.floorDetails as typeof CAMPUS_BUILDINGS[number]["floorsDetail"],
        latitude: Number(row.latitude),
        longitude: Number(row.longitude),
        departments: row.departments as typeof DEFAULT_DEPARTMENTS,
        gallery: row.gallery as typeof DEFAULT_GALLERY,
      };
    });
  } catch (error) {
    console.warn("[Database] Could not load campus buildings, using demo data:", error);
    return CAMPUS_BUILDINGS.map(withBuildingFallbacks);
  }
}

export async function getCampusNews() {
  const db = await getDb();
  if (!db) return CAMPUS_NEWS;

  try {
    const rows = await db.select().from(campusNews).where(eq(campusNews.published, 1));
    if (!rows.length) return CAMPUS_NEWS;
    return rows.map((row) => ({
      id: row.id,
      tag: row.tag,
      title: row.title,
      excerpt: row.excerpt,
      date: row.dateLabel,
      time: row.timeLabel,
      accent: row.accent,
    }));
  } catch (error) {
    console.warn("[Database] Could not load campus news, using demo data:", error);
    return CAMPUS_NEWS;
  }
}

export type BuildingWriteInput = {
  id: string;
  name: string;
  shortName: string;
  category: "วิชาการ" | "ปฏิบัติการ" | "บริการ" | "กิจกรรม";
  description: string;
  floors: number;
  latitude: number;
  longitude: number;
  floorDetails: unknown;
  departments: unknown;
  gallery: unknown;
};

export async function saveCampusBuilding(input: BuildingWriteInput) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const values = {
    id: input.id,
    name: input.name,
    shortName: input.shortName,
    category: input.category,
    description: input.description,
    floors: input.floors,
    latitude: String(input.latitude),
    longitude: String(input.longitude),
    floorDetails: input.floorDetails,
    departments: input.departments,
    gallery: input.gallery,
  };
  await db.insert(campusBuildings).values(values).onDuplicateKeyUpdate({ set: values });
  return values;
}

export type ImportedBuildingInput = Pick<BuildingWriteInput, "id" | "name" | "shortName" | "description" | "category" | "latitude" | "longitude">;

export async function importCampusBuildings(items: ImportedBuildingInput[]) {
  const results = [];
  for (const item of items) {
    results.push(await saveCampusBuilding({
      ...item,
      floors: 1,
      floorDetails: [{ level: 1, label: "ชั้น 1 — รอข้อมูลจากแบ็กเอนด์", rooms: [] }],
      departments: [],
      gallery: [],
    }));
  }
  return { imported: results.length };
}

export async function removeCampusBuilding(id: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.delete(campusBuildings).where(eq(campusBuildings.id, id));
  return { success: true as const };
}

export type NewsWriteInput = {
  id: string;
  tag: string;
  title: string;
  excerpt: string;
  dateLabel: string;
  timeLabel: string;
  accent: string;
  published: number;
};

export async function saveCampusNews(input: NewsWriteInput) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const values = { ...input };
  await db.insert(campusNews).values(values).onDuplicateKeyUpdate({ set: values });
  return values;
}

export async function removeCampusNews(id: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.delete(campusNews).where(eq(campusNews.id, id));
  return { success: true as const };
}
