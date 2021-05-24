/* tslint:disable */
/* eslint-disable */
/**
 * Community API Documentation
 * <h2>REST service for accessing community probation information</h2><p>This service provides endpoints for accessing data primary sourced from National Delius about people that are of interest to HM Probation Service.</p><p>There is cross-over with the <b>prison-api</b> though suspects on remand will not be surfaced by this API unless that have previously been on probation.</p><div>This service is secured by <b>OAuth2</b> with tokens supplied by HMPPS Auth. Most read-only endpoints require the <b>ROLE_COMMUNITY</b> to access, but check each endpoint where this differs.<p>This service can be accessed in a number environments. For each environment a different set of OAuth2 credentials from HMPPS Auth are required</p><ul><li>Development: <b>https://community-api.dev.probation.service.justice.gov.uk</b></li><li>Test: <b>https://community-api.test.probation.service.justice.gov.uk</b></li><li>Pre-production: <b>https://community-api.pre-prod.delius.probation.hmpps.dsd.io</b></li><li>Production: <b>https://community-api.probation.service.justice.gov.uk</b></li></ul><div>
 *
 * The version of the OpenAPI document: 2021-05-21.4548.b3fe43e
 * Contact: dps-hmpps@digital.justice.gov.uk
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


import { LocalDeliveryUnit } from './local-delivery-unit';

/**
 * 
 * @export
 * @interface ProbationAreaWithLocalDeliveryUnits
 */
export interface ProbationAreaWithLocalDeliveryUnits {
    /**
     * area code
     * @type {string}
     * @memberof ProbationAreaWithLocalDeliveryUnits
     */
    code?: string;
    /**
     * description
     * @type {string}
     * @memberof ProbationAreaWithLocalDeliveryUnits
     */
    description?: string;
    /**
     * 
     * @type {Array<LocalDeliveryUnit>}
     * @memberof ProbationAreaWithLocalDeliveryUnits
     */
    localDeliveryUnits?: Array<LocalDeliveryUnit>;
}


