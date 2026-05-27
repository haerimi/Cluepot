import { GoogleGenAI, Type } from "@google/genai";

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
// 카카오 맵 API에서 위치와 장소이름 가져오기
async function searchKakaoPlace(query: string) {
    const res = await fetch(
        `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}&size=1`,
        { headers: { Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}` } }
    );
    const data = await res.json();
    return data.documents?.[0] ?? null;
}

// 네이버 검색 API를 이용해 장소 후기 검색
async function fetchNaverBlogReviews(placeName: string): Promise<string[]> {
    const query = encodeURIComponent(`${placeName} 후기`);
    const res = await fetch(
        `https://openapi.naver.com/v1/search/blog?query=${query}&display=10&sort=sim`,
        {
            headers: {
                'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID!,
                'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET!,
            }
        }
    )

    // 검색 결과를 JSON 형태로 받음
    const data = await res.json();

    // 광고성 필터링
    const adKeywords = /협찬|광고|제공|제공받아|지원받아|협찬받아|무료로 받|소정의 원고료/i;
    const filtered = data.items.filter((item: { description: string, title: string }) =>
        !adKeywords.test(item.title) && !adKeywords.test(item.description)
    );

    // 본문 요약 텍스트만 추출
    return filtered.map((item: { description: string }) =>
        item.description.replace(/<[^>]+>/g, '') // HTML 태그 제거
    );
}

export async function POST(req: Request) {
    try {
        return await runPini(req);
    } catch (err) {
        const msg = err instanceof Error ? err.message : 'AI 추천 중 오류가 발생했어요.';
        const isOverload = msg.includes('503') || msg.toLowerCase().includes('unavailable') || msg.toLowerCase().includes('high demand');
        return Response.json(
            { error: isOverload ? 'AI 서버가 일시적으로 혼잡해요. 잠시 후 다시 시도해 주세요.' : msg },
            { status: isOverload ? 503 : 500 }
        );
    }
}

async function runPini(req: Request) {
    const { participants, category, excludePlaces } = await req.json() as PiniRequestBody;

    // contents에 참가자 정보 넣기
    const participantDesc = participants.map(p =>
        `- ${p.nickname}: 출발지 "${p.abstractLocation}", 교통수단 [${p.transports.join(', ')}], 이동거리 선호: ${p.distanceTolerance}, 분위기 선호: ${p.atmospherePreference}`
    ).join('\n');

    const excludeText = excludePlaces?.length
        ? `\n이미 추천된 장소이니 제외해주세요: ${excludePlaces.join(', ')}`
        : '';

    // 1. 선호 정보를 기반으로 장소명 5개 추천 받기
    const firstResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `
You are a meeting place recommendation system for Seoul, Korea.
Category: ${category}

Participants:
${participantDesc}

CRITICAL: You must ONLY suggest REAL, EXISTING businesses currently operating in Seoul.
- CORRECT: "블루보틀 커피 성수점", "어니언 성수", "카페 노티드 도산", "스타벅스 강남역점"
- WRONG: "화곡동 작은 서재", "고요한 오후" (fictional names — strictly forbidden)

Find a geographically balanced meeting point between all participants,
considering their transport modes and distance tolerance.
${excludeText}

Return exactly 5 real, Kakao Map-searchable business names as a JSON array.
`,

        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
            }
        }
    });

    // 추천 받은 장소 string 배열에 저장
    const placeNames: string[] = JSON.parse(firstResponse.text!);
    console.log("추천 장소명:", placeNames);

    // Promise.all을 사용해 장소 이름이 저장된 배열을 map을 사용해 순환하며 함수 실행
    // kakaoResults: 위치, 장소이름 가져오기
    // reviewResults: 장소 후기 검색하기
    const [kakaoResults, reviewResults] = await Promise.all([
        Promise.all(placeNames.map(name => searchKakaoPlace(name))),
        Promise.all(placeNames.map(name => fetchNaverBlogReviews(name))),
    ]);

    // 카카오에서 못 찾은 장소(null) 제거
    const valid = placeNames
        .map((name, i) => ({ name, kakao: kakaoResults[i], reviews: reviewResults[i] }))
        .filter(r => r.kakao !== null);

    if (valid.length < 2) {
        throw new Error('카카오맵에서 실존하는 장소를 찾지 못했어요. 다시 시도해주세요.');
    }

    // 2. 리뷰 분석 후 최종 추천
    const reviewText = valid.map((r) =>
        `[${r.name}]\n${r.reviews.slice(0, 5).join('\n')}`
    ).join('\n\n');

    const secondResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `
Category: ${category}
Participant Information: ${participantDesc}
[Naver Blog Reviews for Each Location]
${reviewText}
Please analyze the reviews above and recommend the optimal locations for the participants.
    `,
        config: {
            thinkingConfig: { thinkingBudget: 1024 },
            systemInstruction: `
            You are a sophisticated data analysis expert recommending meeting places in the Seoul area.

Based on information provided by the user and actual visitor data collected via the 'Naver Search API (filtering for advertisements/sponsorships/provided content completed),' you must respond strictly in accordance with the rules below and the specified JSON format.

[Basic Rules]

1. You must recommend only places that actually exist and are searchable on KakaoMap.
2. The input review data has been primarily filtered for promotional keywords. Even from this, you must exclude simple promotional tones and carefully select only data containing the 'pure opinions' of actual visitors and a 'rating of 3.5 or higher' to reflect in your analysis.
3. The response must be output in a pure JSON array format, without any other text such as markdown blocks.

[Data Analysis and Output Guidelines]

Each recommended place must be a JSON object with the following keys:

- placeName: The name of the recommended business (based on the name registered on Kakao Map)
- reasoning: Write the reason for the recommendation in a sentence, synthesizing the variation in participants' travel times, the match in preferred atmosphere, and the reliability of actual reviews.
- atmosphereMatch: Specify how many participants match in their atmosphere preferences.
- perParticipantTime: Calculate and include the travel time (minutes) and mode of transportation (transport: 'transit' or 'walk') for each participant (nickname) as an array.
- rating: Estimate a score between 1.0 and 5.0 based on the overall sentiment of the blog reviews.
  If the overall review sentiment is negative and the estimated rating is below 3.5,
  exclude that place from the results and replace it with a better alternative.
- reviewIntelligence:
* authenticCount: The number of actual, reliable reviews used for analysis, excluding promotional posts
* pros: 2-3 positive advantages cited by actual visitors
* cons: 1-2 points of dissatisfaction or precautions mentioned by actual visitors
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
                        perParticipantTime: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    nickname: { type: Type.STRING },
                                    minutes: { type: Type.INTEGER },
                                    transport: { type: Type.STRING }
                                }
                            },
                        },
                        reviewIntelligence: {
                            type: Type.OBJECT,
                            properties: {
                                authenticCount: { type: Type.INTEGER },
                                pros: { type: Type.ARRAY, items: { type: Type.STRING } },
                                cons: { type: Type.ARRAY, items: { type: Type.STRING } }
                            }
                        }
                    },
                    required: ["placeName", "reasoning", "atmosphereMatch", "fairnessScore", "balanceTag", "rating", "perParticipantTime", "reviewIntelligence"]
                },
            }
        }
    });

    if (!secondResponse.text) {
        throw new Error('Gemini 응답이 비어있어요.');
    }

    let parsed: Record<string, unknown>[];
    try {
        parsed = JSON.parse(secondResponse.text);
    } catch {
        console.error('Gemini 응답 파싱 실패:', secondResponse.text?.slice(0, 300));
        throw new Error('AI 응답 형식이 올바르지 않아요. 다시 시도해주세요.');
    }

    const places = parsed.map(
        (place: Record<string, unknown>, i: number) => ({
            ...place,
            placeId: valid[i]?.kakao?.id ?? `place-${i}`,
            placeAddress: valid[i]?.kakao?.road_address_name ?? valid[i]?.kakao?.address_name ?? '',
            lat: parseFloat(valid[i]?.kakao?.y ?? '37.5665'),
            lng: parseFloat(valid[i]?.kakao?.x ?? '126.9780'),
            category,
        })
    );

    return Response.json(places);
}
