export const Grid = () => {
  return (
    <div className="flex-1 min-w-[400px] border-r border-gray-200 flex flex-col h-full bg-white">
      {/* ヘッダー部分 */}
      <div className="h-10 border-b border-gray-200 flex items-center px-4 bg-white">
        <span className="text-sm font-semibold text-gray-600">入力グリッド</span>
      </div>

      {/* グリッド本体（スクロール可能エリア） */}
      <div className="flex-1 overflow-auto p-4">
        {/* 仮のコンテンツ */}
        <div className="space-y-4">
          <p className="text-sm text-gray-400">ここにExcel風のグリッドが表示されます</p>
          <div className="h-[1000px] border border-dashed border-gray-300 rounded flex items-center justify-center bg-gray-50">
            スクロール確認用の長いスペース
          </div>
        </div>
      </div>
    </div>
  );
};