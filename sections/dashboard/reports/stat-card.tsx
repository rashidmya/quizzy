"use client";

import { FC, ReactNode } from "react";
// components
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type StatCardProps = {
  icon: ReactNode;
  label: string;
  value: string;
  tooltip?: string;
};

export const StatCard: FC<StatCardProps> = ({
  icon,
  label,
  value,
  tooltip,
}) => {
  return (
    <div className="flex items-center gap-2 border border-black/20 rounded p-4">
      <div className="text-muted-foreground">{icon}</div>
      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <div className="text-sm font-medium">{label}</div>
          {tooltip && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help font-bold text-xs text-muted-foreground rounded-full border border-gray-300 flex items-center justify-center w-5 h-5">
                  !
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-[200px]">
                {tooltip}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        <div className="text-lg font-bold">{value}</div>
      </div>
    </div>
  );
};
