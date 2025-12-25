import { NextRequest, NextResponse } from "next/server";

// This returns today's activities for the dashboard
// For now, we'll return an empty array until a proper activities backend is implemented
export async function GET(req: NextRequest) {
    try {
        // TODO: Implement proper activities fetching from backend
        // For now, return empty array so dashboard doesn't error
        return NextResponse.json([]);
    } catch (error) {
        console.error("Error fetching activities:", error);
        return NextResponse.json(
            { error: "Failed to fetch activities" },
            { status: 500 }
        );
    }
}
