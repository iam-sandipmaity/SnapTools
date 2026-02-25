import { useState, useRef, useCallback, useEffect } from "react";

// Load exifr from CDN for real EXIF parsing
const loadExifr = () => new Promise((resolve, reject) => {
  if (window.exifr) return resolve(window.exifr);
  const s = document.createElement("script");
  s.src = "https://cdnjs.cloudflare.com/ajax/libs/exifr/7.1.3/full.esm.js";
  s.type = "module";
  s.onload = () => resolve(window.exifr);
  s.onerror = () => reject(new Error("Failed to load exifr"));
  document.head.appendChild(s);
});

// Fallback: manual EXIF reader using DataView
async function readExifFallback(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target.result;
        const view = new DataView(buffer);
        const meta = {};
        // Basic JPEG EXIF detection
        if (view.getUint16(0) === 0xFFD8) {
          meta["Format"] = "JPEG";
          let offset = 2;
          while (offset < buffer.byteLength - 1) {
            const marker = view.getUint16(offset);
            if (marker === 0xFFE1) { // APP1 - EXIF
              meta["Has EXIF"] = "Yes";
              break;
            }
            if ((marker & 0xFF00) !== 0xFF00) break;
            const segLen = view.getUint16(offset + 2);
            offset += 2 + segLen;
          }
        } else if (view.getUint32(0) === 0x89504E47) {
          meta["Format"] = "PNG";
        } else if (view.getUint16(0) === 0x4949 || view.getUint16(0) === 0x4D4D) {
          meta["Format"] = "TIFF";
        }
        resolve(meta);
      } catch { resolve({}); }
    };
    reader.readAsArrayBuffer(file);
  });
}

// Parse file info always available
function getFileInfo(file, img) {
  return {
    "File Name": file.name,
    "File Size": formatBytes(file.size),
    "File Type": file.type || "Unknown",
    "Last Modified": new Date(file.lastModified).toISOString().slice(0, 19).replace("T", " "),
    "Image Width": img?.naturalWidth ? `${img.naturalWidth} px` : "—",
    "Image Height": img?.naturalHeight ? `${img.naturalHeight} px` : "—",
    "Aspect Ratio": img?.naturalWidth && img?.naturalHeight
      ? (img.naturalWidth / img.naturalHeight).toFixed(3)
      : "—",
    "Megapixels": img?.naturalWidth && img?.naturalHeight
      ? ((img.naturalWidth * img.naturalHeight) / 1_000_000).toFixed(2) + " MP"
      : "—",
  };
}

function formatBytes(b) {
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
  return (b / (1024 * 1024)).toFixed(2) + " MB";
}

const EXIF_GROUPS = {
  "📁 File Info": ["File Name","File Size","File Type","Last Modified","Image Width","Image Height","Aspect Ratio","Megapixels"],
  "📷 Camera": ["Make","Model","LensModel","LensMake","Software","HostComputer"],
  "⚙️ Settings": ["ExposureTime","FNumber","ISO","ISOSpeedRatings","FocalLength","FocalLengthIn35mmFilm","ExposureBiasValue","ExposureProgram","ExposureMode","MeteringMode","Flash","WhiteBalance","SharpnessLens","Contrast","Saturation","Sharpness","SceneCaptureType","GainControl","LightSource"],
  "🌍 GPS": ["GPSLatitude","GPSLongitude","GPSAltitude","GPSAltitudeRef","GPSSpeed","GPSImgDirection","GPSDateStamp","GPSTimeStamp","GPSProcessingMethod"],
  "🗓️ Date & Time": ["DateTimeOriginal","DateTimeDigitized","DateTime","ModifyDate","CreateDate","OffsetTime","OffsetTimeOriginal","SubSecTimeOriginal"],
  "🖼️ Image": ["ColorSpace","Compression","ResolutionUnit","XResolution","YResolution","Orientation","BitsPerSample","SamplesPerPixel","PhotometricInterpretation","PixelXDimension","PixelYDimension","ThumbnailOffset","ThumbnailLength","ImageDescription","Artist","Copyright"],
  "📝 IPTC / XMP": ["Title","Description","Keywords","Subject","Creator","CreatorCity","CreatorState","CreatorCountry","CopyrightNotice","CopyrightURL","Credit","Source","Headline","Instructions","Category","SupplementalCategories","TransmissionReference","Urgency","Rating"],
  "🔧 Technical": ["Compression","JPEGInterchangeFormat","JPEGInterchangeFormatLength","CFAPattern","CustomRendered","SubjectDistance","SubjectDistanceRange","FlashPixVersion","FlashEnergy","SpatialFrequencyResponse","FocalPlaneXResolution","FocalPlaneYResolution","FocalPlaneResolutionUnit","ExposureIndex","SensingMethod","FileSource","SceneType","InteropIndex","InteropVersion"],
};

