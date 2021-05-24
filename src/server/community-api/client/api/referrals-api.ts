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


import globalAxios, { AxiosPromise, AxiosInstance } from 'axios';
import { Configuration } from '../configuration';
// Some imports not used depending on template conditions
// @ts-ignore
import { DUMMY_BASE_URL, assertParamExists, setApiKeyToObject, setBasicAuthToObject, setBearerAuthToObject, setOAuthToObject, setSearchParams, serializeDataIfNeeded, toPathString, createRequestFunction } from '../common';
// @ts-ignore
import { BASE_PATH, COLLECTION_FORMATS, RequestArgs, BaseAPI, RequiredError } from '../base';
// @ts-ignore
import { ContextlessReferralEndRequest } from '../model';
// @ts-ignore
import { ContextlessReferralStartRequest } from '../model';
// @ts-ignore
import { ErrorResponse } from '../model';
/**
 * ReferralsApi - axios parameter creator
 * @export
 */
export const ReferralsApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * 
         * @summary Ends a NSI referral
         * @param {string} context Name identifying preprocessing applied to the request
         * @param {string} crn crn
         * @param {ContextlessReferralEndRequest} referralEndRequest referralEndRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        endReferralContextLessUsingPOST: async (context: string, crn: string, referralEndRequest: ContextlessReferralEndRequest, options: any = {}): Promise<RequestArgs> => {
            // verify required parameter 'context' is not null or undefined
            assertParamExists('endReferralContextLessUsingPOST', 'context', context)
            // verify required parameter 'crn' is not null or undefined
            assertParamExists('endReferralContextLessUsingPOST', 'crn', crn)
            // verify required parameter 'referralEndRequest' is not null or undefined
            assertParamExists('endReferralContextLessUsingPOST', 'referralEndRequest', referralEndRequest)
            const localVarPath = `/secure/offenders/crn/{crn}/referral/end/context/{context}`
                .replace(`{${"context"}}`, encodeURIComponent(String(context)))
                .replace(`{${"crn"}}`, encodeURIComponent(String(crn)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;


    
            localVarHeaderParameter['Content-Type'] = 'application/json';

            setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            localVarRequestOptions.data = serializeDataIfNeeded(referralEndRequest, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * 
         * @summary Starts an NSI referral
         * @param {string} context Name identifying preprocessing applied to the request
         * @param {string} crn crn
         * @param {ContextlessReferralStartRequest} referralStartRequest referralStartRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        startReferralContextLessUsingPOST: async (context: string, crn: string, referralStartRequest: ContextlessReferralStartRequest, options: any = {}): Promise<RequestArgs> => {
            // verify required parameter 'context' is not null or undefined
            assertParamExists('startReferralContextLessUsingPOST', 'context', context)
            // verify required parameter 'crn' is not null or undefined
            assertParamExists('startReferralContextLessUsingPOST', 'crn', crn)
            // verify required parameter 'referralStartRequest' is not null or undefined
            assertParamExists('startReferralContextLessUsingPOST', 'referralStartRequest', referralStartRequest)
            const localVarPath = `/secure/offenders/crn/{crn}/referral/start/context/{context}`
                .replace(`{${"context"}}`, encodeURIComponent(String(context)))
                .replace(`{${"crn"}}`, encodeURIComponent(String(crn)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;


    
            localVarHeaderParameter['Content-Type'] = 'application/json';

            setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            localVarRequestOptions.data = serializeDataIfNeeded(referralStartRequest, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
    }
};

/**
 * ReferralsApi - functional programming interface
 * @export
 */
export const ReferralsApiFp = function(configuration?: Configuration) {
    const localVarAxiosParamCreator = ReferralsApiAxiosParamCreator(configuration)
    return {
        /**
         * 
         * @summary Ends a NSI referral
         * @param {string} context Name identifying preprocessing applied to the request
         * @param {string} crn crn
         * @param {ContextlessReferralEndRequest} referralEndRequest referralEndRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async endReferralContextLessUsingPOST(context: string, crn: string, referralEndRequest: ContextlessReferralEndRequest, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<string>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.endReferralContextLessUsingPOST(context, crn, referralEndRequest, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * 
         * @summary Starts an NSI referral
         * @param {string} context Name identifying preprocessing applied to the request
         * @param {string} crn crn
         * @param {ContextlessReferralStartRequest} referralStartRequest referralStartRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async startReferralContextLessUsingPOST(context: string, crn: string, referralStartRequest: ContextlessReferralStartRequest, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<string>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.startReferralContextLessUsingPOST(context, crn, referralStartRequest, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
    }
};

/**
 * ReferralsApi - factory interface
 * @export
 */
export const ReferralsApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    const localVarFp = ReferralsApiFp(configuration)
    return {
        /**
         * 
         * @summary Ends a NSI referral
         * @param {string} context Name identifying preprocessing applied to the request
         * @param {string} crn crn
         * @param {ContextlessReferralEndRequest} referralEndRequest referralEndRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        endReferralContextLessUsingPOST(context: string, crn: string, referralEndRequest: ContextlessReferralEndRequest, options?: any): AxiosPromise<string> {
            return localVarFp.endReferralContextLessUsingPOST(context, crn, referralEndRequest, options).then((request) => request(axios, basePath));
        },
        /**
         * 
         * @summary Starts an NSI referral
         * @param {string} context Name identifying preprocessing applied to the request
         * @param {string} crn crn
         * @param {ContextlessReferralStartRequest} referralStartRequest referralStartRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        startReferralContextLessUsingPOST(context: string, crn: string, referralStartRequest: ContextlessReferralStartRequest, options?: any): AxiosPromise<string> {
            return localVarFp.startReferralContextLessUsingPOST(context, crn, referralStartRequest, options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * Request parameters for endReferralContextLessUsingPOST operation in ReferralsApi.
 * @export
 * @interface ReferralsApiEndReferralContextLessUsingPOSTRequest
 */
export interface ReferralsApiEndReferralContextLessUsingPOSTRequest {
    /**
     * Name identifying preprocessing applied to the request
     * @type {string}
     * @memberof ReferralsApiEndReferralContextLessUsingPOST
     */
    readonly context: string

    /**
     * crn
     * @type {string}
     * @memberof ReferralsApiEndReferralContextLessUsingPOST
     */
    readonly crn: string

    /**
     * referralEndRequest
     * @type {ContextlessReferralEndRequest}
     * @memberof ReferralsApiEndReferralContextLessUsingPOST
     */
    readonly referralEndRequest: ContextlessReferralEndRequest
}

/**
 * Request parameters for startReferralContextLessUsingPOST operation in ReferralsApi.
 * @export
 * @interface ReferralsApiStartReferralContextLessUsingPOSTRequest
 */
export interface ReferralsApiStartReferralContextLessUsingPOSTRequest {
    /**
     * Name identifying preprocessing applied to the request
     * @type {string}
     * @memberof ReferralsApiStartReferralContextLessUsingPOST
     */
    readonly context: string

    /**
     * crn
     * @type {string}
     * @memberof ReferralsApiStartReferralContextLessUsingPOST
     */
    readonly crn: string

    /**
     * referralStartRequest
     * @type {ContextlessReferralStartRequest}
     * @memberof ReferralsApiStartReferralContextLessUsingPOST
     */
    readonly referralStartRequest: ContextlessReferralStartRequest
}

/**
 * ReferralsApi - object-oriented interface
 * @export
 * @class ReferralsApi
 * @extends {BaseAPI}
 */
export class ReferralsApi extends BaseAPI {
    /**
     * 
     * @summary Ends a NSI referral
     * @param {ReferralsApiEndReferralContextLessUsingPOSTRequest} requestParameters Request parameters.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ReferralsApi
     */
    public endReferralContextLessUsingPOST(requestParameters: ReferralsApiEndReferralContextLessUsingPOSTRequest, options?: any) {
        return ReferralsApiFp(this.configuration).endReferralContextLessUsingPOST(requestParameters.context, requestParameters.crn, requestParameters.referralEndRequest, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * 
     * @summary Starts an NSI referral
     * @param {ReferralsApiStartReferralContextLessUsingPOSTRequest} requestParameters Request parameters.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ReferralsApi
     */
    public startReferralContextLessUsingPOST(requestParameters: ReferralsApiStartReferralContextLessUsingPOSTRequest, options?: any) {
        return ReferralsApiFp(this.configuration).startReferralContextLessUsingPOST(requestParameters.context, requestParameters.crn, requestParameters.referralStartRequest, options).then((request) => request(this.axios, this.basePath));
    }
}
