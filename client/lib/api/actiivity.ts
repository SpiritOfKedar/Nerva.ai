interface ActivityEntry {
    type: string;
    name: string;
    description?: string;
    duration?: number;
}

export async function logActivity(
    data: ActivityEntry
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<{ success: boolean; data: any }> {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Not authenticated");

    const response = await fetch("/api/activity", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let error: any;
        try {
            error = await response.json();
        } catch (e) {
            // If response is not JSON, or other parsing error
            throw new Error(`Failed to log activity: ${response.statusText}`);
        }
        throw new Error(error.message || "Failed to log activity");
    }

    return response.json();
}