"use client";
import React from "react";
import GaugeComponent from "./GaugeComponent/GaugeComponent";
import ChartComponent from "./ChartComponent/ChartComponent";
import { ChartData } from "@/interfaces/DataInterface";
import getTempsData, { getBlynkHumid, getBlynkTemp } from "@/libs/GetTempsData";
import getGasesData, {
  getBlynkCo,
  getBlynkCo2,
  getBlynkLpg,
  getBlynkSmoke,
} from "@/libs/GetGasesData";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import addGas from "@/libs/AddGas";
import addTemp from "@/libs/AddTemp";
import CHAD from "./CHAD";

export default function Dashboard() {
  const [tempsData, setTempsData] = React.useState<ChartData[]>([]);
  const [humidsData, setHumidsData] = React.useState<ChartData[]>([]);
  const [lpgsData, setLpgsData] = React.useState<ChartData[]>([]);
  const [cosData, setCosData] = React.useState<ChartData[]>([]);
  const [co2sData, setCo2sData] = React.useState<ChartData[]>([]);
  const [smokesData, setSmokesData] = React.useState<ChartData[]>([]);

  const [tempGauge, setTempGauge] = React.useState<number>(0);
  const [humidGauge, setHumidGauge] = React.useState<number>(0);
  const [lpgGauge, setLpgGauge] = React.useState<number>(0);
  const [coGauge, setCoGauge] = React.useState<number>(0);
  const [co2Gauge, setCo2Gauge] = React.useState<number>(0);
  const [smokeGauge, setSmokeGauge] = React.useState<number>(0);

  const [isLoading, setIsLoading] = React.useState(true);

  const fetchData = async () => {
    try {
      const [bTemp, bHumid, bLpg, bCo, bSmoke, bCo2] = await Promise.all([
        getBlynkTemp(),
        getBlynkHumid(),
        getBlynkLpg(),
        getBlynkCo(),
        getBlynkSmoke(),
        getBlynkCo2(),
      ]);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [x, y, getTemps, getGases] = await Promise.all([
        // addTemp(25, 55),
        // addGas(12, 11, 13, 20),
        addTemp(bTemp, bHumid),
        addGas(bLpg, bCo, bCo2, bSmoke),
        getTempsData(),
        getGasesData(),
      ]);

      setIsLoading(false);

      // console.log("temp", bTemp);
      // console.log("humid", bHumid);
      // console.log("lpg", bLpg);
      // console.log("co", bCo);
      // console.log("smoke", bSmoke);
      // console.log("co2", bCo2);
      console.log("temps", getTemps);
      console.log("gases", getGases);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formmattedTempsData = getTemps.data.map((item: any) => ({
        date: new Date(item.date).toISOString(),
        value: item.c,
      }));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formattedHumidsData = getTemps.data.map((item: any) => ({
        date: new Date(item.date).toISOString(),
        value: item.humid,
      }));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formattedLpgsData = getGases.data.map((item: any) => ({
        date: new Date(item.date).toISOString(),
        value: item.lpg,
      }));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formattedCosData = getGases.data.map((item: any) => ({
        date: new Date(item.date).toISOString(),
        value: item.co,
      }));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formattedCo2sData = getGases.data.map((item: any) => ({
        date: new Date(item.date).toISOString(),
        value: item.co2,
      }));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formattedSmokesData = getGases.data.map((item: any) => ({
        date: new Date(item.date).toISOString(),
        value: item.smoke,
      }));

      setTempsData(formmattedTempsData);
      setHumidsData(formattedHumidsData);
      setLpgsData(formattedLpgsData);
      setCosData(formattedCosData);
      setCo2sData(formattedCo2sData);
      setSmokesData(formattedSmokesData);

      setTempGauge(formmattedTempsData[0].value);
      setHumidGauge(formattedHumidsData[0].value);
      setLpgGauge(formattedLpgsData[0].value);
      setCoGauge(formattedCosData[0].value);
      setCo2Gauge(formattedCo2sData[0].value);
      setSmokeGauge(formattedSmokesData[0].value);
    } catch (error) {
      console.error("Error fetching data:", error);
      setIsLoading(false);
    }
  };

  const [value, setValue] = React.useState("1");

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  React.useEffect(() => {
    console.log("loaded");
    fetchData();
    const intervalId = setInterval(fetchData, 10000); // 10 seconds

    return () => clearInterval(intervalId);
  }, []);

  const dashboardContent = React.useMemo(() => {
    if (isLoading && tempsData.length === 0) {
      return <div>Loading...</div>;
    }

    return (
      <>
        <h1 className="text-3xl font-bold p-3">Dashboard</h1>

        <div className="flex flex-row flex-wrap gap-3 p-4">
          <GaugeComponent
            width={150}
            value={tempGauge}
            min={-45}
            max={85}
            text="Temperature (°C)"
          />
          <GaugeComponent
            width={150}
            value={humidGauge}
            min={0}
            max={100}
            text="Humidity (%)"
          />
          <GaugeComponent
            width={150}
            value={lpgGauge}
            min={0}
            max={10000}
            text="LPG (ppm)"
          />
          <GaugeComponent
            width={150}
            value={coGauge}
            min={0}
            max={10000}
            text="CO (ppm)"
          />
          <GaugeComponent
            width={150}
            value={co2Gauge}
            min={0}
            max={10000}
            text="CO2 (ppm)"
          />
          <GaugeComponent
            width={150}
            value={smokeGauge}
            min={0}
            max={10000}
            text="Smoke (ppm)"
          />
        </div>

        <div className="flex flex-row flex-wrap justify-between">
          <div className="w-full lg:max-w-[45%]">
            <TabContext value={value}>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <TabList onChange={handleChange}>
                  <Tab label="Temperature" value="1" />
                  <Tab label="Humidity" value="2" />
                  <Tab label="LPG" value="3" />
                  <Tab label="CO" value="4" />
                  <Tab label="CO2" value="5" />
                  <Tab label="Smoke" value="6" />
                </TabList>
              </Box>
              <TabPanel value="1">
                <ChartComponent data={tempsData} />
              </TabPanel>
              <TabPanel value="2">
                <ChartComponent data={humidsData} />
              </TabPanel>
              <TabPanel value="3">
                <ChartComponent data={lpgsData} />
              </TabPanel>
              <TabPanel value="4">
                <ChartComponent data={cosData} />
              </TabPanel>
              <TabPanel value="5">
                <ChartComponent data={co2sData} />
              </TabPanel>
              <TabPanel value="6">
                <ChartComponent data={smokesData} />
              </TabPanel>
            </TabContext>
          </div>
          <div className="w-full lg:max-w-[50%] m-4">
            <CHAD />
          </div>
        </div>
      </>
    );
  }, [
    isLoading,
    tempsData,
    humidsData,
    lpgsData,
    co2sData,
    cosData,
    smokesData,
    tempGauge,
    humidGauge,
    lpgGauge,
    coGauge,
    co2Gauge,
    smokeGauge,
    value,
  ]);

  return <div>{dashboardContent}</div>;
}
