import { ClassConstructor, plainToClass } from 'class-transformer'
import { validate } from 'class-validator'
import { SessionBuilder, ViewModelFactory, WizardSession } from './form-builder.types'
import { SecurityContext } from '../../security'
import { RedirectResponse } from '../../common/dynamic-routing'
import { DEFAULT_GROUP } from '../mapping'
import { FormBuilderService } from './form-builder.service'

export abstract class FormBuilderController<Dto extends object, Step extends string, ViewModel> {
  protected constructor(
    protected readonly DtoClass: ClassConstructor<Dto>,
    protected readonly formBuilder: FormBuilderService<Dto, Step>,
    protected readonly factory: ViewModelFactory<Dto, Step, ViewModel>,
    protected readonly sessionBuilder: SessionBuilder<Dto, Step>,
  ) {}

  protected async init(crn: string, session: WizardSession<Dto, Step>, security: SecurityContext) {
    const response = this.formBuilder.reset(session, crn)
    await this.sessionBuilder.init(session, security)
    return response
  }

  protected async viewStep(
    crn: string,
    step: Step,
    session: WizardSession<Dto, Step>,
  ): Promise<ViewModel | RedirectResponse> {
    const redirect = this.formBuilder.assertStep(session, step, crn, 'get')
    if (redirect) {
      return redirect
    }

    return this.factory[step](session)
  }

  protected async updateStep(
    crn: string,
    step: Step,
    session: WizardSession<Dto, Step>,
    body: Dto,
  ): Promise<ViewModel | RedirectResponse> {
    const redirect = this.formBuilder.assertStep(session, step, crn, 'post')
    if (redirect) {
      return redirect
    }

    // merge the properties from the session & request body & validate together for the current step
    const model = plainToClass(
      this.DtoClass,
      { ...session.dto, ...body },
      { groups: [DEFAULT_GROUP], excludeExtraneousValues: true },
    )

    const errors = await validate(model, { groups: [step] })
    if (errors.length > 0) {
      return this.factory[step](session, body, errors)
    }

    // copy the body into the session
    Object.assign(session.dto, body)

    const sessionErrors = await this.sessionBuilder[step](session, model)
    if (sessionErrors.length > 0) {
      return this.factory[step](session, body, sessionErrors)
    }

    return this.formBuilder.nextStep(session, step)
  }
}
