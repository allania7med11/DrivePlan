"use client";

import { Stage, Layer, Line, Image as KonvaImage } from "react-konva";
import React from "react";
import useImage from "use-image";

const STATUS_Y: Record<string, number> = {
  "Off Duty": 195,
  "Sleeper Berth": 212,
  "Driving": 224,
  "On Duty (Unloading)": 241,
  "On Duty (Loading)": 241,
  "On Duty": 241,
};

const HOUR_WIDTH = 16.25; // 24 hours fits within 513px
const OFFSET_X = 65; // slight left margin

export default function DailyLogCanvas() {
  const [image] = useImage("/blank-paper-log.png");

  const activities = [
    { start: 5, end: 8.75, type: "Driving" },
    { start: 8.75, end: 9.75, type: "On Duty (Loading)" },
    { start: 9.75, end: 14.25, type: "Driving" },
    { start: 14.25, end: 15.25, type: "On Duty (Unloading)" },
    { start: 15.25, end: 24, type: "Off Duty" },
  ];

  const lines = activities.flatMap((activity, index) => {
    const x1 = OFFSET_X + activity.start * HOUR_WIDTH;
    const x2 = OFFSET_X + activity.end * HOUR_WIDTH;
    const y = STATUS_Y[activity.type] || STATUS_Y["On Duty"];

    const segments = [
      // horizontal segment for this activity
      <Line
        key={`h-${index}`}
        points={[x1, y, x2, y]}
        stroke="#1e88e5"
        strokeWidth={2}
        lineCap="round"
      />,
    ];

    // vertical join with previous activity
    if (index > 0) {
      const prev = activities[index - 1];
      const prevY = STATUS_Y[prev.type] || STATUS_Y["On Duty"];
      const joinX = x1;

      segments.push(
        <Line
          key={`v-${index}`}
          points={[joinX, prevY, joinX, y]}
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
