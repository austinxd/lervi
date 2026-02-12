import type { NightlyPrice } from "@/lib/types";

interface PriceBreakdownProps {
  nightlyPrices: NightlyPrice[];
  total: string;
  currency: string;
}

export default function PriceBreakdown({
  nightlyPrices,
  total,
  currency,
}: PriceBreakdownProps) {
  return (
    <div className="bg-sand-50 rounded-lg p-5 border border-sand-200">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-primary-700 mb-4 font-sans">
        Desglose de precios
      </h4>
      <div className="space-y-2.5">
        {nightlyPrices.map((night) => (
          <div
            key={night.date}
            className="flex justify-between text-sm font-sans"
          >
            <span className="text-gray-500">
              {new Date(night.date + "T12:00:00").toLocaleDateString("es", {
                weekday: "short",
                day: "numeric",
                month: "short",
              })}
            </span>
            <span className="text-primary-800 font-medium">
              {currency} {night.final}
            </span>
          </div>
        ))}
      </div>
      <div className="border-t border-sand-300 mt-4 pt-4 flex justify-between items-center">
        <span className="font-sans text-sm font-semibold uppercase tracking-wider text-primary-700">
          Total
        </span>
        <span className="font-serif text-xl text-primary-900 font-semibold">
          {currency} {total}
        </span>
      </div>
    </div>
  );
}
