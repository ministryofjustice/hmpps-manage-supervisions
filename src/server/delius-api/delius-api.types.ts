import { ContactV1ApiPatchContactRequest } from './client'

export interface Operation {
  op: string
  path: string
  value: any
}

export interface PatchContactRequest extends ContactV1ApiPatchContactRequest {
  body: Operation[]
}
