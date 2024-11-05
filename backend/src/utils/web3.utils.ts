import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import BigNumber from 'bignumber.js';

export const getGasPrice = async (web3: Web3): Promise<string> => {
    const gasPrice = await web3.eth.getGasPrice();
    return new BigNumber(gasPrice)
        .multipliedBy(1.1) // 10% buffer
        .toString();
};

export const estimateGas = async (
    web3: Web3,
    from: string,
    to: string,
    data: string
): Promise<string> => {
    const gas = await web3.eth.estimateGas({
        from,
        to,
        data
    });
    return new BigNumber(gas)
        .multipliedBy(1.2) // 20% buffer
        .toString();
};

export const createContract = (web3: Web3, abi: AbiItem[], address: string) => {
    return new web3.eth.Contract(abi, address);
};

export const toWei = (amount: string, decimals: number = 18): string => {
    return new BigNumber(amount)
        .multipliedBy(new BigNumber(10).pow(decimals))
        .toString();
};

export const fromWei = (amount: string, decimals: number = 18): string => {
    return new BigNumber(amount)
        .dividedBy(new BigNumber(10).pow(decimals))
        .toString();
};
