import express from 'express';
import { config } from './config';
import { LRU } from './providers/lru.provider';
import { exchange } from './methods/exchange';

// app variables, could be config as well, but for simplicity I've used regular variables
const app: any = express();

// init LRU cache (singleton pattern)
const cache = new LRU(config.lruCacheSize);

// server listener
const server = app.listen(config.port, config.host, () => {
  console.log(`Application is running on ${config.host} port ${config.port}.`);
});

// Default/index GET method for API
app.get('/', async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
  console.log("GET request for /");
  res.status(200).send('Index page');
});

// Restfull GET method, URL format/sample: /quote/USD/EUR/105
app.get('/quote/:baseCurrency/:quoteCurrency/:baseAmount', async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
  // read params
  const baseCurrency: string = String(req.params.baseCurrency).toLocaleUpperCase();
  const quoteCurrency: string = String(req.params.quoteCurrency).toLocaleUpperCase();
  const baseAmount: number = parseInt(req.params.baseAmount,10);

  await exchange(baseCurrency, quoteCurrency, baseAmount, cache, req, res, next);
});

// Old fashioned method for api that reads GET URL params baseCurrency, quoteCurrency, baseAmount
app.get('/quote', async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {

  const baseCurrency: string = String(req.query.baseCurrency).toLocaleUpperCase();
  const quoteCurrency: string = String(req.query.quoteCurrency).toLocaleUpperCase();
  const baseAmount: number = parseInt(String(req.query.baseAmount),10);

  await exchange(baseCurrency, quoteCurrency, baseAmount, cache, req, res, next);
});