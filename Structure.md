## 模組內容

一個基本的功能模組會有以下的項目

- api
  - components
  - form items

- basic ui - must be pure
- storybook
- pages
  - layout
  - page

- hooks
  - effect hooks
  - state hooks

- utils

- constants

- assets
  - image

- context

- container

- store
  - module based - not for sharing

## API

通常在 API 裡面我們會需要定義基本結構，以下是 checklist

- [ ] response, request 的 schema

- [ ] useQuery, useSWR 的 key 需要明確定義，如果有 wallet, account 相關的需要將 wallet addres, account jwt, account id 等級的 id key 加入 cache keys

- [ ] 評估是否需要 export fetcher function，基本來說不建議

- [ ] Error code 的管理 - i18n 使用，還有判斷後端 response error code 會需要

## Components

這裡唯一注意的是，只能用 useState / useReducer，除了這兩個以外的 state 都只能從 props 來。為了 storybook 的流程以及簡潔，需要強制確認這個。如果執行上會有要求穿透 component或者細節使用上需要 cross component 的 state，一律改到 container 執行，並且採用 compound / composition component 的設計方式。

除此以外，唯一可以接受 context 在 component folder 裡面的是 form items，因為 基本結構上就是屬於 form 層級的組件設計，所以可以被接受放到 components 裡面

如果是有邏輯且一定規模和功能的 component，請建立 repo 而不允許 single file 執行完所有的細節，建議是超過 300 ~ 500 行的 file 就可以重新檢視並重構當前的 component

在每一個 component 建立的時候做以下確認

- [ ] storybook

- [ ] only reducer and state

- [ ] readme doc(optional

## Pages

naming rules - XXXXPage.tsx

泛指會使用到及掛到 routing 上的頁面，設計準則為

沒有 state 的操作，除非是 preload data 的環節

redirect 的場景建議採用 route context 或者 protected route 的方式操作

layout 本身不能混用 context，它只能是 style 的分類設計

如果使用 menu，sidebar 等的設計需求active routing，從 container 及 component 處理，不要從 layout或者 page 設定 state，section分類也很重要

## Hooks

泛指全部的 custom hook，除了以下列到的基本可以放在這裡

api hook

store hook

## utils

泛指全部非 hook 的 function 處理，並具有邏輯操作

並且需要嚴格確認是 pure function，即 return type 是固定的

可以接受 overload function ，但是 return type 不變

建議寫測試驗證功能的一致及完整性

採用 jsdoc 方式說明 function 的內容

不能有 async method

## constants

在這個 module 當中會使用到的各類常數項，option, label, 以及 spec 可能會使用的細部參數都會在這裡

## assets

為了更好的 code split 結構還有責任的確認，除了 icon 等級，其他會使用到的圖片，背景都建議放到各自的 module 底下，保持使用上更清晰的分類

## Context
React context 從來都不太屬於 layout, component 之類的，比較近似於 container 的概念，但是這邊只會管理 context 建立，state 設定和 export。不參與邏輯操作概念，若有需要可以拆到 jotai store, reducer 等更適合的地方進行處理。

## Container
執行資料分發的地方，也是將所有 pure component 組合的地方。執行這個的細節是避免 render 的細節被擴大導致有可能效能不佳的問題。這裡不執行任何 styling 的需求，只會將 pure component 組合而已

這也是為什麼前面會強烈要求採用 compound/composition component 的設計，對於組合到 container 是很重要的一環


只有邏輯，api response data，不會有任何 styling 在這裡

## Store

> 這裡的 store 為 jotai

跨組件設計上，store 通常是很重要的環節。但是 feature module 的設計上，store 更傾向於跟 context 會有類似的功能。如果不是從上到下的設計行為而是橫向的組件設計，就需要處理 store 來讓兩邊的資料有一致性。

如果是在feature module 底下的 store 建議可以搭配 context 整合

[atom — Jotai, primitive and flexible state management for React ](https://jotai.org/docs/core/atom#note-about-creating-an-atom-in-render-function)

這樣設計的話在 release state 方面也有不錯的效果

 