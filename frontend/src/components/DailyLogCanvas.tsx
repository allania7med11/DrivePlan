"use client";

import { Stage, Layer, Line, Text, Image as KonvaImage } from "react-konva";
import React from "react";
import useImage from "use-image";

export const CANVAS_WIDTH = 513;
export const CANVAS_HEIGHT = 518;

const STATUS_Y: Record<string, number> = {
  "Off Duty": 195,
  "Sleeper Berth": 212,
  Driving: 224,
  "On Duty": 241,
};

const HOUR_WIDTH = 16.25; // 24 hours fits within 513px
const OFFSET_X = 65;
const X_SUMMARY = 480;
const REMARKS_Y = 278;

type Activity = {
  start: number;
  end: number;
  status: string;
};

type LogSheet = {
  activities: Activity[];
  total_hours_by_status?: Record<string, number>;
  total_hours?: number;
};

type Props = {
  logSheet?: LogSheet;
};

export default function DailyLogCanvas({ logSheet }: Props) {
  const [image] = useImage("/blank-paper-log.png");
  const activities = logSheet?.activities || [];
  const totalByStatus = logSheet?.total_hours_by_status || {};
  const totalHours = logSheet?.total_hours ?? 0;

  const lines = activities.flatMap((activity, index) => {
    const x1 = OFFSET_X + activity.start * HOUR_WIDTH;
    const x2 = OFFSET_X + activity.end * HOUR_WIDTH;
    const y = STATUS_Y[activity.status] ?? STATUS_Y["On Duty"];

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
      const prevY =
        STATUS_Y[activities[index - 1].status] ?? STATUS_Y["On Duty"];
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

  const summaryTextElements = Object.entries(STATUS_Y).map(([status, y]) => {
    const value = totalByStatus[status];
    if (value === undefined) return null;
    return (
      <Text
        key={`sum-${status}`}
        text={`${value}`}
        x={X_SUMMARY}
        y={y}
        fontSize={10}
        fill="#000"
        offsetX={12} 
        offsetY={3} 
      />
    );
  });

  return (
    <Stage width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>
      <Layer>
        {image && (
          <KonvaImage
            image={image}
            x={0}
            y={0}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
          />
        )}
        {lines}
        {summaryTextElements}
        <Text
          text={`${totalHours}`}
          x={X_SUMMARY}
          y={REMARKS_Y}
          fontSize={10}
          fontStyle="bold"
          fill="#000"
          offsetX={12} 
          offsetY={5} 
        />
      </Layer>
    </Stage>
  );
}
