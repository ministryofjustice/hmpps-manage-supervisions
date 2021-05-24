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


import { KeyValue } from './key-value';

/**
 * 
 * @export
 * @interface Requirement
 */
export interface Requirement {
    /**
     * Is the requirement currently active
     * @type {boolean}
     * @memberof Requirement
     */
    active?: boolean;
    /**
     * 
     * @type {KeyValue}
     * @memberof Requirement
     */
    adRequirementTypeMainCategory?: KeyValue;
    /**
     * 
     * @type {KeyValue}
     * @memberof Requirement
     */
    adRequirementTypeSubCategory?: KeyValue;
    /**
     * 
     * @type {string}
     * @memberof Requirement
     */
    commencementDate?: string;
    /**
     * 
     * @type {string}
     * @memberof Requirement
     */
    expectedEndDate?: string;
    /**
     * 
     * @type {string}
     * @memberof Requirement
     */
    expectedStartDate?: string;
    /**
     * The number of temporal units to complete the requirement (see lengthUnit field for unit)
     * @type {number}
     * @memberof Requirement
     */
    length?: number;
    /**
     * The temporal unit corresponding to the length field
     * @type {string}
     * @memberof Requirement
     */
    lengthUnit?: string;
    /**
     * Unique identifier for the requirement
     * @type {number}
     * @memberof Requirement
     */
    requirementId: number;
    /**
     * Notes added by probation relating to the requirement
     * @type {string}
     * @memberof Requirement
     */
    requirementNotes?: string;
    /**
     * 
     * @type {KeyValue}
     * @memberof Requirement
     */
    requirementTypeMainCategory?: KeyValue;
    /**
     * 
     * @type {KeyValue}
     * @memberof Requirement
     */
    requirementTypeSubCategory?: KeyValue;
    /**
     * Is the main category restrictive
     * @type {boolean}
     * @memberof Requirement
     */
    restrictive?: boolean;
    /**
     * 
     * @type {string}
     * @memberof Requirement
     */
    startDate?: string;
    /**
     * 
     * @type {string}
     * @memberof Requirement
     */
    terminationDate?: string;
    /**
     * 
     * @type {KeyValue}
     * @memberof Requirement
     */
    terminationReason?: KeyValue;
}


