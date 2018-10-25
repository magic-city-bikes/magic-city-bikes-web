# Magic City Bikes

Introduction to Data Science mini project. Predicting the time it takes for the next HSL city bike to be brought to or taken away from a city bike station. The estimates are calculated using the exponential distribution, which the waiting files follow. The parameter is learn based on historical data.

## Development

    nvm install
    npm install
    npm run watch

Define the path to your estimate file with the env varialble `DATA_PATH`. The variable is assumed to point to a folder containing estimates as JSON arrays for each hour and weekday.


## Licence

This project uses the [kaupunkifillarit.fi](https://github.com/sampsakuronen/kaupunkifillarit-web) project that has the following license:

Copyright 2016-2018 Sampsa Kuronen

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
