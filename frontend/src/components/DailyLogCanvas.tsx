"use client";

import { Stage, Layer, Line, Image as KonvaImage } from "react-konva";
import React from "react";
import useImage from "use-image";

const STATUS_Y: Record<string, number> = {
  "Off Duty": 195,
  "Sleeper Berth": 212,
  "Driving": 224,
  "On Duty": 241,
  "On Duty (Loading)": 241,
  "On Duty (Unloading)": 241,
};

const HOUR_WIDTH = 16.25; // 24 hours fits within 513px
const OFFSET_X = 65; // slight left margin

type Activity = {
  start: number;
  end: number;
  type: string;
};

type Props = {
  activities: Activity[];
};

export default function DailyLogCanvas({ activities }: Props) {
  const [image] = useImage("/blank-paper-log.png");

  const lines = activities.flatMap((activity, index) => {
    const x1 = OFFSET_X + activity.start * HOUR_WIDTH;
    const x2 = OFFSET_X + activity.end * HOUR_WIDTH;
    const y = STATUS_Y[activity.type] ?? STATUS_Y["On Duty"];

    const segments = [
      <Line
        key={`h-${index}`}
        points={[x1, y, x2, y]}
        stroke="#1e88e5"
        strokeWidth={2}
        lineCap="round"
      />,
    ];

    if (index > 0) {
      const prevY = STATUS_Y[activities[index - 1].type] ?? STATUS_Y["On Duty"];
      segments.push(
        <Line
          key={`v-${index}`}
          points={[x1, prevY, x1, y]}
          stroke="#1e88e5"
          strokeWidth={2}
          lineCap="round"
        />
      );
    }

    return segments;
  });

  return (
    <Stage width={513} height={518}>
      <Layer>
        {image && (
          <KonvaImage image={image} x={0} y={0} width={513} height={518} />
        )}
        {lines}
      </Layer>
    </Stage>
  );
}
