import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface ParticipantInput {
    nickname: string;
    abstractLocation: string;
    transports: string[];
    distanceTolerance: string;
    atmospherePreference: string;
}

interface PiniRequestBody {
    participants: ParticipantInput[];
    category: string;
    excludePlaces?: string[];
}

interface PerParticipantTime {
    nickname: string;
    minutes: number;
    transport: string;
}

interface ReviewIntelligence {
    authenticCount: number;
    pros: string[];
    cons: string[];
}

// AI가 반환하는 구조 (이동 시간 제외 — 직접 계산함)
interface PiniPlaceAiResponse {
    placeName: string;
    reasoning: string;
    atmosphereMatch: string;
    fairnessScore: number;
    balanceTag: string;
    rating: number;
    reviewIntelligence: ReviewIntelligence;
}

interface KakaoPlace {
    id: string;
    place_name: string;
    road_address_name: string;
    address_name: string;
    x: string; // longitude
    y: string; // latitude
    category_name: string;
}

interface GeoCoord {
    lat: number;
    lng: number;
}

// ── 카테고리 한국어 변환 ──────────────────────────────────────────────────
const CATEGORY_KO: Record<string, string> = {
    cafe:       "카페",
    restaurant: "음식점",
    bar:        "술집",
    brunch:     "브런치",
    dessert:    "디저트",
};

// ── 지오코딩 ──────────────────────────────────────────────────────────────
async function geocodeLocation(location: string): Promise<GeoCoord | null> {
    const res = await fetch(
        `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(location)}&size=1`,
        { headers: { Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}` } }
    );
    const data = await res.json();
    const doc = data.documents?.[0];
    if (!doc) return null;
    return { lat: Number.parseFloat(doc.y), lng: Number.parseFloat(doc.x) };
}

// ── 좌표 중심점 계산 ──────────────────────────────────────────────────────
function computeCentroid(coords: GeoCoord[]): GeoCoord {
    const lat = coords.reduce((sum, c) => sum + c.lat, 0) / coords.length;
    const lng = coords.reduce((sum, c) => sum + c.lng, 0) / coords.length;
    return { lat, lng };
}

// ── 거리 계산 (Haversine) ──────────────────────────────────────────────────
function haversineKm(a: GeoCoord, b: GeoCoord): number {
    const R = 6371;
    const dLat = (b.lat - a.lat) * (Math.PI / 180);
    const dLng = (b.lng - a.lng) * (Math.PI / 180);
    const h =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(a.lat * (Math.PI / 180)) *
            Math.cos(b.lat * (Math.PI / 180)) *
            Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

// ── 이동 시간 추정 ────────────────────────────────────────────────────────
function estimateMinutes(distKm: number, transport: string): number {
    const road = distKm * 1.35;
    switch (transport) {
        case "walk":    return Math.round((road / 4.5) * 60);
        case "bike":    return Math.round((road / 14) * 60);
        case "car":     return Math.round((road / 30) * 60);
        case "transit": return Math.round(8 + (road / 28) * 60);
        default:        return Math.round(8 + (road / 28) * 60);
    }
}

// ── 최선 교통수단 선택 ────────────────────────────────────────────────────
// 사용 가능한 수단 중 실제 소요 시간이 가장 짧은 수단을 반환
// (도보는 2.5km 초과 시 제외)
function pickBestTransport(transports: string[], distKm: number): string {
    if (transports.length === 0) return "transit";
    const usable = transports.filter((t) => !(t === "walk" && distKm > 2.5));
    if (usable.length === 0) return transports[0];
    return usable.reduce((best, t) =>
        estimateMinutes(distKm, t) < estimateMinutes(distKm, best) ? t : best
    );
}

// ── 참가자별 이동 시간 계산 ───────────────────────────────────────────────
function calcPerParticipantTime(
    participants: (ParticipantInput & { coord: GeoCoord | null })[],
    placeCoord: GeoCoord
): PerParticipantTime[] {
    return participants.map((p) => {
        if (!p.coord) {
            return { nickname: p.nickname, minutes: 30, transport: p.transports[0] ?? "transit" };
        }
        const dist = haversineKm(p.coord, placeCoord);
        const transport = pickBestTransport(p.transports, dist);
        const minutes = estimateMinutes(dist, transport);
        return { nickname: p.nickname, minutes, transport };
    });
}

// ── Kakao 좌표 기반 장소 검색 ─────────────────────────────────────────────
// 실제 중심 좌표 반경으로 검색 — 지역명 추론보다 정확
async function searchKakaoPlacesByCoord(
    category: string,
    lat: number,
    lng: number,
    radius = 2000
): Promise<KakaoPlace[]> {
    const res = await fetch(
        `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(category)}&y=${lat}&x=${lng}&radius=${radius}&size=10&sort=distance`,
        { headers: { Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}` } }
    );
    const data = await res.json();
    return (data.documents ?? []) as KakaoPlace[];
}

