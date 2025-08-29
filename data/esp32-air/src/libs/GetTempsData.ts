export default async function getTempsData() {
    const response = await fetch(`https://smart-plant-lbf5.vercel.app/api/temps`, {
        method: "GET",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch data")
    }

    return await response.json()
}

const TEMP_URL = "https://sgp1.blynk.cloud/external/api/get?token=ApnnWTRfbbyaI6DSV5V6Mb1CZjVE359T&V0"
const HUMID_URL = "https://sgp1.blynk.cloud/external/api/get?token=ApnnWTRfbbyaI6DSV5V6Mb1CZjVE359T&V1"

export async function getBlynkTemp() {
    const response = await fetch(TEMP_URL, {
        method: "GET",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch data")
    }

    return await response.json()
}

export async function getBlynkHumid() {
    const response = await fetch(HUMID_URL, {
        method: "GET",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch data")
    }

    return await response.json()
}