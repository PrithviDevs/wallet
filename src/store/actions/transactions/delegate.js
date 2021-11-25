import {
    TX_DELEGATE_MODAL_SHOW,
    TX_DELEGATE_MODAL_HIDE,
    TX_DELEGATE_AMOUNT_SET
} from "../../../constants/delegate";
import {setTxName} from "./common";
import {showFeeModal} from "./fee";

export const setTxDelegateAmount = (data) => {
    return {
        type: TX_DELEGATE_AMOUNT_SET,
        data,
    };
};

export const showTxDelegateModal = (data) => {
    return {
        type: TX_DELEGATE_MODAL_SHOW,
        data,
    };
};

export const hideTxDelegateModal = (data) => {
    return {
        type: TX_DELEGATE_MODAL_HIDE,
        data,
    };
};

export const submitFormData = (message) => (dispatch, getState) => {
    dispatch(setTxName({
        value:{
            name:"delegate",
            modal:showTxDelegateModal(),
            data:{
                message:message,
                memo:getState().common.memo.value,
            }
        }
    }));
    dispatch(hideTxDelegateModal());
    dispatch(showFeeModal());
};