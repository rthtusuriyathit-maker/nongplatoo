import { CAMPUS_BUILDINGS, CAMPUS_NEWS, CAMPUS_OVERVIEW, DEFAULT_DEPARTMENTS, DEFAULT_GALLERY } from "../shared/campus";
import { saveCampusBuilding, saveCampusNews } from "../server/db";

async function main() {
  for (const building of CAMPUS_BUILDINGS) {
    await saveCampusBuilding({
      id: building.id,
      name: building.name,
      shortName: building.shortName,
      category: building.category,
      description: building.description,
      floors: building.floors,
      latitude: CAMPUS_OVERVIEW.mapCenter.lat + (building.y - 50) * 0.00035,
      longitude: CAMPUS_OVERVIEW.mapCenter.lng + (building.x - 50) * 0.00045,
      floorDetails: building.floorsDetail,
      departments: DEFAULT_DEPARTMENTS.filter((department) => department.floor <= building.floors),
      gallery: DEFAULT_GALLERY,
    });
  }

  for (const news of CAMPUS_NEWS) {
    await saveCampusNews({
      id: news.id,
      tag: news.tag,
      title: news.title,
      excerpt: news.excerpt,
      dateLabel: news.date,
      timeLabel: news.time,
      accent: news.accent,
      published: 1,
    });
  }

  console.log(`Seeded ${CAMPUS_BUILDINGS.length} buildings and ${CAMPUS_NEWS.length} news items.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
