"use client";
import React from "react";
import GaugeComponent from "./GaugeComponent/GaugeComponent";
import ChartComponent from "./ChartComponent/ChartComponent";
import { fetchSensors, SensorRow } from "@/libs/sensors";

export type ChartData = { date: string; value: number };

export default function Dashboard() {
  const [tempSeries, setTempSeries] = React.useState<ChartData[]>([]);
  const [humidSeries, setHumidSeries] = React.useState<ChartData[]>([]);
  const [lightSeries, setLightSeries] = React.useState<ChartData[]>([]);
  const [moistureSeries, setMoistureSeries] = React.useState<ChartData[]>([]);
  const [accelSeries, setAccelSeries] = React.useState<ChartData[]>([]);
  const [rotationSeries, setRotationSeries] = React.useState<ChartData[]>([]);

  const [tempGauge, setTempGauge] = React.useState<number>(0);
  const [humidGauge, setHumidGauge] = React.useState<number>(0);
  const [lightGauge, setLightGauge] = React.useState<number>(0);
  const [moistureGauge, setMoistureGauge] = React.useState<number>(0);
  const [accelGauge, setAccelGauge] = React.useState<number>(0);
  const [rotationGauge, setRotationGauge] = React.useState<number>(0);

  const [isLoading, setIsLoading] = React.useState(true);
  const [tab, setTab] = React.useState<"1" | "2" | "3" | "4" | "5" | "6">("1");

  const toSeries = (rows: SensorRow[], key: keyof SensorRow): ChartData[] =>
    rows
      .slice() // copy
      .reverse() // optional: oldest->newest for charts
      .map((r) => ({ date: new Date(r.date).toISOString(), value: r[key] as number }));

  const fetchAndBind = async () => {
    try {
      const rows = await fetchSensors(); // newest first from backend
      setIsLoading(false);
      if (!rows.length) return;

      // Build series
      setTempSeries(toSeries(rows, "temperature"));
      setHumidSeries(toSeries(rows, "humidity"));
      setLightSeries(toSeries(rows, "lightIntensity"));
      setMoistureSeries(toSeries(rows, "soilMoisture"));
      setAccelSeries(toSeries(rows, "acceleration"));
      setRotationSeries(toSeries(rows, "rotation"));

      // Gauges from LATEST record (rows[0] is newest due to backend sort)
      const latest = rows[0];
      setTempGauge(latest.temperature);
      setHumidGauge(latest.humidity);
      setLightGauge(latest.lightIntensity);
      setMoistureGauge(latest.soilMoisture);
      setAccelGauge(latest.acceleration);
      setRotationGauge(latest.rotation);
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAndBind();
    const id = setInterval(fetchAndBind, 10_000); // 10s polling
    return () => clearInterval(id);
  }, []);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold p-3">Dashboard</h1>

      <div className="flex flex-row flex-wrap gap-3 p-4">
        <GaugeComponent width={150} value={tempGauge}   min={-45}  max={85}   text="Temperature (°C)" />
        <GaugeComponent width={150} value={humidGauge}  min={0}    max={100}  text="Humidity (%)" />
        <GaugeComponent width={150} value={lightGauge}  min={0}    max={100000} text="Light (lux)" />
        <GaugeComponent width={150} value={moistureGauge} min={0}  max={100}  text="Moisture (%)" />
        <GaugeComponent width={150} value={accelGauge}  min={-16}  max={16}   text="Acceleration (m/s²)" />
        <GaugeComponent width={150} value={rotationGauge} min={-250} max={250} text="Rotation (°/s)" />
      </div>

      {/* Replace your MUI tabs if you want; below is a simple version */}
      <div className="flex flex-wrap gap-4 p-4">
        <div className="w-full lg:max-w-[45%]">
          {/* Temperature */}
          <h2 className="text-xl font-semibold mb-2">Temperature</h2>
          <ChartComponent data={tempSeries} />
          {/* Humidity */}
          <h2 className="text-xl font-semibold mt-6 mb-2">Humidity</h2>
          <ChartComponent data={humidSeries} />
          {/* Light */}
          <h2 className="text-xl font-semibold mt-6 mb-2">Light</h2>
          <ChartComponent data={lightSeries} />
        </div>

        <div className="w-full lg:max-w-[50%]">
          {/* Moisture */}
          <h2 className="text-xl font-semibold mb-2">Moisture</h2>
          <ChartComponent data={moistureSeries} />
          {/* Acceleration */}
          <h2 className="text-xl font-semibold mt-6 mb-2">Acceleration</h2>
          <ChartComponent data={accelSeries} />
          {/* Rotation */}
          <h2 className="text-xl font-semibold mt-6 mb-2">Rotation</h2>
          <ChartComponent data={rotationSeries} />
        </div>
      </div>
    </div>
  );
}
