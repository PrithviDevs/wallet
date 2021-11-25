import {QueryClientImpl} from 'cosmjs-types/cosmos/staking/v1beta1/query';
import {QueryClientImpl as DistributionQueryClientImpl} from "cosmjs-types/cosmos/distribution/v1beta1/query";
import {
    FETCH_ACTIVE_VALIDATORS_SUCCESS,
    FETCH_DELEGATED_VALIDATORS_SUCCESS,
    FETCH_INACTIVE_VALIDATORS_SUCCESS,
    FETCH_VALIDATORS_ERROR,
    FETCH_VALIDATORS_IN_PROGRESS,
    FETCH_VALIDATORS_SUCCESS,
    SET_VALIDATOR_TX_DATA,
    VALIDATOR_TX_MODAL_SHOW,
    VALIDATOR_TX_MODAL_HIDE,
    SET_VALIDATOR_DELEGATIONS,
    SET_VALIDATOR_REWARDS
} from "../../constants/validators";

import helper from "../../utils/helper";
import transactions from "../../utils/transactions";

export const fetchValidatorsInProgress = () => {
    return {
        type: FETCH_VALIDATORS_IN_PROGRESS,
    };
};

export const fetchActiveValidatorsSuccess = (list) => {
    return {
        type: FETCH_ACTIVE_VALIDATORS_SUCCESS,
        list,
    };
};


export const fetchInactiveValidatorsSuccess = (list) => {
    return {
        type: FETCH_INACTIVE_VALIDATORS_SUCCESS,
        list,
    };
};

export const fetchTotalValidatorsSuccess = (list) => {
    return {
        type: FETCH_VALIDATORS_SUCCESS,
        list,
    };
};

export const fetchDelegatedValidators = (list) => {
    return {
        type: FETCH_DELEGATED_VALIDATORS_SUCCESS,
        list,
    };
};

export const fetchValidatorsError = (count) => {
    return {
        type: FETCH_VALIDATORS_ERROR,
        count,
    };
};

export const setValidatorTxData = (data) => {
    return {
        type: SET_VALIDATOR_TX_DATA,
        data,
    };
};

const validatorsDelegationSort = (validators, delegations) => {
    let delegatedValidators = [];
    validators.forEach((item) => {
        for (const data of delegations) {
            if (item.operatorAddress === data.delegation.validatorAddress) {
                let obj = {
                    'data': item,
                    'delegations': data.balance.amount * 1
                };
                delegatedValidators.push(obj);
            }
        }
    });
    return delegatedValidators.sort(function (a, b) {
        return b.delegations - a.delegations;
    });
};

export const showValidatorTxModal = (data) => {
    return {
        type: VALIDATOR_TX_MODAL_SHOW,
        data,
    };
};

export const hideValidatorTxModal = (data) => {
    return {
        type: VALIDATOR_TX_MODAL_HIDE,
        data,
    };
};

export const fetchValidators = (address) => {
    return async dispatch => {
        try {
            dispatch(fetchValidatorsInProgress());
            const rpcClient = await transactions.RpcClient();

            const stakingQueryService = new QueryClientImpl(rpcClient);
            await stakingQueryService.Validators({
                status: false,
            }).then(async (res) => {
                let validators = res.validators;
                let activeValidators = [];
                let delegatedValidators = [];
                let inActiveValidators = [];
                console.log(validators, "validators");
                validators.forEach((item) => {
                    if (helper.isActive(item)) {
                        let activeValidatorsData = {
                            'data': item,
                            'delegations': 0
                        };
                        activeValidators.push(activeValidatorsData);
                    } else {
                        let inActiveValidatorsData = {
                            'data': item,
                            'delegations': 0
                        };
                        inActiveValidators.push(inActiveValidatorsData);
                    }
                });

                const delegationsResponse = await stakingQueryService.DelegatorDelegations({
                    delegatorAddr: address,
                }).catch((error) => {
                    console.log(error.response
                        ? error.response.data.message
                        : error.message);
                });

                if (delegationsResponse !== undefined && delegationsResponse.delegationResponses.length) {
                    delegatedValidators = validatorsDelegationSort(validators, delegationsResponse.delegationResponses);
                } else {
                    delegatedValidators = [];
                }

                dispatch(fetchDelegatedValidators(delegatedValidators));
                dispatch(fetchTotalValidatorsSuccess(validators));
                dispatch(fetchActiveValidatorsSuccess(activeValidators));
                dispatch(fetchInactiveValidatorsSuccess(inActiveValidators));
            }).catch((error) => {
                dispatch(fetchValidatorsError(error.response
                    ? error.response.data.message
                    : error.message));
            });
        } catch (e) {
            console.log(e.message);
        }

    };
};

export const setValidatorDelegations = (data) => {
    return {
        type: SET_VALIDATOR_DELEGATIONS,
        data,
    };
};

export const fetchValidatorDelegations = (address) => {
    console.log(address, "eeee");
    return async (dispatch, getState) => {
        const validatorAddress = getState().validators.validator.value.operatorAddress;
        const rpcClient = await transactions.RpcClient();
        const stakingQueryService = new QueryClientImpl(rpcClient);
        await stakingQueryService.DelegatorDelegations({
            delegatorAddr: address,
        }).then(response => {
            let delegationResponseList = response.delegationResponses;
            for (const item of delegationResponseList) {
                if (item.delegation.validatorAddress === validatorAddress) {
                    dispatch(setValidatorDelegations({
                        value: transactions.XprtConversion(item.balance.amount * 1),
                        status: true,
                        error: {
                            message: ''
                        }
                    }));
                }
            }
        }).catch(error => {
            console.log(error.response
                ? error.response.data.message
                : error.message);
        });
        // } catch (error) {
        //     dispatch(setValidatorDelegations({
        //         value: 0,
        //         status: false,
        //         error: {
        //             message: error.response
        //         }
        //     }));
        // }
    };
};

export const setValidatorRewards = (data) => {
    return {
        type: SET_VALIDATOR_REWARDS,
        data,
    };
};

export const fetchValidatorRewards = (address, validatorAddress) => {
    return async (dispatch) => {
        const rpcClient = await transactions.RpcClient();
        const distributionQueryService = new DistributionQueryClientImpl(rpcClient);
        await distributionQueryService.DelegationRewards({
            delegatorAddress: address,
            validatorAddress: validatorAddress,
        }).then(response => {
            if (response.rewards[0].amount) {
                let value = helper.decimalConversion(response.rewards[0].amount);
                dispatch(setValidatorRewards({
                    value: transactions.XprtConversion(value),
                    error: {
                        message: ''
                    }
                }));
            }
        }).catch(error => {
            console.log(error.response
                ? error.response.data.message
                : error.message);
        });
    };
};