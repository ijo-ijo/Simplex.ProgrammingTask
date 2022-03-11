import express, { Request, Response, NextFunction } from 'express';
import { CurrencyExchange } from '../interfaces/CurrencyExchange.interface';
import { config } from '../config';
import { LRU } from '../providers/lru.provider';
import { getCurrencyData } from '../services/exchange.service';

const exchange = async (baseCurrency: string, quoteCurrency: string, baseAmount: number, cache: LRU, req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
      // veryfy if all params are set and not empty/zero
  if(!baseCurrency || !quoteCurrency || (!baseAmount && baseAmount!=0)){
    res.status(400).send(`Unspecified GET parameter(s): "baseCurrency" and/or "quoteCurrency" and/or "baseAmount"`);
    return next(``);
  }

  // veryfy if baseCurrency and quoteCurrency params are among supported types
  if(config.supportedCurrencies.indexOf(baseCurrency) == -1 || config.supportedCurrencies.indexOf(quoteCurrency) == -1){
    res.status(400).send(`Unsupported currency for "baseCurrency" and/or "quoteCurrency", supported currencies are "${config.supportedCurrencies.sort().join('", "')}"`);
    return next(``);
  }

  // verify if baseAmount is grethen than 0 and non negative
  if(!baseAmount || baseAmount < 0){
    res.status(400).send(`Parameter "baseAmount" should be greater than 0`);
    return next(``);
  }

  // variables:
  // exchange rates
  let exchangeRates: any;
  // cache response (if any)
  let cacheVal: string = cache.get(`${baseCurrency}-${quoteCurrency}`);
  // conversion rate
  let exchangedRate: number = 0;
  // amount in exchanged currency
  let quoteAmount: number = 0;

  // checking whether cache has value
  if(cacheVal){
    // use rates from cache
    exchangeRates = JSON.parse(cacheVal);
    console.log(`Data from cache: `,exchangeRates);
  }else{
    // fetch rates from 3rd party API
    const tempData: any = await getCurrencyData(baseCurrency);

    if(!tempData.data.rates){
      res.status(400).send(`Failed to get data from API`);
      return next(``);
    }

    console.log('tempData: ',tempData.data.rates);

    const data = tempData.data;

    // save rates to cache, also cache only currencies that are supported (i.e. minify memory footprint)
    exchangeRates = config.supportedCurrencies.reduce((obj, key) => ({ ...obj, [key]: data.rates[key] }), {});
    cache.set(`${baseCurrency}-${quoteCurrency}`,JSON.stringify(exchangeRates));
    console.log(`Data fetched: `,exchangeRates);
  }

  // make exchange conversion
  if(exchangeRates[quoteCurrency]){
    exchangedRate = exchangeRates[quoteCurrency];
    quoteAmount = parseFloat((exchangedRate * baseAmount).toFixed(config.roundingPolicy));
  } else{
    res.status(400).send(`Missing exchange currency ${quoteCurrency}`);
    return next(``);
  }

  console.log("Got a GET request for /quote with REST params [baseCurrency: %s, quoteCurrency: %s, baseAmount: %s]", baseCurrency, quoteCurrency, baseAmount);

  console.log('Request params: ', req.params);

  // format out put using interface
  let output: CurrencyExchange = {exchangeRate: exchangedRate, quoteAmount: quoteAmount};

  // output response
  res.status(200).json(output);
}

export { exchange };