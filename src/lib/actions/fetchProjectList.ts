import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function fetchProjectList() {
  const session = await auth()
  const email = session?.user?.email
  if (!email) return []

  const user = await db.user.findUnique({
    where: { email },
    include: {
      userProjects: {
        include: {
          project: true,
        },
      },
    },
  })

  if (!user) return []

  return user.userProjects.map(({ project }) => ({
    id: project.id,
    name: project.name,
  }))
}
