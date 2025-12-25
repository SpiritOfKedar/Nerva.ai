import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL =
    process.env.BACKEND_API_URL ||
    "http://localhost:3001";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const { sessionId } = await params;
        const body = await req.json();
        const { message } = body;
        const authHeader = req.headers.get("Authorization");

        if (!message) {
            return NextResponse.json(
                { error: "Message is required" },
                { status: 400 }
            );
        }

        if (!authHeader) {
            return NextResponse.json(
                { error: "Authorization required" },
                { status: 401 }
            );
        }

        console.log(`Sending message to session ${sessionId}`);
        const response = await fetch(
            `${BACKEND_API_URL}/chat/sessions/${sessionId}/messages`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": authHeader,
                },
                body: JSON.stringify({ message }),
            }
        );

        if (!response.ok) {
            const error = await response.json();
            console.error("Failed to send message:", error);
            return NextResponse.json(
                { error: error.error || "Failed to send message" },
                { status: response.status }
            );
        }

        const data = await response.json();
        console.log("Message sent successfully");
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error sending message:", error);
        return NextResponse.json(
            { error: "Failed to send message" },
            { status: 500 }
        );
    }
}