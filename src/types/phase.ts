import { Dispatch, SetStateAction } from "react"

export type PhaseMenuProps = {
  phaseId: string
  phaseName: string
}

export type PhaseEditProps = {
  open: boolean
  onOpenChange: Dispatch<SetStateAction<boolean>>
  phaseId: string
  currentName: string
}

export type PhaseDeleteProps = {
  open: boolean
  onOpenChange: Dispatch<SetStateAction<boolean>>
  phaseId: string
}
