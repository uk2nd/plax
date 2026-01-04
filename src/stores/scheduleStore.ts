import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// UUID生成関数
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// 共通ヘルパー関数

// 既存項目の更新または新規作成
function updateOrCreate<T extends { order: number }>(
  items: T[],
  order: number,
  updateFn: (item: T) => T,
  createFn: () => T
): T[] {
  const existingIndex = items.findIndex((item) => item.order === order);
  
  if (existingIndex !== -1) {
    return items.map((item, index) => 
      index === existingIndex ? updateFn(item) : item
    );
  } else {
    return [...items, createFn()];
  }
}

// 部分更新ヘルパー
function updateItemByOrder<T extends { order: number }>(
  items: T[],
  order: number,
  updates: Partial<T>
): T[] {
  return items.map((item) =>
    item.order === order ? { ...item, ...updates } : item
  );
}

// データ型定義
export type Milestone = {
  id: string;
  order: number;
  name: string;
  date: string;
};

export type Lane = {
  id: string;
  order: number;
  type: 'lane' | 'task';
  name: string;
};

export type Task = {
  id: string;
  order: number;
  type: 'lane' | 'task';
  laneId: string;
  name: string;
  startDate: string;
  endDate: string;
};

type ScheduleStore = {
  milestones: Milestone[];
  lanes: Lane[];
  tasks: Task[];
  
  // Milestone操作
  setMilestone: (order: number, name: string, date: string) => void;
  updateMilestoneName: (order: number, name: string) => void;
  updateMilestoneDate: (order: number, date: string) => void;
  deleteMilestone: (id: string) => void;
  updateMilestoneOrder: (oldOrder: number, newOrder: number) => void;
  
  // Lane/Task操作（統合）
  setLaneOrTask: (
    order: number,
    isLane: boolean,
    laneName: string,
    taskName: string,
    startDate: string,
    endDate: string,
    laneId?: string
  ) => void;
  updateLaneName: (order: number, name: string) => void;
  updateTaskName: (order: number, name: string, laneId?: string) => void;
  updateTaskStartDate: (order: number, startDate: string, laneId?: string) => void;
  updateTaskEndDate: (order: number, endDate: string, laneId?: string) => void;
  deleteRowData: (order: number) => void;
  updateLaneTaskOrder: (oldOrder: number, newOrder: number) => void;
  
  // ユーティリティ
  clearAll: () => void;
};

export const useScheduleStore = create<ScheduleStore>()(
  devtools(
    (set) => ({
      milestones: [],
      lanes: [],
      tasks: [],
  
  // Milestoneを設定または更新
  setMilestone: (order: number, name: string, date: string) => {
    set((state) => {
      // 空の値の場合は削除
      if (name.trim() === '' && date.trim() === '') {
        return {
          milestones: state.milestones.filter((m) => 
            m.name.trim() !== '' || m.date.trim() !== ''
          )
        };
      }
      
      return {
        milestones: updateOrCreate(
          state.milestones,
          order,
          (m) => ({ ...m, name, date }),
          () => ({ id: generateUUID(), order, name, date })
        )
      };
    });
  },
  
  updateMilestoneName: (order: number, name: string) => {
    set((state) => ({
      milestones: updateOrCreate(
        state.milestones,
        order,
        (m) => ({ ...m, name }),
        () => ({ id: generateUUID(), order, name, date: '' })
      )
    }));
  },
  
  updateMilestoneDate: (order: number, date: string) => {
    set((state) => ({
      milestones: updateOrCreate(
        state.milestones,
        order,
        (m) => ({ ...m, date }),
        () => ({ id: generateUUID(), order, name: '', date })
      )
    }));
  },
  
  deleteMilestone: (id: string) => {
    set((state) => ({
      milestones: state.milestones.filter((m) => m.id !== id),
    }));
  },
  
  updateMilestoneOrder: (oldOrder: number, newOrder: number) => {
    set((state) => ({
      milestones: updateItemByOrder(state.milestones, oldOrder, { order: newOrder })
    }));
  },
  
  // LaneまたはTaskを設定または更新（統合版）
  setLaneOrTask: (
    order: number,
    isLane: boolean,
    laneName: string,
    taskName: string,
    startDate: string,
    endDate: string,
    laneId?: string
  ) => {
    set((state) => {
      if (isLane) {
        // レーン行の処理
        if (laneName.trim() === '') {
          return { lanes: state.lanes.filter((l) => l.order !== order) };
        }
        
        return {
          lanes: updateOrCreate(
            state.lanes,
            order,
            (l) => ({ ...l, name: laneName }),
            () => ({ id: generateUUID(), order, type: 'lane' as const, name: laneName })
          )
        };
      } else {
        // タスク行の処理
        if (taskName.trim() === '' && startDate.trim() === '' && endDate.trim() === '') {
          return { tasks: state.tasks.filter((t) => t.order !== order) };
        }
        
        return {
          tasks: updateOrCreate(
            state.tasks,
            order,
            (t) => ({ ...t, name: taskName, startDate, endDate, laneId: laneId || '' }),
            () => ({
              id: generateUUID(),
              order,
              type: 'task' as const,
              laneId: laneId || '',
              name: taskName,
              startDate,
              endDate,
            })
          )
        };
      }
    });
  },
  
  updateLaneName: (order: number, name: string) => {
    set((state) => ({
      lanes: updateOrCreate(
        state.lanes,
        order,
        (l) => ({ ...l, name }),
        () => ({ id: generateUUID(), order, type: 'lane' as const, name })
      )
    }));
  },
  
  updateTaskName: (order: number, name: string, laneId?: string) => {
    set((state) => ({
      tasks: updateOrCreate(
        state.tasks,
        order,
        (t) => ({ ...t, name, laneId: laneId || t.laneId }),
        () => ({
          id: generateUUID(),
          order,
          type: 'task' as const,
          laneId: laneId || '',
          name,
          startDate: '',
          endDate: '',
        })
      )
    }));
  },
  
  updateTaskStartDate: (order: number, startDate: string, laneId?: string) => {
    set((state) => ({
      tasks: updateOrCreate(
        state.tasks,
        order,
        (t) => ({ ...t, startDate, laneId: laneId || t.laneId }),
        () => ({
          id: generateUUID(),
          order,
          type: 'task' as const,
          laneId: laneId || '',
          name: '',
          startDate,
          endDate: '',
        })
      )
    }));
  },
  
  updateTaskEndDate: (order: number, endDate: string, laneId?: string) => {
    set((state) => ({
      tasks: updateOrCreate(
        state.tasks,
        order,
        (t) => ({ ...t, endDate, laneId: laneId || t.laneId }),
        () => ({
          id: generateUUID(),
          order,
          type: 'task' as const,
          laneId: laneId || '',
          name: '',
          startDate: '',
          endDate,
        })
      )
    }));
  },
  
  // 指定されたorderのデータを削除
  deleteRowData: (order: number) => {
    set((state) => ({
      lanes: state.lanes.filter((l) => l.order !== order),
      tasks: state.tasks.filter((t) => t.order !== order),
    }));
  },
  
  updateLaneTaskOrder: (oldOrder: number, newOrder: number) => {
    set((state) => ({
      lanes: updateItemByOrder(state.lanes, oldOrder, { order: newOrder }),
      tasks: updateItemByOrder(state.tasks, oldOrder, { order: newOrder }),
    }));
  },
  
  // すべてのデータをクリア
  clearAll: () => {
    set({ milestones: [], lanes: [], tasks: [] });
  },
}),
    { name: 'ScheduleStore' }
  )
);
