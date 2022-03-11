const { expect } = require('chai');
const request = require('supertest');
const exchangeRateAPIUrl = `https://api.exchangerate-api.com`;
const supportedCurrencies = ['USD', 'EUR', 'GBP', 'ILS'];
const roundingPolicy = 0;
const baseAmount = 100;
const url = `http://localhost:3000`;

describe(`GET Check currency exchange rate API service endpoint is up and runing`, () => {
    it(`should return rates, etc`, (done) => {
        request(exchangeRateAPIUrl)
        .get(`/v4/latest/EUR`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then((response) => {
            expect(response.body.rates).to.be.not.empty;
            done();
        })
        .catch(err => done(err))
        ;
    });    
    it(`should contain currencies "${supportedCurrencies.join(`", "`)}"`, (done) => {
        request(exchangeRateAPIUrl)
        .get(`/v4/latest/EUR`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then((response) => {
            expect(supportedCurrencies.every((val) => {
                return response.body.rates[val] && response.body.rates[val] != undefined;
            })).to.be.true;
            done();
        })
        .catch(err => done(err))
        ;
    });
});

describe('GET Check whether node API service endpoint is up and runing', () => {
    it('should make default GET call', (done) => {
        request(url)
        .get('/')
        .set('Accept', 'text/html')
        .expect('Content-Type', /html/)
        .expect(200)
        .expect(`Index page`,done)
        ;
    });
});

describe('GET Check /quote node API service endpoint is up and runing', () => {
    it('should make GET call and return 400, missing params', (done) => {
        request(url)
        .get('/quote')
        .set('Accept', 'text/html')
        .expect('Content-Type', /html/)
        .expect(400)
        .expect(`Unspecified GET parameter(s): "baseCurrency" and/or "quoteCurrency" and/or "baseAmount"`,done)
        ;
    });
});

describe(`GET Check /quote?baseCurrency=X&quoteCurrency=y&baseAmount=Z node API service endpoint is up and runing`, () => {
    it('should make GET call and return 400, wrong type params', (done) => {
        request(url)
        .get('/quote?baseCurrency=ALL&quoteCurrency=AMD&baseAmount=3')
        .set('Accept', 'text/html')
        .expect('Content-Type', /html/)
        .expect(400)
        // .then((response) => {
        //     console.log(response);
        //     done();
        // })
        // .catch(err => done(err))
        .expect(`Unsupported currency for "baseCurrency" and/or "quoteCurrency", supported currencies are "${supportedCurrencies.sort().join('", "')}"`,done)
        ;
    });

    it('should make GET call and return 400, wrong baseAmount param, should not be equal to 0', (done) => {
        request(url)
        .get('/quote?baseCurrency=USD&quoteCurrency=EUR&baseAmount=0')
        .set('Accept', 'text/html')
        .expect('Content-Type', /html/)
        .expect(400)
        .expect(`Parameter "baseAmount" should be greater than 0`,done)
        ;
    });

    it('should make GET call and return 400, wrong baseAmount param, should be more than 0', (done) => {
        request(url)
        .get('/quote?baseCurrency=USD&quoteCurrency=EUR&baseAmount=-10')
        .set('Accept', 'text/html')
        .expect('Content-Type', /html/)
        .expect(400)
        .expect(`Parameter "baseAmount" should be greater than 0`,done)
        ;
    });

    it('should make GET call and return 200, conversion should match', async () => {
        const rates = await request(exchangeRateAPIUrl)
        .get(`/v4/latest/USD`)
        .expect(200)
        .expect('Content-Type', 'application/json')
        .expect(function(res) {
            // console.log('Rates: ', res.body.rates);
            if (!('rates' in res.body)) throw new Error(`Expected 'rates' key!`);
        })
        .then((res) => {
            return res.body.rates;
        })
        ;

        // console.log('Rates: ', rates);
        console.log('Base currency:         USD');
        console.log('EUR base rate:        ',rates['USD']);
        console.log('USD conversion rate:  ',rates['EUR']);
        console.log('Amount used for test: ',baseAmount);
        console.log('Exchange value:       ',parseFloat((rates['EUR'] * 100).toFixed(roundingPolicy)));

        request(url)
        .get(`/quote?baseCurrency=USD&quoteCurrency=EUR&baseAmount=${baseAmount}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200)
        .then((res) => {
            expect(res.text).to.be.not.empty;
            expect(res.body).to.be.equals({"exchangeRate":rates['EUR'],"quoteAmount":parseFloat((res.body.exchangeRate * 100).toFixed(roundingPolicy))});
            expect(res.body.quoteAmount).to.be.equals(parseFloat((res.body.exchangeRate * 100).toFixed(roundingPolicy)));
            expect(res.body.exchangeRate).to.be.equals(rates['EUR']);
        })
        .catch((err) => {
            return err;
        })
        ;
    });
});

describe('GET Check RESTFULL /quote/X/Y/Z node API service endpoint is up and runing', () => {
    it('should make default GET call', () => {
        request(url)
        .get('/quote/X/Y/Z')
        .set('Accept', 'text/html')
        .expect('Content-Type', /html/)
        .expect(400)
        .then((res) => {
            expect(res.body).to.be.eql('Unspecified GET parameter(s): "baseCurrency" and/or "quoteCurrency" and/or "baseAmount"');
        });
    });

    it('should make GET call and return 400, wrong type params', (done) => {
        request(url)
        .get('/quote/ALL/AMD/3')
        .set('Accept', 'text/html')
        .expect('Content-Type', /html/)
        .expect(400)
        // .then((response) => {
        //     console.log(response);
        //     done();
        // })
        // .catch(err => done(err))
        .expect(`Unsupported currency for "baseCurrency" and/or "quoteCurrency", supported currencies are "${supportedCurrencies.sort().join('", "')}"`,done)
        ;
    });

    it('should make GET call and return 400, wrong baseAmount param, should not be equal to 0', (done) => {
        request(url)
        .get('/quote/USD/EUR/0')
        .set('Accept', 'text/html')
        .expect('Content-Type', /html/)
        .expect(400)
        .expect(`Parameter "baseAmount" should be greater than 0`,done)
        ;
    });

    it('should make GET call and return 400, wrong baseAmount param, should be more than 0', (done) => {
        request(url)
        .get('/quote/USD/EUR/-10')
        .set('Accept', 'text/html')
        .expect('Content-Type', /html/)
        .expect(400)
        .expect(`Parameter "baseAmount" should be greater than 0`,done)
        ;
    });

    it('should make GET call and return 200, conversion should match', async () => {
        const rates = await request(exchangeRateAPIUrl)
        .get(`/v4/latest/USD`)
        .expect(200)
        .expect('Content-Type', 'application/json')
        .expect(function(res) {
            // console.log('Rates: ', res.body.rates);
            if (!('rates' in res.body)) throw new Error(`Expected 'rates' key!`);
        })
        .then((res) => {
            return res.body.rates;
        })
        ;

        // console.log('Rates: ', rates);
        console.log('Base currency:         USD');
        console.log('EUR base rate:        ',rates['USD']);
        console.log('USD conversion rate:  ',rates['EUR']);
        console.log('Amount used for test: ',baseAmount);
        console.log('Exchange value:       ',parseFloat((rates['EUR'] * 100).toFixed(roundingPolicy)));

        request(url)
        .get(`/quote/USD/EUR/${baseAmount}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200)
        .then((res) => {
            expect(res.text).to.be.not.empty;
            expect(res.body).to.be.equals({"exchangeRate":rates['EUR'],"quoteAmount":parseFloat((res.body.exchangeRate * 100).toFixed(roundingPolicy))});
            expect(res.body.quoteAmount).to.be.equals(parseFloat((res.body.exchangeRate * 100).toFixed(roundingPolicy)));
            expect(res.body.exchangeRate).to.be.equals(rates['EUR']);
        })
        .catch((err) => {
            return err;
        })
        ;
    });
});