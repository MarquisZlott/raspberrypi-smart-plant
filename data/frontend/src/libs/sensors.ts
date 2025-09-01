export type SensorRow = {
    _id: string;
    temperature: number;
    humidity: number;
    soilMoisture: number;
    lightIntensity: number;
    acceleration: number;
    rotation: number;
    date: string; // ISO from backend
  };
  
  export type NewSensor = Omit<SensorRow, "_id" | "date">;
  
  const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
  
  export async function fetchSensors(): Promise<SensorRow[]> {
    const res = await fetch(`${API}/api/sensor`, { cache: "no-store" });
    if (!res.ok) throw new Error(`fetchSensors failed: ${res.status}`);
    const json = await res.json();
    return json.data as SensorRow[];
  }
  
  export async function createSensor(payload: NewSensor) {
    const res = await fetch(`${API}/api/sensor`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`createSensor failed: ${res.status}`);
    return (await res.json()).data as SensorRow;
  }
  