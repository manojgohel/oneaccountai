"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, PieChart } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from "recharts";

interface ChartData {
    date: string;
    tokens: number;
    cost: number;
}

interface PieData {
    name: string;
    value: number;
    color: string;
}

interface AnalyticsChartsProps {
    readonly chartData: ChartData[];
    readonly pieData: PieData[];
}

export default function AnalyticsCharts({ chartData, pieData }: AnalyticsChartsProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Usage Bar Chart */}
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <BarChart3 className="h-6 w-6 text-blue-600" />
                        Daily Token Usage
                    </CardTitle>
                    <CardDescription>
                        Token consumption over the last 3 days
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 12 }}
                                    className="text-xs"
                                />
                                <YAxis
                                    tick={{ fontSize: 12 }}
                                    className="text-xs"
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}
                                />
                                <Bar
                                    dataKey="tokens"
                                    fill="#3b82f6"
                                    radius={[4, 4, 0, 0]}
                                    className="hover:opacity-80 transition-opacity"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Model Usage Pie Chart */}
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <PieChart className="h-6 w-6 text-purple-600" />
                        Model Distribution
                    </CardTitle>
                    <CardDescription>
                        Token usage by AI model
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                                <Pie
                                    data={pieData as any[]}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={(props:any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${entry.name}-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}
                                />
                            </RechartsPieChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Legend */}
                    <div className="mt-4 grid grid-cols-2 gap-2">
                        {pieData.map((item, index) => (
                            <div key={`legend-${item.name}-${index}`} className="flex items-center gap-2 text-sm">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: item.color }}
                                />
                                <span className="text-slate-600 dark:text-slate-400 truncate">
                                    {item.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
