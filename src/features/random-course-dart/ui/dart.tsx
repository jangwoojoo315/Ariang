"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { getRecommendCourse } from "@/shared/api/generated/home/home";
import type { RecommendCourse } from "@/shared/api/generated/model";
import { resolveRegionPoint } from "../model/region-points";

/** 지도 실루엣(장식용 도형) — viewBox 300×400 기준 */
const KOREA_D =
  "M78,54 L112,44 L150,36 L186,42 L206,58 L222,84 L216,112 L232,146 L242,182 L236,212 L226,238 L212,258 L194,272 L174,266 L160,280 L140,288 L122,280 L106,288 L92,274 L84,254 L96,236 L86,218 L70,208 L62,190 L78,176 L64,158 L56,134 L70,116 L60,96 Z";

const CONFETTI_COLORS = ["#EF8970", "#E8B84B", "#3F8870", "#8FC2B1"];

// 다트 던지기 연출은 키프레임이 많아 인라인 스타일로 표현할 수 없어 CSS로 주입한다.
// 색상은 globals.css의 CSS 변수를 그대로 사용한다.
const DART_CSS = `
.dt-ov{position:fixed;inset:0;z-index:200;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(24,38,30,.5);backdrop-filter:blur(3px);animation:dtFade .22s ease-out}
@keyframes dtFade{from{opacity:0}to{opacity:1}}
.dt-panel{position:relative;display:flex;flex-direction:column;width:100%;max-width:900px;max-height:min(720px,calc(100vh - 40px));overflow:hidden;background:var(--bg);border-radius:24px;box-shadow:0 30px 70px rgba(24,38,30,.3);animation:dtUp .3s cubic-bezier(.22,1.2,.36,1)}
.dt-scroll{overflow-y:auto;min-height:0}
@keyframes dtUp{from{opacity:0;transform:translateY(18px) scale(.98)}to{opacity:1;transform:none}}
.dt-x{position:absolute;top:16px;right:16px;z-index:2;width:36px;height:36px;border:0;border-radius:50%;background:rgba(255,255,255,.9);box-shadow:0 2px 8px rgba(24,38,30,.14);cursor:pointer;display:grid;place-items:center;color:var(--text2);font-size:17px;line-height:1}
.dt-grid{display:grid;grid-template-columns:1fr;gap:0}
@media(min-width:820px){.dt-grid{grid-template-columns:1.05fr .95fr}}
.dt-left{padding:34px 30px 30px}
.dt-kicker{font-size:11px;letter-spacing:.16em;color:var(--text3);font-weight:700}
.dt-h1{font-size:26px;font-weight:800;line-height:1.3;color:var(--text);margin-top:8px;letter-spacing:-.5px}
.dt-sub{font-size:14px;color:var(--text2);margin-top:10px;line-height:1.65}
.dt-paper{position:relative;margin-top:22px;background:#FBF7EC;border-radius:12px;box-shadow:0 10px 26px rgba(46,38,24,.1),inset 0 0 0 1px #E9E1CB;display:grid;place-items:center;padding:18px;transform:rotate(-1deg)}
.dt-paper::before{content:'';position:absolute;inset:10px;border:1px dashed #DED2B4;border-radius:6px;pointer-events:none}
.dt-paper.hit{animation:dtShake .5s cubic-bezier(.36,.07,.19,.97)}
@keyframes dtShake{0%{transform:rotate(-1deg)}25%{transform:rotate(-2.2deg) translateY(3px)}50%{transform:rotate(0deg) translateY(-2px)}75%{transform:rotate(-1.5deg)}100%{transform:rotate(-1deg)}}
.dt-mapwrap{position:relative;width:min(240px,60vw,34vh)}
.dt-map{width:100%;display:block;overflow:visible}
.dt-land{fill:none;stroke:#9C8A64;stroke-width:2.4;stroke-linejoin:round}
.dt-hatch{fill:#E9DFC4;opacity:.65}
.dt-islet{stroke-width:1.5}
.dt-mark{fill:var(--accent);opacity:0;transition:opacity .4s}
.dt-mark.on{opacity:.8}
.dt-burst{position:absolute;width:6px;height:6px;border-radius:2px;opacity:0;pointer-events:none}
.dt-trailsvg{position:absolute;inset:0;pointer-events:none;overflow:visible}
.dt-trailsvg path{fill:none;stroke:var(--accent);stroke-width:2;stroke-dasharray:3 5;opacity:0}
.dt-trailsvg path.go{animation:dtTrace .78s ease-out}
@keyframes dtTrace{0%{opacity:0;stroke-dashoffset:120}30%{opacity:.7}100%{opacity:0;stroke-dashoffset:0}}
.dt-dart{position:absolute;left:0;top:0;width:26px;height:112px;opacity:0;pointer-events:none;transform-origin:50% 100%}
.dt-dart.windup{opacity:1;transform:translate(var(--sx),var(--sy)) rotate(-38deg);animation:dtWind .34s ease-in-out}
@keyframes dtWind{0%{transform:translate(var(--sx),var(--sy)) rotate(-38deg)}55%{transform:translate(calc(var(--sx) + 14px),calc(var(--sy) + 10px)) rotate(-52deg)}100%{transform:translate(var(--sx),var(--sy)) rotate(-38deg)}}
.dt-dart.arc{animation:dtArc .7s linear forwards}
@keyframes dtArc{
 0%{opacity:1;transform:translate(var(--sx),var(--sy)) rotate(-52deg) scale(1.05)}
 18%{transform:translate(calc(var(--sx) + (var(--dx) - var(--sx))*.18),calc(var(--sy) + (var(--dy) - var(--sy))*.18 - 62px)) rotate(-38deg) scale(.98)}
 38%{transform:translate(calc(var(--sx) + (var(--dx) - var(--sx))*.38),calc(var(--sy) + (var(--dy) - var(--sy))*.38 - 102px)) rotate(-22deg) scale(.9)}
 58%{transform:translate(calc(var(--sx) + (var(--dx) - var(--sx))*.58),calc(var(--sy) + (var(--dy) - var(--sy))*.58 - 104px)) rotate(-8deg) scale(.87)}
 80%{transform:translate(calc(var(--sx) + (var(--dx) - var(--sx))*.8),calc(var(--sy) + (var(--dy) - var(--sy))*.8 - 62px)) rotate(2deg) scale(.93)}
 100%{opacity:1;transform:translate(var(--dx),var(--dy)) rotate(6deg) scale(1)}}
.dt-dart.set{opacity:1;transform:translate(var(--dx),var(--dy)) rotate(6deg);animation:dtJit .72s cubic-bezier(.28,1.6,.5,1)}
@keyframes dtJit{0%{transform:translate(var(--dx),var(--dy)) rotate(6deg)}22%{transform:translate(var(--dx),var(--dy)) rotate(-8deg)}44%{transform:translate(var(--dx),var(--dy)) rotate(10deg)}66%{transform:translate(var(--dx),var(--dy)) rotate(3deg)}100%{transform:translate(var(--dx),var(--dy)) rotate(6deg)}}
.dt-stamp{position:absolute;font-size:12px;font-weight:800;color:var(--accent);border:2px solid var(--accent);padding:2px 7px;border-radius:4px;transform:translate(-50%,-50%) rotate(-9deg);opacity:0;letter-spacing:.06em;white-space:nowrap}
.dt-stamp.on{animation:dtStamp .5s cubic-bezier(.2,1.6,.4,1) forwards}
@keyframes dtStamp{0%{opacity:0;transform:translate(-50%,-50%) rotate(-9deg) scale(1.8)}100%{opacity:1;transform:translate(-50%,-50%) rotate(-9deg) scale(1)}}
.dt-right{padding:34px 30px 0;display:flex;flex-direction:column;gap:16px;border-top:1px solid var(--border)}
@media(min-width:820px){.dt-right{border-top:0;border-left:1px solid var(--border)}}
.dt-resting{flex:1;min-height:140px;display:flex;align-items:center;justify-content:center;text-align:center;border:1.5px dashed var(--border);border-radius:18px;padding:28px 20px;font-size:14px;color:var(--text3);line-height:1.7}
.dt-err{border:1.5px solid var(--accent);background:var(--accent-light);color:var(--primary-dark);border-radius:18px;padding:18px 20px;font-size:13px;line-height:1.7;text-align:center}
.dt-card{background:var(--surface);border-radius:18px;padding:24px;box-shadow:0 8px 26px rgba(24,38,30,.08);opacity:0;transform:translateY(14px);transition:opacity .35s,transform .45s cubic-bezier(.22,1.2,.36,1)}
.dt-card.hidden{display:none}
.dt-card.up{opacity:1;transform:none}
.dt-thumb{width:100%;height:140px;object-fit:cover;border-radius:12px;margin-bottom:16px;display:block;background:var(--tag-bg)}
.dt-tag{display:inline-flex;background:var(--tag-bg);color:var(--primary-dark);font-size:11px;font-weight:700;padding:5px 11px;border-radius:20px;letter-spacing:.04em}
.dt-name{font-size:22px;font-weight:800;color:var(--text);margin-top:12px;letter-spacing:-.4px;line-height:1.35}
.dt-desc{font-size:14px;color:var(--text2);line-height:1.7;margin-top:10px;text-wrap:pretty}
.dt-meta{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}
.dt-meta span{background:var(--tag-bg);color:var(--primary-dark);font-size:12px;font-weight:700;padding:5px 10px;border-radius:8px}
.dt-spots{margin-top:20px;border-top:1px solid var(--border);padding-top:16px}
.dt-spots-h{font-size:12px;font-weight:800;color:var(--text3);letter-spacing:.04em;margin-bottom:10px}
.dt-spot{display:flex;gap:10px;align-items:flex-start;padding:8px 0;width:100%;text-align:left;background:none;border:0;font:inherit;color:inherit}
.dt-spot + .dt-spot{border-top:1px solid var(--border)}
.dt-spot.tappable{cursor:pointer}
.dt-spot.tappable:hover .dt-spot-n{color:var(--primary)}
.dt-spot-img{width:52px;height:52px;object-fit:cover;border-radius:10px;flex-shrink:0;background:var(--tag-bg)}
.dt-spot-body{flex:1;min-width:0}
.dt-spot-n{font-size:13.5px;font-weight:700;color:var(--text);line-height:1.4;display:flex;align-items:center;gap:5px;transition:color .15s}
.dt-spot-caret{font-size:9px;color:var(--text3);flex-shrink:0;transition:transform .2s}
.dt-spot-caret.up{transform:rotate(180deg)}
.dt-spot-o{font-size:12px;color:var(--text2);line-height:1.55;margin-top:3px;white-space:pre-line;word-break:break-word}
.dt-spot-o.clamp{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.dt-btns{display:flex;gap:10px;position:sticky;bottom:0;background:linear-gradient(to bottom,transparent,var(--bg) 24%);padding:16px 0 30px;margin-top:auto}
.dt-btns button{border:0;font-family:inherit;font-size:15px;font-weight:700;padding:15px;border-radius:14px;cursor:pointer;transition:transform .12s,opacity .2s}
.dt-btns button:active{transform:scale(.97)}
.dt-btns button:disabled{opacity:.6;cursor:default;transform:none}
.dt-throw{flex:1;background:var(--primary);color:#fff}
.dt-fab{position:absolute;right:24px;bottom:24px;z-index:40;width:60px;height:60px;border:0;border-radius:50%;background:var(--primary);color:#fff;box-shadow:0 8px 24px rgba(38,96,78,.34);cursor:pointer;display:grid;place-items:center;transition:transform .15s,box-shadow .15s}
.dt-fab:hover{transform:translateY(-2px) scale(1.04);box-shadow:0 12px 30px rgba(38,96,78,.4)}
.dt-fab:active{transform:scale(.95)}
.dt-fab::after{content:attr(data-label);position:absolute;right:72px;white-space:nowrap;background:rgba(24,38,30,.9);color:#fff;font-size:12px;font-weight:700;padding:7px 11px;border-radius:9px;opacity:0;pointer-events:none;transition:opacity .18s}
.dt-fab:hover::after{opacity:1}
@media(max-width:767px){.dt-fab{right:16px;bottom:16px;width:54px;height:54px}.dt-fab::after{display:none}}
`;