const EDITABLE_KEYS = new Set([
  "File Name","Image Width","Image Height", // displayed but file info
  "DateTimeOriginal","DateTimeDigitized","DateTime","ModifyDate","CreateDate",
  "Artist","Copyright","ImageDescription","Make","Model","Software",
  "LensModel","LensMake","HostComputer",
  "GPSLatitude","GPSLongitude","GPSAltitude",
  "Title","Description","Keywords","Subject","Creator","CreatorCity","CreatorState",
  "CreatorCountry","CopyrightNotice","CopyrightURL","Credit","Source","Headline",
  "Instructions","Category","Rating","Urgency",
  "XResolution","YResolution","Orientation","ColorSpace",
]);

const ORIENTATION_MAP = {1:"Horizontal (normal)",2:"Mirror horizontal",3:"Rotate 180°",4:"Mirror vertical",5:"Mirror horizontal, rotate 270°",6:"Rotate 90° CW",7:"Mirror horizontal, rotate 90° CW",8:"Rotate 270° CW"};
const EXPOSURE_PROGRAM = {0:"Not defined",1:"Manual",2:"Program AE",3:"Aperture priority",4:"Shutter priority",5:"Creative",6:"Action",7:"Portrait",8:"Landscape"};
const METERING_MODE = {0:"Unknown",1:"Average",2:"Center-weighted",3:"Spot",4:"Multi-spot",5:"Multi-segment",6:"Partial"};

function formatValue(key, val) {
  if (val === null || val === undefined || val === "") return "";
  if (key === "Orientation" && ORIENTATION_MAP[val]) return ORIENTATION_MAP[val];
  if (key === "ExposureProgram" && EXPOSURE_PROGRAM[val]) return EXPOSURE_PROGRAM[val];
  if (key === "MeteringMode" && METERING_MODE[val]) return METERING_MODE[val];
  if (key === "FNumber") return `f/${Number(val).toFixed(1)}`;
  if (key === "ExposureTime") {
    const n = Number(val);
    return n < 1 ? `1/${Math.round(1/n)}s` : `${n}s`;
  }
  if (key === "FocalLength") return `${Number(val).toFixed(1)} mm`;
  if (key === "FocalLengthIn35mmFilm") return `${val} mm`;
  if (key === "ISO" || key === "ISOSpeedRatings") return `ISO ${Array.isArray(val) ? val[0] : val}`;
  if (key === "GPSLatitude" || key === "GPSLongitude") {
    if (Array.isArray(val)) return val.map(v => typeof v === "number" ? v.toFixed(6) : v).join(", ");
  }
  if (Array.isArray(val)) return val.join(", ");
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
}

function getGroupForKey(key) {
  for (const [group, keys] of Object.entries(EXIF_GROUPS)) {
    if (keys.includes(key)) return group;
  }
  return "🔍 Other";
}

