import React from 'react';

const RiskDisclaimerBanner: React.FC = () => {
  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5">
          <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-blue-800">合规风险提示</h4>
          <p className="mt-1 text-sm text-blue-700 leading-relaxed">
            本工具通过浏览器自动化实现内容发布，使用过程中请遵守小红书平台规则。
            频繁操作、批量发布或异常行为可能触发平台风控机制，导致账号受限。
            请合理设置发布频率和操作延迟，降低风险。
          </p>
          <p className="mt-2 text-xs text-blue-600">
            使用本工具所产生的一切后果由用户自行承担。
          </p>
        </div>
      </div>
    </div>
  );
};

export default RiskDisclaimerBanner;