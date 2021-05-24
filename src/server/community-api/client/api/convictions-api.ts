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
import { Conviction } from '../model';
// @ts-ignore
import { ErrorResponse } from '../model';
// @ts-ignore
import { Nsi } from '../model';
// @ts-ignore
import { OffenderLatestRecall } from '../model';
/**
 * ConvictionsApi - axios parameter creator
 * @export
 */
export const ConvictionsApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * 
         * @summary Return the conviction (AKA Delius Event) for a conviction ID and a CRN
         * @param {number} convictionId ID for the conviction / event
         * @param {string} crn CRN for the offender
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getConvictionForOffenderByCrnAndConvictionIdUsingGET: async (convictionId: number, crn: string, options: any = {}): Promise<RequestArgs> => {
            // verify required parameter 'convictionId' is not null or undefined
            assertParamExists('getConvictionForOffenderByCrnAndConvictionIdUsingGET', 'convictionId', convictionId)
            // verify required parameter 'crn' is not null or undefined
            assertParamExists('getConvictionForOffenderByCrnAndConvictionIdUsingGET', 'crn', crn)
            const localVarPath = `/secure/offenders/crn/{crn}/convictions/{convictionId}`
                .replace(`{${"convictionId"}}`, encodeURIComponent(String(convictionId)))
                .replace(`{${"crn"}}`, encodeURIComponent(String(crn)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;


    
            setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * 
         * @summary Return the convictions (AKA Delius Event) for an offender
         * @param {string} crn CRN for the offender
         * @param {boolean} [activeOnly] retrieve only active convictions
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getConvictionsForOffenderByCrnUsingGET: async (crn: string, activeOnly?: boolean, options: any = {}): Promise<RequestArgs> => {
            // verify required parameter 'crn' is not null or undefined
            assertParamExists('getConvictionsForOffenderByCrnUsingGET', 'crn', crn)
            const localVarPath = `/secure/offenders/crn/{crn}/convictions`
                .replace(`{${"crn"}}`, encodeURIComponent(String(crn)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            if (activeOnly !== undefined) {
                localVarQueryParameter['activeOnly'] = activeOnly;
            }


    
            setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * 
         * @summary Return the convictions (AKA Delius Event) for an offender
         * @param {string} nomsNumber Nomis number for the offender
         * @param {boolean} [activeOnly] retrieve only active convictions
         * @param {boolean} [failOnDuplicate] Should fail if multiple offenders found regardless of status
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getConvictionsForOffenderUsingGET: async (nomsNumber: string, activeOnly?: boolean, failOnDuplicate?: boolean, options: any = {}): Promise<RequestArgs> => {
            // verify required parameter 'nomsNumber' is not null or undefined
            assertParamExists('getConvictionsForOffenderUsingGET', 'nomsNumber', nomsNumber)
            const localVarPath = `/secure/offenders/nomsNumber/{nomsNumber}/convictions`
                .replace(`{${"nomsNumber"}}`, encodeURIComponent(String(nomsNumber)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            if (activeOnly !== undefined) {
                localVarQueryParameter['activeOnly'] = activeOnly;
            }

            if (failOnDuplicate !== undefined) {
                localVarQueryParameter['failOnDuplicate'] = failOnDuplicate;
            }


    
            setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * Accepts an offender CRN in the format A999999
         * @summary Returns the latest recall and release details for an offender
         * @param {string} crn CRN for the offender
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getLatestRecallAndReleaseForOffenderByCrnUsingGET: async (crn: string, options: any = {}): Promise<RequestArgs> => {
            // verify required parameter 'crn' is not null or undefined
            assertParamExists('getLatestRecallAndReleaseForOffenderByCrnUsingGET', 'crn', crn)
            const localVarPath = `/secure/offenders/crn/{crn}/release`
                .replace(`{${"crn"}}`, encodeURIComponent(String(crn)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;


    
            setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * Accepts a NOMIS offender nomsNumber in the format A9999AA
         * @summary Returns the latest recall and release details for an offender
         * @param {string} nomsNumber Nomis number for the offender
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getLatestRecallAndReleaseForOffenderUsingGET: async (nomsNumber: string, options: any = {}): Promise<RequestArgs> => {
            // verify required parameter 'nomsNumber' is not null or undefined
            assertParamExists('getLatestRecallAndReleaseForOffenderUsingGET', 'nomsNumber', nomsNumber)
            const localVarPath = `/secure/offenders/nomsNumber/{nomsNumber}/release`
                .replace(`{${"nomsNumber"}}`, encodeURIComponent(String(nomsNumber)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;


    
            setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * 
         * @summary Return an NSI by crn, convictionId and nsiId
         * @param {number} convictionId ID for the conviction / event
         * @param {string} crn CRN for the offender
         * @param {number} nsiId ID for the nsi
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getNsiByNsiIdUsingGET: async (convictionId: number, crn: string, nsiId: number, options: any = {}): Promise<RequestArgs> => {
            // verify required parameter 'convictionId' is not null or undefined
            assertParamExists('getNsiByNsiIdUsingGET', 'convictionId', convictionId)
            // verify required parameter 'crn' is not null or undefined
            assertParamExists('getNsiByNsiIdUsingGET', 'crn', crn)
            // verify required parameter 'nsiId' is not null or undefined
            assertParamExists('getNsiByNsiIdUsingGET', 'nsiId', nsiId)
            const localVarPath = `/secure/offenders/crn/{crn}/convictions/{convictionId}/nsis/{nsiId}`
                .replace(`{${"convictionId"}}`, encodeURIComponent(String(convictionId)))
                .replace(`{${"crn"}}`, encodeURIComponent(String(crn)))
                .replace(`{${"nsiId"}}`, encodeURIComponent(String(nsiId)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;


    
            setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * 
         * @summary Return the convictions (AKA Delius Event) for an offender that contain RAR
         * @param {string} crn CRN for the offender
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getOffenderConvictionsWithRarByCrnUsingGET: async (crn: string, options: any = {}): Promise<RequestArgs> => {
            // verify required parameter 'crn' is not null or undefined
            assertParamExists('getOffenderConvictionsWithRarByCrnUsingGET', 'crn', crn)
            const localVarPath = `/secure/offenders/crn/{crn}/convictions-with-rar`
                .replace(`{${"crn"}}`, encodeURIComponent(String(crn)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;


    
            setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
    }
};

/**
 * ConvictionsApi - functional programming interface
 * @export
 */
export const ConvictionsApiFp = function(configuration?: Configuration) {
    const localVarAxiosParamCreator = ConvictionsApiAxiosParamCreator(configuration)
    return {
        /**
         * 
         * @summary Return the conviction (AKA Delius Event) for a conviction ID and a CRN
         * @param {number} convictionId ID for the conviction / event
         * @param {string} crn CRN for the offender
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getConvictionForOffenderByCrnAndConvictionIdUsingGET(convictionId: number, crn: string, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<Conviction>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.getConvictionForOffenderByCrnAndConvictionIdUsingGET(convictionId, crn, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * 
         * @summary Return the convictions (AKA Delius Event) for an offender
         * @param {string} crn CRN for the offender
         * @param {boolean} [activeOnly] retrieve only active convictions
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getConvictionsForOffenderByCrnUsingGET(crn: string, activeOnly?: boolean, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<Array<Conviction>>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.getConvictionsForOffenderByCrnUsingGET(crn, activeOnly, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * 
         * @summary Return the convictions (AKA Delius Event) for an offender
         * @param {string} nomsNumber Nomis number for the offender
         * @param {boolean} [activeOnly] retrieve only active convictions
         * @param {boolean} [failOnDuplicate] Should fail if multiple offenders found regardless of status
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getConvictionsForOffenderUsingGET(nomsNumber: string, activeOnly?: boolean, failOnDuplicate?: boolean, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<Array<Conviction>>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.getConvictionsForOffenderUsingGET(nomsNumber, activeOnly, failOnDuplicate, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * Accepts an offender CRN in the format A999999
         * @summary Returns the latest recall and release details for an offender
         * @param {string} crn CRN for the offender
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getLatestRecallAndReleaseForOffenderByCrnUsingGET(crn: string, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<OffenderLatestRecall>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.getLatestRecallAndReleaseForOffenderByCrnUsingGET(crn, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * Accepts a NOMIS offender nomsNumber in the format A9999AA
         * @summary Returns the latest recall and release details for an offender
         * @param {string} nomsNumber Nomis number for the offender
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getLatestRecallAndReleaseForOffenderUsingGET(nomsNumber: string, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<OffenderLatestRecall>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.getLatestRecallAndReleaseForOffenderUsingGET(nomsNumber, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * 
         * @summary Return an NSI by crn, convictionId and nsiId
         * @param {number} convictionId ID for the conviction / event
         * @param {string} crn CRN for the offender
         * @param {number} nsiId ID for the nsi
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getNsiByNsiIdUsingGET(convictionId: number, crn: string, nsiId: number, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<Nsi>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.getNsiByNsiIdUsingGET(convictionId, crn, nsiId, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * 
         * @summary Return the convictions (AKA Delius Event) for an offender that contain RAR
         * @param {string} crn CRN for the offender
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getOffenderConvictionsWithRarByCrnUsingGET(crn: string, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<Array<Conviction>>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.getOffenderConvictionsWithRarByCrnUsingGET(crn, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
    }
};

/**
 * ConvictionsApi - factory interface
 * @export
 */
export const ConvictionsApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    const localVarFp = ConvictionsApiFp(configuration)
    return {
        /**
         * 
         * @summary Return the conviction (AKA Delius Event) for a conviction ID and a CRN
         * @param {number} convictionId ID for the conviction / event
         * @param {string} crn CRN for the offender
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getConvictionForOffenderByCrnAndConvictionIdUsingGET(convictionId: number, crn: string, options?: any): AxiosPromise<Conviction> {
            return localVarFp.getConvictionForOffenderByCrnAndConvictionIdUsingGET(convictionId, crn, options).then((request) => request(axios, basePath));
        },
        /**
         * 
         * @summary Return the convictions (AKA Delius Event) for an offender
         * @param {string} crn CRN for the offender
         * @param {boolean} [activeOnly] retrieve only active convictions
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getConvictionsForOffenderByCrnUsingGET(crn: string, activeOnly?: boolean, options?: any): AxiosPromise<Array<Conviction>> {
            return localVarFp.getConvictionsForOffenderByCrnUsingGET(crn, activeOnly, options).then((request) => request(axios, basePath));
        },
        /**
         * 
         * @summary Return the convictions (AKA Delius Event) for an offender
         * @param {string} nomsNumber Nomis number for the offender
         * @param {boolean} [activeOnly] retrieve only active convictions
         * @param {boolean} [failOnDuplicate] Should fail if multiple offenders found regardless of status
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getConvictionsForOffenderUsingGET(nomsNumber: string, activeOnly?: boolean, failOnDuplicate?: boolean, options?: any): AxiosPromise<Array<Conviction>> {
            return localVarFp.getConvictionsForOffenderUsingGET(nomsNumber, activeOnly, failOnDuplicate, options).then((request) => request(axios, basePath));
        },
        /**
         * Accepts an offender CRN in the format A999999
         * @summary Returns the latest recall and release details for an offender
         * @param {string} crn CRN for the offender
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getLatestRecallAndReleaseForOffenderByCrnUsingGET(crn: string, options?: any): AxiosPromise<OffenderLatestRecall> {
            return localVarFp.getLatestRecallAndReleaseForOffenderByCrnUsingGET(crn, options).then((request) => request(axios, basePath));
        },
        /**
         * Accepts a NOMIS offender nomsNumber in the format A9999AA
         * @summary Returns the latest recall and release details for an offender
         * @param {string} nomsNumber Nomis number for the offender
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getLatestRecallAndReleaseForOffenderUsingGET(nomsNumber: string, options?: any): AxiosPromise<OffenderLatestRecall> {
            return localVarFp.getLatestRecallAndReleaseForOffenderUsingGET(nomsNumber, options).then((request) => request(axios, basePath));
        },
        /**
         * 
         * @summary Return an NSI by crn, convictionId and nsiId
         * @param {number} convictionId ID for the conviction / event
         * @param {string} crn CRN for the offender
         * @param {number} nsiId ID for the nsi
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getNsiByNsiIdUsingGET(convictionId: number, crn: string, nsiId: number, options?: any): AxiosPromise<Nsi> {
            return localVarFp.getNsiByNsiIdUsingGET(convictionId, crn, nsiId, options).then((request) => request(axios, basePath));
        },
        /**
         * 
         * @summary Return the convictions (AKA Delius Event) for an offender that contain RAR
         * @param {string} crn CRN for the offender
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getOffenderConvictionsWithRarByCrnUsingGET(crn: string, options?: any): AxiosPromise<Array<Conviction>> {
            return localVarFp.getOffenderConvictionsWithRarByCrnUsingGET(crn, options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * Request parameters for getConvictionForOffenderByCrnAndConvictionIdUsingGET operation in ConvictionsApi.
 * @export
 * @interface ConvictionsApiGetConvictionForOffenderByCrnAndConvictionIdUsingGETRequest
 */
export interface ConvictionsApiGetConvictionForOffenderByCrnAndConvictionIdUsingGETRequest {
    /**
     * ID for the conviction / event
     * @type {number}
     * @memberof ConvictionsApiGetConvictionForOffenderByCrnAndConvictionIdUsingGET
     */
    readonly convictionId: number

    /**
     * CRN for the offender
     * @type {string}
     * @memberof ConvictionsApiGetConvictionForOffenderByCrnAndConvictionIdUsingGET
     */
    readonly crn: string
}

/**
 * Request parameters for getConvictionsForOffenderByCrnUsingGET operation in ConvictionsApi.
 * @export
 * @interface ConvictionsApiGetConvictionsForOffenderByCrnUsingGETRequest
 */
export interface ConvictionsApiGetConvictionsForOffenderByCrnUsingGETRequest {
    /**
     * CRN for the offender
     * @type {string}
     * @memberof ConvictionsApiGetConvictionsForOffenderByCrnUsingGET
     */
    readonly crn: string

    /**
     * retrieve only active convictions
     * @type {boolean}
     * @memberof ConvictionsApiGetConvictionsForOffenderByCrnUsingGET
     */
    readonly activeOnly?: boolean
}

/**
 * Request parameters for getConvictionsForOffenderUsingGET operation in ConvictionsApi.
 * @export
 * @interface ConvictionsApiGetConvictionsForOffenderUsingGETRequest
 */
export interface ConvictionsApiGetConvictionsForOffenderUsingGETRequest {
    /**
     * Nomis number for the offender
     * @type {string}
     * @memberof ConvictionsApiGetConvictionsForOffenderUsingGET
     */
    readonly nomsNumber: string

    /**
     * retrieve only active convictions
     * @type {boolean}
     * @memberof ConvictionsApiGetConvictionsForOffenderUsingGET
     */
    readonly activeOnly?: boolean

    /**
     * Should fail if multiple offenders found regardless of status
     * @type {boolean}
     * @memberof ConvictionsApiGetConvictionsForOffenderUsingGET
     */
    readonly failOnDuplicate?: boolean
}

/**
 * Request parameters for getLatestRecallAndReleaseForOffenderByCrnUsingGET operation in ConvictionsApi.
 * @export
 * @interface ConvictionsApiGetLatestRecallAndReleaseForOffenderByCrnUsingGETRequest
 */
export interface ConvictionsApiGetLatestRecallAndReleaseForOffenderByCrnUsingGETRequest {
    /**
     * CRN for the offender
     * @type {string}
     * @memberof ConvictionsApiGetLatestRecallAndReleaseForOffenderByCrnUsingGET
     */
    readonly crn: string
}

/**
 * Request parameters for getLatestRecallAndReleaseForOffenderUsingGET operation in ConvictionsApi.
 * @export
 * @interface ConvictionsApiGetLatestRecallAndReleaseForOffenderUsingGETRequest
 */
export interface ConvictionsApiGetLatestRecallAndReleaseForOffenderUsingGETRequest {
    /**
     * Nomis number for the offender
     * @type {string}
     * @memberof ConvictionsApiGetLatestRecallAndReleaseForOffenderUsingGET
     */
    readonly nomsNumber: string
}

/**
 * Request parameters for getNsiByNsiIdUsingGET operation in ConvictionsApi.
 * @export
 * @interface ConvictionsApiGetNsiByNsiIdUsingGETRequest
 */
export interface ConvictionsApiGetNsiByNsiIdUsingGETRequest {
    /**
     * ID for the conviction / event
     * @type {number}
     * @memberof ConvictionsApiGetNsiByNsiIdUsingGET
     */
    readonly convictionId: number

    /**
     * CRN for the offender
     * @type {string}
     * @memberof ConvictionsApiGetNsiByNsiIdUsingGET
     */
    readonly crn: string

    /**
     * ID for the nsi
     * @type {number}
     * @memberof ConvictionsApiGetNsiByNsiIdUsingGET
     */
    readonly nsiId: number
}

/**
 * Request parameters for getOffenderConvictionsWithRarByCrnUsingGET operation in ConvictionsApi.
 * @export
 * @interface ConvictionsApiGetOffenderConvictionsWithRarByCrnUsingGETRequest
 */
export interface ConvictionsApiGetOffenderConvictionsWithRarByCrnUsingGETRequest {
    /**
     * CRN for the offender
     * @type {string}
     * @memberof ConvictionsApiGetOffenderConvictionsWithRarByCrnUsingGET
     */
    readonly crn: string
}

/**
 * ConvictionsApi - object-oriented interface
 * @export
 * @class ConvictionsApi
 * @extends {BaseAPI}
 */
export class ConvictionsApi extends BaseAPI {
    /**
     * 
     * @summary Return the conviction (AKA Delius Event) for a conviction ID and a CRN
     * @param {ConvictionsApiGetConvictionForOffenderByCrnAndConvictionIdUsingGETRequest} requestParameters Request parameters.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ConvictionsApi
     */
    public getConvictionForOffenderByCrnAndConvictionIdUsingGET(requestParameters: ConvictionsApiGetConvictionForOffenderByCrnAndConvictionIdUsingGETRequest, options?: any) {
        return ConvictionsApiFp(this.configuration).getConvictionForOffenderByCrnAndConvictionIdUsingGET(requestParameters.convictionId, requestParameters.crn, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * 
     * @summary Return the convictions (AKA Delius Event) for an offender
     * @param {ConvictionsApiGetConvictionsForOffenderByCrnUsingGETRequest} requestParameters Request parameters.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ConvictionsApi
     */
    public getConvictionsForOffenderByCrnUsingGET(requestParameters: ConvictionsApiGetConvictionsForOffenderByCrnUsingGETRequest, options?: any) {
        return ConvictionsApiFp(this.configuration).getConvictionsForOffenderByCrnUsingGET(requestParameters.crn, requestParameters.activeOnly, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * 
     * @summary Return the convictions (AKA Delius Event) for an offender
     * @param {ConvictionsApiGetConvictionsForOffenderUsingGETRequest} requestParameters Request parameters.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ConvictionsApi
     */
    public getConvictionsForOffenderUsingGET(requestParameters: ConvictionsApiGetConvictionsForOffenderUsingGETRequest, options?: any) {
        return ConvictionsApiFp(this.configuration).getConvictionsForOffenderUsingGET(requestParameters.nomsNumber, requestParameters.activeOnly, requestParameters.failOnDuplicate, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Accepts an offender CRN in the format A999999
     * @summary Returns the latest recall and release details for an offender
     * @param {ConvictionsApiGetLatestRecallAndReleaseForOffenderByCrnUsingGETRequest} requestParameters Request parameters.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ConvictionsApi
     */
    public getLatestRecallAndReleaseForOffenderByCrnUsingGET(requestParameters: ConvictionsApiGetLatestRecallAndReleaseForOffenderByCrnUsingGETRequest, options?: any) {
        return ConvictionsApiFp(this.configuration).getLatestRecallAndReleaseForOffenderByCrnUsingGET(requestParameters.crn, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Accepts a NOMIS offender nomsNumber in the format A9999AA
     * @summary Returns the latest recall and release details for an offender
     * @param {ConvictionsApiGetLatestRecallAndReleaseForOffenderUsingGETRequest} requestParameters Request parameters.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ConvictionsApi
     */
    public getLatestRecallAndReleaseForOffenderUsingGET(requestParameters: ConvictionsApiGetLatestRecallAndReleaseForOffenderUsingGETRequest, options?: any) {
        return ConvictionsApiFp(this.configuration).getLatestRecallAndReleaseForOffenderUsingGET(requestParameters.nomsNumber, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * 
     * @summary Return an NSI by crn, convictionId and nsiId
     * @param {ConvictionsApiGetNsiByNsiIdUsingGETRequest} requestParameters Request parameters.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ConvictionsApi
     */
    public getNsiByNsiIdUsingGET(requestParameters: ConvictionsApiGetNsiByNsiIdUsingGETRequest, options?: any) {
        return ConvictionsApiFp(this.configuration).getNsiByNsiIdUsingGET(requestParameters.convictionId, requestParameters.crn, requestParameters.nsiId, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * 
     * @summary Return the convictions (AKA Delius Event) for an offender that contain RAR
     * @param {ConvictionsApiGetOffenderConvictionsWithRarByCrnUsingGETRequest} requestParameters Request parameters.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ConvictionsApi
     */
    public getOffenderConvictionsWithRarByCrnUsingGET(requestParameters: ConvictionsApiGetOffenderConvictionsWithRarByCrnUsingGETRequest, options?: any) {
        return ConvictionsApiFp(this.configuration).getOffenderConvictionsWithRarByCrnUsingGET(requestParameters.crn, options).then((request) => request(this.axios, this.basePath));
    }
}
