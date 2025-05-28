"use client"

import Link from "next/link"

type Project = {
  id: string
  name: string
}

export default function ProjectList({ projects }: { projects: Project[] }) {
  return (
    <>
      {projects.map((project) => (
        <Link
          key={project.id}
          href={`/dashboard/project/${project.id}`}
          className="block px-2 py-1 hover:underline text-white"
        >
          {project.name}
        </Link>
      ))}
    </>
  )
}
