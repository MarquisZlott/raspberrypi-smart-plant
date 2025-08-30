export default async function addGas(lpg: number, co: number, co2: number, smoke: number) {
    const response = await fetch(`https://smart-plant-lbf5.vercel.app/api/gases`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            lpg: lpg,
            co: co,
            co2: co2,
            smoke: smoke
        })
    });

    if (!response.ok) {
        throw new Error("Failed to fetch data")
    }

    return await response.json()
}
