import { getDailyTokenUsage, getTokenUsageByModel } from "@/actions/conversation/statistic.action";
import HeaderComponent from "@/components/common/HeaderComponent";
import WalletComponent from "@/components/modules/WalletComponent";
import AnalyticsCharts from "@/components/charts/AnalyticsCharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity, DollarSign, BarChart3, Calendar, Zap } from "lucide-react";

export default async function WalletModuleComponent() {
    const dailyTokenUsage = await getDailyTokenUsage(3);
    const aiModelUsage = await getTokenUsageByModel();

    // Prepare chart data
    const chartData = dailyTokenUsage.map(item => ({
        date: item.date,
        tokens: item.tokens,
        cost: item.tokens * 0.0001
    }));

    const pieData = aiModelUsage.map((item, index) => ({
        name: item.model,
        value: item.total,
        color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]
    }));

    return (
        <div className="min-h-screen">
            <HeaderComponent title="Wallet Dashboard" description="Monitor your token usage and optimize your AI model performance." />
            <div className="max-w-7xl mx-auto p-4">

                {/* Wallet Component */}
                <div className="mb-6">
                    <WalletComponent />
                </div>

                {/* Analytics Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* Daily Token Usage Card */}
                    <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Calendar className="h-5 w-5 text-blue-600" />
                                        Daily Usage
                                    </CardTitle>
                                    <CardDescription>Token consumption over time</CardDescription>
                                </div>
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                                    Last 3 Days
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {dailyTokenUsage.map((item) => (
                                    <div key={item.date} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                {item.date}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Zap className="h-4 w-4 text-yellow-500" />
                                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                                                {item.tokens.toLocaleString()}
                                            </span>
                                            <span className="text-xs text-slate-500">tokens</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* AI Model Usage Card */}
                    <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-green-600" />
                                Model Usage
                            </CardTitle>
                            <CardDescription>Token consumption by AI model</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4 max-h-64 overflow-y-auto">
                                {aiModelUsage.map((item) => (
                                    <div key={item.model} className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium text-slate-900 dark:text-slate-100 capitalize">
                                                {item.model}
                                            </span>
                                            <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                                {item.total.toLocaleString()} total
                                            </Badge>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div className="flex items-center gap-2">
                                                <TrendingUp className="h-3 w-3 text-green-500" />
                                                <span className="text-green-700 dark:text-green-400">
                                                    Input: {item.input.toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <TrendingDown className="h-3 w-3 text-purple-500" />
                                                <span className="text-purple-700 dark:text-purple-400">
                                                    Output: {item.output.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Usage Statistics Card */}
                    <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 backdrop-blur-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg flex items-center gap-2 text-blue-900 dark:text-blue-100">
                                <Activity className="h-5 w-5" />
                                Usage Stats
                            </CardTitle>
                            <CardDescription className="text-blue-700 dark:text-blue-300">
                                Quick overview of your activity
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-medium">Total Spent</span>
                                </div>
                                <span className="font-semibold text-green-700 dark:text-green-400">
                                    ${(dailyTokenUsage.reduce((sum, item) => sum + item.tokens, 0) * 0.0001).toFixed(2)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-yellow-600" />
                                    <span className="text-sm font-medium">Total Tokens</span>
                                </div>
                                <span className="font-semibold text-yellow-700 dark:text-yellow-400">
                                    {dailyTokenUsage.reduce((sum, item) => sum + item.tokens, 0).toLocaleString()}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <BarChart3 className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm font-medium">Models Used</span>
                                </div>
                                <span className="font-semibold text-blue-700 dark:text-blue-400">
                                    {aiModelUsage.length}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Section */}
                <AnalyticsCharts chartData={chartData} pieData={pieData} />
            </div>
        </div>
    );
}
