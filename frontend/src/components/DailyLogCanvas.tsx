"use client";

import { Stage, Layer, Line, Text, Image as KonvaImage } from "react-konva";
import React from "react";
import useImage from "use-image";

export const CANVAS_WIDTH = 513;
export const CANVAS_HEIGHT = 518;

const STATUS_Y: Record<string, number> = {
  "Off Duty": 195,
  "Sleeper Berth": 212,
  "Driving": 224,
  "On Duty": 241,
};

const HOUR_WIDTH = 16.25;
const OFFSET_X = 65;
const X_SUMMARY = 480;
const REMARKS_Y = 278;
const REMARKS_START_Y = 253;
const REMARK_VERTICAL_HEIGHT = 9;
const REMARK_DIAGONAL_LENGTH = 70;

type Activity = {
  start: number;
  end: number;
  status: string;
};

type Remark = {
  start: number;
  end: number;
  location: string;
  information: string;
};

type LogSheet = {
  activities: Activity[];
  remarks?: Remark[];
  total_hours_by_status?: Record<string, number>;
  total_hours?: number;
};

type Props = {
  logSheet?: LogSheet;
};

export default function DailyLogCanvas({ logSheet }: Props) {
  const [image] = useImage("/blank-paper-log.png");
  const activities = logSheet?.activities || [];
  const remarks = logSheet?.remarks || [];
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
      const prevY = STATUS_Y[activities[index - 1].status] ?? STATUS_Y["On Duty"];
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

  const remarkLines = remarks.map((remark, index) => {
    const xStart = OFFSET_X + remark.start * HOUR_WIDTH;
    const xEnd = OFFSET_X + remark.end * HOUR_WIDTH;
    const yTop = REMARKS_START_Y;
    const yBottom = yTop + REMARK_VERTICAL_HEIGHT;
  
    const angle = Math.PI / 4;
    const xDiag = xStart + REMARK_DIAGONAL_LENGTH * Math.cos(angle);
    const yDiag = yBottom + REMARK_DIAGONAL_LENGTH * Math.sin(angle);
    const xDiagText = xStart + 0.4 * REMARK_DIAGONAL_LENGTH * Math.cos(angle);
    const yDiagText = yBottom + 0.4 * REMARK_DIAGONAL_LENGTH * Math.sin(angle);
  
    return (
      <React.Fragment key={`remark-${index}`}>
        {/* Left vertical line at start */}
        <Line
          points={[xStart, yTop, xStart, yBottom]}
          stroke="#000"
          strokeWidth={1}
        />
  
        {/* Right vertical line at end */}
        <Line
          points={[xEnd, yTop, xEnd, yBottom]}
          stroke="#000"
          strokeWidth={1}
        />
  
        {/* Horizontal line between verticals */}
        <Line
          points={[xStart, yBottom, xEnd, yBottom]}
          stroke="#000"
          strokeWidth={1}
        />
  
        {/* Diagonal 45° line */}
        <Line
          points={[xStart, yBottom, xDiag, yDiag]}
          stroke="#000"
          strokeWidth={1}
        />
  
        {/* Rotated location text above diagonal */}
        <Text
          text={remark.location}
          x={xDiagText}
          y={yDiagText - 16}
          fontSize={8}
          rotation={45}
          fill="#000"
          fontStyle="bold"
        />
  
        {/* Rotated info text below diagonal */}
        <Text
          text={remark.information}
          x={xDiagText}
          y={yDiagText + 4}
          fontSize={8}
          rotation={45}
          fill="#000"
          fontStyle="bold"
        />
      </React.Fragment>
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
        {remarkLines}
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
