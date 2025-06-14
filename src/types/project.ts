import { Dispatch, SetStateAction } from "react"

export type ProjectProps = {
  id: string
  name: string
}

export type ProjectMenuProps = {
  projectId: string
  projectName: string
}

export type ProjectDeleteProps = {
  open: boolean
  onOpenChange: Dispatch<SetStateAction<boolean>>
  projectId: string
}

export type ProjectEditProps = {
  open: boolean
  onOpenChange: Dispatch<SetStateAction<boolean>>
  projectId: string
  currentName: string
}
