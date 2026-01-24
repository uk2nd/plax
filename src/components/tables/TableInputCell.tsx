import { useRef, useEffect, useState } from 'react';

type CellMode = 'select' | 'edit';

type TableInputCellProps = {
  value: string;
  rowId: string;
  colIndex: number;
  isFocused: boolean;
  mode: CellMode;
  disabled?: boolean;
  className?: string;
  onChange: (value: string) => void;
  onFocus: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  onSelectModeKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onEditModeKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onCellClick: () => void;
  onCellDoubleClick: () => void;
};

/**
 * Excelライクな選択モードと編集モードを持つテーブルセルコンポーネント
 */
export const TableInputCell = ({
  value,
  rowId,
  colIndex,
  isFocused,
  mode,
  disabled = false,
  className = '',
  onChange,
  onFocus,
  onBlur,
  onSelectModeKeyDown,
  onEditModeKeyDown,
  onCellClick,
  onCellDoubleClick,
}: TableInputCellProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [clickCount, setClickCount] = useState(0);
  const [isComposing, setIsComposing] = useState(false);
  const [composingValue, setComposingValue] = useState('');

  // フォーカス管理
  useEffect(() => {
    if (isFocused) {
      inputRef.current?.focus();
      if (mode === 'select') {
        // 選択モード：文字列を全選択（透明表示）
        inputRef.current?.select();
      } else {
        // 編集モード：カーソルを末尾に配置
        const len = inputRef.current?.value.length || 0;
        inputRef.current?.setSelectionRange(len, len);
      }
    }
  }, [isFocused, mode]);

  // クリックタイマーのクリーンアップ
  useEffect(() => {
    return () => {
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
      }
    };
  }, []);

  // クリックとダブルクリックを区別するハンドラ
  const handleClick = () => {
    setClickCount((prev) => prev + 1);

    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }

    clickTimerRef.current = setTimeout(() => {
      if (clickCount === 0) {
        // シングルクリック
        onCellClick();
      }
      setClickCount(0);
    }, 50);
  };

  const handleDoubleClick = () => {
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }
    setClickCount(0);
    // ダブルクリック
    onCellDoubleClick();
  };

  // IME変換の開始・終了を管理
  const handleCompositionStart = () => {
    setIsComposing(true);
    setComposingValue(inputRef.current?.value || '');
  };

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    setIsComposing(false);
    // IME変換確定時にonChangeを呼び出し
    onChange(e.currentTarget.value);
  };

  // 通常のonChangeハンドラ（IME変換中は親の状態を更新しない）
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (isComposing) {
      // IME変換中はローカル状態のみ更新（親には通知しない）
      setComposingValue(newValue);
    } else {
      // IME変換中でない場合は親に通知
      onChange(newValue);
    }
  };

  // キーボードイベントハンドラ（モードによって切り替え）
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (mode === 'edit') {
      onEditModeKeyDown(e);
    } else {
      onSelectModeKeyDown(e);
    }
  };

  // 無効化されているセル
  if (disabled) {
    return (
      <input
        type="text"
        value={value}
        disabled
        data-row-id={rowId}
        data-col={colIndex}
        className={`w-full border-none outline-none px-0 focus:ring-0 bg-gray-200 cursor-not-allowed ${className}`}
      />
    );
  }

  // ①選択されていないセル：div要素
  if (!isFocused) {
    return (
      <div
        ref={divRef}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        data-row-id={rowId}
        data-col={colIndex}
        className={`w-full px-0 outline-none cursor-cell min-h-[1.5rem] ${className}`}
      >
        {value || '\u00A0'}
      </div>
    );
  }

  // ②③選択されているセル：input要素（選択モード・編集モード）
  return (
    <input
      ref={inputRef}
      type="text"
      value={isComposing ? composingValue : value}
      onChange={handleChange}
      onFocus={(e) => {
        onFocus(e);
        // カーソルを末尾に配置
        const len = e.currentTarget.value.length;
        e.currentTarget.setSelectionRange(len, len);
      }}
      onBlur={onBlur}
      onKeyDown={handleKeyDown}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      data-row-id={rowId}
      data-col={colIndex}
      data-is-composing={isComposing}
      data-mode={mode}
      tabIndex={0}
      className={`
        w-full border-none outline-none px-0 focus:ring-0 min-h-[1.5rem]
        ${mode === 'edit' ? 'caret-auto bg-transparent' : 'caret-transparent bg-blue-100 selection:bg-transparent selection:text-current'}
        ${className}
      `}
    />
  );
};
