# World Tree

ローカルストレージには、次のようなデータを入れる。

```js
const novels = [
  {
    id: "1d1ae274-c3f7-429c-bbdd-44dae3c7d0d7",
    title: "小説のタイトル",
    scenes: [
      {
        id: "29f3b5d3-7e42-4ab8-8231-9396c961e6e5",
        name: "シーン1",
        notes: [
          {
            type: "概要1",
            content: "これは概要1です。",
          },
          {
            type: "人物1",
            content: "これは人物1です。",
          },
        ],
        content: "これは本文1です。",
        x: 100,
        y: 100
      },
      {
        id: "7bc54e52-e6c3-4b61-810e-5b569d3793cf",
        name: "シーン2",
        notes: [
          {
            type: "概要2",
            content: "これは概要2です。",
          },
          {
            type: "人物2",
            content: "これは人物2です。",
          },
        ],
        content: "これは本文2です。",
        x: 200,
        y: 50
      },
      {
        id: "fb7d1e12-517d-4ecf-8de6-07c1b5cf2c93",
        name: "シーン3",
        notes: [
          {
            type: "概要3",
            content: "これは概要3です。",
          },
          {
            type: "人物3",
            content: "これは人物3です。",
          },
        ],
        content: "これは本文3です。",
        x: 200,
        y: 150
      },
    ],
    connections: [
      {
        from: "29f3b5d3-7e42-4ab8-8231-9396c961e6e5",
        to: "7bc54e52-e6c3-4b61-810e-5b569d3793cf",
        type: "solid",
      },
      {
        from: "7bc54e52-e6c3-4b61-810e-5b569d3793cf",
        to: "fb7d1e12-517d-4ecf-8de6-07c1b5cf2c93",
        type: "dashed",
      },
    ],
  },
];
```
