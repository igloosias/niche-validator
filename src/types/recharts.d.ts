// Recharts TypeScript declarations to fix React 18 compatibility
declare module 'recharts' {
  import * as React from 'react';

  export interface AreaChartProps {
    data?: any[];
    margin?: { top?: number; right?: number; bottom?: number; left?: number };
    children?: React.ReactNode;
  }

  export interface AreaProps {
    type?: 'basis' | 'basisClosed' | 'basisOpen' | 'linear' | 'natural' | 'monotone' | 'step' | 'stepBefore' | 'stepAfter';
    dataKey: string;
    stroke?: string;
    strokeWidth?: number;
    fill?: string;
    fillOpacity?: number;
  }

  export interface XAxisProps {
    dataKey?: string;
    type?: 'number' | 'category';
    domain?: any[];
    axisLine?: boolean;
    tickLine?: boolean;
    tick?: any;
  }

  export interface YAxisProps {
    dataKey?: string;
    type?: 'number' | 'category';
    domain?: any[];
    axisLine?: boolean;
    tickLine?: boolean;
    tick?: any;
    width?: number;
  }

  export interface TooltipProps {
    contentStyle?: React.CSSProperties;
    cursor?: any;
  }

  export interface BarChartProps {
    data?: any[];
    layout?: 'horizontal' | 'vertical';
    margin?: { top?: number; right?: number; bottom?: number; left?: number };
    children?: React.ReactNode;
  }

  export interface BarProps {
    dataKey: string;
    radius?: number[];
    fill?: string;
    children?: React.ReactNode;
  }

  export interface CellProps {
    key?: string;
    fill?: string;
  }

  export interface ResponsiveContainerProps {
    width?: string | number;
    height?: string | number;
    children?: React.ReactNode;
  }

  export const AreaChart: React.FC<AreaChartProps>;
  export const Area: React.FC<AreaProps>;
  export const XAxis: React.FC<XAxisProps>;
  export const YAxis: React.FC<YAxisProps>;
  export const Tooltip: React.FC<TooltipProps>;
  export const BarChart: React.FC<BarChartProps>;
  export const Bar: React.FC<BarProps>;
  export const Cell: React.FC<CellProps>;
  export const ResponsiveContainer: React.FC<ResponsiveContainerProps>;
}
