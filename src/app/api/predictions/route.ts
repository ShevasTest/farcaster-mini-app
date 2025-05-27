import { NextResponse } from "next/server";

// В реальном приложении это будет база данных
const predictions: any[] = [];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const prediction = {
      id: Date.now().toString(),
      ...body,
      timestamp: new Date().toISOString(),
      roundDate: new Date().toISOString().split("T")[0],
    };

    predictions.push(prediction);

    return NextResponse.json({ success: true, prediction });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to save prediction" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ predictions });
}
