import React from 'react';

interface Category {
  name: string;
  count: number;
}

interface Account {
  id: string;
  nickname: string;
}

interface CategoryFilterProps {
  categories: Category[];
  accounts: Account[];
  selectedCategory?: string;
  selectedAccount?: string;
  onCategoryChange: (category: string | null) => void;
  onAccountChange: (accountId: string | null) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  accounts,
  selectedCategory,
  selectedAccount,
  onCategoryChange,
  onAccountChange,
}) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-sm font-medium text-gray-600 shrink-0">分类</span>
        <button
          onClick={() => onCategoryChange(null)}
          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shrink-0 ${
            !selectedCategory
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          全部
        </button>
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() =>
              onCategoryChange(selectedCategory === cat.name ? null : cat.name)
            }
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shrink-0 ${
              selectedCategory === cat.name
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {cat.name}
            <span
              className={`text-xs ${
                selectedCategory === cat.name ? 'text-blue-200' : 'text-gray-400'
              }`}
            >
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* Account Dropdown */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-sm font-medium text-gray-600">账号</span>
        <div className="relative">
          <select
            value={selectedAccount ?? ''}
            onChange={(e) =>
              onAccountChange(e.target.value === '' ? null : e.target.value)
            }
            className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-1.5 pr-8 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <option value="">全部账号</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.nickname}
              </option>
            ))}
          </select>
          <svg
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default CategoryFilter;