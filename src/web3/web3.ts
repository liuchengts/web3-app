import {BrowserProvider, Contract, ethers, JsonRpcSigner} from "ethers";
// @ts-ignore
// https://chainlist.org/chain/97
// https://chainlist.org/chain/56

// usdt地址-正式网
export const USDT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955'
// 自定义钱包地址-正式网
export const CUSTOM_ADDRESS = '0x4cd16D0a8AecBd2e4e3816043B29C27f45783a74'
// usdt地址-测试网
// export const USDT_ADDRESS = '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd'
// 自定义合约地址-测试网
// export const CUSTOM_CONTRACT_ADDRESS = '0xA74C15956b7FC4b20B8ec63229a8B154Bd4CB390'

// 文档 https://docs.ethers.org/v6/getting-started/
export class Web3Service {
    provider: BrowserProvider;
    signer: JsonRpcSigner;
    address: string;

    // https://learnblockchain.cn/question/3815
    constructor(windowEthereum) {
        this.provider = new ethers.BrowserProvider(switchEthereumChain(windowEthereum))
        this.provider.getSigner().then(signer => {
            this.signer = signer;
            this.signer.getAddress().then((address: string) => {
                this.address = address
                console.log("address:", address)
            });
        });
    }

    getContract(readOnly: Boolean): Contract {
        if (readOnly) {
            return new ethers.Contract(USDT_ADDRESS,
                ["function balanceOf(address account) external view returns (uint256)",
                    "function allowance(address _owner, address spender) external view returns (uint256)"],
                this.provider)
        } else {
            return new ethers.Contract(USDT_ADDRESS,
                ["function approve(address spender, uint256 amount) external returns (bool)",
                    "function transfer(address recipient, uint256 amount) external returns (bool)",
                    "function transferFrom(address sender, address recipient, uint256 amount) external returns (bool)"],
                this.signer)
        }
    }

    getNonce() {
        return this.signer?.getNonce();
    }

    getGas(address: string, amount: BigInt) {
        return this.provider.estimateGas({
            to: address,
            value: amount
        });
    }

    /**
     * 获取网络
     */
    getNetwork() {
        return this.provider.getNetwork();
    }

    /**
     * 获取代币数
     * @param address 地址
     */
    getBalance(address: string) {
        return this.provider.getBalance(address);
    }

    /**
     * 获取区块号
     */
    getBlockNumber() {
        return this.provider.getBlockNumber();
    }

}

export function jsonToString(resource: any) {
    return JSON.stringify(resource, (key, value) =>
        typeof value === 'bigint'
            ? value.toString()
            : value // return everything else unchanged
    )
}

function switchEthereumChain(windowEthereum: any) {
    const hexChainId = "0x38";
    try {
        // 尝试切换到目标链
        windowEthereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{chainId: hexChainId}]
        });
        console.log("切换链：", hexChainId)
    } catch (e) {
        if (e.code === 4902) {
            // 如果链不存在，则添加链
            windowEthereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                    chainId: hexChainId,
                    chainName: 'BSC Mainnet',
                    rpcUrls: ['https://bsc-dataseed.binance.org/'],
                    blockExplorerUrls: ['https://bscscan.com/'],
                }]
            });
            console.log("添加链：", hexChainId)
        } else {
            console.error("switchEthereumChain error:", e)
        }
    }
    return windowEthereum;
}
