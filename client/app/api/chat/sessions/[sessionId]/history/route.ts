import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL =
    process.env.BACKEND_API_URL ||
    "http://localhost:3001";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const { sessionId } = await params;
        const authHeader = req.headers.get("Authorization");

        if (!authHeader) {
            return NextResponse.json(
                { error: "Authorization required" },
                { status: 401 }
            );
        }

        console.log(`Getting chat history for session ${sessionId}`);

        const response = await fetch(
            `${BACKEND_API_URL}/chat/sessions/${sessionId}/history`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": authHeader,
                },
            }
        );

        if (!response.ok) {
            const error = await response.json();
            console.error("Failed to get chat history:", error);
            return NextResponse.json(
                { error: error.error || "Failed to get chat history" },
                { status: response.status }
            );
        }

        const data = await response.json();

        // Format the response to match the frontend's expected format
        const formattedMessages = Array.isArray(data) ? data.map((msg: any) => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp,
            metadata: msg.metadata,
        })) : [];

        return NextResponse.json(formattedMessages);
    } catch (error) {
        console.error("Error getting chat history:", error);
        return NextResponse.json(
            { error: "Failed to get chat history" },
            { status: 500 }
        );
    }
}