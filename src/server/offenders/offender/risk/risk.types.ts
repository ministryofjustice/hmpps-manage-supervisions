export interface Risks {
  overallLevel: Level
  communityRisks: RoshRisk[]
}

export interface RoshRisk {
  riskTo: string
  level: Level
}

export interface Level {
  key: string
  class: string
  text: string
}

export interface RegistrationFlag {
  text: string
  class: string
}
