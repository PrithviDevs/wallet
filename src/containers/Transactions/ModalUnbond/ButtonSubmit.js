import React from 'react';
import Button from "../../../components/Button";
import { hideTxUnbondModal, submitFormData } from "../../../store/actions/transactions/unbond";
import { useDispatch, useSelector } from "react-redux";
import { keplrSubmit } from "../../../store/actions/transactions/keplr";
import { UnbondMsg } from "../../../utils/protoMsgHelper";
import { setTxIno } from "../../../store/actions/transactions/common";
import { LOGIN_INFO } from "../../../constants/localStorage";
import { stringToNumber } from "../../../utils/scripts";
import { DefaultChainInfo } from "../../../config";
import { cosmostationSubmit } from '../../../store/actions/transactions/cosmostation';


const ButtonSubmit = () => {
    const dispatch = useDispatch();
    const loginInfo = JSON.parse(localStorage.getItem(LOGIN_INFO));
    const amount = useSelector((state) => state.unbondTx.amount);
    const memo = useSelector((state) => state.unbondTx.memo);
    const validator = useSelector((state) => state.validators.validator.value);

    const onClick = () => {
        dispatch(submitFormData([UnbondMsg(loginInfo && loginInfo.address, validator.operatorAddress, (amount.value * DefaultChainInfo.uTokenValue).toFixed(0))]));
    };


    const disable = (
        amount.value === '' || stringToNumber(amount.value) === 0 || amount.error.message !== '' || validator === '' || memo.error.message !== ''
    );

    const onClickKeplr = () => {
        dispatch(setTxIno({
            value: {
                modal: hideTxUnbondModal(),
                data: {
                    message: '',
                    memo: '',
                }
            }
        }));
        dispatch(keplrSubmit([UnbondMsg(loginInfo && loginInfo.address, validator.operatorAddress, (amount.value * DefaultChainInfo.uTokenValue).toFixed(0))]));
    };

    const onClickCosmostation = () => {
        dispatch(setTxIno({
            value: {
                modal: hideTxUnbondModal(),
                data: {
                    message: '',
                    memo: '',
                }
            }
        }));
        dispatch(cosmostationSubmit([UnbondMsg(loginInfo && loginInfo.address, validator.operatorAddress, (amount.value * DefaultChainInfo.uTokenValue).toFixed(0))]));
    };

    return (
        <div className="buttons">
            <div className="button-section">
                <Button
                    className="button button-primary"
                    type="button"
                    disable={disable}
                    value="Submit"
                    onClick={loginInfo && loginInfo.loginMode === 'keplr' ? onClickKeplr : loginInfo?.loginMode === 'cosmostation' ? onClickCosmostation : onClick}
                />
            </div>
        </div>
    );
};


export default ButtonSubmit;
