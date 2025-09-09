import { getDailyTokenUsage, getTokenUsageByModel } from "@/actions/conversation/statistic.action";
import HeaderComponent from "@/components/common/HeaderComponent";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default async function SecurePage() {
  const dailyTokenUsage = await getDailyTokenUsage(3);
  const aiModelUsage = await getTokenUsageByModel();

  return (
    <>
      <HeaderComponent />
      <div className="flex flex-col gap-6 p-6">
        <h1 className="text-2xl font-bold">Token Usage Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Daily Token Usage Card */}
          <Card>
            <CardHeader>
              <CardTitle>
                Daily Token Usage{" "}
                <Badge variant="secondary">Last 3 Days</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dailyTokenUsage.map((item) => (
                  <div
                    key={item.date}
                    className="flex justify-between items-center"
                  >
                    <span className="text-muted-foreground">
                      {item.date}
                    </span>
                    <span className="font-semibold">
                      {item.tokens.toLocaleString()} tokens
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          {/* AI Model Token Usage Card */}
          <Card>
            <CardHeader>
              <CardTitle>Token Usage by AI Model</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {aiModelUsage.map((item) => (
                  <div
                    key={item.model}
                    className="flex flex-col gap-1 border-b pb-2 last:border-b-0 last:pb-0"
                  >
                    <div className="flex justify-between items-center">
                      <span className="capitalize font-medium">{item.model}</span>
                      <span className="font-semibold text-blue-700">
                        {item.total.toLocaleString()} total
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="text-green-700">
                        Input: {item.input.toLocaleString()}
                      </span>
                      <span className="text-purple-700">
                        Output: {item.output.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <Separator />
        {/* Simple Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Token Usage Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="w-full h-32 rounded-md" />
            <div className="text-xs text-muted-foreground mt-2">
              (Chart coming soon)
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
