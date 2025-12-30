export const Sidebar = () => {
  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 font-bold text-gray-700">
        Plax (Logo)
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="text-sm text-gray-500 mb-2">プロジェクト</div>
        {/* ここにプロジェクト一覧が入ります */}
        <ul className="space-y-2">
          <li className="p-2 bg-blue-50 text-blue-600 rounded cursor-pointer">
            EX プロジェクト
          </li>
          <li className="p-2 hover:bg-gray-100 rounded cursor-pointer">
            TW 開発
          </li>
        </ul>
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="text-sm text-gray-500">設定 / アカウント</div>
      </div>
    </aside>
  );
};