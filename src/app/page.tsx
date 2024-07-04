'use client'
import {CUSTOM_ADDRESS, jsonToString, USDT_ADDRESS, Web3Service} from "@/web3/web3";
import {useState} from "react";
import {BigNumberish, Contract, formatEther, parseEther, parseUnits} from "ethers";
// @ts-ignore
import {Network} from "ethers/src.ts/providers/network";

export default function Home() {
    // @ts-ignore
    if (!window.ethereum) {
        return (<div>没有window.ethereum，请安装钱包插件</div>)
    }
    console.log(window.ethereum)
    // @ts-ignore
    const web3Service = new Web3Service(window.ethereum);
    /**
     *  获取网络
     */
    const [network, setNetwork] = useState<Network>();

    function getNetwork() {
        web3Service?.getNetwork().then(result => {
            console.log("getNetwork:", JSON.stringify(result))
            setNetwork(result as Network)
        });
    }

    /**
     * 获取当前账户地址
     */
    const [account, setAccount] = useState<string>('');

    function getAccount() {
        setAccount(web3Service.address!!)
        console.log("BlockNumber:",web3Service.getBlockNumber())
        return account
    }

    /**
     *  通过web3查询该地址的代币数量
     */
    const [balanceBNB, setBalanceBNB] = useState<BigNumberish>(0);

    function getBalanceBNB() {
        web3Service.getBalance(getAccount()).then((result: BigNumberish) => {
            console.log("getBalance:", result)
            setBalanceBNB(formatEther(result))
        });
    }


    /**
     *  通过web3查询该地址的代币数量 USDT
     */
    const [balanceOfUSDT, setBalanceOfUSDT] = useState<BigNumberish>(0);

    function getBalanceOfUSDT() {
        const contract: Contract = web3Service.getContract(true)
        contract.balanceOf(getAccount())
            // contract.getFunction("balanceOf").staticCall(getAccount())
            .then((result) => {
                console.log("USDT balanceOf:", result)
                setBalanceOfUSDT(formatEther(result))
            }).catch((error) => {
            console.error('getBalanceOfUSDT出错:', error);
        });

    }

    /**
     * 查询地址对合约对授权额度
     * @param address
     */
    const [allowance, setAllowance] = useState<BigNumberish>(0);

    function findAllowance() {
        const contract: Contract = web3Service.getContract(true)
        contract.getFunction("allowance").staticCall(getAccount(), CUSTOM_ADDRESS)
            .then((result) => {
                console.log(jsonToString(result))
                // 格式化成以太币单位
                setAllowance(formatEther(result))
            }).catch((error) => {
            console.error('findAllowance出错:', error);
        });
    }

    /**
     * usdt 授权 给自定义合约
     * @param address 要授权的地址
     */
    const [approve, setApprove] = useState<string>('');

    function usdtApprove() {
        const contract: Contract = web3Service.getContract(false)
        const amount = parseEther('90000000000');
        contract.getFunction("approve").send(CUSTOM_ADDRESS, amount)
            .then((result) => {
                console.log(jsonToString(result))
                // 格式化成以太币单位
                setApprove(jsonToString(result))
            }).catch((error) => {
            console.error('usdtApprove出错:', error);
        });
    }

    /**
     * usdt 转账
     * @param account from
     */
    const [transfer, setTransfer] = useState<string>('');

    // gas不足的问题  https://ethereum.stackexchange.com/questions/100209/estimate-gas-price-with-ethers-js
    async function transferFrom() {
        const contract: Contract = web3Service.getContract(false)
        // 将以太币转为 wei
        const amount = parseEther("1");
        console.log("-----:", getAccount(), "  ", CUSTOM_ADDRESS, "   ", amount)
        // Unable to call estimated gas
        // const estimateGas = await contract.getFunction("transferFrom").estimateGas(getAccount(), CUSTOM_ADDRESS, amount);
        // @ts-ignore
        // const estimateGas = await contract.transferFrom.estimateGas(getAccount(), CUSTOM_ADDRESS, amount);
        // console.log("estimateGas:", estimateGas)
        let overrides = {
            // gasLimit: estimateGas,
            gasLimit: parseUnits('2', 'gwei'),
            gasPrice: parseUnits('1', 'gwei'),
            gas: parseUnits('0.1', 'gwei')
        };
        // contract.getFunction("transferFrom").send(getAccount(), CUSTOM_ADDRESS, amount, overrides)
        // @ts-ignore
        contract.transferFrom(getAccount(), CUSTOM_ADDRESS, amount, overrides)
            .then((result) => {
                setTransfer(jsonToString(result))
            }).catch((error) => {
            console.error('transferFrom error:', error);
        });
    }

    async function transfer2() {
        // 将以太币转为 wei
        const amount = parseEther("0.2");
        const contract: Contract = web3Service.getContract(false)
        // @ts-ignore
        const estimateGas = await contract.transfer.estimateGas(CUSTOM_ADDRESS, amount);
        let overrides = {
            gasLimit: estimateGas,
            gasPrice: parseUnits('1', 'gwei')
        };
        // contract.getFunction("transfer").send(CUSTOM_ADDRESS, amount, overrides)
        // @ts-ignore
        contract.transfer(CUSTOM_ADDRESS, amount, overrides)
            .then((result) => {
                setTransfer(jsonToString(result))
            }).catch((error) => {
            console.error('transfer出错:', error);
        });


        // const estimateGas = await web3Service.getGas(CUSTOM_ADDRESS, amount)
        // console.log("estimateGas:", estimateGas)
        // let overrides = {
        //     gasLimit: estimateGas,
        //     gasPrice: 2000,
        //     value: amount
        // };
        //
        // web3Service.USDT_CONTRACT_WRITE?.transfer(CUSTOM_ADDRESS, amount, overrides).then((result: any) => {
        //     setTransfer(jsonToString(result))
        // });
    }

    return (
        <div>
            {/*<div>*/}
            {/*    /!*初始化*!/*/}
            {/*    <Trust globalAccounts={globalAccounts}></Trust>*/}
            {/*</div>*/}

            <div>
                <h1>network: {JSON.stringify(network)}</h1>
                <button onClick={getNetwork}>getNetwork-button</button>
            </div>
            <div>
                <h1>account: {account}</h1>
                <button onClick={getAccount}>getAccount-button</button>
            </div>

            <div>

                <h1>balanceBNB: {balanceBNB}</h1>
                <button onClick={getBalanceBNB}>getBalanceBNB-button</button>

                <h1>balanceOfUSDT: {balanceOfUSDT}</h1>
                <button onClick={getBalanceOfUSDT}>getBalanceOfUSDT-button</button>

            </div>
            <div>
                <h1>allowance:{allowance}</h1>
                <button onClick={findAllowance}>findAllowance-button</button>
            </div>

            <div>
                <h1>usdtApprove:{approve}</h1>
                <button onClick={usdtApprove}>usdtApprove-button</button>
            </div>

            <div>
                <h1>transfer:{transfer}</h1>
                <button onClick={transferFrom}>transferFrom-button</button>

                <h1>transfer2:{transfer}</h1>
                <button onClick={transfer2}>transfer-button</button>
            </div>
        </div>
    );
}
