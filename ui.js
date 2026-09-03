/* =============================================================================
   ui.js
   จัดการส่วน UI ที่ "ไม่เกี่ยวกับแผนที่โดยตรง" — sidebar, รายการอาคาร, ช่องค้นหา,
   การสลับโหมดมือถือ/เดสก์ท็อป
   แยกจาก map.js เพื่อให้ map.js โฟกัสแค่เรื่องแผนที่ล้วนๆ
   ============================================================================= */

document.addEventListener("DOMContentLoaded", () => {
  renderZoneChips();
  renderBuildingList("buildingList");
  renderBuildingList("mobileBuildingList");
  wireSearch();
  wireMobileSearchOverlay();
});

/* ----- โซน chip กดกรองอาคารในรายการซ้ายมือ ----- */
function renderZoneChips() {
  const wrap = document.getElementById("zoneChips");
  if (!wrap) return;

  const allChip = makeChip("ทั้งหมด", null, "#8FA9B3");
  allChip.classList.add("active");
  wrap.appendChild(allChip);

  ZONES.forEach((zone) => {
    wrap.appendChild(makeChip(zone.name, zone.id, zone.color));
  });

  wrap.addEventListener("click", (e) => {
    const chip = e.target.closest(".zone-chip");
    if (!chip) return;
    wrap.querySelectorAll(".zone-chip").forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    filterBuildingListByZone(chip.dataset.zoneId || null);
  });
}

function makeChip(label, zoneId, color) {
  const chip = document.createElement("button");
  chip.className = "zone-chip";
  chip.textContent = label;
  chip.style.setProperty("--chip-color", color);
  if (zoneId) chip.dataset.zoneId = zoneId;
  return chip;
}

function filterBuildingListByZone(zoneId) {
  const items = document.querySelectorAll("#buildingList .building-item");
  items.forEach((item) => {
    const show = !zoneId || item.dataset.zoneId === zoneId;
    item.style.display = show ? "flex" : "none";
  });
}

/* ----- สร้างรายการอาคารทั้งหมด ใช้ได้ทั้ง sidebar (desktop) และ overlay (mobile) ----- */
function renderBuildingList(targetId) {
  const list = document.getElementById(targetId);
  if (!list) return;

  BUILDINGS.forEach((b) => {
    const li = document.createElement("li");
    li.className = "building-item";
    li.dataset.zoneId = b.zoneId;
    li.dataset.searchText = (b.name + " " + zoneNameOf(b.zoneId)).toLowerCase();
    li.innerHTML = `
      <span class="building-dot" style="background:${b.color}"></span>
      <span class="building-item-text">
        <span class="building-item-name">${b.name}</span>
        <span class="building-item-sub">${zoneNameOf(b.zoneId)} · ${b.hours}</span>
      </span>
    `;
    li.addEventListener("click", () => {
      showBuildingInfo(b);          // ฟังก์ชันนี้อยู่ใน map.js
      document.getElementById("mobileSearchOverlay").classList.remove("show");
    });
    list.appendChild(li);
  });
}

/* ----- ช่องค้นหาบน header (desktop) ----- */
function wireSearch() {
  const input = document.getElementById("searchInput");
  if (!input) return;
  input.addEventListener("input", () => filterListBySearch("buildingList", input.value));
}

/* ----- ช่องค้นหาแบบเต็มจอ (mobile) ----- */
function wireMobileSearchOverlay() {
  const overlay = document.getElementById("mobileSearchOverlay");
  const openBtn = document.getElementById("mobileSearchBtn");
  const closeBtn = document.getElementById("closeMobileSearch");
  const input = document.getElementById("mobileSearchInput");

  if (openBtn) openBtn.addEventListener("click", () => {
    overlay.classList.add("show");
    input.focus();
  });
  if (closeBtn) closeBtn.addEventListener("click", () => overlay.classList.remove("show"));
  if (input) input.addEventListener("input", () => filterListBySearch("mobileBuildingList", input.value));
}

function filterListBySearch(listId, query) {
  const q = query.trim().toLowerCase();
  document.querySelectorAll(`#${listId} .building-item`).forEach((item) => {
    const match = !q || item.dataset.searchText.includes(q);
    item.style.display = match ? "flex" : "none";
  });
}
