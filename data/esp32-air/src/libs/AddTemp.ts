export default async function addTemp(c: number, humid: number) {
    const response = await fetch(`https://esp32-air-lbf5.vercel.app/api/temps`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            c: c,
            humid: humid
        })
    });

    if (!response.ok) {
        throw new Error("Failed to fetch data")
    }

    return await response.json()
}
