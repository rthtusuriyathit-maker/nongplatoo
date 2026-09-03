/* =============================================================================
   map.js
   ไฟล์นี้คือ "เครื่องยนต์" ของแผนที่ — อ่านข้อมูลจาก config.js กับ data.js มาวาดแผนที่
   ปกติไม่ต้องแก้ไฟล์นี้ ยกเว้นอยากเพิ่มฟีเจอร์ใหม่จริงๆ
   ============================================================================= */

let map;
let directionsService;
let directionsRenderer;
let markers = [];
let userMarker = null;

/* -----------------------------------------------------------------------------
   ICONS — SVG path ของแต่ละหมวดหมู่ (ใช้ category จาก data.js มาเลือกไอคอน)
   อยากเพิ่มหมวดใหม่: เพิ่ม key ใหม่ในนี้ แล้วไปใส่ category นั้นใน data.js ได้เลย
   ----------------------------------------------------------------------------- */
const ICONS = {
  gear:    '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 005 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82L4.2 7.1a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09A1.65 1.65 0 0015 4.6a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9c.36.14.68.36 1.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>',
  bolt:    '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>',
  laptop:  '<rect x="2" y="4" width="20" height="14" rx="2"/><path d="M8 21h8M12 18v3"/>',
  chip:    '<rect x="6" y="6" width="12" height="12" rx="1"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4M2 8h2M2 16h2M20 8h2M20 16h2"/>',
  food:    '<path d="M3 2v7c0 1.1.9 2 2 2h1a2 2 0 002-2V2M6 2v20M17 2a5 5 0 00-5 5v4a2 2 0 002 2h1v9"/>',
  cafe:    '<path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>',
  sport:   '<circle cx="12" cy="12" r="10"/><path d="M12 2a15 15 0 010 20M2 12h20M4 7h16M4 17h16"/>',
  parking: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 17V7h4a3 3 0 010 6H9"/>',
  default: '<circle cx="12" cy="12" r="8"/>',
};

/* map style: โทนแม่น้ำแม่กลอง (dark mode) — แก้สีตรงนี้ถ้าอยากเปลี่ยนธีมแผนที่ */
const RIVER_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#0B2A3D" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0B2A3D" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8FA9B3" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#123A4F" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8FA9B3" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#1B4B63" }] },
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#14435C" }] },
];

/* สร้างไอคอนหมุดเป็นรูปหยดน้ำสี (SVG data URL) จุดยึดอยู่ที่ปลายแหลมด้านล่าง
   ใช้ google.maps.Marker ตรงๆ ไม่ใช่ CSS transform เลยไม่มีปัญหาตำแหน่งขยับ/วาร์ป */
