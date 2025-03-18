"use client";

type LiveStatusProps = {
  isLive: boolean;
};

export function LiveStatus({ isLive }: LiveStatusProps) {
  return (
    <div className="flex items-center">
      <div className="relative flex h-2 w-2">
        {isLive ? (
          <>
            <div className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></div>
            <div className="relative inline-flex h-2 w-2 rounded-full bg-green-600"></div>
          </>
        ) : (
          <>
            <div className="relative inline-flex h-2 w-2 rounded-full bg-red-600"></div>
          </>
        )}
      </div>
      <span
        className={`ml-1 text-xs font-semibold uppercase tracking-wider ${
          isLive ? "text-green-600" : "text-red-600"
        }`}
      >
        {isLive ? "Live" : "Offline"}
      </span>
    </div>
  );
}
