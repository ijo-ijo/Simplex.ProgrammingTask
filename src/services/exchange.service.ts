import axios from 'axios';
import {config} from '../config';

const getCurrencyData = async (baseCurrency: string) => {
    try {
        return await axios.get(`${config.exhangeServiceURL}${baseCurrency}`);
    } catch (error) {
        console.error(error);
        return await error;
    }
}

export { getCurrencyData };