export function DartIcon({ size = 26, color = "#fff" }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="10" cy="14" r="7.5" />
      <circle cx="10" cy="14" r="3.4" />
      <path d="M10 14 L20.5 3.5" />
      <path d="M16.4 3.1 L20.9 3.1 L20.9 7.6" />
    </svg>
  );
}

export function DartThrowModal({ onClose }: { onClose: () => void }) {
  const dartRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<SVGCircleElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const stampRef = useRef<HTMLDivElement>(null);
  const mapWrapRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<SVGPathElement>(null);

  // 던지는 중 중복 실행 방지
  const busyRef = useRef(false);
  const timersRef = useRef<number[]>([]);
  const aliveRef = useRef(true);

  const [result, setResult] = useState<RecommendCourse | null>(null);
  const [regionLabel, setRegionLabel] = useState("");
  const [thrown, setThrown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // 설명을 펼쳐 놓은 코스 구성 관광지 id 모음
  const [expandedSpots, setExpandedSpots] = useState<string[]>([]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // 연출·요청 도중 닫히면 남은 타이머가 언마운트된 컴포넌트를 건드리지 않도록 정리
  useEffect(() => {
    const timers = timersRef;
    const alive = aliveRef;
    alive.current = true;
    return () => {
      alive.current = false;
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, []);

  const later = (fn: () => void, ms: number) => {
    timersRef.current.push(window.setTimeout(fn, ms));
  };

  const confetti = (left: number, top: number) => {
    const wrap = mapWrapRef.current;
    if (!wrap) return;
    for (let i = 0; i < 14; i++) {
      const piece = document.createElement("div");
      piece.className = "dt-burst";
      piece.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
      piece.style.left = `${left}px`;
      piece.style.top = `${top}px`;
      const angle = Math.random() * Math.PI * 2;
      const radius = 26 + Math.random() * 34;
      wrap.appendChild(piece);
      const anim = piece.animate(
        [
          { opacity: 1, transform: "translate(-50%,-50%) scale(1) rotate(0)" },
          {
            opacity: 0,
            transform: `translate(calc(-50% + ${Math.cos(angle) * radius}px),calc(-50% + ${Math.sin(angle) * radius}px)) scale(.3) rotate(220deg)`,
          },
        ],
        { duration: 640 + Math.random() * 260, easing: "cubic-bezier(.2,.7,.4,1)" },
      );
      anim.onfinish = () => piece.remove();
    }
  };

  /** 코스를 받아온 뒤 지도에 다트를 꽂는 연출 */
  const animateThrow = (course: RecommendCourse) => {
    const dart = dartRef.current;
    const card = cardRef.current;
    const mark = markRef.current;
    const paper = paperRef.current;
    const stamp = stampRef.current;
    const wrap = mapWrapRef.current;
    const trail = trailRef.current;
    if (!dart || !card || !mark || !paper || !stamp || !wrap || !trail) {
      busyRef.current = false;
      return;
    }

    card.classList.remove("up");
    stamp.className = "dt-stamp";
    mark.setAttribute("class", "dt-mark");

    // 코스의 지역(region)으로 꽂을 자리를 정한다.
    const point = resolveRegionPoint(course.region);

    // 지도 SVG 좌표(300 기준)를 실제 렌더 크기로 환산
    const w = wrap.offsetWidth;
    const target = { left: (point.x / 300) * w, top: (point.y / 300) * w };
    const sx = -6;
    const sy = wrap.offsetHeight - 70;

    dart.style.setProperty("--sx", `${sx}px`);
    dart.style.setProperty("--sy", `${sy}px`);
    dart.style.setProperty("--dx", `${target.left - 13}px`);
    dart.style.setProperty("--dy", `${target.top - 112}px`);
    mark.setAttribute("cx", String(point.x));
    mark.setAttribute("cy", String(point.y));
    dart.className = "dt-dart windup";

    later(() => {
      trail.setAttribute(
        "d",
        `M${sx + 13},${sy + 112} Q${(sx + 13 + target.left) / 2},${sy - 150} ${target.left},${target.top}`,
      );
      trail.classList.remove("go");
      void trail.getBoundingClientRect(); // 애니메이션 재시작을 위한 강제 리플로우
      trail.classList.add("go");
      dart.className = "dt-dart arc";

      later(() => {
        dart.className = "dt-dart set";
        paper.classList.add("hit");
        mark.setAttribute("class", "dt-mark on");
        confetti(target.left, target.top);
        stamp.style.left = `${target.left + 46}px`;
        stamp.style.top = `${target.top - 18}px`;
        stamp.textContent = point.label;
        stamp.className = "dt-stamp on";
        setResult(course);
        setExpandedSpots([]);
        setRegionLabel(point.label);
        setThrown(true);

        later(() => {
          paper.classList.remove("hit");
          card.classList.add("up");
          busyRef.current = false;
        }, 460);
      }, 700);
    }, 340);
  };

  const go = async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setError(null);
    setLoading(true);

    let course: RecommendCourse;
    try {
      course = await getRecommendCourse();
    } catch {
      if (!aliveRef.current) return;
      setLoading(false);
      setError("코스를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
      busyRef.current = false;
      return;
    }
    if (!aliveRef.current) return;

    setLoading(false);
    animateThrow(course);
  };

  return (
    <div
      className="dt-ov"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="dt-panel">
        <button className="dt-x" onClick={onClose} aria-label="닫기">
          ✕
        </button>
        <div className="dt-scroll">
          <div className="dt-grid">
            <div className="dt-left">
              <div className="dt-kicker">RANDOM COURSE</div>
              <div className="dt-h1">
                지도에 다트를 던져
                <br />
                오늘의 코스를 뽑아요
              </div>
              <div className="dt-sub">
                꽂힌 자리가 목적지. 아이랑이 그 지역의 가족 코스를 꺼내드려요.
              </div>
              <div className="dt-paper" ref={paperRef}>
                <div className="dt-mapwrap" ref={mapWrapRef}>
                  <svg className="dt-map" viewBox="0 0 300 400">
                    <path className="dt-hatch" d={KOREA_D} />
                    <path className="dt-land" d={KOREA_D} />
                    <ellipse className="dt-hatch" cx="118" cy="344" rx="30" ry="15" />
                    <ellipse className="dt-land" cx="118" cy="344" rx="30" ry="15" />
                    {/* 울릉도 — 실제 거리대로 두면 지도 밖으로 나가 동해 쪽에 당겨 그린다 */}
                    <circle className="dt-hatch" cx="258" cy="104" r="5.5" />
                    <circle className="dt-land dt-islet" cx="258" cy="104" r="5.5" />
                    {/* 독도 */}
                    <circle className="dt-hatch" cx="277" cy="114" r="2.6" />
                    <circle className="dt-land dt-islet" cx="277" cy="114" r="2.6" />
                    <circle className="dt-mark" ref={markRef} r="22" />
                  </svg>
                  <svg className="dt-trailsvg">
                    <path ref={trailRef} />
                  </svg>
                  <div className="dt-dart" ref={dartRef}>
                    <svg viewBox="0 0 26 112" width="26" height="112">
                      <path d="M13,112 L8,84 L18,84 Z" fill="#C9C2B4" />
                      <rect x="10" y="38" width="6" height="48" rx="2.5" fill="#7E7361" />
                      <rect x="9" y="28" width="8" height="12" rx="2" fill="#F0C56A" />
                      <path d="M13,3 L24,23 L18,31 L13,19 L8,31 L2,23 Z" fill="#EE9A5C" />
                    </svg>
                  </div>
                  <div className="dt-stamp" ref={stampRef}>
                    당첨
                  </div>
                </div>
              </div>
            </div>
            <div className="dt-right">
              {!thrown && !error && (
                <div className="dt-resting">
                  <div>
                    아직 뽑지 않았어요
                    <br />
                    다트를 던지면 코스가 나타나요
                  </div>
                </div>
              )}
              {error && <div className="dt-err">{error}</div>}

              <div className={`dt-card${thrown ? "" : " hidden"}`} ref={cardRef}>
                {result?.imgUrl && (
                  <Image
                    className="dt-thumb"
                    src={result.imgUrl}
                    alt=""
                    width={520}
                    height={140}
                    unoptimized
                  />
                )}
                <span className="dt-tag">{result?.theme ?? "추천 코스"}</span>
                <div className="dt-name">{result?.title}</div>
                {result?.overview && <div className="dt-desc">{result.overview}</div>}
                <div className="dt-meta">
                  {regionLabel && <span>{regionLabel}</span>}
                  {result?.takeTime && <span>{result.takeTime}</span>}
                  {result?.distance && <span>{result.distance}</span>}
                </div>

                {!!result?.spots?.length && (
                  <div className="dt-spots">
                    <div className="dt-spots-h">코스에 담긴 곳 {result.spots.length}곳</div>
                    {result.spots.map((spot, index) => {
                      // 같은 관광지가 두 번 내려오는 코스가 있어 순번까지 붙여 행을 구분한다
                      const rowId = `${spot.subContentId}-${index}`;
                      const open = expandedSpots.includes(rowId);
                      // 설명이 있을 때만 눌러서 펼칠 수 있다
                      const tappable = !!spot.overview;
                      return (
                        <button
                          type="button"
                          className={`dt-spot${tappable ? " tappable" : ""}`}
                          key={rowId}
                          aria-expanded={tappable ? open : undefined}
                          onClick={() => {
                            if (!tappable) return;
                            setExpandedSpots((prev) =>
                              prev.includes(rowId)
                                ? prev.filter((id) => id !== rowId)
                                : [...prev, rowId],
                            );
                          }}
                        >
                          {spot.imgUrl && (
                            <Image
                              className="dt-spot-img"
                              src={spot.imgUrl}
                              alt={spot.imgAlt ?? ""}
                              width={52}
                              height={52}
                              unoptimized
                            />
                          )}
                          <div className="dt-spot-body">
                            <div className="dt-spot-n">
                              <span>{spot.name}</span>
                              {tappable && (
                                <span className={`dt-spot-caret${open ? " up" : ""}`}>▾</span>
                              )}
                            </div>
                            {spot.overview && (
                              <div className={`dt-spot-o${open ? "" : " clamp"}`}>
                                {spot.overview}
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="dt-btns">
                <button className="dt-throw" onClick={go} disabled={loading}>
                  {loading ? "코스를 뽑는 중…" : thrown ? "한 번 더 던지기" : "다트 던지기"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 랜덤 코스 다트 FAB.
 * `position:absolute`이므로 `position:relative`인 화면 컨테이너 안에 두어야 한다.
 */
export function DartFab() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <style>{DART_CSS}</style>
      <button
        className="dt-fab"
        data-label="랜덤 코스 뽑기"
        onClick={() => setOpen(true)}
        aria-label="랜덤 코스 뽑기"
      >
        <DartIcon />
      </button>
      {open && <DartThrowModal onClose={() => setOpen(false)} />}
    </>
  );
}