export default function ImageMetadataEditor() {
  const [image, setImage] = useState(null); // { file, url, meta, rawMeta }
  const [editedMeta, setEditedMeta] = useState({});
  const [activeGroup, setActiveGroup] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showExport, setShowExport] = useState(false);
  const [exportFmt, setExportFmt] = useState("JSON");
  const [editingKey, setEditingKey] = useState(null);
  const [editVal, setEditVal] = useState("");
  const [sortAlpha, setSortAlpha] = useState(false);
  const [showOnlyEdited, setShowOnlyEdited] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const inputRef = useRef();
  const imgRef = useRef();

  const notify = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 2800);
  };

  const processFile = async (file) => {
    if (!file || !file.type.startsWith("image/")) {
      notify("Please drop an image file", "error");
      return;
    }
    setLoading(true);
    const url = URL.createObjectURL(file);

    // Wait for image to load to get dimensions
    const imgEl = new Image();
    await new Promise(res => { imgEl.onload = res; imgEl.onerror = res; imgEl.src = url; });

    let exifData = {};
    try {
      // Try loading exifr dynamically (it's an ES module, may not attach to window)
      // We'll use a different approach - fetch and eval
      const mod = await import("https://cdn.jsdelivr.net/npm/exifr@7.1.3/dist/full.esm.js");
      const parsed = await mod.parse(file, { xmp: true, iptc: true, icc: true, jfif: true, tiff: true, exif: true, gps: true, interop: true, translateValues: false, reviveValues: true, sanitize: false, mergeOutput: true, chunked: true, firstChunkSize: 65536 });
      if (parsed) exifData = parsed;
    } catch (err) {
      console.warn("exifr dynamic import failed, using fallback", err);
      exifData = await readExifFallback(file);
    }

    const fileInfo = getFileInfo(file, imgEl);
    const allMeta = { ...fileInfo };

    // Flatten exif
    const flatten = (obj, prefix = "") => {
      for (const [k, v] of Object.entries(obj)) {
        if (v && typeof v === "object" && !Array.isArray(v) && !(v instanceof Date)) {
          flatten(v, prefix);
        } else {
          allMeta[k] = v instanceof Date ? v.toISOString().slice(0,19).replace("T"," ") : v;
        }
      }
    };
    if (exifData && typeof exifData === "object") flatten(exifData);

    setImage({ file, url, meta: allMeta });
    setEditedMeta({});
    setActiveGroup("All");
    setLoading(false);
    notify(`Loaded ${Object.keys(allMeta).length} metadata fields`);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  };

  const startEdit = (key, currentVal) => {
    setEditingKey(key);
    setEditVal(String(currentVal ?? ""));
  };

  const commitEdit = (key) => {
    if (editVal !== String(image.meta[key] ?? "")) {
      setEditedMeta(p => ({ ...p, [key]: editVal }));
    }
    setEditingKey(null);
  };

  const revertKey = (key) => {
    setEditedMeta(p => { const n = { ...p }; delete n[key]; return n; });
  };

  const getValue = (key) => editedMeta.hasOwnProperty(key) ? editedMeta[key] : (image?.meta[key] ?? "");

  const allMeta = image?.meta || {};
  let entries = Object.entries(allMeta);

  if (showOnlyEdited) entries = entries.filter(([k]) => editedMeta.hasOwnProperty(k));
  if (search) entries = entries.filter(([k, v]) => k.toLowerCase().includes(search.toLowerCase()) || String(v).toLowerCase().includes(search.toLowerCase()));
  if (activeGroup !== "All") {
    const groupKeys = EXIF_GROUPS[activeGroup];
    if (groupKeys) entries = entries.filter(([k]) => groupKeys.includes(k));
    else entries = entries.filter(([k]) => !Object.values(EXIF_GROUPS).flat().includes(k));
  }
  if (sortAlpha) entries.sort(([a], [b]) => a.localeCompare(b));

  // Groups present in current meta
  const presentGroups = ["All"];
  for (const [group, keys] of Object.entries(EXIF_GROUPS)) {
    if (keys.some(k => allMeta.hasOwnProperty(k))) presentGroups.push(group);
  }
  if (Object.keys(allMeta).some(k => !Object.values(EXIF_GROUPS).flat().includes(k))) {
    presentGroups.push("🔍 Other");
  }

  const exportData = () => {
    const merged = { ...allMeta, ...editedMeta };
    const formatted = {};
    for (const [k, v] of Object.entries(merged)) formatted[k] = formatValue(k, v) || v;
    switch (exportFmt) {
      case "JSON": return JSON.stringify(formatted, null, 2);
      case "CSV": return "Key,Value\n" + Object.entries(formatted).map(([k,v]) => `"${k}","${String(v).replace(/"/g,'""')}"`).join("\n");
      case "TXT": return Object.entries(formatted).map(([k,v]) => `${k}: ${v}`).join("\n");
      case "XML": return `<metadata>\n${Object.entries(formatted).map(([k,v]) => `  <${k.replace(/\s/g,"_")}>${v}</${k.replace(/\s/g,"_")}>`).join("\n")}\n</metadata>`;
      case "XMP": return `<?xpacket begin='' id='W5M0MpCehiHzreSzNTczkc9d'?>\n<x:xmpmeta xmlns:x='adobe:ns:meta/'>\n  <rdf:RDF xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns#'>\n    <rdf:Description rdf:about=''>\n${Object.entries(formatted).map(([k,v])=>`      <xmp:${k.replace(/\s/g,"_")}>${v}</xmp:${k.replace(/\s/g,"_")}>`).join("\n")}\n    </rdf:Description>\n  </rdf:RDF>\n</x:xmpmeta>\n<?xpacket end='w'?>`;
      default: return JSON.stringify(formatted, null, 2);
    }
  };

  const gpsLat = allMeta.GPSLatitude;
  const gpsLng = allMeta.GPSLongitude;
  const hasGPS = gpsLat && gpsLng;

  const gpsDecimal = (val, ref) => {
    if (!val) return null;
    let deg;
    if (Array.isArray(val)) {
      deg = val[0] + (val[1] || 0) / 60 + (val[2] || 0) / 3600;
    } else deg = Number(val);
    if (ref === "S" || ref === "W") deg = -deg;
    return deg.toFixed(6);
  };

  const latDec = gpsDecimal(gpsLat, allMeta.GPSLatitudeRef);
  const lngDec = gpsDecimal(gpsLng, allMeta.GPSLongitudeRef);

  return (
    <div className="bg-background text-foreground" style={{ fontFamily: "'Syne', 'DM Sans', sans-serif", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: hsl(var(--card)); }
        ::-webkit-scrollbar-thumb { background: hsl(var(--border)); border-radius: 3px; }
        input:focus, textarea:focus, select:focus { outline: none; border-color: hsl(var(--primary)) !important; box-shadow: 0 0 0 2px hsl(var(--primary) / 0.15); }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0%,100%{opacity:.4} 50%{opacity:.9} }
        @keyframes toastIn { from{transform:translateX(100%);opacity:0} to{transform:translateX(0);opacity:1} }
        .field-row:hover { background: hsl(var(--primary) / 0.04) !important; }
        .field-row:hover .edit-btn { opacity: 1 !important; }
        .tab-btn:hover { background: hsl(var(--primary) / 0.08) !important; }
        .action-btn:hover { background: hsl(var(--primary) / 0.12) !important; }
        /* Responsive layout for mobile */
        .meta-editor-grid { display: grid; grid-template-columns: 280px 1fr; min-height: calc(100vh - 64px); }
        .field-row { display: grid; grid-template-columns: 220px 1fr 80px; gap: 0; align-items: center; }

        @media (max-width: 900px) {
          .meta-editor-grid { grid-template-columns: 1fr !important; grid-auto-rows: auto; }
          .meta-editor-grid > div:first-child { order: 2; }
          .meta-editor-grid > div:last-child { order: 1; }
          .meta-editor-grid img { height: 180px !important; object-fit: cover; }
          .field-row { grid-template-columns: 1fr !important; grid-auto-flow: row; padding: 8px 16px !important; }
          .field-row > div:nth-child(1) { padding-right: 0 !important; padding-bottom: 6px; }
          .field-row > div:nth-child(2) { padding: 0 !important; }
          .field-row > div:nth-child(3) { justify-content: flex-start !important; }
          .tab-btn { font-size: 13px; }
        }
      `}</style>

      {/* Header */}
      <div style={{ background: "linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--background)) 100%)", borderBottom: "1px solid hsl(var(--border))", padding: "0 32px", display: "flex", alignItems: "center", height: 64, gap: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>⬡</div>
          <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.5px" }}>MetaScope</span>
          <span style={{ fontSize: 10, background: "hsl(var(--primary) / 0.14)", border: "1px solid hsl(var(--primary) / 0.27)", borderRadius: 20, padding: "2px 8px", color: "hsl(var(--primary))", fontWeight: 700, letterSpacing: 1 }}>IMAGE EXIF</span>
        </div>
        {image && (
          <>
            <div style={{ height: 20, width: 1, background: "hsl(var(--border))" }} />
            <span style={{ fontSize: 13, color: "#8B8B9E", fontWeight: 500 }}>{image.file.name}</span>
            <span style={{ fontSize: 12, color: "#5A5A6E", marginLeft: "auto" }}>{Object.keys(allMeta).length} fields · {Object.keys(editedMeta).length} edited</span>
            <button className="action-btn" onClick={() => { setShowExport(p => !p); }} style={{ background: showExport ? "hsl(var(--primary) / 0.15)" : "transparent", border: `1px solid ${showExport ? "hsl(var(--primary))" : "hsl(var(--border))"}`, color: showExport ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))", borderRadius: 8, padding: "7px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              ↗ Export
            </button>
            <button className="action-btn" onClick={() => { setImage(null); setEditedMeta({}); }} style={{ background: "transparent", border: "1px solid #2A2A3A", color: "#5A5A6E", borderRadius: 8, padding: "7px 14px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
              ✕
            </button>
          </>
        )}
      </div>

      {!image ? (
        /* Drop Zone */
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 64px)", padding: 32 }}>
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => inputRef.current?.click()}
            style={{
              width: "100%", maxWidth: 560, border: `2px dashed ${dragOver ? "#C8A96E" : "#2A2A3A"}`,
              borderRadius: 24, padding: "64px 48px", textAlign: "center", cursor: "pointer",
              background: dragOver ? "rgba(200,169,110,0.05)" : "rgba(255,255,255,0.01)",
              transition: "all 0.2s", animation: "fadeUp 0.5s ease",
            }}
          >
            <div style={{ fontSize: 56, marginBottom: 20, filter: dragOver ? "brightness(1.3)" : "brightness(0.6)", transition: "0.2s" }}>⬡</div>
              <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.5px" }}>
              Drop an image here
            </div>
            <div style={{ fontSize: 14, color: "#5A5A6E", marginBottom: 28, lineHeight: 1.6 }}>
              Reads EXIF, IPTC, XMP & GPS metadata<br />from JPEG, TIFF, HEIC, RAW and more
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 28 }}>
              {["JPEG","TIFF","HEIC","RAW","PNG","WEBP"].map(f => (
                <span key={f} style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 6, padding: "4px 10px", fontSize: 11, color: "hsl(var(--muted-foreground))", fontWeight: 700 }}>{f}</span>
              ))}
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg, hsl(var(--primary) / 0.14), hsl(var(--accent) / 0.07))", border: "1px solid hsl(var(--primary) / 0.27)", borderRadius: 10, padding: "10px 24px", color: "hsl(var(--primary))", fontSize: 13, fontWeight: 700 }}>
              ↑ Choose File
            </div>
            <input ref={inputRef} type="file" accept="image/*" onChange={handleFileInput} style={{ display: "none" }} />
          </div>
          {loading && (
            <div style={{ position: "fixed", inset: 0, background: "#0A0A0Fcc", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 40, animation: "shimmer 1.2s infinite" }}>⬡</div>
                <div style={{ marginTop: 16, color: "#C8A96E", fontWeight: 600 }}>Reading metadata…</div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="meta-editor-grid" style={{ minHeight: "calc(100vh - 64px)" }}>

          {/* Left Sidebar */}
          <div style={{ background: "#0D0D14", borderRight: "1px solid #1E1E2E", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* Image Preview */}
            <div style={{ padding: 16, borderBottom: "1px solid #1E1E2E" }}>
              <div style={{ borderRadius: 10, overflow: "hidden", background: "#111118", position: "relative" }}>
                <img src={image.url} alt="" ref={imgRef} style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }} />
                {hasGPS && (
                  <button onClick={() => setMapVisible(p => !p)} style={{ position: "absolute", bottom: 8, right: 8, background: "#0A0A0Fdd", border: "1px solid #C8A96E44", borderRadius: 6, color: "#C8A96E", fontSize: 11, padding: "4px 8px", cursor: "pointer", fontFamily: "inherit", fontWeight: 700 }}>
                    📍 GPS
                  </button>
                )}
              </div>
              <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {["Image Width","Image Height","File Size","File Type"].map(k => (
                  <div key={k} style={{ background: "#111118", borderRadius: 6, padding: "6px 10px" }}>
                    <div style={{ fontSize: 9, color: "#5A5A6E", fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 2 }}>{k.replace("Image ","")}</div>
                    <div style={{ fontSize: 12, color: "#C8A96E", fontWeight: 600 }}>{formatValue(k, allMeta[k]) || allMeta[k] || "—"}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Group Navigation */}
            <div style={{ padding: "12px 12px 8px", flex: 1, overflow: "auto" }}>
              <div style={{ fontSize: 10, color: "#5A5A6E", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8, paddingLeft: 4 }}>Categories</div>
              {presentGroups.map(g => {
                const count = g === "All" ? Object.keys(allMeta).length
                  : g === "🔍 Other" ? Object.keys(allMeta).filter(k => !Object.values(EXIF_GROUPS).flat().includes(k)).length
                  : (EXIF_GROUPS[g] || []).filter(k => allMeta.hasOwnProperty(k)).length;
                return (
                  <button key={g} className="tab-btn" onClick={() => setActiveGroup(g)} style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: activeGroup === g ? "rgba(200,169,110,0.1)" : "transparent",
                    border: `1px solid ${activeGroup === g ? "#C8A96E33" : "transparent"}`,
                    borderRadius: 8, padding: "8px 10px", cursor: "pointer", marginBottom: 2,
                    color: activeGroup === g ? "#C8A96E" : "#6A6A7E", fontFamily: "inherit", fontSize: 12, fontWeight: 500, textAlign: "left",
                  }}>
                    <span>{g}</span>
                    <span style={{ fontSize: 10, background: activeGroup === g ? "#C8A96E22" : "#1A1A24", borderRadius: 10, padding: "1px 6px", color: activeGroup === g ? "#C8A96E" : "#4A4A5E" }}>{count}</span>
                  </button>
                );
              })}
            </div>

            {/* Camera info quick card */}
            {(allMeta.Make || allMeta.Model) && (
              <div style={{ padding: 12, borderTop: "1px solid #1E1E2E" }}>
                <div style={{ background: "#111118", borderRadius: 8, padding: "10px 12px" }}>
                  <div style={{ fontSize: 9, color: "#5A5A6E", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Camera</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#F0EDE8" }}>{allMeta.Make} {allMeta.Model}</div>
                  {allMeta.LensModel && <div style={{ fontSize: 11, color: "#8B8B9E", marginTop: 2 }}>{allMeta.LensModel}</div>}
                  {allMeta.DateTimeOriginal && <div style={{ fontSize: 10, color: "#5A5A6E", marginTop: 4 }}>📅 {String(allMeta.DateTimeOriginal).slice(0,19)}</div>}
                  {(allMeta.ExposureTime || allMeta.FNumber || allMeta.ISO) && (
                    <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                      {allMeta.ExposureTime && <span style={{ fontSize: 10, background: "#1A1A24", borderRadius: 4, padding: "2px 6px", color: "#C8A96E" }}>{formatValue("ExposureTime", allMeta.ExposureTime)}</span>}
                      {allMeta.FNumber && <span style={{ fontSize: 10, background: "#1A1A24", borderRadius: 4, padding: "2px 6px", color: "#C8A96E" }}>{formatValue("FNumber", allMeta.FNumber)}</span>}
                      {allMeta.ISO && <span style={{ fontSize: 10, background: "#1A1A24", borderRadius: 4, padding: "2px 6px", color: "#C8A96E" }}>ISO {Array.isArray(allMeta.ISO)?allMeta.ISO[0]:allMeta.ISO}</span>}
                      {allMeta.FocalLength && <span style={{ fontSize: 10, background: "#1A1A24", borderRadius: 4, padding: "2px 6px", color: "#C8A96E" }}>{formatValue("FocalLength", allMeta.FocalLength)}</span>}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right: Main Fields */}
          <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* Toolbar */}
            <div style={{ padding: "12px 24px", borderBottom: "1px solid #1E1E2E", display: "flex", gap: 10, alignItems: "center", background: "#0D0D14", flexWrap: "wrap" }}>
              <div style={{ position: "relative", flex: 1, maxWidth: 320 }}>
                <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#5A5A6E", fontSize: 13 }}>⌕</span>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search metadata…"
                  style={{ width: "100%", background: "#111118", border: "1px solid #1E1E2E", borderRadius: 8, padding: "8px 12px 8px 30px", color: "#F0EDE8", fontSize: 13, fontFamily: "inherit" }} />
              </div>
              <button className="action-btn" onClick={() => setSortAlpha(p => !p)} style={{ background: sortAlpha ? "rgba(200,169,110,0.1)" : "transparent", border: `1px solid ${sortAlpha ? "#C8A96E44" : "#1E1E2E"}`, color: sortAlpha ? "#C8A96E" : "#6A6A7E", borderRadius: 8, padding: "8px 14px", fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
                A↕Z
              </button>
              <button className="action-btn" onClick={() => setShowOnlyEdited(p => !p)} style={{ background: showOnlyEdited ? "rgba(200,169,110,0.1)" : "transparent", border: `1px solid ${showOnlyEdited ? "#C8A96E44" : "#1E1E2E"}`, color: showOnlyEdited ? "#C8A96E" : "#6A6A7E", borderRadius: 8, padding: "8px 14px", fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
                ✎ Edited only
              </button>
              {Object.keys(editedMeta).length > 0 && (
                <button className="action-btn" onClick={() => { setEditedMeta({}); notify("All edits reverted"); }} style={{ background: "transparent", border: "1px solid #3A1A1A", color: "#C85A5A", borderRadius: 8, padding: "8px 14px", fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
                  ↺ Revert all
                </button>
              )}
              <span style={{ fontSize: 12, color: "#3A3A4E", marginLeft: "auto" }}>{entries.length} fields shown</span>
            </div>

            {/* GPS Map */}
            {mapVisible && hasGPS && latDec && lngDec && (
              <div style={{ borderBottom: "1px solid #1E1E2E", animation: "fadeUp 0.2s ease" }}>
                <iframe
                  title="GPS Location"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${lngDec-0.01},${latDec-0.01},${parseFloat(lngDec)+0.01},${parseFloat(latDec)+0.01}&layer=mapnik&marker=${latDec},${lngDec}`}
                  style={{ width: "100%", height: 200, border: "none", display: "block" }}
                />
                <div style={{ padding: "8px 24px", background: "#0D0D14", fontSize: 11, color: "#5A5A6E", display: "flex", gap: 16 }}>
                  <span>📍 Lat: {latDec}</span>
                  <span>Lng: {lngDec}</span>
                  {allMeta.GPSAltitude && <span>Alt: {Number(allMeta.GPSAltitude).toFixed(1)}m</span>}
                  <a href={`https://www.google.com/maps?q=${latDec},${lngDec}`} target="_blank" rel="noreferrer" style={{ color: "#C8A96E", marginLeft: "auto" }}>Open in Maps ↗</a>
                </div>
              </div>
            )}

            {/* Fields */}
            <div style={{ flex: 1, overflow: "auto", padding: "8px 0" }}>
              {entries.length === 0 ? (
                <div style={{ padding: 48, textAlign: "center", color: "#3A3A4E", fontSize: 14 }}>
                  {search ? "No fields match your search" : "No metadata in this category"}
                </div>
              ) : entries.map(([key, rawVal], i) => {
                const val = getValue(key);
                const displayVal = formatValue(key, val) || String(val ?? "—");
                const isEdited = editedMeta.hasOwnProperty(key);
                const isEditable = EDITABLE_KEYS.has(key);
                const isEditing = editingKey === key;
                const group = getGroupForKey(key);

                return (
                  <div key={key} className="field-row" style={{
                    gap: 0, padding: "0 24px", minHeight: 44,
                    alignItems: "center",
                    borderBottom: "1px solid hsl(var(--border))",
                    background: isEdited ? "hsl(var(--primary) / 0.03)" : "transparent",
                    borderLeft: `3px solid ${isEdited ? "hsl(var(--primary))" : "transparent"}`,
                    animation: `fadeUp 0.2s ease ${Math.min(i * 0.01, 0.3)}s both`,
                  }}>
                    {/* Key */}
                    <div style={{ paddingRight: 12, paddingTop: 10, paddingBottom: 10 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: isEdited ? "#C8A96E" : "#8B8B9E", letterSpacing: 0.2 }}>{key}</div>
                      <div style={{ fontSize: 10, color: "#3A3A4E", marginTop: 1 }}>{group.replace(/[📁📷⚙️🌍🗓️🖼️📝🔧🔍]/g,'').trim()}</div>
                    </div>

                    {/* Value */}
                    <div style={{ padding: "8px 0" }}>
                      {isEditing ? (
                        <input
                          autoFocus
                          value={editVal}
                          onChange={e => setEditVal(e.target.value)}
                          onBlur={() => commitEdit(key)}
                          onKeyDown={e => { if (e.key === "Enter") commitEdit(key); if (e.key === "Escape") setEditingKey(null); }}
                          style={{ width: "100%", background: "#111118", border: "1px solid #C8A96E", borderRadius: 6, padding: "6px 10px", color: "#F0EDE8", fontSize: 13, fontFamily: "inherit" }}
                        />
                      ) : (
                        <div
                          onClick={() => isEditable && startEdit(key, val)}
                          title={isEditable ? "Click to edit" : undefined}
                          style={{
                            fontSize: 13, color: isEdited ? "#E8C98E" : "#C8C8D8",
                            cursor: isEditable ? "text" : "default",
                            wordBreak: "break-all", lineHeight: 1.5,
                            padding: "4px 0",
                            borderBottom: isEditable ? "1px dashed #2A2A3A" : "none",
                          }}
                        >
                          {displayVal || <span style={{ color: "#3A3A4E", fontStyle: "italic" }}>empty</span>}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                      {isEditable && !isEditing && (
                        <button className="edit-btn" onClick={() => startEdit(key, val)} title="Edit" style={{ opacity: 0, background: "transparent", border: "1px solid #2A2A3A", color: "#6A6A7E", borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontSize: 11, fontFamily: "inherit", transition: "opacity 0.1s" }}>✎</button>
                      )}
                      {isEdited && (
                        <button onClick={() => revertKey(key)} title="Revert" style={{ background: "transparent", border: "1px solid #3A1A1A", color: "#C85A5A", borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontSize: 11, fontFamily: "inherit" }}>↺</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Export Panel */}
            {showExport && (
              <div style={{ borderTop: "1px solid #1E1E2E", background: "#0D0D14", animation: "fadeUp 0.2s ease" }}>
                <div style={{ padding: "10px 24px", display: "flex", gap: 8, alignItems: "center", borderBottom: "1px solid #1E1E2E", flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#8B8B9E", marginRight: 4 }}>Format:</span>
                  {["JSON","CSV","TXT","XML","XMP"].map(f => (
                    <button key={f} onClick={() => setExportFmt(f)} className="action-btn" style={{ background: exportFmt === f ? "rgba(200,169,110,0.15)" : "transparent", border: `1px solid ${exportFmt === f ? "#C8A96E44" : "#1E1E2E"}`, color: exportFmt === f ? "#C8A96E" : "#5A5A6E", borderRadius: 6, padding: "5px 12px", fontSize: 11, cursor: "pointer", fontFamily: "inherit", fontWeight: 700 }}>{f}</button>
                  ))}
                  <button onClick={() => { navigator.clipboard?.writeText(exportData()); notify("Copied to clipboard"); }} style={{ marginLeft: "auto", background: "linear-gradient(135deg, #C8A96E22, #E8C98E11)", border: "1px solid #C8A96E44", color: "#C8A96E", borderRadius: 8, padding: "6px 16px", fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 700 }}>⎘ Copy</button>
                  <button onClick={() => {
                    const blob = new Blob([exportData()], { type: "text/plain" });
                    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
                    const ext = exportFmt.toLowerCase(); a.download = `${image.file.name.replace(/\.[^.]+$/,"")}_metadata.${ext}`;
                    a.click(); notify("Downloaded");
                  }} style={{ background: "transparent", border: "1px solid #2A2A3A", color: "#8B8B9E", borderRadius: 8, padding: "6px 14px", fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>↓ Save</button>
                </div>
                <pre style={{ margin: 0, padding: "14px 24px", fontSize: 11, color: "#7A9E7A", background: "#060608", maxHeight: 200, overflow: "auto", fontFamily: "monospace", lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                  {exportData()}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast */}
      {notification && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 9999,
          background: notification.type === "error" ? "#3A1A1A" : notification.type === "info" ? "#1A1A3A" : "#1A2E1A",
          border: `1px solid ${notification.type === "error" ? "#C85A5A44" : notification.type === "info" ? "#5A8AFF44" : "#2EA04344"}`,
          color: notification.type === "error" ? "#C85A5A" : notification.type === "info" ? "#8AB4FF" : "#7ACA7A",
          borderRadius: 10, padding: "12px 20px", fontSize: 13, fontWeight: 600,
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)", animation: "toastIn 0.25s ease",
        }}>
          {notification.msg}
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div style={{ position: "fixed", inset: 0, background: "#0A0A0Fdd", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, animation: "shimmer 1s infinite" }}>⬡</div>
            <div style={{ marginTop: 16, color: "#C8A96E", fontWeight: 600, fontSize: 14 }}>Parsing EXIF metadata…</div>
          </div>
        </div>
      )}
    </div>
  );
}