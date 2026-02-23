import { Button } from '@/ui/components/Button';
import { FeatherPlus, FeatherRefreshCw } from '@subframe/core';
import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  count: number;
  onRefetch: () => void;
  onAdd: () => void;
  buttonLabel?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  count,
  onRefetch,
  onAdd,
  buttonLabel = "Add Organization"
}) => {
  return (
    <div className="flex w-full flex-col items-start gap-1">
      <span className="w-full text-heading-2 font-heading-2 text-default-font">
        {title}
      </span>
      <span className="text-body font-body text-subtext-color">
        {subtitle}
      </span>
      <div className="grid grid-cols-1 items-end justify-between gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 w-full">
        <span className="text-caption font-caption text-subtext-color">
          Showing {count} records
        </span>
        <div className="flex justify-end items-center col-span-4 gap-2">
          <Button
            variant="neutral-secondary"
            className="mobile:h-8 mobile:grow mobile:shrink-0 mobile:basis-0"
            icon={<FeatherRefreshCw />}
            onClick={onRefetch}
          >
            Refresh
          </Button>
          <Button
            className="mobile:h-8 mobile:grow mobile:shrink-0 mobile:basis-0"
            icon={<FeatherPlus />}
            onClick={onAdd}
          >
            {buttonLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;