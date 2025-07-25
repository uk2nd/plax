"use client"

import Link from "next/link"
import { ProjectProps } from "@/types/project"
import ProjectMenu from "@/components/project/ProjectMenu"

export default function ProjectList({ projects }: { projects: ProjectProps[] }) {
  return (
    <div className="space-y-1">
      {projects.length === 0 ? (
        <div className="px-2 py-4 text-sm text-gray-500">
          プロジェクトがまだ作成されていません
        </div>
      ) : (
        projects.map((project) => (
          <div
            key={project.id}
            className="flex items-center justify-between px-2 py-1 text-white hover:bg-gray-800 rounded-md"
          >
            <Link
              href={`/dashboard/${project.id}/schedule`}
              className="hover:underline"
            >
              {project.name}
            </Link>
            <ProjectMenu projectId={project.id} projectName={project.name} />
          </div>
        ))
      )}
    </div>
  )
}
