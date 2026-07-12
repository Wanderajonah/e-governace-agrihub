import React from "react";

function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 lg:mb-8">
      <div>
        <h1 className="text-lg font-bold text-gray-900 tracking-tight">
          {title}
        </h1>
        {subtitle && <p className="text-[13px] text-gray-400 mt-1">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2 sm:gap-3 flex-wrap">{children}</div>}
    </div>
  );
}

export default PageHeader;
