import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const q = req.nextUrl.searchParams.get('q');
    if (!q || q.trim().length < 1) return NextResponse.json([]);

    const res = await fetch(
        `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(q)}&size=5`,
        { headers: { Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}` } }
    )
    if (!res.ok) return NextResponse.json([])

    const data = await res.json()
    const places = (data.documents ?? []).map((p: {
        place_name: string; address_name: string; x: string; y: string
    }) => ({
        name: p.place_name,
        address: p.address_name,
        lat: Number(p.y),
        lng: Number(p.x)
    }))

    return NextResponse.json(places)
}