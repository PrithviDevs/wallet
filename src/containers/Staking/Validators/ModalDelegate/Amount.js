import React from 'react';
import InputFieldNumber from "../../../../components/InputFieldNumber";
import {setTxDelegateAmount} from "../../../../store/actions/transactions/delegate";
import {useSelector, useDispatch} from "react-redux";
import {formatNumber} from "../../../../utils/scripts";
import NumberView from "../../../../components/NumberView";
import {ValidateSendAmount, ValidateSpecialCharacters} from "../../../../utils/validations";
import {useTranslation} from "react-i18next";
import config from "../../../../config";
const Amount = () => {
    const {t} = useTranslation();
    // const amount = floatCoin(props.balance);
    const amount = useSelector((state) => state.delegate.amount);
    const transferableAmount = useSelector((state) => state.balance.amount);

    const dispatch = useDispatch();
    // const onChange = (evt) =>{
    //     dispatch(setTxSendAmount({
    //         value:evt.target.value,
    //         error:ValidateSendAmount(transferableAmount, (evt.target.value * 1))
    //     }));
    // };

    const onChange = (evt) =>{
        let rex = /^\d*\.?\d{0,6}$/;
        if (rex.test(evt.target.value)) {
            dispatch(
                setTxDelegateAmount({
                    value:evt.target.value,
                    error:ValidateSendAmount(transferableAmount, (evt.target.value * 1))
                })
            );
        } else {
            return false;
        }
    };

    const selectTotalBalanceHandler = (value) => {
        dispatch(
            setTxDelegateAmount({
                value:value,
                error:ValidateSendAmount(value, (value* 1))
            })
        );
        // setAmountField(value.replace(/,/g, '') * 1);
        // setEnteredAmount(value.replace(/,/g, ''));
    };

    return (
        <div className="form-field p-0">
            <p className="label amount-label">
                <span> {t("DELEGATION_AMOUNT")}</span>
                <span
                    className={transferableAmount === 0 ? "empty info-data info-link" : "info-data info-link"}
                    onClick={() => selectTotalBalanceHandler(formatNumber(transferableAmount))}><span
                        className="title">{t("BALANCE")}:</span>
                    <span
                        className="value">
                        <NumberView value={formatNumber(transferableAmount)}/>
                        {config.coinName}
                    </span>
                </span>
              
            </p>
            <div className="amount-field">
                <InputFieldNumber
                    className="form-control"
                    min={0}
                    name="amount"
                    placeholder={t("DELEGATION_AMOUNT")}
                    required={true}
                    type="number"
                    value={amount.value}
                    onKeyPress={ValidateSpecialCharacters}
                    error={amount.error}
                    onChange={onChange}
                />
            </div>
        </div>
    );
};


export default Amount;