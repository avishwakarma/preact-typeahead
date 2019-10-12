# TypeAhead 

A TypeAhead Component for Preact

### Setup

Clone the repo

```
git clone https://github.com/ashokvishwakarma/preact-typehead.git
```

install the packages

```
npm install
````

Run development server

```
npm start
```

Build component

```
npm run build
```

Test 

```
npm run test
```

### TypeAhead Props

Available props and their default values

|Prop|Details|Default Value|
|----|-------|------------:|
|url|URL to fetch data from the server|`null`|
|data|Data for typeahead|`null`|
|suggestAfter |Chars to wait till the suggestions|3|
|maxItem|Maximum items to be selected|5|
|displayProp|Proprty to display in chips or input|`title`|
|onInput|onInput callback| function |
|onSelect|onSelect callback| function |
|hilightTerm|Highlight the matched term| `false` |
|duplicate|Allow selected item in suggestion| `false` |
|multiple|Select multiple items| `false` |
|itemBuilder|function to custom html for suggested items | NA |