import { Gauge } from "@mui/x-charts";

export default function GaugeComponent({
  width,
  height,
  value,
  min,
  max,
  text,
}: {
  width?: number;
  height?: number;
  value: number;
  text: string;
  min: number;
  max: number;
}) {
  return (
    <span className="w-fit flex flex-col items-center bg-slate-200 rounded-md p-2 drop-shadow-md">
      <Gauge
        width={width || 100}
        height={height || 100}
        value={value}
        valueMin={min}
        valueMax={max}
        cornerRadius={"70%"}
        startAngle={-90}
        endAngle={90}
      />
      <div>{text}</div>
    </span>
  );
}
