import HeaderComponent from "@/components/common/HeaderComponent";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function OrderCompletePage() {
    return (
        <>
            <HeaderComponent title="Payment Successful!" description="Thank you for your purchase. Your order is complete and your balance has been updated." />

            <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 px-4">
                <CheckCircle2 className="text-green-600 mb-4" size={64} />
                <h1 className="text-3xl font-bold mb-2 text-center">Payment Successful!</h1>
                <p className="text-lg text-muted-foreground mb-6 text-center">
                    Thank you for your purchase. Your order is complete and your balance has been updated.
                </p>
                <Link href="/secure" passHref>
                    <Button size="lg" className="mt-2 cursor-pointer">
                        Go to Dashboard
                    </Button>
                </Link>
            </div>
        </>
    );
}