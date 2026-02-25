interface EmptyStateProps {
  hasDepots: boolean;
  title:string
}

export function EmptyState({ hasDepots, title }: EmptyStateProps) {
  const entity = hasDepots ? title : "depots";
  console.log(entity,title)
  return (
    <div className="w-full h-full flex items-center justify-center bg-background">
      <div className="flex h-full w-full flex-col items-center justify-center gap-1">
        <h2 className="text-heading-2 font-heading-2 text-default-font">
          No {entity} Found
        </h2>
        <p className="text-body font-body text-subtext-color">
          You do not have any {entity} added yet. Start by adding a new {entity.slice(0, -1)}.
        </p>
      </div>
    </div>
  );
}