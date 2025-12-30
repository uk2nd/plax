export const Preview = () => {
  return (
    <div className="flex-1 min-w-[400px] flex flex-col h-full bg-slate-50">
      {/* ヘッダー部分（ズーム操作などが入る予定） */}
      <div className="h-10 border-b border-gray-200 flex items-center px-4 bg-white">
        <span className="text-sm font-semibold text-gray-600">プレビュー</span>
      </div>

      {/* SVG描画エリア（縦横スクロール可能） */}
      <div className="flex-1 overflow-auto p-4 relative">
        <div className="min-w-[800px] min-h-[600px] bg-white border border-gray-200 shadow-sm rounded">
          {/* ここにSVGが描画されます */}
          <div className="p-8 text-gray-400 text-center">
            SVG Chart Area
          </div>
        </div>
      </div>
    </div>
  );
};