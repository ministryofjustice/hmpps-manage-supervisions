export interface Risks {
  community?: {
    level: Level
    risks: RoshRisk[]
  }
  self?: {
    harm: FlatRiskToSelf
    custody: FlatRiskToSelf
    vulnerability: FlatRiskToSelf
  }
}

export interface RoshRisk {
  riskTo: string
  level: Level
}

export interface Level {
  class: string
  text: string
  index: number
}

export interface RegistrationFlag {
  text: string
  class: string
}

export interface FlatRiskToSelf {
  value: string
  notes: { current?: string; previous?: string }
}
