'use client'
import {useState} from "react";

// @ts-ignore
function Trust({globalAccounts}) {
    const [state, setState] = useState<Boolean>(false);
    if (state){
        return (<div>钱包连接已授权</div>);
    }
    // @ts-ignore
    if (window.ethereum) {
        console.log(2222)
        // 请求用户授权连接到以太坊网络
        // @ts-ignore
        window.ethereum.enable().then(function (accounts) {
            setState(true)
            console.log(accounts)
            globalAccounts(accounts);
        }).catch(function (error: any) {
            console.error('Failed to connect to Trust Wallet:', error);
        });
    } else {
        console.error('Trust Wallet not detected. Please make sure you have Trust Wallet installed.');
    }
    return (<div></div>);
}

export default Trust;