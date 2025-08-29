"use client";
import { ChartData } from "@/interfaces/DataInterface";
import { MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { LineChart } from "@mui/x-charts";
import React from "react";

export default function ChartComponent({ data }: { data: ChartData[] }) {
  const [selectedRange, setSelectedRange] = React.useState("10min");

  const handleChange = (event: SelectChangeEvent) => {
    setSelectedRange(event.target.value);
  };

  const filteredData = React.useMemo(() => {
    const now = new Date();
    let rangeStart: Date | null = null;

    switch (selectedRange) {
      case "10min":
        rangeStart = new Date(now.getTime() - 10 * 60 * 1000); // Last 10 min
        break;
      case "1h":
        rangeStart = new Date(now.getTime() - 1 * 60 * 60 * 1000); // Last 1 hour
        break;
      case "24h":
        rangeStart = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours
        break;
      case "Week":
        rangeStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Last 7 days
        break;
      case "Month":
        rangeStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
        break;
      default:
        return data; // Show all data for "All"
    }

    const filtered = data.filter((d) => new Date(d.date) >= rangeStart);
    return filtered.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [selectedRange, data]);

  const getXAxisFormat = () => {
    switch (selectedRange) {
      case "10min":
        return (date: Date) =>
          date.toLocaleTimeString("en-US", {
            minute: "2-digit",
          });
      case "1h":
        return (date: Date) =>
          date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          });
      case "24h":
        return (date: Date) =>
          date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          });
      case "Week":
        return (date: Date) =>
          date.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
      case "Month":
        return (date: Date) =>
          date.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
      default:
        return (date: Date) =>
          date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "2-digit",
          });
    }
  };

  const formatXAxisLabels = (date: Date) => {
    const formatFunction = getXAxisFormat();
    return formatFunction(date);
  };

  return (
    <div className="w-fit flex flex-col">
      <div className="w-[100px]">
        <Select
          value={selectedRange}
          onChange={handleChange}
          displayEmpty
          variant="outlined"
          fullWidth
        >
          {["10min", "1h", "24h", "Week", "Month", "All"].map((key) => (
            <MenuItem key={key} value={key}>
              {key}
            </MenuItem>
          ))}
        </Select>
      </div>

      <LineChart
        series={[
          {
            data: filteredData.map((d) => d.value),
          },
        ]}
        width={500}
        height={300}
        xAxis={[
          {
            scaleType: "time",
            data: filteredData.map((d) => new Date(d.date).getTime()),
            valueFormatter: (value) => formatXAxisLabels(new Date(value)),
          },
        ]}
      />
    </div>
  );
}