// ── Kakao 지역명 장소 검색 (좌표 없을 때 fallback) ────────────────────────
async function searchKakaoPlacesByArea(category: string, area: string): Promise<KakaoPlace[]> {
    const query = `${area} ${category}`;
    const res = await fetch(
        `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}&size=10`,
        { headers: { Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}` } }
    );
    const data = await res.json();
    return (data.documents ?? []) as KakaoPlace[];
}

// ── 네이버 블로그 리뷰 (광고 필터링) ─────────────────────────────────────
async function fetchNaverBlogReviews(placeName: string): Promise<string[]> {
    const query = encodeURIComponent(`${placeName} 후기`);
    const res = await fetch(
        `https://openapi.naver.com/v1/search/blog?query=${query}&display=7&sort=sim`,
        {
            headers: {
                "X-Naver-Client-Id": process.env.NAVER_CLIENT_ID!,
                "X-Naver-Client-Secret": process.env.NAVER_CLIENT_SECRET!,
            },
        }
    );
    const data = await res.json();
    const adKeywords = /협찬|광고|제공|제공받아|지원받아|협찬받아|무료로 받|소정의 원고료/i;
    const filtered = (data.items ?? []).filter(
        (item: { description: string; title: string }) =>
            !adKeywords.test(item.title) && !adKeywords.test(item.description)
    );
    return filtered.map((item: { description: string }) =>
        item.description.replace(/<[^>]+>/g, "")
    );
}

// ── POST handler ──────────────────────────────────────────────────────────
export async function POST(req: Request) {
    try {
        return await runPini(req);
    } catch (err) {
        console.error("[PINI] 오류:", err);
        const msg = err instanceof Error ? err.message : "AI 추천 중 오류가 발생했어요.";
        const isOverload =
            msg.includes("503") ||
            msg.toLowerCase().includes("unavailable") ||
            msg.toLowerCase().includes("high demand");
        return Response.json(
            { error: isOverload ? "AI 서버가 일시적으로 혼잡해요. 잠시 후 다시 시도해 주세요." : msg },
            { status: isOverload ? 503 : 500 }
        );
    }
}

async function runPini(req: Request) {
    const { participants, category, excludePlaces } = (await req.json()) as PiniRequestBody;

    if (participants.length === 0) {
        throw new Error("참가자 정보가 없어요.");
    }

    const participantDesc = participants
        .map(
            (p) =>
                `- ${p.nickname}: 출발지 "${p.abstractLocation}", 교통수단 [${p.transports.join(", ")}], 이동거리 선호: ${p.distanceTolerance}, 분위기 선호: ${p.atmospherePreference}`
        )
        .join("\n");

    // ── Step 1: 참가자 지오코딩 먼저 ─────────────────────────────────────────
    // 실제 좌표로 중심점을 계산해야 장소가 정확한 지역에서 나옴
    const participantCoords = await Promise.all(
        participants.map((p) => geocodeLocation(p.abstractLocation))
    );

    const participantsWithCoord = participants.map((p, i) => ({
        ...p,
        coord: participantCoords[i],
    }));

    console.log(
        "참가자 좌표:",
        participantsWithCoord.map((p) => `${p.nickname}: ${p.coord?.lat},${p.coord?.lng}`)
    );

    // ── Step 2: 중심 좌표 계산 → 장소 검색 ───────────────────────────────────
    const validCoords = participantCoords.filter((c): c is GeoCoord => c !== null);
    const categoryKo = CATEGORY_KO[category] ?? category;

    let kakaoPlaces: KakaoPlace[];

    if (validCoords.length >= 1) {
        // 좌표 기반: 실제 중심점 계산 후 반경 검색 (정확)
        const center = computeCentroid(validCoords);
        console.log("중심 좌표:", center);
        kakaoPlaces = await searchKakaoPlacesByCoord(categoryKo, center.lat, center.lng);
    } else {
        // fallback: 좌표를 전혀 못 얻은 경우 AI로 지역 추론
        console.log("좌표 없음 → AI 지역 추론 fallback");
        const areaRes = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: `
참가자 정보:
${participantDesc}

카테고리: ${category}

위 참가자들의 출발지와 교통수단을 고려했을 때, 모두에게 이동 시간이 공평한 서울 내 중간 지점을 하나 도출하세요.
카카오맵에서 바로 검색 가능한 형태로, "강서구 화곡동" 또는 "마포구 합정동" 같이 "구 + 동" 수준으로 작성하세요.
지역명만 단순 문자열로 반환하세요.
            `,
            config: {
                responseMimeType: "application/json",
                responseSchema: { type: Type.STRING },
            },
        });
        const targetArea = JSON.parse(areaRes.text!) as string;
        console.log("타깃 지역 (AI fallback):", targetArea);
        kakaoPlaces = await searchKakaoPlacesByArea(categoryKo, targetArea);
    }

    if (kakaoPlaces.length === 0) {
        throw new Error(`근처에서 ${category} 장소를 찾지 못했어요. 다시 시도해주세요.`);
    }

    // 이미 추천된 장소 제외
    const excludeSet = new Set((excludePlaces ?? []).map((n) => n.replace(/\s+/g, "")));
    const candidates = kakaoPlaces.filter(
        (p) => !excludeSet.has(p.place_name.replace(/\s+/g, ""))
    );

    if (candidates.length < 2) {
        throw new Error("추천 가능한 새로운 장소가 부족해요. 범위를 바꿔서 다시 시도해보세요.");
    }

    console.log("카카오 후보 장소:", candidates.map((p) => p.place_name));

    // ── Step 3: 후보 장소들의 네이버 블로그 리뷰 수집 ─────────────────────
    const reviewResults = await Promise.all(
        candidates.map((p) => fetchNaverBlogReviews(p.place_name))
    );

    // 리뷰가 1개 이상인 장소 우선, 부족하면 전체 상위 5개
    const withReviews = candidates
        .map((place, i) => ({ place, reviews: reviewResults[i] }))
        .filter((r) => r.reviews.length > 0);

    const analysisTargets = withReviews.length >= 2
        ? withReviews
        : candidates.map((place, i) => ({ place, reviews: reviewResults[i] })).slice(0, 5);

    console.log("리뷰 포함 장소:", analysisTargets.map((r) => r.place.place_name));

    // ── Step 4: AI가 리뷰 분석 후 장소 선정 ─────────────────────────────────
    const reviewText = analysisTargets
        .map(
            (r) =>
                `[${r.place.place_name}] (주소: ${r.place.road_address_name || r.place.address_name})\n${r.reviews.slice(0, 5).join("\n")}`
        )
        .join("\n\n");

    const excludeText = excludePlaces?.length
        ? `\n이미 추천된 장소이니 절대 포함하지 마세요: ${excludePlaces.join(", ")}`
        : "";

    const aiRes = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: `
분류 카테고리: ${category}
참가자 선호 정보:
${participantDesc}
${excludeText}

[카카오맵에서 확인된 실존 장소 및 네이버 블로그 실방문 후기 데이터]
${reviewText}

위의 실제 장소 목록과 방문자 후기 데이터를 정밀하게 분석하여, 참가자들의 분위기 선호와 후기 신뢰도를 기준으로 최적인 장소 3~5곳을 선정해 주세요.
반드시 위 목록에 있는 장소명을 그대로 사용하세요. 목록에 없는 장소는 절대 추가하지 마세요.
        `,
        config: {
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            systemInstruction: `
당신은 서울 지역의 모임 장소를 추천하고 데이터를 정밀하게 분석하는 전문 AI 피니(PINI)입니다.
사용자가 제공한 정보와 실제 방문자 후기 데이터를 바탕으로, 반드시 아래 규칙과 지정된 JSON 스키마 형식에 맞춰 모든 텍스트 필드를 **100% 한국어(Korean)**로 작성해야 합니다.

[기본 규칙]
1. 반드시 전달받은 실방문 후기 데이터에 존재하는 매장만 분석하여 결과에 포함하세요.
2. 같은 장소를 두 번 포함하지 마세요. placeName이 중복되면 안 됩니다.
3. 이동 시간(perParticipantTime)은 별도로 계산되므로 당신은 포함하지 않아도 됩니다.
4. 'reasoning', 'pros', 'cons' 등 모든 텍스트 영역은 반드시 명확하고 자연스러운 한국어 문장이나 단어로 기술되어야 합니다. 영어를 섞어 쓰지 마세요.
5. 응답은 다른 부가적인 설명 마크다운 블록(예: \`\`\`json) 없이 순수한 JSON 배열 포맷으로만 출력되어야 합니다.

[데이터 분석 및 출력 가이드라인]
- placeName: 추천된 매장의 이름 (제공된 데이터의 이름 기준, 절대 변형하지 말 것)
- reasoning: 선호 분위기 일치 여부, 실제 후기의 신뢰성을 종합하여 추천하는 이유를 신뢰감 있는 한국어 문장으로 작성하세요.
- atmosphereMatch: 선호 분위기가 매칭되는 참가자 명수나 매칭 상태를 한국어로 적으세요. (예: "3명 일치", "모두 만족")
- rating: 블로그 리뷰의 전반적인 감정을 분석하여 1.0에서 5.0 사이의 점수를 부여하세요.
- reviewIntelligence: authenticCount(분석에 활용된 순수 후기 수), pros(실제 방문자들이 꼽은 생생한 한국어 장점 2-3개), cons(아쉬운 점이나 주의사항 1-2개)를 포함하세요.
            `,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                minItems: 3,
                maxItems: 5,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        placeName: { type: Type.STRING },
                        reasoning: { type: Type.STRING },
                        atmosphereMatch: { type: Type.STRING },
                        fairnessScore: { type: Type.INTEGER },
                        balanceTag: { type: Type.STRING },
                        rating: { type: Type.NUMBER },
                        reviewIntelligence: {
                            type: Type.OBJECT,
                            properties: {
                                authenticCount: { type: Type.INTEGER },
                                pros: { type: Type.ARRAY, items: { type: Type.STRING } },
                                cons: { type: Type.ARRAY, items: { type: Type.STRING } },
                            },
                        },
                    },
                    required: [
                        "placeName",
                        "reasoning",
                        "atmosphereMatch",
                        "fairnessScore",
                        "balanceTag",
                        "rating",
                        "reviewIntelligence",
                    ],
                },
            },
        },
    });

    if (!aiRes.text) throw new Error("Gemini 응답이 비어있어요.");

    let parsed: PiniPlaceAiResponse[];
    try {
        parsed = JSON.parse(aiRes.text) as PiniPlaceAiResponse[];
    } catch {
        throw new Error("AI 응답 형식이 올바르지 않아요. 다시 시도해주세요.");
    }

    // ── Step 5: AI 선택 장소에 카카오 데이터 매칭 + 이동 시간 직접 계산 ───
    const seenIds = new Set<string>();

    const places = parsed
        .map((place) => {
            const cleanAI = place.placeName.replace(/\s+/g, "");
            const matched = analysisTargets.find((r) => {
                const cleanKakao = r.place.place_name.replace(/\s+/g, "");
                return cleanKakao.includes(cleanAI) || cleanAI.includes(cleanKakao);
            });

            if (!matched) return null;

            const kakao = matched.place;
            if (seenIds.has(kakao.id)) return null;
            seenIds.add(kakao.id);

            const placeCoord: GeoCoord = {
                lat: Number.parseFloat(kakao.y),
                lng: Number.parseFloat(kakao.x),
            };

            const perParticipantTime = calcPerParticipantTime(participantsWithCoord, placeCoord);

            const times = perParticipantTime.map((p) => p.minutes);
            const diff = Math.max(...times) - Math.min(...times);
            const fairnessScore = Math.max(0, Math.round(100 - diff * 3));

            return {
                ...place,
                placeName: kakao.place_name,
                placeId: kakao.id,
                placeAddress: kakao.road_address_name || kakao.address_name,
                lat: placeCoord.lat,
                lng: placeCoord.lng,
                category,
                perParticipantTime,
                fairnessScore,
            };
        })
        .filter(Boolean);

    if (places.length < 1) {
        throw new Error("AI 추천 결과를 장소 데이터와 연결하지 못했어요. 다시 시도해주세요.");
    }

    return Response.json(places);
}
