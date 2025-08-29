export default async function getChadAnalysis() {
    const response = await fetch(`https://esp32-air-lbf5.vercel.app/api/chad`, {
        method: "GET",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch data")
    }

    return await response.json()
}