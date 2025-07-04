import { fetchScheduleData } from "@/lib/actions/schedule/fetchScheduleData";
import { TimelineCanvas } from "@/components/schedule/TimelineCanvas";
import { PhaseList } from "@/components/schedule/PhaseList";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ projectId: string }>;
};

export default async function SchedulePage({ params }: Props) {
  const { projectId } = await params;

  try {
    const data = await fetchScheduleData(projectId);

    return (
      <div className="w-[90vw] h-[90vh] flex">
        <PhaseList phases={data.phases} projectId={projectId} />
        <TimelineCanvas phases={data.phases} tasks={data.tasks} />
      </div>
    );
  } catch (error) {
    console.error("Failed to load schedule data:", error);
    return notFound();
  }
}
