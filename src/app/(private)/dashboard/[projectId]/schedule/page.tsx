import { fetchScheduleData } from "@/lib/actions/schedule/fetchScheduleData";
import { TimelineCanvas } from "@/components/schedule/TimelineCanvas";
import { PhaseList } from "@/components/schedule/PhaseList";
import { notFound } from "next/navigation";

type Props = {
  params: { projectId: string };
};

export default async function SchedulePage( { params }: Props ) {
  const { projectId } = await params;

  try {
    const data = await fetchScheduleData(projectId);

    return (
      <div className="h-full w-full flex">
        <PhaseList phases={data.phases} />
        <TimelineCanvas
          project={data.project}
          phases={data.phases}
          tasks={data.tasks}
        />
      </div>
    );
  } catch (error) {
    console.error("Failed to load schedule data:", error);
    return notFound(); // 404ページへ
  }
}