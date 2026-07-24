import { Attributes } from "onecore"

export interface User {
  id: string
  username: string
  email?: string
  phone?: string
  dateOfBirth?: Date
}
export const userModel: Attributes = {
  id: {
    length: 40,
  },
  username: {
    required: true,
    length: 255,
  },
  email: {
    format: "email",
    required: true,
    length: 120,
  },
  phone: {
    format: "phone",
    required: true,
    length: 14,
  },
  dateOfBirth: {
    column: "date_of_birth",
    type: "datetime",
  },
}
