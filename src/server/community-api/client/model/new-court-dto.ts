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



/**
 * Court details for a new court
 * @export
 * @interface NewCourtDto
 */
export interface NewCourtDto {
    /**
     * true when this court is open
     * @type {boolean}
     * @memberof NewCourtDto
     */
    active?: boolean;
    /**
     * 
     * @type {string}
     * @memberof NewCourtDto
     */
    buildingName?: string;
    /**
     * unique code for this court
     * @type {string}
     * @memberof NewCourtDto
     */
    code?: string;
    /**
     * 
     * @type {string}
     * @memberof NewCourtDto
     */
    country?: string;
    /**
     * 
     * @type {string}
     * @memberof NewCourtDto
     */
    county?: string;
    /**
     * 
     * @type {string}
     * @memberof NewCourtDto
     */
    courtName: string;
    /**
     * type code from standard reference data
     * @type {string}
     * @memberof NewCourtDto
     */
    courtTypeCode?: string;
    /**
     * 
     * @type {string}
     * @memberof NewCourtDto
     */
    fax?: string;
    /**
     * 
     * @type {string}
     * @memberof NewCourtDto
     */
    locality?: string;
    /**
     * 
     * @type {string}
     * @memberof NewCourtDto
     */
    postcode?: string;
    /**
     * probation area code from probation areas
     * @type {string}
     * @memberof NewCourtDto
     */
    probationAreaCode?: string;
    /**
     * 
     * @type {string}
     * @memberof NewCourtDto
     */
    street?: string;
    /**
     * 
     * @type {string}
     * @memberof NewCourtDto
     */
    telephoneNumber?: string;
    /**
     * 
     * @type {string}
     * @memberof NewCourtDto
     */
    town?: string;
}


