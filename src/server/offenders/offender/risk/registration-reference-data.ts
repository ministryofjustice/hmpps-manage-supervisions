import { RiskReferenceData } from './risk.types'

/*
  Registration reference data. The descriptions here aren't shown to users, they are just to make this file easier to use.
*/
export const riskReferenceData: RiskReferenceData = {
  // Alert notice has 2 active codes
  ALAN: {
    description: 'Alert Notice',
    suggestedReviewFrequency: 6,
    purpose: 'To distribute priority information/warning/alerts relating to an offender.',
    furtherInformation:
      'Should only be used when a national alert notice has been issued. <br>Prompts User Alert Notice when viewing the Offender Record.',
    termination: "Don't remove at termination.",
  },
  ALERT: {
    description: 'Alert Notice',
    suggestedReviewFrequency: 6,
    purpose: 'To distribute priority information/warning/alerts relating to an offender.',
    furtherInformation:
      'Should only be used when a national alert notice has been issued. <br>Prompts User Alert Notice when viewing the Offender Record.',
    termination: "Don't remove at termination.",
  },
  ADWC: {
    description: 'Barred from working with Children',
    suggestedReviewFrequency: 6,
    purpose:
      'To denote those offenders who are in the DBS Children’s Barred List or subject to a disqualification order. ',
    furtherInformation:
      'This will assist to manage risk and ensure appropriate work/group placements and allocation of resources (ETE, housing, safeguarding monitoring).<br>Previously called “Disqualified from working with Children”. Previously categorised under Public Protection.',
    termination: "Don't remove at termination.",
  },
  RCCO: {
    description: 'Child Concerns',
    suggestedReviewFrequency: 3,
    purpose:
      'To capture ROH safeguarding concerns.<br>Appropriate to use when a referral is in progress or under review (protection plan/conference yet to be confirmed/arranged). <br>Links to OASys R2.2.',
    furtherInformation:
      'Denotes environment in which child is deemed to be at risk from offender or where offender lives in an environment where child is deemed to be at risk of harm from others – but child is not subject to a protection plan.',
    termination: 'Remove at termination<br>(terminate as links to referral in progress or CP plan yet to be activated)',
  },
  RCPR: {
    description: 'Child Protection',
    suggestedReviewFrequency: 3,
    purpose:
      'To capture ROH safeguarding concerns.<br>Denotes child who is at risk of harm and is subject to a child protection plan/conference',
    furtherInformation:
      'Denotes child who is at risk of harm and is subject to a child protection plan/conference – either at risk directly from offender or where offender lives in an environment where child is deemed to be at risk of harm from others.',
    termination: 'Remove at termination<br>(terminate as it relates to child being on a CP plan)',
  },
  CSEP: {
    description: 'Child Sexual Exploitation – Perpetrator',
    suggestedReviewFrequency: 3,
    purpose: 'To identify offenders where child sexual exploitation is believed to be a factor in their offending.',
    furtherInformation:
      'Offenders who commit child sexual exploitation may be convicted of a range of offences, which might or might not be sexual offences. Practitioners need to make an assessment of whether child sexual exploitation was a factor in the offence.',
    termination: 'Remove at termination<br>ALT register can be added',
  },
  REG30: {
    description: 'Domestic Abuse History',
    suggestedReviewFrequency: 0,
    purpose: 'To denote history of domestic abuse (where there are not specifically current concerns)',
    furtherInformation: 'Previously categorised under Public Protection',
    termination: "Don't remove at termination.",
  },
  ADVP: {
    description: 'Domestic Abuse Perpetrator',
    suggestedReviewFrequency: 3,
    purpose:
      'Will denote any offender who presents evidence of domestic abuse as a perpetrator (conviction not necessary to trigger registration). ',
    furtherInformation:
      'The cross-government definition of domestic violence and abuse is:<br>Any incident or pattern of incidents of controlling, coercive, threatening behavior, violence or abuse between those aged 16 or over who are, or have been, intimate partners or family members regardless of gender or sexuality. The abuse can encompass, but is not limited to: Psychological, physical, Sexual, financial, emotional<br>Will ensure appropriate management and identification of such offenders and prompt appropriate review of risk in cases where concerns relating to domestic abuse are not related to index offence/conviction (as outlined in current event/Court referral).<br>Will allow management to monitor this specific group of offenders and manage available resources as appropriate (i.e. Allocation of such cases to appropriate grades of staff).  <br>Registration allows easy identification of such risk concerns – especially in circumstances where the index offence/conviction does not immediately identify Domestic Abuse concerns/behaviour. ',
    termination: 'Remove at termination.',
  },
  ADVV: {
    description: 'Domestic Abuse Victim',
    suggestedReviewFrequency: 6,
    purpose: 'To denote an offender where there are concerns of victimisation/ROSH (Domestic Abuse – victim). ',
    furtherInformation:
      'Registration may assist to identify any measures put in place to ensure health and safety / risk management, namely:<br>Managing offender reporting in conjunction with other offenders/DV perpetrator.<br>Ensuring staff safety and risk management during planned home visits / off site meetings / court appearances / etc.<br>Ensuring risk to others is identified and managed (i.e. Safeguarding / Child protection). <br>Previously named Domestic Violence Victim',
    termination: 'Remove at termination.',
  },
  DOFF: {
    description: 'Duplicate Offender Records Exist',
    suggestedReviewFrequency: 6,
    purpose:
      'In circumstances where there are multiple Offender Records for the same offender, this register should be used to indicate the main record to be retained. ',
    furtherInformation:
      'Register currently active for migration purposes. <br>Used in conjunction with ‘Known Duplicate Offender’. Current register used in live environment to match KDO details. <br>Details of the duplicate CRNs can be added to the offender record as Additional Identifiers. ',
    termination: "Don't remove at termination.",
  },
  IRMO: {
    description: 'Hate Crime',
    suggestedReviewFrequency: 6,
    purpose: 'To denote a perpetrator of Hate Crime.',
    furtherInformation:
      'Hate crime is any criminal offence committed against a person or property that is perceived by the victim or any other person as being motivated by an offender’s prejudice or hatred of someone because of their:<br>Race, colour, ethnic origin, nationality or national origins.<br>Religion.<br>Gender or gender identity.<br>Sexual orientation.<br>Disability.<br><br>Note: It is not currently possible to record multiple categories against the registration. If it is necessary to record more than one Hate Crime category, this detail should be recorded within Personal Circumstances. ',
    termination: 'Remove at termination – Links to Current Offences',
  },
  RHRH: {
    description: 'High RoH',
    suggestedReviewFrequency: 6,
    purpose: 'To capture the latest RoH value as assessed by OASys',
    furtherInformation:
      'Improved efficiency: reduced time inputting ROH category into PCMS/OASYS separately. <br>Improved record keeping/data quality: PCMS is updated following completion of OASYS assessment. ',
    termination: 'Remove at termination.',
  },
  HOIE: {
    description: 'Home Office Interest',
    suggestedReviewFrequency: 6,
    purpose: 'Where deportation / removal procedures are confirmed by HOIE the HOI Register should be added',
    furtherInformation:
      'Where an offender is a foreign national and is either a serious offender (subject to a custodial sentence of over 12 months) or a persistent offender the Responsible Officer should contact HOIE to seek advice as to whether the offender will be subject to either deportation or removal processes <br>OR<br>If the court recommended Deportation<br>THEN<br>The Home Officer Interest register should be added.',
    termination: "Don't remove at termination.",
  },
  IIOM: {
    description: 'Integrated Offender Management',
    suggestedReviewFrequency: 6,
    purpose:
      'Will capture and identify those offenders who fall under scope of the IOM model.<br>Fix - Focus on persistent offenders (statutory) defined by a high OGRS score or recent arrest record with priority weighting given to more serious persistent offenders (e.g. burglars, robbers).<br> This cohort is likely to overlap with the AC EM pathfinder cohort, but being on the EM pathfinder does not guarantee IOM participation as selection onto IOM is determined locally<br>Flex – Index offence of persistent offenders will vary by area<br>% of referrals based on professional judgement from all police, Probation (including courts) and other partners. <br>Free - Freedom to use surplus resource to run IOM schemes for other cohorts – with possibility of future strategies addressing these specific cohorts.',
    furtherInformation:
      'Identifies those offenders who fall under scope of the IOM matrix (as implemented/designed by local area). <br>Will identify the most prolific offenders and thus highlight need for higher level of offender management/resource provision/allocation.  <br>Will assist Court staff and external staff to immediately identify IOM status and thus refer the case to the appropriate IOM unit as appropriate. <br> Will allow management to monitor this specific group of offenders and capture data relating to reoffending rates, compliance and enforcement, obtaining external resource, etc.',
    termination:
      "Don't remove at termination. – Determined by IOM intervention (checking with Carina Head of Extremism – IOM Lead)",
  },
  IKII: {
    description: 'Keep IICSA',
    suggestedReviewFrequency: 3,
    purpose: 'To identify and retain electronic records within Delius.',
    furtherInformation:
      'In accordance with instruction issued by NOMS, on the ban of destruction of information as part of the Independent Inquiry into Child sexual Abuse (IICSA). <br>Please refer to annex A of the instruction issued on 20 July 2015 for further detailed information on how to identify these cases.',
    termination: "Don't remove at termination.",
  },
  KDUP: {
    description: 'Known Duplicate Offender',
    suggestedReviewFrequency: 6,
    purpose:
      'In circumstances where there are multiple Offender Records for the same offender, this register should be used to indicate the duplicate record(s) to be merged with the main record.',
    furtherInformation:
      'Register currently active for migration purposes. <br>Used in conjunction with ‘Duplicate Offender Records Exist’ Register. Current register used in live environment to match KDO details.<br> Details of the duplicate CRNs can be added to the offender record as Additional Identifiers.',
    termination: "Don't remove at termination.",
  },
  INLL: {
    description: 'Lifer',
    suggestedReviewFrequency: 12,
    purpose:
      'To identify all cases made subject to life imprisonment/detention and IPP.<br>*Lifer review period<br> If in custody is there a need to review these every 12 months? Currently the guidance is an OASys review every three years for lifers (post ISP) and for IPP’s (post ISP) they are completed following a significant change. Should the options tie in with these or will this overcomplicate things?<br>Once in the community, lifers (excluding IPP’s) have to be reviewed within 3 months of release at a head of service lifer panel and then every 12 months thereafter.  For IPP it will be 12 monthly although they could be subject to an IPP progression panel.',
    furtherInformation:
      'Will prompt POM/COM to complete timely risk assessments.<br>Will prompt POM/COM to bring case to a lifer/IPP review panel as required.<br>Will allow management to monitor the number of lifers/IPP in custody/community and ensure appropriate allocation of resources.<br>Will prompt POM/COM to ensure appropriate MAPPA oversight',
    termination: "Don't remove at termination.",
  },
  RLRH: {
    description: 'Low RoH',
    suggestedReviewFrequency: 6,
    purpose: 'To capture the latest RoH value as assessed by OASys',
    furtherInformation:
      'Improved efficiency: reduced time inputting ROH category into PCMS/OASYS separately. <br>Improved record keeping/data quality: PCMS is updated following completion of OASYS assessment.',
    termination: 'Remove at termination.',
  },
  MAPP: {
    description: 'MAPPA',
    suggestedReviewFrequency: 3,
    purpose: 'Will identify MAPPA offenders',
    furtherInformation:
      'Category 1: All Registered Sex Offenders. <br>Category 2: Violent offenders sentenced to 12 months or more imprisonment for a Schedule 15. CJA Act 2003 offence.<br>Category 3: Other dangerous offenders not falling under Cat 1 or Cat 2 eligibility criteria who indicate capable of causing serious harm and are deemed to require MAPPA Level 2/3 management. (Review period will be determined by selected MAPPA management level).<br> Registration will prompt referral and review.<br> Registration allows management oversight of MAPPA caseload and thus improves efficiency savings by ensuring appropriate resource allocation. ',
    termination: 'Remove at termination. No longer MAPPA managed by Probation. ALT register can be added',
  },
  NOTMAPPA: {
    description: 'Not MAPPA Eligible',
    suggestedReviewFrequency: 0,
    purpose: 'To confirm offender is not MAPPA eligible in circumstances where it is appropriate to do so. ',
    furtherInformation:
      'The ‘Not MAPPA Eligible’ Registration should be used in circumstances where at face value an offender appears to be MAPPA Eligible. The use of the ‘Not MAPPA Eligible’ provides immediate clarification to all staff that the case has been appropriately considered and reviewed. (The MAPPA Identification Tool should be used in all cases to ensure accurate recording.)',
    termination: 'Remove at termination.',
  },
  IMAR: {
    description: 'MARAC',
    suggestedReviewFrequency: 3,
    purpose: 'To denote active MARAC referral (Perp or Victim)',
    furtherInformation:
      'Multi Agency Risk Assessment Conference:<br>Specifically designed to ensure protection of identified victim(s) of Domestic Abuse (those assessed to be at highest risk of harm – including direct and indirect risks to children who witness/experience domestic abuse).<br>Differs from MAPPA in so far as referrals are made in relation to the assessed risk of harm posed to the identified/intended victim. Thus MARACs are held in relation to location of the victim and not the location/place of residence of the perpetrator. Likewise it is not necessary for the perpetrator to have been convicted or even charged with an offence in order for a MARAC referral to be completed. <br>In cases where the perpetrator is MAPPA eligible/registered, MAPPA takes precedence over MARAC in terms of risk management and associated decisions in terms of victim/child/public protection and control measures that are identified and imposed.  ',
    termination: 'Remove at termination. No longer current Referral',
  },
  RMRH: {
    description: 'Medium RoH',
    suggestedReviewFrequency: 6,
    purpose: 'To capture the latest RoH value as assessed by OASys',
    furtherInformation:
      'Improved efficiency: reduced time inputting ROH category into PCMS/OASYS separately. <br>Improved record keeping/data quality: PCMS is updated following completion of OASYS assessment. ',
    termination: 'Remove at termination.',
  },
  AMHL: {
    description: 'Mental Health Issues',
    suggestedReviewFrequency: 6,
    purpose: 'Can be used to identify offenders who present any form/degree of mental health issue.',
    furtherInformation:
      'This could be used to reflect temporary/permanent/recurring issue.<br>Will assist to highlight potential health and safety / ROH issues that need to be considered by any member of staff working with the offender.<br>May prompt Court staff, UPW staff and external providers to consider specific needs of the offender and tailor services provided accordingly. Thus may encourage offender engagement.<br>Will allow management to monitor numbers of registered offenders and review resource allocation / service provision.',
    termination: 'Remove at termination. ALT register can be added',
  },
  RMDO: {
    description: 'Mentally Disordered Offender',
    suggestedReviewFrequency: 6,
    purpose: 'To denote MDOs',
    furtherInformation: '',
    termination: 'Remove at termination. ALT register can be added',
  },
  ANSO: {
    description: 'Non Registered Sex Offender',
    suggestedReviewFrequency: 3,
    purpose:
      'To identify offenders who have been convicted of a sexual offence not classified under the Sexual Offences Act 2003',
    furtherInformation:
      'Offenders convicted of such offences are not required to observe a notification period or requirements of the Sex Offender Register.<br>Will also denote offenders who demonstrate sexual offending behaviour that would not fall under MAPPA Cat 1.',
    termination: 'Remove at termination. Not managed by Probation Post Sentence',
  },
  REG26: {
    description: 'Organised Crime',
    suggestedReviewFrequency: 6,
    purpose:
      'To denote those individuals typically involved in drug or people trafficking where criminal links exist between towns and cities in the UK and often have international connections as well. ',
    furtherInformation:
      'There is no legal definition of organised crime in England and Wales. For the purposes of the Government’s Serious and Organised Crime Strategy (2013), organised crime is serious crime planned, coordinated and conducted by people working together on a continuing basis. Their motivation is often, but not always, financial gain.<br><br>Organised crime is characterised by violence or the threat of violence and by the use of bribery and corruption: organised criminals very often depend on the assistance of corrupt, complicit or negligent professionals, notably lawyers, accountants and bankers. Organised crime also uses sophisticated technology to conduct operations, maintain security and evade justice.<br><br>Organised crime includes drug trafficking, human trafficking, and organised illegal immigration, high value fraud and other financial crimes, counterfeiting, organised acquisitive crime and cyber-crime. It can also include serious crime which demands a national coordinated response, notably other fraud and child sexual exploitation.<br><br>There is currently varying practice across the NPS with regards to flagging SOC offenders. Full guidance will be developed and published during 2016.',
    termination: 'Remove at termination. ALT register can be added',
  },
  APPO: {
    description: 'PPO',
    suggestedReviewFrequency: 6,
    purpose: 'Denotes Prolific Priority Offenders.',
    furtherInformation:
      'May be replaced by IOM registrations as rolled out across trusts. <br>Default review period should reflect frequency of local review of PPO cohort. <br>Identification of this group of offenders ensures appropriate resource allocation and correct tier of offender management.',
    termination: 'Remove at termination.',
  },
  RPIR: {
    description: 'Public Interest Case',
    suggestedReviewFrequency: 6,
    purpose: '',
    furtherInformation: '',
    termination: 'Remove at termination. ALT register can be added',
  },
  IKMF: {
    description: 'Record to be Retained',
    suggestedReviewFrequency: 12,
    purpose:
      'To identify offenders where an assessment has been made that it is necessary to exclude the offender record from the statutory 6 year DPA deletion process.',
    furtherInformation:
      'This should include any offender on whom the trust has recorded a decision to retain the record and detailed the justification for doing so.',
    termination: "Don't remove at termination.",
  },
  ARSO: {
    description: 'Registered Sex Offender',
    suggestedReviewFrequency: 3,
    purpose:
      'To identify offenders convicted under the Sexual Offences Act 2003 and therefore subject to the notification period and requirements of the Sex Offender Register.',
    furtherInformation:
      'Notification Periods for offenders sentenced under the Sexual Offences Act 2003: <br>Imprisonment for a fixed period of 30 months or more, Imprisonment for an indefinite period, imprisonment for public protection, or admission to hospital under restriction order, or subject to an Order for Lifelong Restriction: Indefinitely <br>Imprisonment for more than 6 months but less than 30 months: 10 years<br>Imprisonment for 6 months or less, or admission to hospital without restriction order: 7 years<br>Caution: 2 years<br>Conditional discharge or (in Scotland) a probation order: Period of discharge or probation<br>Any other: 5 years<br>Finite notification periods are halved if the person is under 18 when convicted or cautioned.<br>If an offender is on the register for an indefinite period they can apply to the police area managing them to come off the register 15 years from their initial notification (if made upon release from prison) or first registration upon release from custody (in case they registered upon conviction).(Also extended licences will impact on this as well and will render people to be placed on the register indefinitely – stated case is R v Wiles.)',
    termination: 'Remove at termination, except for Life Sentences. ALT register can be added',
  },
  RRR: {
    description: 'Required Risk Review',
    suggestedReviewFrequency: 1,
    purpose: 'To indicate where a Risk Review has been requested by the NPS for a Case allocated to a CRC. ',
    furtherInformation:
      'At the point NPS allocates a new case, if the assessor determines that a risk review is required at a certain time post allocation of the case to a CRC, they will add a new registration against the Offender of type ‘Required Risk Review’.<br>The register is linked to the ‘Risk of Harm’ flag and has a default review period of 1 month – the review date should be changed to reflect the date specified at allocation/review.For cases where it has been identified that specific circumstances would trigger a review, the notes field on the current Risk of Harm register can be used to record the specific circumstances that have been identified.',
    termination: 'Remove at termination.',
  },
  RCHD: {
    description: 'Risk to Children',
    suggestedReviewFrequency: 3,
    purpose:
      'To capture ROH safeguarding concerns.<br>To be used when Risk to Children is assessed as Medium or above in OASys R10.6',
    furtherInformation:
      'Denotes risk of serious harm posed by offender to children whose identity is known or to children in general.',
    termination: 'Remove at termination.',
  },
  REG15: {
    description: 'Risk to Known Adult',
    suggestedReviewFrequency: 6,
    purpose: 'Should reflect OASys / Risk assessment',
    furtherInformation: '',
    termination: 'Remove at termination.',
  },
  REG16: {
    description: 'Risk to Prisoner',
    suggestedReviewFrequency: 6,
    purpose: 'Should reflect OASys / Risk assessment',
    furtherInformation: '',
    termination: 'Remove at termination.',
  },
  REG17: {
    description: 'Risk to Public',
    suggestedReviewFrequency: 6,
    purpose: 'Should reflect OASys / Risk assessment',
    furtherInformation: '',
    termination: 'Remove at termination.',
  },
  AV2S: {
    description: 'Risk to Staff',
    suggestedReviewFrequency: 6,
    purpose: 'Denotes any offender who presents an identifiable risk of harm to staff members.',
    furtherInformation:
      'Will allow for immediate identification of such offenders and ensure appropriate health and safety measures are considered and followed. Will allow for monitoring of such offenders and effective risk management (in terms of office visits, home visits, Court appearances, group attendance, UPW work placements, etc).<br>Prompts User Alert Notice when viewing the Offender Record.',
    termination: 'Remove at termination. No longer current. ALT register can be added',
  },
  REG22: {
    description: 'Risk to ‘Adult at Risk’',
    suggestedReviewFrequency: 6,
    purpose: 'To capture ROH Safeguarding (Adults) Concerns.',
    furtherInformation:
      'This register should be used to denote where an offender is identified as posing a risk to an identified Vulnerable Adult as defined in No Secrets 2000',
    termination: 'Remove at termination.',
  },
  ASFO: {
    description: 'SFO',
    suggestedReviewFrequency: 3,
    purpose: 'Registration will denote offenders subject to Serious Further Offence review/investigation. ',
    furtherInformation:
      'Registration will allow easy identification and therefore management of such cases. <br>Probation Circular PI 04/2013 for further detail.',
    termination: 'Remove at termination – determined by SFO process. Yes – When review has been completed',
  },
  SOPS: {
    description: 'Sexual Harm Prevention Order/Sexual Risk Order',
    suggestedReviewFrequency: 3,
    purpose: 'To identify/record offenders who have been made subject of a Sexual Harm Prevention Order.',
    furtherInformation: 'To be recorded in Additional Sentences also',
    termination: 'Remove at termination, except for Life Sentences',
  },
  ALSH: {
    description: 'Suicide/Self Harm',
    suggestedReviewFrequency: 6,
    purpose: 'To provide immediate identification of any offender who presents active suicide/self-harm concerns.',
    furtherInformation:
      'Will alert any member of staff working directly with an offender and ensure appropriate risk management and health and safety precautions are considered. <br>Will allow management to review numbers of such registrations and allocate local resources / implement Health and Safety measures as necessary.<br> Identified by ‘Yes’ answer to current risk/concerns in section R8 of OASys.',
    termination: 'Remove at termination – ALT register can be added',
  },
  RTAO: {
    description: 'Terrorism Act Offender',
    suggestedReviewFrequency: 6,
    purpose: 'Ensures appropriate identification and monitoring of this group of offenders. ',
    furtherInformation:
      'Specific terrorist offences are detailed in Annex A of PI 05/2013Managing Terrorist and Extremist Offenders in the Community alongside those listed in Schedule 15 Criminal Justice Act 2003 as amended by The Legal Aid, Sentencing and Punishment of Offenders (LASPO) Act 2012. <br>Whilst there is no finite list of offences which are defined as terrorism cases for the purpose of this register offences listed in Annex A may be considered to be terrorism.<br> May also apply to certain persons dealt with for the specified terrorism offences prior to 1st October 2009. (Part 4 of the Counter- Terrorism Act 2008).',
    termination: 'Remove at termination – ALT register can be added',
  },
  RVHR: {
    description: 'Very High RoH',
    suggestedReviewFrequency: 6,
    purpose: 'To capture the latest RoH value as assessed by OASys',
    furtherInformation:
      'Improved efficiency: reduced time inputting ROH category into PCMS/OASYS separately. <br>Improved record keeping/data quality: PCMS is updated following completion of OASYS assessment.<br>Prompts User Alert Notice when viewing the Offender Record.',
    termination: 'Remove at termination.',
  },
  AVIS: {
    description: 'ViSOR',
    suggestedReviewFrequency: 6,
    purpose: 'Highlights offenders where a ViSOR record exists.',
    furtherInformation:
      'Allows for appropriate review of MAPPA caseload and prompts appropriate agency update/review of ViSOR records. Default review period should be consistent with MAPPA review periods.<br>In the United Kingdom, the Violent and Sex Offender Register (ViSOR) is a database of records of those required to register with the Police under the Sexual Offences Act 2003, those jailed for more than 12 months for violent offences, and unconvicted people thought to be at risk of offending. The Register can be accessed by the Police, National Probation Service and HM Prison Service personnel.',
    termination: "Don't remove at termination.",
  },
  INVI: {
    description: 'Victim Contact',
    suggestedReviewFrequency: 3,
    purpose: 'To identify cases in which statutory victim contact has been instigated/offered. ',
    furtherInformation:
      'Registration will prompt the offender manager to make contact with the VLO at key stages of the sentence. <br>Will highlight, monitor and record the need for additional licence conditions/disqualifications/restrictions to ensure protection of an identifiable victim(s).<br>Will clarify which cases fall under the VLO scope and what support/contact, if any, is being offered to ensure appropriate risk management/victim protection. ',
    termination: 'Remove at termination, except for Life Sentences',
  },
  RVLN: {
    description: 'Vulnerable',
    suggestedReviewFrequency: 0,
    purpose:
      'Use to denote a person has current vulnerability issues when applying the E3 Tiering Framework.  Vulnerable is identified by a ‘yes’ answer to current risk in section R8 of OASYS Full RoSH Analysis.',
    furtherInformation: '',
    termination: 'Remove at termination.',
  },
  WRSM: {
    description: 'Warrant /Summons',
    suggestedReviewFrequency: 3,
    purpose: 'To identify offenders who have an outstanding warrant or summons.',
    furtherInformation:
      'Will enable trusts to flag offenders who are active but have no trust engagement due to them not being contactable and undergoing Breach Proceedings.<br>Prompts User Alert Notice when viewing the Offender Record.',
    termination: "Don't remove at termination.",
  },
  REG24: {
    description: 'Women’s Safety Worker',
    suggestedReviewFrequency: 6,
    purpose: 'To record details of the WSW',
    furtherInformation:
      'Women’s Safety Workers work in partnership with those providing accredited men’s domestic violence programmes in the community (the National Probation Service) and in prison (HM<br>Prison Service).<br>Their primary role is to work with the victims and the current partners of men undertaking the programmes in order to promote the safety of women and children and to seek to ensure that the programme of intervention with the male offenders does not put women and children at further risk of harm. It is ecognized that women who are victims of domestic violence may have longer-term needs for help and support. Women’s Safety Workers facilitate the referral of women to community-based services for on-going assistance.',
    termination: 'Remove at termination.',
  },
  WEAP: {
    description: 'Weapons',
    suggestedReviewFrequency: 3,
    purpose: 'Denotes offenders known to use/carry weapons. ',
    furtherInformation:
      'Can be used to highlight risk concerns and prompt health and safety considerations/review in terms of supervision of such offenders and placements in group environments (such as offending behaviour programmes and UPW projects).<br> Gun Crime is crime (Violence Against the Person, Robbery, Burglary and Sexual Offences) in which guns are used. A gun is taken to be involved in an offence if it is fired, used as a blunt instrument to cause injury to a person, or used as a threat. Where the victim is convinced of the presence of a firearm, even if it is concealed, and there is evidence to of the suspect’s intention to create this impression, then the incident counts. Both real, and fake firearms, and air weapons are counted within this category.',
    termination: 'Remove at termination – ALT register can be added',
  },
  RSTO: {
    description: 'Restraining Order',
    suggestedReviewFrequency: 6,
    purpose: 'Provides immediate identification where a Restraining Order is in effect. ',
    furtherInformation: 'Can also be recorded as an Additional sentence type. ',
    termination: 'Remove at termination, except for Life Sentences',
  },
  STRG: {
    description: 'Street Gangs',
    suggestedReviewFrequency: 3,
    purpose: 'Will denote offenders involved in Serious Group Offending.',
    furtherInformation:
      'Can be used to monitor SGO activity, provide external partners with accurate risk information and assist local offices to coordinate UPW projects, Court appearances and planned office visits to reduce risk of conflict. ',
    termination: 'Remove at termination.',
  },
  MSP: {
    description: 'Modern Day Slavery – Perpetrator',
    suggestedReviewFrequency: 6,
    purpose:
      'Will denote any offender who presents evidence of modern day slavery perpetrator (conviction not necessary to trigger registration). ',
    furtherInformation:
      'Modern day slavery encompasses slavery, servitude, forced and compulsory labour and human trafficking. Traffickers and slave drivers coerce, deceive and force individuals against their will into a life of abuse, servitude and inhumane treatment. A large number of active organised crime groups are involved in modern slavery. But it is also committed by individual opportunistic perpetrators. Victims are often pressured into debt-bondage and are likely to be fearful of those who exploit them, who will often threaten and abuse victims and their families. All of these factors make it very difficult for victims to escape.',
    termination: 'Remove at termination.',
  },
  MSV: {
    description: 'Modern Day Slavery – Victim',
    suggestedReviewFrequency: 6,
    purpose: 'To denote an offender where there are concerns of being the victim of modern day slavery.',
    furtherInformation:
      'Modern day slavery encompasses slavery, servitude, forced and compulsory labour and human trafficking. Traffickers and slave drivers coerce, deceive and force individuals against their will into a life of abuse, servitude and inhumane treatment. A large number of active organised crime groups are involved in modern slavery. But it is also committed by individual opportunistic perpetrators. Victims are often pressured into debt-bondage and are likely to be fearful of those who exploit them, who will often threaten and abuse victims and their families. All of these factors make it very difficult for victims to <br>escape.',
    termination: 'Remove at termination.',
  },
  RVAD: {
    description: 'Safeguarding – Adult at Risk',
    suggestedReviewFrequency: 6,
    purpose: 'To identify offenders who are “adults at risk”',
    furtherInformation:
      'This register should be used to denote where an offender has been identified as an “adult at risk”. “Adult at risk” is defined as an adult who has care and support needs, is experiencing, or at risk of, abuse or neglect; and as a result of those care and support needs is unable to protect themselves from the risk, or experience, of abuse or neglect. Previously known as Vulnerable Adult',
    termination: 'Remove at termination – ALT register can be added',
  },
  CUCK: {
    description: 'Cuckooing – Potential Victim',
    suggestedReviewFrequency: 3,
    purpose:
      'To identify any concerns around potential addresses that cases are residing at and as part of their home visit risk assessments',
    furtherInformation:
      'Cuckooing is a form of crime where people, i.e. drug dealers who takes over a vulnerable persons home and uses the property to facilitate exploitation. ',
    termination: 'Remove at termination.',
  },
  SPO: {
    description: 'Stalking Protection Order',
    suggestedReviewFrequency: 3,
    purpose: 'To identify any risk associated with stalking to another person',
    furtherInformation:
      'It is the Police’s responsibility to ensure that there is a monitoring mechanism to ensure compliance with the terms of a SPO, which will involve monitoring either by the Police or by another appropriate authority, such as the Probation Service.  ',
    termination: 'Remove at termination (except for Lifer sentences)',
  },
  UPWS: {
    description: 'UPW Suspended',
    suggestedReviewFrequency: 1,
    purpose:
      'To identify those cases where the UPW has been suspended - This could only be used in certain circumstances: -Medical (this is currently recorded in PC but pulled through onto this screen as a medical cert), Overseas Work i.e. Oil rigs, and Consecutive Hours',
    furtherInformation:
      'Refer to UPW Operating Manual for full details. <br>Note - this register will be made inactive when a Suspend solution within the UPW Functionality will be delivered. Due to be made inactive January 2021 due to SR20 in NDelius will support this via the UPW Details screen',
    termination: 'Remove at termination – De-register on resumption of work or at termination of the related event.',
  },
  DORIS: {
    description: 'DoRIS',
    suggestedReviewFrequency: 0,
    purpose:
      'To reduce contraband trafficked into prisons on recalled offenders. To Support the National Intelligence Unit process between Prison, Police, Probation and PPCS.',
    furtherInformation:
      'No review period but should be reviewed at every recall. Links to Recall Part A Q11 – NPS<br>Recall Part A Q10 - CRC',
    termination: "Don't remove at termination.",
  },
}