function buildPinIcon(color, category) {
  const glyph = ICONS[category] || ICONS.default;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="52" viewBox="0 0 40 52">
      <ellipse cx="20" cy="47" rx="8" ry="2.4" fill="rgba(0,0,0,0.35)"/>
      <path d="M20 2c12 0 20 8.5 20 19C40 33 24 46 20 50 16 46 0 33 0 21 0 10.5 8 2 20 2z" fill="${color}"/>
      <circle cx="20" cy="20" r="11" fill="#0B2A3D"/>
      <g transform="translate(12,12)" stroke="${color}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
        ${glyph}
      </g>
    </svg>`;
  return {
    url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg),
    scaledSize: new google.maps.Size(40, 52),
    anchor: new google.maps.Point(20, 50),
  };
}


/* -----------------------------------------------------------------------------
   initMap() — Google Maps เรียกฟังก์ชันนี้อัตโนมัติทันทีที่โหลด API เสร็จ
   (ดู index.html ท้ายไฟล์ ตรง <script src="...&callback=initMap">)
   ----------------------------------------------------------------------------- */
function initMap() {
  document.getElementById("keyWarning").style.display =
    CONFIG.GOOGLE_MAPS_API_KEY === "YOUR_API_KEY_HERE" ? "flex" : "none";

  map = new google.maps.Map(document.getElementById("map"), {
    center: CONFIG.MAP_CENTER,
    zoom: CONFIG.MAP_ZOOM,
    disableDefaultUI: true,
    zoomControl: true,
    styles: RIVER_MAP_STYLE,
  });

  // ระบบนำทาง: ใช้ DirectionsService (คำนวณเส้นทาง) + DirectionsRenderer (วาดเส้นทางบนแผนที่)
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({
    map,
    suppressMarkers: true, // ปิดหมุด A/B เริ่มต้นของ Google เพราะเรามีหมุดของเราเองแล้ว
    polylineOptions: {
      strokeColor: "#E8935B",
      strokeWeight: 5,
      strokeOpacity: 0.9,
    },
  });

  drawZones();
  drawBuildingMarkers();
  wireUIButtons();
}

/* วาดเส้นประล้อมแต่ละโซนจาก ZONES ใน data.js */
function drawZones() {
  ZONES.forEach((zone) => {
    new google.maps.Polygon({
      paths: zone.path,
      strokeColor: zone.color,
      strokeOpacity: 0.9,
      strokeWeight: 1.6,
      strokeDasharray: "4,4", // หมายเหตุ: Google Maps ไม่รองรับ dashed จริงตรงๆ ใช้ icons แบบ dash ถ้าต้องการเป๊ะ
      fillOpacity: 0,
      map,
    });
  });
}

/* สร้างหมุดของทุกอาคารจาก BUILDINGS ใน data.js พร้อม event ตอนคลิก */
function drawBuildingMarkers() {
  BUILDINGS.forEach((b) => {
    const marker = new google.maps.Marker({
      position: { lat: b.lat, lng: b.lng },
      map,
      title: b.name,
      icon: buildPinIcon(b.color, b.category),
    });

    marker.addListener("click", () => showBuildingInfo(b));
    markers.push(marker);
  });
}

/* แสดงข้อมูลอาคาร — เขียนลงทั้ง 2 ชุด element (มือถือ + เดสก์ท็อป) พร้อมกัน
   CSS (.mobile-only / .desktop-only) จะเลือกโชว์อันที่เหมาะกับขนาดจอเอง */
function showBuildingInfo(building) {
  const subText = `${zoneNameOf(building.zoneId)} · เปิด ${building.hours}`;

  // ฝั่งมือถือ: การ์ดลอยด้านล่างแผนที่
  document.getElementById("popName").textContent = building.name;
  document.getElementById("popSub").textContent = subText;
  document.getElementById("infoPop").classList.add("show");
  document.getElementById("popGo").onclick = () => startNavigation(building);

  // ฝั่งเดสก์ท็อป: panel ทางขวา
  document.getElementById("popNameDesktop").textContent = building.name;
  document.getElementById("popSubDesktop").textContent = subText;
  document.getElementById("popGoDesktop").onclick = () => startNavigation(building);
  document.getElementById("detailEmpty").style.display = "none";
  document.getElementById("detailInfo").classList.add("show");

  hideDirectionsPanel();
  map.panTo({ lat: building.lat, lng: building.lng });
}

function zoneNameOf(zoneId) {
  const z = ZONES.find((z) => z.id === zoneId);
  return z ? z.name : zoneId;
}


/* -----------------------------------------------------------------------------
   ระบบนำทาง (turn-by-turn) — คล้าย Google Maps: ขอตำแหน่งผู้ใช้ -> คำนวณเส้นทาง
   -> วาดเส้นทางบนแผนที่ -> โชว์รายการขั้นตอนเลี้ยวซ้าย/ขวาที่แผงด้านล่าง
   ----------------------------------------------------------------------------- */
function startNavigation(building) {
  if (!navigator.geolocation) {
    alert("อุปกรณ์นี้ไม่รองรับการระบุตำแหน่ง กรุณาเปิด GPS หรือลองอุปกรณ์อื่น");
    return;
  }

  showRouteLoading();

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const origin = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      requestDirections(origin, building);
    },
    () => {
      // ผู้ใช้ไม่อนุญาต GPS หรือหาไม่เจอ -> fallback ใช้จุดศูนย์กลางวิทยาลัยแทน เพื่อให้ demo ใช้งานได้
      requestDirections(CONFIG.MAP_CENTER, building);
    }
  );
}

function requestDirections(origin, building) {
  const destination = { lat: building.lat, lng: building.lng };

  directionsService.route(
    {
      origin,
      destination,
      travelMode: google.maps.TravelMode[CONFIG.TRAVEL_MODE],
    },
    (result, status) => {
      if (status !== "OK") {
        alert("หาเส้นทางไม่สำเร็จ (" + status + ") ลองใหม่อีกครั้ง");
        hideRouteLoading();
        return;
      }
      directionsRenderer.setDirections(result);
      renderTurnByTurnSteps(result, building);
      hideRouteLoading();
    }
  );
}

/* แปลงผลลัพธ์จาก DirectionsService เป็นรายการขั้นตอนเลี้ยว
   เขียนซ้ำลงทั้งแผงมือถือ (...Mobile) และแผงเดสก์ท็อป (...Desktop) */
function renderTurnByTurnSteps(result, building) {
  const leg = result.routes[0].legs[0];
  const summaryText = `ระยะทาง ${leg.distance.text} · ใช้เวลาประมาณ ${leg.duration.text}`;

  const stepsHTML = leg.steps
    .map(
      (step, i) => `
        <li class="step-item">
          <span class="step-num">${i + 1}</span>
          <span class="step-text">${step.instructions}</span>
          <span class="step-dist">${step.distance.text}</span>
        </li>`
    )
    .join("");

  ["Mobile", "Desktop"].forEach((suffix) => {
    document.getElementById("directionsSteps" + suffix).innerHTML = stepsHTML;
    document.getElementById("directionsDestName" + suffix).textContent = building.name;
    document.getElementById("directionsSummary" + suffix).textContent = summaryText;
    document.getElementById("directionsPanel" + suffix).classList.add("show");
  });

  document.getElementById("infoPop").classList.remove("show");
}

function hideDirectionsPanel() {
  ["Mobile", "Desktop"].forEach((suffix) => {
    document.getElementById("directionsPanel" + suffix).classList.remove("show");
  });
  if (directionsRenderer) directionsRenderer.setDirections({ routes: [] }); // เคลียร์เส้นทางเดิมออกจากแผนที่
}

function showRouteLoading() {
  document.getElementById("popGo").textContent = "กำลังหาเส้นทาง...";
  document.getElementById("popGoDesktop").textContent = "กำลังหาเส้นทาง...";
}
function hideRouteLoading() {
  document.getElementById("popGo").textContent = "นำทาง";
  document.getElementById("popGoDesktop").textContent = "นำทาง";
}

/* ผูกปุ่มปิดต่างๆ ในหน้า UI */
function wireUIButtons() {
  document.getElementById("closeDirectionsMobile").onclick = hideDirectionsPanel;
  document.getElementById("closeDirectionsDesktop").onclick = hideDirectionsPanel;
}

// ให้ Google Maps script เห็นฟังก์ชันนี้ (จำเป็นเพราะเรียกผ่าน callback=initMap ใน URL)
window.initMap = initMap;
