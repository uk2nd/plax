import { create } from 'zustand';

// UUID生成関数
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// データ型定義
export type Milestone = {
  id: string;
  name: string;
  date: string;
};

export type Lane = {
  id: string;
  rowIndex: number;
  name: string;
};

export type Task = {
  id: string;
  rowIndex: number;
  name: string;
  startDate: string;
  endDate: string;
};

type ScheduleStore = {
  milestones: Milestone[];
  lanes: Lane[];
  tasks: Task[];
  
  // Milestone操作
  setMilestone: (rowIndex: number, name: string, date: string) => void;
  deleteMilestone: (id: string) => void;
  
  // Lane/Task操作（統合）
  setLaneOrTask: (
    rowIndex: number,
    isLane: boolean,
    laneName: string,
    taskName: string,
    startDate: string,
    endDate: string
  ) => void;
  deleteRowData: (rowIndex: number) => void;
  
  // ユーティリティ
  clearAll: () => void;
};

export const useScheduleStore = create<ScheduleStore>((set) => ({
  milestones: [],
  lanes: [],
  tasks: [],
  
  // Milestoneを設定または更新
  setMilestone: (rowIndex: number, name: string, date: string) => {
    set((state) => {
      // 空の値の場合は削除
      if (name.trim() === '' && date.trim() === '') {
        return {
          milestones: state.milestones.filter((m) => {
            // rowIndexを使って特定できないため、空のデータをクリーンアップ
            return m.name.trim() !== '' || m.date.trim() !== '';
          })
        };
      }
      
      // 既存のマイルストーンをrowIndexで検索（簡易的にインデックスで管理）
      const existingIndex = state.milestones.findIndex((_, idx) => idx === rowIndex);
      
      if (existingIndex >= 0) {
        // 既存のマイルストーンを更新
        const updatedMilestones = [...state.milestones];
        updatedMilestones[existingIndex] = {
          ...updatedMilestones[existingIndex],
          name,
          date,
        };
        return { milestones: updatedMilestones };
      } else {
        // 新しいマイルストーンを追加
        return {
          milestones: [
            ...state.milestones,
            {
              id: generateUUID(),
              name,
              date,
            },
          ],
        };
      }
    });
  },
  
  deleteMilestone: (id: string) => {
    set((state) => ({
      milestones: state.milestones.filter((m) => m.id !== id),
    }));
  },
  
  // LaneまたはTaskを設定または更新（統合版）
  setLaneOrTask: (
    rowIndex: number,
    isLane: boolean,
    laneName: string,
    taskName: string,
    startDate: string,
    endDate: string
  ) => {
    set((state) => {
      if (isLane) {
        // レーン行の処理
        if (laneName.trim() === '') {
          // 空の場合は削除
          return {
            lanes: state.lanes.filter((l) => l.rowIndex !== rowIndex),
          };
        }
        
        // 既存のレーンを検索
        const existingLane = state.lanes.find((l) => l.rowIndex === rowIndex);
        
        if (existingLane) {
          // 既存のレーンを更新
          return {
            lanes: state.lanes.map((l) =>
              l.rowIndex === rowIndex ? { ...l, name: laneName } : l
            ),
          };
        } else {
          // 新しいレーンを追加
          return {
            lanes: [
              ...state.lanes,
              {
                id: generateUUID(),
                rowIndex,
                name: laneName,
              },
            ],
          };
        }
      } else {
        // タスク行の処理
        if (taskName.trim() === '' && startDate.trim() === '' && endDate.trim() === '') {
          // 空の場合は削除
          return {
            tasks: state.tasks.filter((t) => t.rowIndex !== rowIndex),
          };
        }
        
        // 既存のタスクを検索
        const existingTask = state.tasks.find((t) => t.rowIndex === rowIndex);
        
        if (existingTask) {
          // 既存のタスクを更新
          return {
            tasks: state.tasks.map((t) =>
              t.rowIndex === rowIndex
                ? { ...t, name: taskName, startDate, endDate }
                : t
            ),
          };
        } else {
          // 新しいタスクを追加
          return {
            tasks: [
              ...state.tasks,
              {
                id: generateUUID(),
                rowIndex,
                name: taskName,
                startDate,
                endDate,
              },
            ],
          };
        }
      }
    });
  },
  
  // 指定されたrowIndexのデータを削除
  deleteRowData: (rowIndex: number) => {
    set((state) => ({
      lanes: state.lanes.filter((l) => l.rowIndex !== rowIndex),
      tasks: state.tasks.filter((t) => t.rowIndex !== rowIndex),
    }));
  },
  
  // すべてのデータをクリア
  clearAll: () => {
    set({ milestones: [], lanes: [], tasks: [] });
  },
}));
