export default async function getGasesData() {
    const response = await fetch(`https://smart-plant-lbf5.vercel.app/api/gases`, {
        method: "GET",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch data")
    }

    return await response.json()
}

const LPG_URL = "https://sgp1.blynk.cloud/external/api/get?token=ApnnWTRfbbyaI6DSV5V6Mb1CZjVE359T&V2"
const CO_URL = "https://sgp1.blynk.cloud/external/api/get?token=ApnnWTRfbbyaI6DSV5V6Mb1CZjVE359T&V3"
const SMOKE_URL = "https://sgp1.blynk.cloud/external/api/get?token=ApnnWTRfbbyaI6DSV5V6Mb1CZjVE359T&V4"
const Co2_URL = "https://sgp1.blynk.cloud/external/api/get?token=ApnnWTRfbbyaI6DSV5V6Mb1CZjVE359T&V5"

export async function getBlynkLpg() {
    const response = await fetch(LPG_URL, {
        method: "GET",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch data")
    }

    return await response.json()
}

export async function getBlynkCo() {
    const response = await fetch(CO_URL, {
        method: "GET",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch data")
    }

    return await response.json()
}

export async function getBlynkSmoke() {
    const response = await fetch(SMOKE_URL, {
        method: "GET",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch data")
    }

    return await response.json()
}

export async function getBlynkCo2() {
    const response = await fetch(Co2_URL, {
        method: "GET",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch data")
    }

    return await response.json()
}