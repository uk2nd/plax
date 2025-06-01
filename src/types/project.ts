import { Dispatch, SetStateAction } from "react"

export type ProjectProps = {
  id: string
  name: string
}

export type ProjectDeleteProps = {
  open: boolean
  onOpenChange: Dispatch<SetStateAction<boolean>>
  projectId: string
}

