import React, {useEffect, useState} from "react";
import {Table} from "react-bootstrap";
import {getSendTransactionsUrl} from "../../constants/url";
import moment from 'moment';
import axios from "axios";
import helper from "../../utils/helper";
import Icon from "../../components/Icon";
import Loader from "../../components/Loader";

const Transactions = () => {
    const [sendTransactionsList, setSendTransactionsList] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchValidators = async () => {
            const address = localStorage.getItem('address');
            const sendTxnsUrl = getSendTransactionsUrl(address);
            await axios.get(sendTxnsUrl).then(response => {
                let sendTxnsResponseList = response.data.txs;
                if(sendTxnsResponseList !== undefined){
                    setSendTransactionsList(sendTxnsResponseList);
                }
                setLoading(false);
            }).catch(error => {
                console.log(error.response, "unable to loading validators")
                setLoading(false);
            });
        };
        fetchValidators();
    }, []);
    if (loading) {
        return <Loader/>;
    }
    return (
        <div className="txns-container">
            <Table borderless hover responsive>
                <thead>
                <tr>
                    <th>Tx Hash</th>
                    <th>Type</th>
                    <th>Result</th>
                    <th>Amount</th>
                    <th>Fee</th>
                    <th>Height</th>
                    <th>Time</th>
                </tr>
                </thead>
                <tbody>
                {sendTransactionsList.length ?
                    sendTransactionsList.map((stxn, index) => {
                        let hash = helper.stringTruncate(stxn.txhash);
                        let amountDenom = '';
                        let amount = 0;
                        let feeDenom = '';
                        let fee = 0;
                        let type = stxn.tx.value.msg[0].type;
                        type = type.substr(type.indexOf('/') + 4)
                        if (stxn.tx.value.msg[0].value.amount !== undefined && stxn.tx.value.msg[0].value.amount.length) {
                            amountDenom = stxn.tx.value.msg[0].value.amount[0].denom;
                            amount = stxn.tx.value.msg[0].value.amount[0].amount;

                        } else if (stxn.tx.value.msg[0].value.amount !== undefined && stxn.tx.value.msg[0].value.amount) {
                            amountDenom = stxn.tx.value.msg[0].value.amount.denom;
                            amount = stxn.tx.value.msg[0].value.amount.amount;
                        } else {
                            let event = stxn.logs[0].events.find(event => event.type === 'transfer');
                            if (event !== undefined) {
                                let transferAmount = event.attributes.find(item => item.key === 'amount')
                                if (transferAmount !== undefined) {
                                    amount = transferAmount.value;
                                }
                            }
                        }

                        if (stxn.tx.value.fee.amount !== undefined && stxn.tx.value.fee.amount.length) {
                            feeDenom = stxn.tx.value.fee.amount[0].denom;
                            fee = stxn.tx.value.fee.amount[0].amount;
                        }

                        let height = stxn.height;
                        let timestamp = stxn.timestamp;

                        let ago = moment.utc(timestamp).local().startOf('seconds').fromNow()
                        return (
                            <tr>
                                <td className="tx-hash"><a
                                    href={`https://explorer.persistence.one/transactions/${stxn.txhash}`}
                                    target="_blank">
                                    {hash}
                                </a></td>
                                <td className="type">{type}</td>
                                <td className="result">
                                    <span className="icon-box success">
                                        <Icon
                                            viewClass="arrow-right"
                                            icon="success"/>
                                    </span>
                                </td>
                                <td className="amount">{amount} {amountDenom} </td>
                                <td className="fee">{fee} {feeDenom}</td>
                                <td className="height">{height}</td>
                                <td className="time">{ago}</td>
                            </tr>
                        )
                    })
                    : <tr><td colSpan={7} className="text-center"> No Txns Found</td></tr>
                }


                </tbody>
            </Table>
        </div>
    );
};
export default Transactions