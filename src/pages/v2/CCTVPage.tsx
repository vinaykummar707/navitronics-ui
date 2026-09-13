export default function CCTVPage() {
  return (
    <div className="flex h-full w-full flex-col items-start gap-6 ">
      <div className="flex w-full flex-col items-start gap-1">
        <span className="w-full text-heading-2 font-heading-2 text-default-font">
          CCTV & Live Streaming
        </span>
        <span className="text-body font-body text-subtext-color">
          Vehicle surveillance and camera overview (Upcoming feature)
        </span>
      </div>
      <div className="rounded-lg border border-neutral-border bg-neutral-50 p-6 text-sm text-subtext-color">
        Live streaming feeds and CCTV management are scheduled for a future release of the ITMS module.
      </div>
    </div>
  );
}
